import logging
from fastapi import APIRouter, Query
from app.schemas.heatmap import GeoJSONFeatureCollection, NearbyATMsResponse
from app.services.geo_service import GeoService

logger = logging.getLogger("heatmap_api")
router = APIRouter(prefix="/heatmap", tags=["Geospatial & Heatmap"])


@router.get("", response_model=GeoJSONFeatureCollection)
async def get_heatmap_features():
    """
    Returns RFC 7946 GeoJSON FeatureCollection containing all ATMs and reported cybercrime complaint points.
    Used directly by the Leaflet Dark-Mode map on the frontend dashboard.
    """
    return await GeoService.get_heatmap_geojson()


@router.get("/atms/nearby", response_model=NearbyATMsResponse)
async def get_nearby_atms(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Latitude of center coordinate"),
    lon: float = Query(..., ge=-180.0, le=180.0, description="Longitude of center coordinate"),
    radius_km: float = Query(10.0, gt=0.0, le=100.0, description="Search radius in kilometers")
):
    """
    Performs high-speed PostGIS spatial radius search (ST_DWithin) to locate physical ATM cash-out points.
    """
    return await GeoService.get_nearby_atms(lat=lat, lon=lon, radius_km=radius_km)
