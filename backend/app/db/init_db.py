import asyncio
import logging
from sqlalchemy import text
from app.db.postgres import engine
from app.db.base import Base
import app.models  # Ensures all models are registered with Base.metadata
from app.db.neo4j_schema import init_neo4j_schema

logger = logging.getLogger("init_db")


async def init_postgres():
    """Enables PostGIS and creates all relational tables."""
    logger.info("Connecting to PostgreSQL to initialize tables...")
    async with engine.begin() as conn:
        logger.info("Enabling PostGIS extension...")
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
        logger.info("Creating relational tables from SQLAlchemy metadata...")
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ PostgreSQL tables & PostGIS spatial columns created successfully.")


async def init_all_databases():
    """Initializes PostgreSQL schemas, PostGIS, and Neo4j graph constraints."""
    logger.info("=== Initializing RakshaNet Multi-Database Schemas ===")
    await init_postgres()
    await init_neo4j_schema()
    logger.info("=== All Databases Initialized Successfully ===")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(init_all_databases())
