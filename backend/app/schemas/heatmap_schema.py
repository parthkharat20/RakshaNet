from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class GeoJSONGeometry(BaseModel):
    type: str = "Point"
    coordinates: List[float] # [longitude, latitude]

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: GeoJSONGeometry
    properties: Dict[str, Any]

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]

class DashboardStats(BaseModel):
    total_complaints: int
    active_alerts: int
    funds_preserved_inr: float
    avg_response_minutes: float
    predicted_clean_accounts: int
    critical_hotspots_count: int
