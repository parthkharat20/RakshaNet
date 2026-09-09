from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class PatrolUnitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    callsign: str
    unit_type: str
    officer_in_charge: str
    badge_id: Optional[str] = None
    contact_channel: str
    status: str
    city: str
    jurisdiction: str
    lat: float
    lon: float
    current_speed_kmh: float
    updated_at: datetime


class NearbyPatrolUnit(BaseModel):
    id: str
    callsign: str
    unit_type: str
    officer_in_charge: str
    badge_id: Optional[str] = None
    contact_channel: str
    status: str
    city: str
    jurisdiction: str
    lat: float
    lon: float
    distance_km: float
    eta_minutes: float
    speed_kmh: float


class NearbyPatrolsResponse(BaseModel):
    search_center: Dict[str, float]
    radius_km: float
    total_found: int
    units: List[NearbyPatrolUnit]


class PatrolDispatchRequest(BaseModel):
    alert_id: Optional[str] = Field(None, description="Associated threat alert UUID")
    target_terminal_id: Optional[str] = Field(None, description="ATM terminal ID (e.g., ATM_MUM_001)")
    target_atm_name: Optional[str] = Field(None, description="Descriptive hotspot location")
    target_lat: float = Field(..., description="Target cash-out hotspot latitude")
    target_lon: float = Field(..., description="Target cash-out hotspot longitude")
    tactical_instructions: Optional[str] = Field(
        "Immediate cash-out interdiction cordon. Intercept active mule runner at ATM terminal.",
        description="Operational directives for the patrolling crew"
    )


class PatrolDispatchResponse(BaseModel):
    success: bool
    dispatch_order_id: str
    unit_id: UUID
    callsign: str
    officer_in_charge: str
    unit_status: str
    target_hotspot: str
    distance_km: float
    eta_minutes: float
    audit_log_id: UUID
    hash_signature: str
    dispatched_at: datetime
    message: str
