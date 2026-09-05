from sqlalchemy import Column, String, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base
import uuid
from datetime import datetime

class Transaction(Base):
    __tablename__ = "transactions"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    txn_ref          = Column(String, unique=True, index=True, nullable=False)
    from_account     = Column(String, index=True, nullable=False)
    to_account       = Column(String, index=True, nullable=False)
    amount           = Column(Numeric(14, 2), nullable=False)
    txn_type         = Column(String, default="UPI") # "UPI", "IMPS", "NEFT", "RTGS", "ATM_WITHDRAWAL"
    timestamp        = Column(DateTime, default=datetime.utcnow, index=True)
    is_suspicious    = Column(Boolean, default=False)
    fraud_ring_id    = Column(String, nullable=True) # Tagged for synthetic evaluation

    created_at       = Column(DateTime, default=datetime.utcnow)
