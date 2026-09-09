"""
Seeds demo Police Patrol Units with PostGIS coordinates for SIH field interdiction demonstration.
Called automatically on application startup.
"""
import logging
from datetime import datetime, timezone
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from sqlalchemy import select
from app.db.postgres import AsyncSessionLocal, engine
from app.db.base import Base
from app.models.patrol_unit import PatrolUnit

logger = logging.getLogger("init_patrols")

DEMO_PATROL_UNITS = [
    # Mumbai Police Sector (Western & Central Corridor)
    {
        "callsign": "PCR-MUM-NORTH-12",
        "unit_type": "PCR_VAN",
        "officer_in_charge": "ASI Vilas Shinde",
        "badge_id": "MH-POL-4412",
        "contact_channel": "VHF Ch 4 / +91 98201 44102",
        "status": "ON_PATROL",
        "city": "Mumbai",
        "jurisdiction": "Matunga Police Station Precinct",
        "lat": 19.0270,
        "lon": 72.8550,
        "current_speed_kmh": 22.0
    },
    {
        "callsign": "BEAT-MARSHAL-MATUNGA-04",
        "unit_type": "MOTORCYCLE_MARSHAL",
        "officer_in_charge": "HC Santosh Gaikwad",
        "badge_id": "MH-POL-8821",
        "contact_channel": "VHF Ch 4 / +91 98201 88204",
        "status": "ON_PATROL",
        "city": "Mumbai",
        "jurisdiction": "Kings Circle / Matunga East Precinct",
        "lat": 19.0305,
        "lon": 72.8580,
        "current_speed_kmh": 30.0
    },
    {
        "callsign": "PCR-MUM-CENTRAL-07",
        "unit_type": "PCR_VAN",
        "officer_in_charge": "PSI Ramesh Kulkarni",
        "badge_id": "MH-POL-3109",
        "contact_channel": "VHF Ch 2 / +91 98202 31007",
        "status": "ON_PATROL",
        "city": "Mumbai",
        "jurisdiction": "Dadar West Police Station",
        "lat": 19.0178,
        "lon": 72.8478,
        "current_speed_kmh": 20.0
    },
    {
        "callsign": "BEAT-MARSHAL-DADAR-02",
        "unit_type": "MOTORCYCLE_MARSHAL",
        "officer_in_charge": "Constable Anand Jadhav",
        "badge_id": "MH-POL-7714",
        "contact_channel": "VHF Ch 2 / +91 98202 77102",
        "status": "ON_PATROL",
        "city": "Mumbai",
        "jurisdiction": "Shivaji Park Beat Cordon",
        "lat": 19.0269,
        "lon": 72.8372,
        "current_speed_kmh": 28.0
    },
    {
        "callsign": "INTERCEPTOR-MUM-BKC-01",
        "unit_type": "INTERCEPTOR_MOBILE",
        "officer_in_charge": "PI Deepak Sawant",
        "badge_id": "MH-POL-1002",
        "contact_channel": "Tactical Ch 1 / +91 98209 10001",
        "status": "STANDBY",
        "city": "Mumbai",
        "jurisdiction": "Bandra-Kurla Complex Financial Taskforce",
        "lat": 19.0657,
        "lon": 72.8688,
        "current_speed_kmh": 0.0
    },

    # Delhi Police Sector (New Delhi & Central NCR)
    {
        "callsign": "PCR-DEL-CP-01",
        "unit_type": "PCR_VAN",
        "officer_in_charge": "SI Vikram Meena",
        "badge_id": "DL-POL-2091",
        "contact_channel": "NCR Net 1 / +91 98110 20901",
        "status": "ON_PATROL",
        "city": "New Delhi",
        "jurisdiction": "Connaught Place Police Station",
        "lat": 28.6328,
        "lon": 77.2197,
        "current_speed_kmh": 25.0
    },
    {
        "callsign": "BEAT-MARSHAL-CP-03",
        "unit_type": "MOTORCYCLE_MARSHAL",
        "officer_in_charge": "HC Naresh Tanwar",
        "badge_id": "DL-POL-6512",
        "contact_channel": "NCR Net 1 / +91 98110 65103",
        "status": "ON_PATROL",
        "city": "New Delhi",
        "jurisdiction": "Barakhamba Road & Janpath Corridor",
        "lat": 28.6290,
        "lon": 77.2260,
        "current_speed_kmh": 32.0
    },
    {
        "callsign": "PCR-DEL-NDLS-05",
        "unit_type": "PCR_VAN",
        "officer_in_charge": "ASI Surinder Singh",
        "badge_id": "DL-POL-4190",
        "contact_channel": "NCR Net 3 / +91 98110 41905",
        "status": "ON_PATROL",
        "city": "New Delhi",
        "jurisdiction": "Pahar Ganj & NDLS Metro Zone",
        "lat": 28.6429,
        "lon": 77.2195,
        "current_speed_kmh": 18.0
    },
    {
        "callsign": "BEAT-MARSHAL-SOUTH-DEL-02",
        "unit_type": "MOTORCYCLE_MARSHAL",
        "officer_in_charge": "Constable Amit Tyagi",
        "badge_id": "DL-POL-9923",
        "contact_channel": "NCR Net 4 / +91 98110 99202",
        "status": "ON_PATROL",
        "city": "New Delhi",
        "jurisdiction": "Hauz Khas / IIT Flyover Zone",
        "lat": 28.5494,
        "lon": 77.1950,
        "current_speed_kmh": 35.0
    },

    # Bengaluru Police Sector (IT Corridors)
    {
        "callsign": "PCR-BLR-WHITEFIELD-02",
        "unit_type": "PCR_VAN",
        "officer_in_charge": "PSI Manjunath Gowda",
        "badge_id": "KA-POL-5120",
        "contact_channel": "Bangalore Control / +91 94808 51202",
        "status": "ON_PATROL",
        "city": "Bengaluru",
        "jurisdiction": "Whitefield ITPL Main Corridor",
        "lat": 12.9860,
        "lon": 77.7320,
        "current_speed_kmh": 26.0
    },
    {
        "callsign": "BEAT-MARSHAL-KORAMANGALA-06",
        "unit_type": "MOTORCYCLE_MARSHAL",
        "officer_in_charge": "HC Chethan Kumar",
        "badge_id": "KA-POL-7341",
        "contact_channel": "Bangalore Control / +91 94808 73406",
        "status": "ON_PATROL",
        "city": "Bengaluru",
        "jurisdiction": "80 Feet Road Koramangala 4th Block",
        "lat": 12.9352,
        "lon": 77.6245,
        "current_speed_kmh": 30.0
    },
    {
        "callsign": "PCR-BLR-INDIRANAGAR-04",
        "unit_type": "PCR_VAN",
        "officer_in_charge": "ASI Srinivas Rao",
        "badge_id": "KA-POL-3490",
        "contact_channel": "Bangalore Control / +91 94808 34904",
        "status": "ON_PATROL",
        "city": "Bengaluru",
        "jurisdiction": "100 Feet Road Indiranagar Sector",
        "lat": 12.9784,
        "lon": 77.6408,
        "current_speed_kmh": 22.0
    }
]


