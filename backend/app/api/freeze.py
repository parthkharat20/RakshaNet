import logging
from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.schemas.account import AccountFreezeRequest, AccountFreezeResponse
from app.services.alert_service import AlertService
from app.api.auth import get_current_officer

logger = logging.getLogger("freeze_api")
router = APIRouter(prefix="/freeze", tags=["Law Enforcement Interdiction"])


@router.post("/{account_id}", response_model=AccountFreezeResponse)
async def execute_freeze_order(
    account_id: str,
    request_body: AccountFreezeRequest,
    request: Request,
    officer: dict = Depends(get_current_officer)
):
    """
    Direct One-Click Account Freeze Action for Law Enforcement Officers:
    1. Immediately locks account in PostgreSQL system of record.
    2. Synchronously updates Neo4j (:Account) graph node to is_frozen=true.
    3. Generates a court-admissible cryptographic SHA-256 evidence entry in audit_logs.

    Requires JWT authentication — only authorized officers can execute freeze orders.
    """
    # Override officer_badge_id from the authenticated token (prevent spoofing)
    request_body.officer_badge_id = officer["badge_id"]

    # Extract real client IP for audit trail
    client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "0.0.0.0")

    try:
        return await AlertService.freeze_account(account_id, request_body, client_ip=client_ip)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Freeze execution failed for {account_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Freeze dispatch failed due to an internal error. The incident has been logged."
        )
