"""
Patrol API: Real-time Police Beat Dispatch & Mobile Tactical Interdiction.
Provides geospatial queries for on-duty LEA patrol units, nearest vehicle ranking,
and emergency dispatch interdiction flash broadcasts with SHA-256 evidence logging.
"""

import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status as http_status

from app.schemas.patrol import (
    PatrolUnitResponse,
    NearbyPatrolsResponse,
    PatrolDispatchRequest,
    PatrolDispatchResponse
)
from app.services.patrol_service import PatrolService
from app.api.auth import get_current_officer

logger = logging.getLogger("patrols_api")
router = APIRouter(prefix="/patrols", tags=["Patrol Interdiction & Tactical Geofencing"])


@router.get("", response_model=List[PatrolUnitResponse])
async def list_patrol_units(
    city: Optional[str] = Query(None, description="Filter by operational city (e.g. Mumbai, Delhi, Bengaluru)"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (e.g. PATROLLING, DISPATCHED_INTERDICTION)")
):
    """
    Returns active police patrol units, PCR vans, and beat marshals.
    Used for populating the Leaflet tactical GIS overlay.
    """
    try:
        return await PatrolService.list_patrols(city=city, status_filter=status_filter)
    except Exception as e:
        logger.error(f"Failed to fetch patrol units: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve patrol unit fleet."
        )



@router.get("/nearby", response_model=NearbyPatrolsResponse)
async def get_nearby_patrols(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Target cash-out hotspot latitude"),
    lon: float = Query(..., ge=-180.0, le=180.0, description="Target cash-out hotspot longitude"),
    radius_km: float = Query(15.0, ge=0.5, le=100.0, description="Search radius in kilometers")
):
    """
    High-precision PostGIS spherical spatial distance query.
    Calculates nearest active police units to the cash-out ATM with arrival ETAs.
    """
    try:
        return await PatrolService.get_nearby_patrols(lat=lat, lon=lon, radius_km=radius_km)
    except Exception as e:
        logger.error(f"Failed to query nearby patrol units for [{lat}, {lon}]: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Spatial patrol proximity query failed."
        )


@router.post("/{unit_id}/dispatch", response_model=PatrolDispatchResponse)
async def dispatch_patrol_unit(
    unit_id: str,
    request_body: PatrolDispatchRequest,
    request: Request,
    officer: dict = Depends(get_current_officer)
):
    """
    Direct One-Click Patrol Interdiction Dispatch Action:
    1. Transmits operational alert to PCR / Beat Marshal via LEA comms.
    2. Updates unit status to DISPATCHED_INTERDICTION.
    3. Generates cryptographic SHA-256 evidence receipt in audit_logs.
    4. Broadcasts WebSocket event to all connected monitoring rooms.

    Requires JWT authentication — only authorized law enforcement officers can dispatch patrols.
    """
    client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "0.0.0.0")

    try:
        return await PatrolService.dispatch_patrol(
            unit_id=unit_id,
            req=request_body,
            officer_badge_id=officer["badge_id"],
            client_ip=client_ip
        )
    except ValueError as e:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Patrol dispatch failed for unit {unit_id}: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Patrol dispatch operation failed. Incident logged."
        )

