import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    txn_ref = Column(String(64), unique=True, index=True, nullable=False)
    sender_account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    receiver_account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    channel = Column(String(32), default="UPI", nullable=False, index=True)
    is_flagged = Column(Boolean, default=False, nullable=False, index=True)
    hop_level = Column(Integer, default=0, nullable=False)
    ring_id = Column(String(64), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    sender = relationship("Account", foreign_keys=[sender_account_id])
    receiver = relationship("Account", foreign_keys=[receiver_account_id])

    def __repr__(self):
        return f"<Transaction {self.txn_ref}: ₹{self.amount} via {self.channel} (Hop {self.hop_level})>"
