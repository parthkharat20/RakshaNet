import logging
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select
from app.db.postgres import AsyncSessionLocal
from app.models import Account
from app.schemas.account import AccountResponse
from app.schemas.graph import GraphResponse
from app.services.graph_service import GraphService

logger = logging.getLogger("accounts_api")
router = APIRouter(prefix="/accounts", tags=["Bank Accounts"])


@router.get("", response_model=List[AccountResponse])
async def list_accounts(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    bank_name: Optional[str] = None,
    is_frozen: Optional[bool] = None,
    is_mule: Optional[bool] = None,
    min_risk: Optional[float] = Query(None, ge=0.0, le=1.0)
):
    """Lists accounts with optional filtering by bank, frozen state, mule flag, or risk score."""
    async with AsyncSessionLocal() as session:
        query = select(Account)
        if bank_name:
            # Fixed: Use parameterized ilike with % escaping to prevent SQL injection
            safe_pattern = bank_name.replace("%", r"\%").replace("_", r"\_")
            query = query.where(Account.bank_name.ilike(f"%{safe_pattern}%"))
        if is_frozen is not None:
            query = query.where(Account.is_frozen == is_frozen)
        if is_mule is not None:
            query = query.where(Account.is_mule_label == is_mule)
        if min_risk is not None:
            query = query.where(Account.risk_score >= min_risk)

        query = query.order_by(Account.risk_score.desc(), Account.created_at.desc()).offset(offset).limit(limit)
        results = (await session.execute(query)).scalars().all()
        return results


@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(account_id: str):
    """Retrieves full profile for a single bank account (by UUID or account_number)."""
    async with AsyncSessionLocal() as session:
        if len(account_id) == 36:
            try:
                query = select(Account).where(Account.id == UUID(account_id))
            except ValueError:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid UUID format.")
        else:
            query = select(Account).where(Account.account_number == account_id)

        result = (await session.execute(query)).scalar_one_or_none()
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Account '{account_id}' not found.")
        return result


@router.get("/{account_id}/graph", response_model=GraphResponse)
async def get_account_graph(
    account_id: str,
    max_hops: int = Query(2, ge=1, le=4, description="Graph traversal depth (1 to 4 hops)")
):
    """
    Returns the multi-hop transaction ego-network around an account for React-Force-Graph-2D.
    Extracts all interconnected sender/receiver accounts and labels them as VICTIM, MULE, or CLEAN.
    """
    return await GraphService.get_account_subgraph(account_id, max_hops=max_hops)

