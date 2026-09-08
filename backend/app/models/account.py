import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Float, Boolean, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


class Account(Base):
    __tablename__ = "accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_number = Column(String(32), unique=True, index=True, nullable=False)
    holder_name = Column(String(128), nullable=False)
    bank_name = Column(String(64), nullable=False, index=True)
    ifsc_code = Column(String(16), nullable=False, index=True)
    upi_id = Column(String(128), nullable=True, index=True)
    account_type = Column(String(32), default="SAVINGS", nullable=False)
    balance = Column(Numeric(15, 2), default=0.0, nullable=False)
    risk_score = Column(Float, default=0.0, nullable=False)
    is_frozen = Column(Boolean, default=False, nullable=False)
    account_age_days = Column(Integer, default=365, nullable=False)  # Key feature for SHAP & ML
    is_mule_label = Column(Boolean, default=False, nullable=False)  # Ground truth training label
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f"<Account {self.account_number} ({self.bank_name}) - Risk: {self.risk_score}>"
