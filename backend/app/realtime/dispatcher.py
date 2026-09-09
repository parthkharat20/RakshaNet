"""
Event Dispatcher: Central hub for broadcasting real-time events to WebSocket clients.

Called by service layer code (risk_fusion, alert_service, ingestion) to push
events to the Command Center frontend without coupling them directly to WebSocket logic.
"""
import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional

logger = logging.getLogger("dispatcher")


async def dispatch_alert_batch(summary: Dict[str, Any], triggered_by: str = "system"):
    """Broadcast after AI scoring pipeline completes."""
    from app.realtime.socket_server import ws_manager

    top_threat = None
    critical_accs = summary.get("critical_accounts", [])
    if critical_accs:
        top = critical_accs[0]
        top_threat = {
            "holder": top.get("holder", "Unknown"),
            "fused_score": top.get("fused_score", 0),
            "graph_score": top.get("graph_score", 0),
            "geo_score": top.get("geo_score", 0)
        }

    await ws_manager.broadcast_event("ALERT_BATCH", {
        "total_scored": summary.get("total_scored", 0),
        "critical_count": summary.get("critical_count", 0),
        "elevated_count": summary.get("elevated_count", 0),
        "alerts_written": summary.get("alerts_written", 0),
        "triggered_by": triggered_by,
        "top_threat": top_threat
    })
    logger.info(f"📡 Dispatched ALERT_BATCH event to {ws_manager.client_count} clients")


async def dispatch_freeze_event(
    account_id: str,
    account_number: str,
    holder_name: str,
    officer_badge_id: str,
    hash_signature: str
):
    """Broadcast after a freeze order is executed."""
    from app.realtime.socket_server import ws_manager

    await ws_manager.broadcast_event("FREEZE_EXECUTED", {
        "account_id": account_id,
        "account_number": account_number,
        "holder_name": holder_name,
        "officer_badge_id": officer_badge_id,
        "hash_signature": hash_signature
    })
    logger.info(f"📡 Dispatched FREEZE_EXECUTED event for {account_number}")


async def dispatch_ingestion_event(
    acknowledgement_no: str,
    category: str,
    loss_amount: float,
    city: str
):
    """Broadcast after a new NCRP complaint is ingested."""
    from app.realtime.socket_server import ws_manager

    await ws_manager.broadcast_event("COMPLAINT_INGESTED", {
        "acknowledgement_no": acknowledgement_no,
        "category": category,
        "loss_amount": loss_amount,
        "city": city
    })
    logger.info(f"📡 Dispatched COMPLAINT_INGESTED event: {acknowledgement_no}")


async def dispatch_pipeline_progress(stage: str, progress_pct: int, message: str):
    """Broadcast pipeline execution progress."""
    from app.realtime.socket_server import ws_manager

    await ws_manager.broadcast_event("PIPELINE_PROGRESS", {
        "stage": stage,
        "progress_pct": progress_pct,
        "message": message
    })


async def dispatch_lien_confirmed_event(
    account_number: str,
    bank_name: str,
    bank_lien_reference: str,
    funds_retained: float,
    cfcfrms_ack_code: str
):
    """Broadcast after core banking system confirms Section 91 lien placement."""
    from app.realtime.socket_server import ws_manager

    await ws_manager.broadcast_event("LIEN_CONFIRMED", {
        "account_number": account_number,
        "bank_name": bank_name,
        "bank_lien_reference": bank_lien_reference,
        "funds_retained": funds_retained,
        "cfcfrms_ack_code": cfcfrms_ack_code
    })
    logger.info(f"📡 Dispatched LIEN_CONFIRMED event for {account_number}: {bank_lien_reference}")


async def dispatch_attack_simulated_event(scenario_name: str, victim_city: str, loss_amount: float):
    """Broadcast when a live attack scenario is injected."""
    from app.realtime.socket_server import ws_manager

    await ws_manager.broadcast_event("ATTACK_SIMULATED", {
        "scenario_name": scenario_name,
        "victim_city": victim_city,
        "loss_amount": loss_amount
    })
    logger.info(f"📡 Dispatched ATTACK_SIMULATED event: {scenario_name}")

