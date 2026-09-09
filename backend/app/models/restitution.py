import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


class RestitutionOrder(Base):
    __tablename__ = "restitution_orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    restitution_reference = Column(String(64), unique=True, index=True, nullable=False)
    complaint_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    alert_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    
    # Victim details (beneficiary of restitution)
    victim_account_number = Column(String(32), nullable=False)
    victim_holder_name = Column(String(128), nullable=False)
    victim_bank = Column(String(64), nullable=False)
    victim_ifsc = Column(String(16), nullable=False)

    # Indicted source details (where funds were frozen under lien)
    frozen_account_number = Column(String(32), nullable=False)
    frozen_bank = Column(String(64), nullable=False)
    cfcfrms_lien_reference = Column(String(64), nullable=False)

    # Restitution financial details
    amount_restituted = Column(Numeric(15, 2), nullable=False)
    court_order_number = Column(String(64), nullable=True)
    magistrate_court = Column(String(256), nullable=True)
    status = Column(String(32), default="ORDER_DRAFTED", index=True, nullable=False)
    sha256_hash = Column(String(64), nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    executed_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<RestitutionOrder {self.restitution_reference} (₹{self.amount_restituted}) - Status: {self.status}>"
