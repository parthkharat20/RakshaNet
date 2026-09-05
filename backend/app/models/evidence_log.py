from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base
import uuid
from datetime import datetime

class EvidenceLog(Base):
    __tablename__ = "evidence_log_vault"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alert_code     = Column(String, index=True, nullable=False)
    action_taken   = Column(String, nullable=False) # e.g., "FREEZE_REQUEST_LOGGED", "ACKNOWLEDGED", "DISMISSED"
    officer_id     = Column(String, nullable=False) # e.g., "Officer PK · Maharashtra Cyber Cell"
    dispatch_ref   = Column(String, nullable=True)  # e.g., "NB-8819"
    legal_basis    = Column(String, default="CrPC Section 102 / Bharatiya Nagarik Suraksha Sanhita (BNSS)")
    shap_snapshot  = Column(JSON, nullable=True)
    notes          = Column(Text, nullable=True)
    timestamp      = Column(DateTime, default=datetime.utcnow, index=True)
