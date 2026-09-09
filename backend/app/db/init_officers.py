"""
Seeds demo Law Enforcement Officers for SIH demonstration.
Called automatically on application startup.
"""
import logging
from sqlalchemy import select, text
from app.db.postgres import AsyncSessionLocal, engine
from app.db.base import Base
from app.models.officer import Officer

logger = logging.getLogger("init_officers")

# Demo officers for SIH presentation
DEMO_OFFICERS = [
    {
        "badge_id": "LE-CYBER-MUM-4029",
        "name": "Inspector Parth Kharat",
        "rank": "Cyber Crime Inspector",
        "department": "Maharashtra Cyber Cell, I4C Division",
        "pin": "1234"
    },
    {
        "badge_id": "LE-CYBER-DEL-1001",
        "name": "SP Rajesh Kumar",
        "rank": "Superintendent of Police",
        "department": "Delhi Cyber Crime Branch",
        "pin": "5678"
    },
    {
        "badge_id": "LE-CYBER-BLR-2045",
        "name": "ASP Priya Sharma",
        "rank": "Assistant Superintendent",
        "department": "Karnataka CID Cyber Division",
        "pin": "9012"
    },
    {
        "badge_id": "LE-I4C-HQ-0001",
        "name": "DIG Vikram Singh",
        "rank": "Deputy Inspector General",
        "department": "I4C National Coordination Centre",
        "pin": "admin"
    }
]


async def seed_demo_officers():
    """Creates the officers table and seeds demo officers if they don't exist."""
    # Ensure the officers table exists
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        for officer_data in DEMO_OFFICERS:
            # Check if officer already exists
            result = await session.execute(
                select(Officer).where(Officer.badge_id == officer_data["badge_id"])
            )
            existing = result.scalar_one_or_none()

            if not existing:
                officer = Officer(
                    badge_id=officer_data["badge_id"],
                    name=officer_data["name"],
                    rank=officer_data["rank"],
                    department=officer_data["department"],
                    hashed_pin=Officer.hash_pin(officer_data["pin"])
                )
                session.add(officer)
                logger.info(f"✅ Seeded officer: {officer_data['badge_id']} ({officer_data['name']})")
            else:
                logger.debug(f"Officer {officer_data['badge_id']} already exists, skipping.")

        await session.commit()

    logger.info(f"✅ Officer seeding complete. {len(DEMO_OFFICERS)} officers available.")
