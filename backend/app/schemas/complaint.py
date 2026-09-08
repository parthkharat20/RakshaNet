from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class ComplaintCreate(BaseModel):
    category: str = Field(..., description="NCRP Fraud Category (e.g., 'UPI QR Code / Payment Request Fraud', 'Digital Arrest Scam')")
    loss_amount: float = Field(..., gt=0, description="Financial loss incurred in INR")
    victim_account_number: Optional[str] = Field(None, description="Bank account number of victim")
    suspect_account_number: Optional[str] = Field(None, description="Suspect mule account number receiving funds")
    incident_time: datetime = Field(..., description="Timestamp of when fraudulent debit occurred")
    lat: Optional[float] = Field(None, description="Latitude of incident location")
    lon: Optional[float] = Field(None, description="Longitude of incident location")
    city: Optional[str] = Field(None, description="City of incident")
    state: Optional[str] = Field(None, description="State of incident")
    description: Optional[str] = Field(None, description="Victim narrative statement")


class ComplaintResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    acknowledgement_no: str
    category: str
    loss_amount: float
    victim_account_id: Optional[UUID] = None
    suspect_account_id: Optional[UUID] = None
    incident_time: datetime
    reported_time: datetime
    city: Optional[str] = None
    state: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    status: str
    description: Optional[str] = None
    created_at: datetime
