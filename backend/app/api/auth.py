"""
JWT Authentication & Authorization module for RakshaNet.
Provides login, token refresh, and FastAPI dependency for route protection.
"""
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from pydantic import BaseModel, Field
from sqlalchemy import select

from app.config import settings
from app.db.postgres import AsyncSessionLocal
from app.models.officer import Officer

logger = logging.getLogger("auth")

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Security scheme
bearer_scheme = HTTPBearer(auto_error=False)


# --- Pydantic Schemas ---

class LoginRequest(BaseModel):
    badge_id: str = Field(..., description="Officer badge ID (e.g., LE-CYBER-MUM-4029)")
    pin: str = Field(..., description="Security PIN")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    officer_name: str
    officer_rank: str
    badge_id: str


class RefreshRequest(BaseModel):
    access_token: str


# --- JWT Token Management ---

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )


# --- FastAPI Dependencies ---

async def get_current_officer(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
) -> dict:
    """
    FastAPI dependency that validates the JWT Bearer token and returns
    the authenticated officer's identity payload.
    
    Returns dict with keys: badge_id, name, rank, department, officer_id
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Provide Bearer token.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    payload = decode_access_token(credentials.credentials)
    badge_id = payload.get("sub")
    if not badge_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing subject.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return {
        "badge_id": badge_id,
        "name": payload.get("name", ""),
        "rank": payload.get("rank", ""),
        "department": payload.get("department", ""),
        "officer_id": payload.get("officer_id", "")
    }


async def get_optional_officer(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
) -> Optional[dict]:
    """
    Optional auth dependency — returns officer if authenticated, None otherwise.
    Used for endpoints that work both authenticated and anonymously.
    """
    if credentials is None:
        return None
    try:
        payload = decode_access_token(credentials.credentials)
        return {
            "badge_id": payload.get("sub"),
            "name": payload.get("name", ""),
            "rank": payload.get("rank", ""),
        }
    except HTTPException:
        return None


# --- API Endpoints ---

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """
    Authenticates a Law Enforcement Officer and issues a JWT access token.
    Validates badge_id and PIN against the officers table.
    """
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Officer).where(Officer.badge_id == request.badge_id)
        )
        officer = result.scalar_one_or_none()

        if not officer:
            logger.warning(f"Login attempt failed: badge_id '{request.badge_id}' not found.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid badge ID or security PIN."
            )

        if not officer.is_active:
            logger.warning(f"Login attempt blocked: officer '{request.badge_id}' is deactivated.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Officer account has been deactivated. Contact administrator."
            )

        if not officer.verify_pin(request.pin):
            logger.warning(f"Login attempt failed: invalid PIN for badge '{request.badge_id}'.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid badge ID or security PIN."
            )

        # Update last login timestamp
        officer.last_login_at = datetime.now(timezone.utc)
        await session.commit()

    # Issue JWT token
    token_data = {
        "sub": officer.badge_id,
        "officer_id": str(officer.id),
        "name": officer.name,
        "rank": officer.rank,
        "department": officer.department,
    }
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data=token_data, expires_delta=expires_delta)

    logger.info(f"✅ Officer {officer.badge_id} ({officer.name}) authenticated successfully.")

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        officer_name=officer.name,
        officer_rank=officer.rank,
        badge_id=officer.badge_id
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshRequest):
    """Refreshes a valid (or recently expired) JWT token with a new expiry."""
    try:
        payload = jwt.decode(
            request.access_token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_exp": False}  # Allow expired tokens for refresh
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid and cannot be refreshed."
        )

    badge_id = payload.get("sub")
    if not badge_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload.")

    # Verify officer still exists and is active
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Officer).where(Officer.badge_id == badge_id)
        )
        officer = result.scalar_one_or_none()
        if not officer or not officer.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Officer account not found or deactivated."
            )

    # Issue new token
    token_data = {
        "sub": badge_id,
        "officer_id": payload.get("officer_id", ""),
        "name": payload.get("name", ""),
        "rank": payload.get("rank", ""),
        "department": payload.get("department", ""),
    }
    new_token = create_access_token(data=token_data)

    return TokenResponse(
        access_token=new_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        officer_name=payload.get("name", ""),
        officer_rank=payload.get("rank", ""),
        badge_id=badge_id
    )


@router.get("/me")
async def get_current_user(officer: dict = Depends(get_current_officer)):
    """Returns the identity of the currently authenticated officer."""
    return {
        "badge_id": officer["badge_id"],
        "name": officer["name"],
        "rank": officer["rank"],
        "department": officer["department"],
        "authenticated": True
    }
