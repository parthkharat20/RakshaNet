from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field


class Section65BCertificate(BaseModel):
    certificate_id: str = Field(..., description="Unique legal evidence certificate reference")
    act_reference: str = Field(
        "Section 63, Bharatiya Sakshya Adhiniyam, 2023 / Section 65B, Indian Evidence Act, 1872",
        description="Statutory legal basis"
    )
    certifying_officer: str
    officer_badge_id: str
    officer_rank: str
    device_system_id: str
    evidence_hash_sha256: str
    issued_at: datetime
    legal_declaration: str


class TransactionHop(BaseModel):
    hop_number: int
    from_account: str
    to_account: str
    to_holder_name: str
    bank_name: str
    ifsc: str
    amount: float
    timestamp: str


class CourtDossierResponse(BaseModel):
    dossier_id: str
    case_reference: str
    generated_at: datetime
    alert_id: str
    suspect_account_id: str
    suspect_account_number: str
    suspect_holder_name: str
    suspect_bank: str
    suspect_ifsc: str
    fused_risk_score: float
    citizen_loss_amount: float
    citizen_acknowledgement_no: Optional[str] = None
    cfcfrms_lien_reference: Optional[str] = None
    funds_retained: float
    patrol_dispatch_order: Optional[str] = None
    patrol_callsign: Optional[str] = None
    target_atm: Optional[str] = None
    transaction_trail: List[TransactionHop] = []
    shap_attributions: Dict[str, Any] = {}
    legal_grounds: List[str] = []
    certificate_65b: Section65BCertificate


class SyndicateProfile(BaseModel):
    id: str
    name: str
    modus_operandi: str
    primary_region: str
    total_detected_loss: float
    funds_intercepted: float
    active_mules_identified: int
    disruption_rate_pct: float
    top_target_atms: List[str]
    status: str