async def seed_demo_patrols():
    """Ensures the patrol_units table exists with PostGIS geometry and seeds demo units."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    now = datetime.now(timezone.utc)
    async with AsyncSessionLocal() as session:
        for p in DEMO_PATROL_UNITS:
            res = await session.execute(
                select(PatrolUnit).where(PatrolUnit.callsign == p["callsign"])
            )
            existing = res.scalar_one_or_none()

            geom = from_shape(Point(p["lon"], p["lat"]), srid=4326)

            if not existing:
                unit = PatrolUnit(
                    callsign=p["callsign"],
                    unit_type=p["unit_type"],
                    officer_in_charge=p["officer_in_charge"],
                    badge_id=p.get("badge_id"),
                    contact_channel=p["contact_channel"],
                    status=p["status"],
                    city=p["city"],
                    jurisdiction=p["jurisdiction"],
                    location=geom,
                    current_speed_kmh=p["current_speed_kmh"],
                    created_at=now,
                    updated_at=now
                )
                session.add(unit)
                logger.info(f"✅ Seeded patrol unit: {p['callsign']} ({p['city']})")
            else:
                # Update location to keep coordinates fresh
                existing.location = geom
                existing.status = p["status"]
                existing.updated_at = now

        await session.commit()

    logger.info(f"✅ Patrol unit seeding complete. {len(DEMO_PATROL_UNITS)} active units available.")
