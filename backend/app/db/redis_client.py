from typing import Optional
import redis.asyncio as aioredis
from app.config import settings

_redis: Optional[aioredis.Redis] = None


def get_redis() -> aioredis.Redis:
    """Returns or initializes the async Redis client instance."""
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20
        )
    return _redis


async def close_redis():
    """Closes the Redis client connection pool."""
    global _redis
    if _redis is not None:
        await _redis.close()
        _redis = None


async def check_redis_connection() -> bool:
    """Verifies active connectivity to Redis server."""
    try:
        client = get_redis()
        return await client.ping()
    except Exception as e:
        print(f"[ERROR] Redis connection failed: {e}")
        return False
