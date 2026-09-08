import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.db.base import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    acknowledgement_no = Column(String(32), unique=True, index=True, nullable=False)
    category = Column(String(64), nullable=False, index=True)
    loss_amount = Column(Numeric(12, 2), nullable=False)
    victim_account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True, index=True)
    suspect_account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True, index=True)
    incident_time = Column(DateTime(timezone=True), nullable=False)
    reported_time = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    location = Column(Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=True)
    city = Column(String(64), nullable=True, index=True)
    state = Column(String(64), nullable=True)
    status = Column(String(32), default="PENDING", nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    victim_account = relationship("Account", foreign_keys=[victim_account_id])
    suspect_account = relationship("Account", foreign_keys=[suspect_account_id])

    def __repr__(self):
        return f"<Complaint {self.acknowledgement_no} ({self.category}) - ₹{self.loss_amount}>"
