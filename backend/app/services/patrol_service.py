"""
Patrol Service: Real-time Law Enforcement Patrol Geofencing & Interdiction Dispatch.
Executes high-precision PostGIS spherical spatial distance queries and dispatches on-duty
beat marshals and PCR vans to predicted ATM liquidation hotspots.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy import text, select

from app.db.postgres import AsyncSessionLocal
from app.models.patrol_unit import PatrolUnit
from app.models.audit_log import AuditLog
from app.schemas.patrol import (
    PatrolUnitResponse,
    NearbyPatrolUnit,
    NearbyPatrolsResponse,
    PatrolDispatchRequest,
    PatrolDispatchResponse
)

logger = logging.getLogger("patrol_service")


class PatrolService:
    @staticmethod
    async def list_patrols(city: Optional[str] = None, status_filter: Optional[str] = None) -> List[PatrolUnitResponse]:
        """Returns all patrol units with optional city and status filters."""
        conditions = []
        params = {}
        if city:
            conditions.append("city ILIKE :city")
            params["city"] = f"%{city}%"
        if status_filter:
            conditions.append("status = :status")
            params["status"] = status_filter

        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

        async with AsyncSessionLocal() as session:
            query = text(f"""
                SELECT id, callsign, unit_type, officer_in_charge, badge_id,
                       contact_channel, status, city, jurisdiction,
                       ST_Y(location::geometry) AS lat,
                       ST_X(location::geometry) AS lon,
                       current_speed_kmh, updated_at
                FROM patrol_units
                {where_clause}
                ORDER BY callsign ASC;
            """)
            rows = (await session.execute(query, params)).fetchall()


            return [
                PatrolUnitResponse(
                    id=r[0],
                    callsign=r[1],
                    unit_type=r[2],
                    officer_in_charge=r[3],
                    badge_id=r[4],
                    contact_channel=r[5],
                    status=r[6],
                    city=r[7],
                    jurisdiction=r[8],
                    lat=float(r[9]),
                    lon=float(r[10]),
                    current_speed_kmh=float(r[11]),
                    updated_at=r[12]
                )
                for r in rows
            ]

    @staticmethod
    async def get_nearby_patrols(lat: float, lon: float, radius_km: float = 10.0) -> NearbyPatrolsResponse:
        """
        Locates all on-duty police patrol units within radius_km of given coordinates
        using PostGIS ST_DWithin on spherical geography. Calculates real-time arrival ETAs.
        """
        radius_meters = radius_km * 1000.0

        query = text("""
            SELECT id, callsign, unit_type, officer_in_charge, badge_id,
                   contact_channel, status, city, jurisdiction,
                   ST_Y(location::geometry) AS lat,
                   ST_X(location::geometry) AS lon,
                   ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography) / 1000.0 AS dist_km,
                   current_speed_kmh
            FROM patrol_units
            WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :radius_meters)
            ORDER BY dist_km ASC
            LIMIT 20;
        """)

        async with AsyncSessionLocal() as session:
            rows = (await session.execute(query, {
                "lon": lon,
                "lat": lat,
                "radius_meters": radius_meters
            })).fetchall()

            units = []
            for r in rows:
                dist = round(float(r[11]), 2)
                speed = max(float(r[12]), 20.0)  # Min response speed 20 km/h in metro traffic
                eta = round(max((dist / speed) * 60.0, 1.0), 1)  # Minutes

                units.append(NearbyPatrolUnit(
                    id=str(r[0]),
                    callsign=r[1],
                    unit_type=r[2],
                    officer_in_charge=r[3],
                    badge_id=r[4],
                    contact_channel=r[5],
                    status=r[6],
                    city=r[7],
                    jurisdiction=r[8],
                    lat=float(r[9]),
                    lon=float(r[10]),
                    distance_km=dist,
                    eta_minutes=eta,
                    speed_kmh=float(r[12])
                ))

        return NearbyPatrolsResponse(
            search_center={"lat": lat, "lon": lon},
            radius_km=radius_km,
            total_found=len(units),
            units=units
        )

    @staticmethod
    async def dispatch_patrol(
        unit_id: str,
        req: PatrolDispatchRequest,
        officer_badge_id: str,
        client_ip: str = "127.0.0.1"
    ) -> PatrolDispatchResponse:
        """
        Dispatches an emergency interdiction order to the specified patrol unit:
        1. Updates unit status to DISPATCHED_INTERDICTION
        2. Computes SHA-256 evidence log in audit_logs
        3. Broadcasts real-time WebSocket event to all connected command rooms
        4. Returns formal LEA dispatch confirmation receipt
        """
        now = datetime.now(timezone.utc)
        date_str = now.strftime("%Y%m%d")
        hex_suffix = uuid.uuid4().hex[:6].upper()

        async with AsyncSessionLocal() as session:
            # Query target unit
            try:
                unit_uuid = UUID(unit_id)
                query = select(PatrolUnit).where(PatrolUnit.id == unit_uuid)
            except ValueError:
                query = select(PatrolUnit).where(PatrolUnit.callsign == unit_id)

            res = await session.execute(query)
            unit = res.scalar_one_or_none()

            if not unit:
                raise ValueError(f"Patrol unit '{unit_id}' not found.")

            # Calculate precise distance and ETA
            dist_query = text("""
                SELECT ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography) / 1000.0 AS dist_km
                FROM patrol_units WHERE id = :uid;
            """)
            dist_res = await session.execute(dist_query, {"uid": unit.id, "lon": req.target_lon, "lat": req.target_lat})
            dist_km = round(float(dist_res.scalar_one() or 1.5), 2)
            eta_mins = round(max((dist_km / max(unit.current_speed_kmh, 20.0)) * 60.0, 1.0), 1)

            # Update unit status
            unit.status = "DISPATCHED_INTERDICTION"
            unit.updated_at = now

            # Generate dispatch order reference
            city_prefix = (unit.city or "LEA")[:3].upper()
            order_ref = f"{city_prefix}-PCR-FLASH-{date_str}-{hex_suffix}"
            target_hotspot = req.target_atm_name or req.target_terminal_id or f"Coords [{req.target_lat:.4f}, {req.target_lon:.4f}]"

            # Create cryptographic SHA-256 audit entry
            details = {
                "dispatch_order_id": order_ref,
                "callsign": unit.callsign,
                "officer_in_charge": unit.officer_in_charge,
                "target_hotspot": target_hotspot,
                "target_lat": req.target_lat,
                "target_lon": req.target_lon,
                "distance_km": dist_km,
                "eta_minutes": eta_mins,
                "tactical_instructions": req.tactical_instructions,
                "alert_id": req.alert_id,
                "client_ip": client_ip
            }
            timestamp_str = now.isoformat()
            signature = AuditLog.compute_signature(
                badge_id=officer_badge_id,
                action="PATROL_DISPATCH",
                target_id=str(unit.id),
                timestamp_str=timestamp_str,
                details_dict=details
            )

            audit_log = AuditLog(
                officer_badge_id=officer_badge_id,
                action="PATROL_DISPATCH",
                target_type="PATROL_UNIT",
                target_id=str(unit.id),
                details=details,
                ip_address=client_ip,
                timestamp=now,
                hash_signature=signature
            )
            session.add(audit_log)
            await session.commit()
            await session.refresh(unit)
            await session.refresh(audit_log)

        # Broadcast real-time WebSocket event
        try:
            from app.realtime.dispatcher import dispatch_patrol_event
            await dispatch_patrol_event(
                callsign=unit.callsign,
                officer_in_charge=unit.officer_in_charge,
                target_hotspot=target_hotspot,
                dispatch_order_id=order_ref,
                distance_km=dist_km,
                eta_minutes=eta_mins,
                officer_badge_id=officer_badge_id
            )
        except Exception as e:
            logger.warning(f"WebSocket broadcast failed for patrol dispatch: {e}")

        logger.info(
            f"🚨 [PATROL DISPATCHED] Unit={unit.callsign} ({unit.officer_in_charge}) -> Hotspot={target_hotspot} | "
            f"Order={order_ref} | Dist={dist_km}km (ETA {eta_mins}m) | Dispatched by {officer_badge_id}"
        )

        return PatrolDispatchResponse(
            success=True,
            dispatch_order_id=order_ref,
            unit_id=unit.id,
            callsign=unit.callsign,
            officer_in_charge=unit.officer_in_charge,
            unit_status=unit.status,
            target_hotspot=target_hotspot,
            distance_km=dist_km,
            eta_minutes=eta_mins,
            audit_log_id=audit_log.id,
            hash_signature=signature,
            dispatched_at=now,
            message=f"Interdiction flash transmitted to {unit.callsign}. ETA {eta_mins} mins to {target_hotspot}."
        )
