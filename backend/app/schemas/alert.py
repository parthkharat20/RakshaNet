from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    alert_type: str
    target_account_id: Optional[UUID] = None
    target_account_number: Optional[str] = None
    target_holder_name: Optional[str] = None
    target_atm_id: Optional[UUID] = None
    risk_score: float
    graph_score: float
    geo_score: float
    explanation: Optional[Dict[str, Any]] = None
    status: str
    created_at: datetime


class AlertStatusUpdate(BaseModel):
    status: str  # NEW, INVESTIGATING, FREEZE_DISPATCHED, RESOLVED, FALSE_POSITIVE
    notes: Optional[str] = None
