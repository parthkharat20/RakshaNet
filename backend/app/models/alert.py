import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alert_type = Column(String(64), nullable=False, index=True)
    target_account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=True, index=True)
    target_atm_id = Column(UUID(as_uuid=True), ForeignKey("atm_locations.id", ondelete="SET NULL"), nullable=True, index=True)
    risk_score = Column(Float, nullable=False)
    graph_score = Column(Float, default=0.0, nullable=False)
    geo_score = Column(Float, default=0.0, nullable=False)
    explanation = Column(JSON, nullable=True)  # SHAP factor attribution + narrative summary
    status = Column(String(32), default="NEW", nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    target_account = relationship("Account", foreign_keys=[target_account_id])
    target_atm = relationship("ATMLocation", foreign_keys=[target_atm_id])

    def __repr__(self):
        return f"<Alert {self.alert_type} (Score: {self.risk_score:.2f}) - Status: {self.status}>"
