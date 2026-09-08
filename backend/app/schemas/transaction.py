from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class TransactionCreate(BaseModel):
    sender_account_number: str = Field(..., description="Sender 11-16 digit account number")
    receiver_account_number: str = Field(..., description="Receiver 11-16 digit account number")
    amount: float = Field(..., gt=0, description="Amount in INR")
    channel: str = Field("UPI", description="Transfer channel: UPI, IMPS, NEFT, RTGS, ATM_WITHDRAWAL")
    timestamp: Optional[datetime] = Field(None, description="Transaction timestamp")
    is_flagged: bool = False
    ring_id: Optional[str] = None


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    txn_ref: str
    sender_account_id: UUID
    receiver_account_id: UUID
    amount: float
    timestamp: datetime
    channel: str
    is_flagged: bool
    hop_level: int
    ring_id: Optional[str] = None
    created_at: datetime
