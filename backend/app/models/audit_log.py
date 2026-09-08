import uuid
import hashlib
import json
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    officer_badge_id = Column(String(32), nullable=False, index=True)
    action = Column(String(64), nullable=False, index=True)
    target_type = Column(String(32), nullable=False)
    target_id = Column(String(64), nullable=False, index=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    hash_signature = Column(String(64), nullable=False)

    @staticmethod
    def compute_signature(badge_id: str, action: str, target_id: str, timestamp_str: str, details_dict: dict) -> str:
        payload = f"{badge_id}|{action}|{target_id}|{timestamp_str}|{json.dumps(details_dict, sort_keys=True)}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def __repr__(self):
        return f"<AuditLog {self.officer_badge_id} did {self.action} on {self.target_type}:{self.target_id}>"
