from typing import List, Dict, Any, Literal
from pydantic import BaseModel, Field


class GeoJSONGeometry(BaseModel):
    type: Literal["Point"] = "Point"
    coordinates: List[float] = Field(..., description="[longitude, latitude]")


class GeoJSONFeature(BaseModel):
    type: Literal["Feature"] = "Feature"
    geometry: GeoJSONGeometry
    properties: Dict[str, Any]


class GeoJSONFeatureCollection(BaseModel):
    type: Literal["FeatureCollection"] = "FeatureCollection"
    features: List[GeoJSONFeature]
    total_features: int


class NearbyATM(BaseModel):
    terminal_id: str
    bank_name: str
    address: str
    city: str
    state: str
    lat: float
    lon: float
    distance_km: float
    cash_out_frequency: int
    risk_score: float
    is_hotspot: bool


class NearbyATMsResponse(BaseModel):
    search_center: Dict[str, float]
    radius_km: float
    total_found: int
    atms: List[NearbyATM]
