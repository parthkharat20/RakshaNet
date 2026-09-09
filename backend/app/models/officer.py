"""
Law Enforcement Officer model for JWT authentication.
Used by RakshaNet to verify authorized personnel before allowing
sensitive operations like account freezing and AI pipeline triggers.
"""
import uuid
import hashlib
import hmac
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

# Use HMAC-SHA256 for PIN hashing (avoids bcrypt version conflicts)
_PIN_SALT = "rakshanet_officer_pin_salt_2026"


class Officer(Base):
    __tablename__ = "officers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    badge_id = Column(String(32), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    rank = Column(String(64), nullable=False)
    department = Column(String(128), nullable=False)
    hashed_pin = Column(String(256), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    @staticmethod
    def hash_pin(pin: str) -> str:
        return hmac.new(
            _PIN_SALT.encode("utf-8"),
            pin.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

    def verify_pin(self, pin: str) -> bool:
        return hmac.compare_digest(self.hashed_pin, Officer.hash_pin(pin))

    def __repr__(self):
        return f"<Officer {self.badge_id} ({self.name}) - {self.rank}>"
