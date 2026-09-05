from neo4j import GraphDatabase, AsyncGraphDatabase
from app.config import settings
import logging

logger = logging.getLogger("rakshanet.db.neo4j")

class Neo4jConnection:
    def __init__(self):
        self._driver = None
        self._async_driver = None

    def get_driver(self):
        if self._driver is None:
            try:
                self._driver = GraphDatabase.driver(
                    settings.NEO4J_URI,
                    auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
                    max_connection_lifetime=30 * 60,
                    max_connection_pool_size=50
                )
            except Exception as e:
                logger.warning(f"Neo4j sync driver connection deferred: {e}")
        return self._driver

    def get_async_driver(self):
        if self._async_driver is None:
            try:
                self._async_driver = AsyncGraphDatabase.driver(
                    settings.NEO4J_URI,
                    auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
                )
            except Exception as e:
                logger.warning(f"Neo4j async driver connection deferred: {e}")
        return self._async_driver

    def close(self):
        if self._driver:
            self._driver.close()
        if self._async_driver:
            self._async_driver.close()

neo4j_conn = Neo4jConnection()

def get_neo4j_session():
    driver = neo4j_conn.get_driver()
    if not driver:
        raise RuntimeError("Neo4j driver not connected. Ensure Neo4j container is running.")
    with driver.session() as session:
        yield session
