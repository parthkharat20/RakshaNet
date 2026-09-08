import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from app.db.base import Base


class ATMLocation(Base):
    __tablename__ = "atm_locations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    terminal_id = Column(String(64), unique=True, index=True, nullable=False)
    bank_name = Column(String(64), nullable=False)
    address = Column(String(256), nullable=False)
    city = Column(String(64), nullable=False, index=True)
    state = Column(String(64), nullable=False)
    location = Column(Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=False)
    cash_out_frequency = Column(Integer, default=0, nullable=False)
    risk_score = Column(Float, default=0.0, nullable=False)
    is_hotspot = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f"<ATMLocation {self.terminal_id} ({self.city}) - Risk: {self.risk_score}>"
