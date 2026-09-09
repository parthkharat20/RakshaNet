from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class RestitutionDraftRequest(BaseModel):
    alert_id: Optional[str] = Field(None, description="Flagged alert reference")
    complaint_id: Optional[str] = Field(None, description="NCRP complaint UUID or acknowledgement number")


class RestitutionExecuteRequest(BaseModel):
    court_order_number: str = Field(..., description="Magistrate Court Order Number, e.g. CJM-MUM-457-2026-8812")
    magistrate_court: str = Field(
        ...,
        description="Designated Judicial Magistrate Court, e.g. Esplanade Court of Chief Metropolitan Magistrate, Mumbai"
    )
    judicial_notes: Optional[str] = Field(
        "Order passed under Section 457 Cr.P.C. / Section 503 BNSS for release and restitution of frozen seized cyber-fraud funds.",
        description="Magisterial remarks"
    )


class RestitutionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    restitution_reference: str
    status: str
    amount_restituted: float
    victim_account_number: str
    victim_holder_name: str
    victim_bank: str
    victim_ifsc: str
    frozen_account_number: str
    frozen_bank: str
    cfcfrms_lien_reference: str
    court_order_number: Optional[str] = None
    magistrate_court: Optional[str] = None
    sha256_hash: str
    created_at: datetime
    executed_at: Optional[datetime] = None
    reverse_settlement_ref: Optional[str] = None
    message: str


class RestitutionTimelineItem(BaseModel):
    stage: int
    title: str
    description: str
    timestamp: str
    completed: bool


class VictimTrackResponse(BaseModel):
    acknowledgement_no: str
    citizen_name: str
    city: str
    loss_amount: float
    secured_amount: float
    recovery_rate_pct: float
    restitution_status: str
    current_stage: int
    cfcfrms_lien_reference: Optional[str] = None
    court_order_number: Optional[str] = None
    timeline: List[RestitutionTimelineItem]
