from sqlalchemy import Column, String, Numeric, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from app.models.base import Base
import uuid
from datetime import datetime

class Complaint(Base):
    __tablename__ = "complaints"

    id                 = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ncrp_ref           = Column(String, unique=True, index=True, nullable=False) # e.g., "NCRP-2026-DEL-0419"
    victim_name        = Column(String, nullable=True)
    victim_phone_hash  = Column(String, nullable=True)
    fraud_type         = Column(String, nullable=False) # "digital_arrest", "investment_scam", "phishing", "job_fraud"
    amount             = Column(Numeric(14, 2), nullable=False)
    currency           = Column(String, default="INR")
    suspect_account_no = Column(String, index=True, nullable=False)
    initial_mule_bank  = Column(String, nullable=True)
    jurisdiction       = Column(String, index=True, nullable=False) # State/UT, e.g., "Delhi", "Maharashtra"
    district           = Column(String, nullable=True)
    description        = Column(Text, nullable=True)
    status             = Column(String, default="filed") # "filed", "investigating", "action_taken"
    filed_at           = Column(DateTime, default=datetime.utcnow, index=True)

    # PostGIS Spatial column (longitude, latitude) in WGS84 (SRID 4326)
    location           = Column(Geometry(geometry_type="POINT", srid=4326), nullable=False)

    created_at         = Column(DateTime, default=datetime.utcnow)
