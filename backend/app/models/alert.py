from sqlalchemy import Column, String, Numeric, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from app.models.base import Base
import uuid
from datetime import datetime

class Alert(Base):
    __tablename__ = "alerts"

    id                   = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alert_code           = Column(String, unique=True, index=True, nullable=False) # e.g. "RN-9042"
    tier                 = Column(String, index=True, nullable=False) # "CRITICAL", "HIGH", "MEDIUM"
    target_account_no    = Column(String, index=True, nullable=False)
    target_bank          = Column(String, nullable=True)
    amount_at_risk       = Column(Numeric(14, 2), nullable=False)
    predicted_atm_code   = Column(String, nullable=True)
    predicted_atm_zone   = Column(String, nullable=True)

    # PostGIS location of predicted cash-out ATM
    predicted_location   = Column(Geometry(geometry_type="POINT", srid=4326), nullable=True)

    # Risk Metrics
    graph_score          = Column(Float, nullable=False)
    geo_score            = Column(Float, nullable=False)
    fused_score          = Column(Float, nullable=False)

    # SHAP Explainability Payloads
    shap_attribution     = Column(JSON, nullable=True) # { "network_proximity": 0.34, "atm_density": 0.26, ... }
    explanation_text     = Column(Text, nullable=False)

    # Interdiction Status & CFCFRMS Dispatch
    status               = Column(String, default="NEW", index=True) # "NEW", "ACKNOWLEDGED", "FREEZE_REQUEST_LOGGED", "DISMISSED"
    actioned_by          = Column(String, nullable=True)
    actioned_at          = Column(DateTime, nullable=True)
    bank_dispatched      = Column(Boolean, default=False)
    bank_dispatch_ref    = Column(String, nullable=True)

    created_at           = Column(DateTime, default=datetime.utcnow, index=True)
