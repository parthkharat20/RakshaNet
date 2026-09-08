from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class AccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    account_number: str
    holder_name: str
    bank_name: str
    ifsc_code: str
    upi_id: Optional[str] = None
    account_type: str
    balance: float
    risk_score: float
    is_frozen: bool
    account_age_days: int
    is_mule_label: bool
    created_at: datetime
    updated_at: datetime


class AccountFreezeRequest(BaseModel):
    officer_badge_id: str = Field(..., description="Unique badge ID of the investigating officer (e.g. LEA_MH_4920)")
    reason: str = Field(..., description="Legal rationale for freeze order under Section 91 CrPC / cybercrime interdiction")
    notes: Optional[str] = Field(None, description="Investigator operational case notes")


class AccountFreezeResponse(BaseModel):
    success: bool
    account_id: UUID
    account_number: str
    holder_name: str
    bank_name: str
    is_frozen: bool
    audit_log_id: UUID
    hash_signature: str
    action_taken_at: datetime
    message: str
