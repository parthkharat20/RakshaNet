import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.account import AccountFreezeRequest, AccountFreezeResponse
from app.services.alert_service import AlertService

logger = logging.getLogger("freeze_api")
router = APIRouter(prefix="/freeze", tags=["Law Enforcement Interdiction"])


@router.post("/{account_id}", response_model=AccountFreezeResponse)
async def execute_freeze_order(account_id: str, request: AccountFreezeRequest):
    """
    Direct One-Click Account Freeze Action for Law Enforcement Officers:
    1. Immediately locks account in PostgreSQL system of record.
    2. Synchronously updates Neo4j (:Account) graph node to is_frozen=true.
    3. Generates a court-admissible cryptographic SHA-256 evidence entry in audit_logs.
    """
    try:
        return await AlertService.freeze_account(account_id, request)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Freeze execution failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Freeze dispatch failed: {str(e)}")
