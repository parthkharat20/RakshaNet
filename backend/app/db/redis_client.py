import redis.asyncio as aioredis
import redis
from app.config import settings
import logging

logger = logging.getLogger("rakshanet.db.redis")

# Async Redis client for FastAPI WebSockets and Pub/Sub
async_redis = aioredis.from_url(
    settings.REDIS_URL,
    encoding="utf-8",
    decode_responses=True
)

# Sync Redis client for background scripts
sync_redis = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    decode_responses=True
)

async def get_redis():
    return async_redis
