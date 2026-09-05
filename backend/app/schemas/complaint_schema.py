from pydantic import BaseModel, Field
from typing import Optional, Union
from uuid import UUID
from datetime import datetime

class ComplaintCreate(BaseModel):
    ncrp_ref: Optional[str] = None
    victim_name: Optional[str] = "Anonymous Citizen"
    fraud_type: str = Field(..., example="digital_arrest")
    amount: float = Field(..., gt=0, example=45000.0)
    suspect_account_no: str = Field(..., example="987654321098")
    initial_mule_bank: Optional[str] = "State Bank of India"
    jurisdiction: str = Field(..., example="Delhi")
    district: Optional[str] = "South Delhi"
    latitude: float = Field(..., example=28.6139)
    longitude: float = Field(..., example=77.2090)
    description: Optional[str] = "Victim coerced through fraudulent legal threat call."

class ComplaintResponse(BaseModel):
    id: Union[UUID, str]
    ncrp_ref: str
    fraud_type: str
    amount: float
    suspect_account_no: str
    jurisdiction: str
    status: str
    filed_at: datetime

    class Config:
        from_attributes = True
