from sqlalchemy import Column, String, Float, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base
import uuid
from datetime import datetime

class Account(Base):
    __tablename__ = "accounts"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_number   = Column(String, unique=True, index=True, nullable=False)
    bank_name        = Column(String, nullable=False)
    ifsc_code        = Column(String, index=True, nullable=False)
    holder_name      = Column(String, nullable=True)
    account_type     = Column(String, default="savings") # "savings", "current", "jan_dhan"
    opened_at        = Column(DateTime, default=datetime.utcnow)
    kyc_status       = Column(String, default="simplified") # "full", "simplified", "minimal"
    is_fraud_labeled = Column(Boolean, default=False, index=True)
    flag_reason      = Column(String, nullable=True)

    # Risk Scores
    graph_risk_score = Column(Float, default=0.0) # Calculated via Branch A (GNN / NetworkX)
    geo_risk_score   = Column(Float, default=0.0) # Calculated via Branch B (HDBSCAN / XGBoost)
    fused_risk_score = Column(Float, default=0.0)
    risk_tier        = Column(String, default="LOW") # "CRITICAL", "HIGH", "MEDIUM", "LOW"

    created_at       = Column(DateTime, default=datetime.utcnow)
