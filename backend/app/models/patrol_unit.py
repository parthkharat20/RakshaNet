import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from app.db.base import Base


class PatrolUnit(Base):
    __tablename__ = "patrol_units"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    callsign = Column(String(64), unique=True, index=True, nullable=False)
    unit_type = Column(String(32), nullable=False)  # PCR_VAN, MOTORCYCLE_MARSHAL, INTERCEPTOR_MOBILE
    officer_in_charge = Column(String(128), nullable=False)
    badge_id = Column(String(32), nullable=True)
    contact_channel = Column(String(64), nullable=False)  # Tactical radio/mobile
    status = Column(String(32), default="ON_PATROL", index=True, nullable=False)  # ON_PATROL, DISPATCHED_INTERDICTION, RESPONDING, STANDBY
    city = Column(String(64), nullable=False, index=True)
    jurisdiction = Column(String(128), nullable=False)
    location = Column(Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=False)
    current_speed_kmh = Column(Float, default=25.0, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f"<PatrolUnit {self.callsign} ({self.city}) - Status: {self.status}>"
