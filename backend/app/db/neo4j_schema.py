import asyncio
import logging
from app.db.neo4j_driver import get_neo4j_driver

logger = logging.getLogger(__name__)

CONSTRAINTS_AND_INDEXES = [
    # 1. Unique constraint for Account node
    """
    CREATE CONSTRAINT account_number_unique IF NOT EXISTS
    FOR (a:Account) REQUIRE a.account_number IS UNIQUE
    """,

    # 2. Unique constraint for ATM node
    """
    CREATE CONSTRAINT atm_terminal_id_unique IF NOT EXISTS
    FOR (atm:ATM) REQUIRE atm.terminal_id IS UNIQUE
    """,

    # 3. Index for fast bank filtering
    """
    CREATE INDEX account_bank_idx IF NOT EXISTS
    FOR (a:Account) ON (a.bank_name)
    """,

    # 4. Index for risk scoring lookups
    """
    CREATE INDEX account_risk_idx IF NOT EXISTS
    FOR (a:Account) ON (a.risk_score)
    """,

    # 5. Index for transaction reference lookups
    """
    CREATE INDEX transferred_txn_idx IF NOT EXISTS
    FOR ()-[r:TRANSFERRED]-() ON (r.txn_ref)
    """
]


async def init_neo4j_schema() -> bool:
    """Applies schema constraints and indexes to Neo4j graph database."""
    driver = get_neo4j_driver()
    try:
        async with driver.session() as session:
            for statement in CONSTRAINTS_AND_INDEXES:
                logger.info(f"Applying Neo4j schema: {statement.strip().splitlines()[0]}...")
                await session.run(statement)
        logger.info("✅ Neo4j constraints and indexes applied successfully.")
        return True
    except Exception as e:
        logger.error(f"❌ Failed applying Neo4j schema: {e}")
        raise e


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(init_neo4j_schema())
