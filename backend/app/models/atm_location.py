from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from app.models.base import Base
import uuid
from datetime import datetime

class ATMLocation(Base):
    __tablename__ = "atm_locations"

    id                 = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    atm_code           = Column(String, unique=True, index=True, nullable=False) # e.g., "ATM-MUM-042"
    bank_name          = Column(String, nullable=False)
    address            = Column(String, nullable=True)
    city               = Column(String, index=True, nullable=False)
    state              = Column(String, index=True, nullable=False)
    zone               = Column(String, nullable=False) # e.g., "Bandra-Kurla Complex"

    # PostGIS Spatial column (longitude, latitude)
    location           = Column(Geometry(geometry_type="POINT", srid=4326), nullable=False)

    cluster_id         = Column(Integer, default=-1) # HDBSCAN cluster ID
    risk_score         = Column(Float, default=0.0)  # 0 to 100
    risk_tier          = Column(String, default="LOW") # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    is_hotspot         = Column(Boolean, default=False)
    predicted_volume   = Column(Float, default=0.0)  # Forecasted cash-out events

    updated_at         = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
