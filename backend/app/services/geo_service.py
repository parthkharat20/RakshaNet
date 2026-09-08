import logging
from typing import List, Dict, Any
from sqlalchemy import text
from app.db.postgres import AsyncSessionLocal
from app.schemas.heatmap import (
    GeoJSONFeature,
    GeoJSONGeometry,
    GeoJSONFeatureCollection,
    NearbyATM,
    NearbyATMsResponse
)

logger = logging.getLogger("geo_service")


class GeoService:
    @staticmethod
    async def get_heatmap_geojson() -> GeoJSONFeatureCollection:
        """Returns all ATMs and complaints as a unified GeoJSON FeatureCollection for Leaflet."""
        features: List[GeoJSONFeature] = []

        async with AsyncSessionLocal() as session:
            # 1. Query ATMs with PostGIS coordinates
            atm_query = text("""
                SELECT id, terminal_id, bank_name, address, city, state,
                       ST_X(location::geometry) AS lon,
                       ST_Y(location::geometry) AS lat,
                       cash_out_frequency, risk_score, is_hotspot
                FROM atm_locations;
            """)
            atm_rows = (await session.execute(atm_query)).fetchall()

            for r in atm_rows:
                features.append(GeoJSONFeature(
                    type="Feature",
                    geometry=GeoJSONGeometry(type="Point", coordinates=[float(r[6]), float(r[7])]),
                    properties={
                        "id": str(r[0]),
                        "type": "ATM",
                        "title": f"ATM: {r[1]} ({r[2]})",
                        "terminal_id": r[1],
                        "bank_name": r[2],
                        "address": r[3],
                        "city": r[4],
                        "state": r[5],
                        "cash_out_frequency": r[8],
                        "risk_score": float(r[9]),
                        "is_hotspot": bool(r[10]),
                        "intensity": float(r[9])  # For Leaflet heatmap gradient weight
                    }
                ))

            # 2. Query Complaints with incident locations
            comp_query = text("""
                SELECT id, acknowledgement_no, category, loss_amount, city, state, status,
                       ST_X(location::geometry) AS lon,
                       ST_Y(location::geometry) AS lat
                FROM complaints
                WHERE location IS NOT NULL;
            """)
            comp_rows = (await session.execute(comp_query)).fetchall()

            for r in comp_rows:
                features.append(GeoJSONFeature(
                    type="Feature",
                    geometry=GeoJSONGeometry(type="Point", coordinates=[float(r[7]), float(r[8])]),
                    properties={
                        "id": str(r[0]),
                        "type": "COMPLAINT",
                        "title": f"NCRP: {r[1]} ({r[2]})",
                        "acknowledgement_no": r[1],
                        "category": r[2],
                        "loss_amount": float(r[3]),
                        "city": r[4],
                        "state": r[5],
                        "status": r[6],
                        "intensity": min(float(r[3]) / 200000.0, 1.0)
                    }
                ))

        return GeoJSONFeatureCollection(
            type="FeatureCollection",
            features=features,
            total_features=len(features)
        )

    @staticmethod
    async def get_nearby_atms(lat: float, lon: float, radius_km: float = 10.0) -> NearbyATMsResponse:
        """Finds all ATMs within a specified radius (in km) using PostGIS ST_DWithin."""
        radius_meters = radius_km * 1000.0

        query = text("""
            SELECT terminal_id, bank_name, address, city, state,
                   ST_Y(location::geometry) AS lat,
                   ST_X(location::geometry) AS lon,
                   ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography) / 1000.0 AS dist_km,
                   cash_out_frequency, risk_score, is_hotspot
            FROM atm_locations
            WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :radius_meters)
            ORDER BY dist_km ASC
            LIMIT 50;
        """)

        async with AsyncSessionLocal() as session:
            rows = (await session.execute(query, {
                "lon": lon,
                "lat": lat,
                "radius_meters": radius_meters
            })).fetchall()

            atms = [
                NearbyATM(
                    terminal_id=r[0],
                    bank_name=r[1],
                    address=r[2],
                    city=r[3],
                    state=r[4],
                    lat=float(r[5]),
                    lon=float(r[6]),
                    distance_km=round(float(r[7]), 2),
                    cash_out_frequency=r[8],
                    risk_score=float(r[9]),
                    is_hotspot=bool(r[10])
                )
                for r in rows
            ]

        return NearbyATMsResponse(
            search_center={"lat": lat, "lon": lon},
            radius_km=radius_km,
            total_found=len(atms),
            atms=atms
        )
