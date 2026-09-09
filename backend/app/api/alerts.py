import asyncio
import logging
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import select
from app.db.postgres import AsyncSessionLocal
from app.models import Alert, Account
from app.schemas.account import AccountFreezeRequest, AccountFreezeResponse
from app.schemas.alert import AlertResponse, AlertStatusUpdate
from app.services.alert_service import AlertService
from app.api.auth import get_current_officer, get_optional_officer

logger = logging.getLogger("alerts_api")
router = APIRouter(prefix="/alerts", tags=["Intelligence Alerts"])

# Concurrency lock to prevent simultaneous scoring pipeline executions
_scoring_lock = asyncio.Lock()


@router.get("", response_model=List[AlertResponse])
async def list_alerts(
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None
):
    """Retrieves prioritized threat alerts sorted by fused risk score."""
    return await AlertService.get_alerts(limit=limit, status_filter=status)


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(alert_id: UUID):
    """Retrieves full intelligence payload for an alert."""
    async with AsyncSessionLocal() as session:
        query = select(Alert, Account).outerjoin(Account, Alert.target_account_id == Account.id).where(Alert.id == alert_id)
        res = (await session.execute(query)).first()
        if not res:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Alert '{alert_id}' not found.")
        alert, acc = res
        return AlertResponse(
            id=alert.id,
            alert_type=alert.alert_type,
            target_account_id=alert.target_account_id,
            target_account_number=acc.account_number if acc else None,
            target_holder_name=acc.holder_name if acc else None,
            target_atm_id=alert.target_atm_id,
            risk_score=float(alert.risk_score),
            graph_score=float(alert.graph_score),
            geo_score=float(alert.geo_score),
            explanation=alert.explanation,
            status=alert.status,
            created_at=alert.created_at
        )


@router.post("/{alert_id}/freeze", response_model=AccountFreezeResponse)
async def freeze_alert_target(
    alert_id: UUID,
    request_body: AccountFreezeRequest,
    request: Request,
    officer: dict = Depends(get_current_officer)
):
    """Dispatches freeze order against the suspect account flagged in the alert. Requires JWT auth."""
    async with AsyncSessionLocal() as session:
        query = select(Alert).where(Alert.id == alert_id)
        alert = (await session.execute(query)).scalar_one_or_none()
        if not alert or not alert.target_account_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert or target account not found.")

        # Update alert status
        alert.status = "FREEZE_DISPATCHED"
        await session.commit()

    # Override badge from authenticated officer
    request_body.officer_badge_id = officer["badge_id"]
    client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "0.0.0.0")
    return await AlertService.freeze_account(str(alert.target_account_id), request_body, client_ip=client_ip)


@router.post("/run-scoring")
async def trigger_scoring_pipeline(officer: dict = Depends(get_current_officer)):
    """
    Triggers the full real-time dual-branch AI scoring pipeline.
    Requires JWT auth. Concurrent executions are prevented by an asyncio lock.
    """
    if _scoring_lock.locked():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="AI scoring pipeline is already in progress. Please wait for the current run to complete."
        )

    async with _scoring_lock:
        from app.ai.risk_fusion import run_full_scoring_pipeline
        logger.info(f"AI pipeline triggered by officer: {officer['badge_id']} ({officer['name']})")
        summary = await run_full_scoring_pipeline()
        return {"status": "SUCCESS", "triggered_by": officer["badge_id"], "summary": summary}
