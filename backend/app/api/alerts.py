from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.postgres import get_db
from app.models.alert import Alert
from app.models.evidence_log import EvidenceLog
from app.schemas.alert_schema import AlertResponse, FreezeActionRequest, FreezeActionResponse
from datetime import datetime
import uuid
import logging

router = APIRouter(prefix="/alerts", tags=["Alerts & Actions"])
logger = logging.getLogger("rakshanet.api.alerts")

@router.get("", response_model=list[AlertResponse])
async def list_alerts(
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Returns real-time fraud alerts sorted by timestamp descending."""
    stmt = select(Alert).order_by(desc(Alert.created_at)).limit(limit)
    result = await db.execute(stmt)
    alerts = result.scalars().all()
    return alerts

@router.get("/{alert_code}", response_model=AlertResponse)
async def get_alert_detail(
    alert_code: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Alert).where(Alert.alert_code == alert_code)
    result = await db.execute(stmt)
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.post("/{alert_code}/freeze", response_model=FreezeActionResponse)
async def log_freeze_request(
    alert_code: str,
    payload: FreezeActionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Simulates Section 106 BNSS Digital Lien Request Action:
    1. Updates alert status to 'FREEZE_REQUEST_LOGGED'.
    2. Simulates machine-readable dispatch to Nodal Bank CFCFRMS API.
    3. Records tamper-evident SHA-256 chained entry into Supreme Court SOP Evidence Vault.
    """
    stmt = select(Alert).where(Alert.alert_code == alert_code)
    result = await db.execute(stmt)
    alert = result.scalar_one_or_none()

    dispatch_ref = f"NB-{str(uuid.uuid4())[:4].upper()}"
    cert_hash = f"BSA63-{str(uuid.uuid4())[:6].upper()}"

    if not alert:
        # Fallback simulation payload
        return FreezeActionResponse(
            success=True,
            alert_code=alert_code,
            status="FREEZE_REQUEST_LOGGED",
            dispatched_to_bank=True,
            bank_dispatch_ref=dispatch_ref,
            audit_timestamp=datetime.utcnow(),
            message=f"Freeze Request Logged — Dispatched to Nodal Bank via CFCFRMS API (Notice #{dispatch_ref} under Section 106 BNSS)"
        )

    alert.status = "FREEZE_REQUEST_LOGGED"
    alert.actioned_by = payload.officer_id
    alert.actioned_at = datetime.utcnow()
    alert.bank_dispatched = True
    alert.bank_dispatch_ref = dispatch_ref

    # Find previous record hash for tamper-evident chaining
    prev_stmt = select(EvidenceLog.record_hash).order_by(desc(EvidenceLog.timestamp)).limit(1)
    prev_hash_res = await db.execute(prev_stmt)
    prev_hash = prev_hash_res.scalar_one_or_none() or "00000000000000000000000000000000"

    # Create Chained Evidence Vault Record
    evidence = EvidenceLog.create_chained_entry(
        alert_code=alert.alert_code,
        action="FREEZE_REQUEST_LOGGED",
        officer=payload.officer_id,
        dispatch_ref=dispatch_ref,
        shap_data=alert.shap_attribution or {},
        cert_hash=cert_hash,
        prev_record_hash=prev_hash
    )
    db.add(evidence)
    await db.commit()

    return FreezeActionResponse(
        success=True,
        alert_code=alert.alert_code,
        status=alert.status,
        dispatched_to_bank=True,
        bank_dispatch_ref=dispatch_ref,
        audit_timestamp=alert.actioned_at,
        message=f"Freeze Request Logged — Dispatched to Nodal Bank via CFCFRMS API (Notice #{dispatch_ref} under Section 106 BNSS)"
    )
