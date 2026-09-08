from typing import Optional
from neo4j import AsyncGraphDatabase, AsyncDriver
from app.config import settings

_driver: Optional[AsyncDriver] = None


def get_neo4j_driver() -> AsyncDriver:
    """Returns or initializes the async Neo4j driver."""
    global _driver
    if _driver is None:
        _driver = AsyncGraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
            max_connection_lifetime=3600,
            max_connection_pool_size=50,
            connection_acquisition_timeout=10.0
        )
    return _driver


async def close_neo4j():
    """Closes the Neo4j driver connection pool."""
    global _driver
    if _driver is not None:
        await _driver.close()
        _driver = None


async def check_neo4j_connection() -> bool:
    """Verifies active connectivity to Neo4j graph database."""
    try:
        driver = get_neo4j_driver()
        async with driver.session() as session:
            result = await session.run("RETURN 1 AS ping")
            record = await result.single()
            return record is not None and record["ping"] == 1
    except Exception as e:
        print(f"[ERROR] Neo4j connection failed: {e}")
        return False
