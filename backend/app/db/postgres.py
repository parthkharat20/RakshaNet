from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
import logging

logger = logging.getLogger("rakshanet.db.postgres")

# Async Engine (for FastAPI route handlers)
try:
    async_engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        future=True,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
    AsyncSessionLocal = async_sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False
    )
except Exception as e:
    logger.warning(f"Async PostgreSQL engine initialization deferred: {e}")
    async_engine = None
    AsyncSessionLocal = None

# Synchronous Engine (for table creation & seeding scripts)
try:
    sync_engine = create_engine(
        settings.SYNC_DATABASE_URL,
        echo=False,
        pool_pre_ping=True
    )
    SyncSessionLocal = sessionmaker(
        bind=sync_engine,
        autocommit=False,
        autoflush=False
    )
except Exception as e:
    logger.warning(f"Sync PostgreSQL engine initialization deferred: {e}")
    sync_engine = None
    SyncSessionLocal = None

async def get_db():
    """FastAPI dependency for async database session."""
    if AsyncSessionLocal is None:
        raise RuntimeError("PostgreSQL async session not initialized. Ensure database is running.")
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
