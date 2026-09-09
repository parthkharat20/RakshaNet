"""
WebSocket Event Schemas for real-time push notifications.

Defines typed event payloads broadcast to connected Command Center clients.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class WebSocketEvent(BaseModel):
    """Base event envelope for all WebSocket messages."""
    event_type: str
    timestamp: str
    payload: Dict[str, Any]


class AlertBatchEvent(BaseModel):
    """Broadcast when AI scoring pipeline completes and new alerts are generated."""
    event_type: str = "ALERT_BATCH"
    total_scored: int
    critical_count: int
    elevated_count: int
    alerts_written: int
    triggered_by: str = "system"
    top_threat: Optional[Dict[str, Any]] = None


class FreezeEvent(BaseModel):
    """Broadcast when a law enforcement freeze order is executed."""
    event_type: str = "FREEZE_EXECUTED"
    account_id: str
    account_number: str
    holder_name: str
    officer_badge_id: str
    hash_signature: str
    timestamp: str


class IngestionEvent(BaseModel):
    """Broadcast when a new NCRP complaint is ingested."""
    event_type: str = "COMPLAINT_INGESTED"
    acknowledgement_no: str
    category: str
    loss_amount: float
    city: str
    timestamp: str


class PipelineProgressEvent(BaseModel):
    """Broadcast during AI pipeline execution to show real-time progress."""
    event_type: str = "PIPELINE_PROGRESS"
    stage: str  # "GRAPH_SCORING", "GEO_SCORING", "FUSION", "ALERTS_WRITTEN"
    progress_pct: int  # 0-100
    message: str


class SystemStatusEvent(BaseModel):
    """Broadcast for system health changes."""
    event_type: str = "SYSTEM_STATUS"
    status: str  # "HEALTHY", "DEGRADED"
    databases: Dict[str, str]
