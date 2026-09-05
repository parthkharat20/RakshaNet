from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class AlertResponse(BaseModel):
    id: str
    alert_code: str
    tier: str
    target_account_no: str
    target_bank: Optional[str]
    amount_at_risk: float
    predicted_atm_code: Optional[str]
    predicted_atm_zone: Optional[str]
    graph_score: float
    geo_score: float
    fused_score: float
    shap_attribution: Optional[Dict[str, Any]]
    explanation_text: str
    status: str
    bank_dispatched: bool
    bank_dispatch_ref: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class FreezeActionRequest(BaseModel):
    officer_id: str = "Officer PK · Maharashtra Cyber Cell"
    notes: Optional[str] = "Emergency interdiction executed before ATM cash-out."

class FreezeActionResponse(BaseModel):
    success: bool
    alert_code: str
    status: str
    dispatched_to_bank: bool
    bank_dispatch_ref: str
    audit_timestamp: datetime
    message: str
