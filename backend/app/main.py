from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.db.postgres import check_postgres_connection
from app.db.neo4j_driver import check_neo4j_connection, close_neo4j
from app.db.redis_client import check_redis_connection, close_redis


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown hooks."""
    print(f"[*] Starting {settings.PROJECT_NAME} Backend ({settings.ENVIRONMENT})...")
    yield
    print(f"[*] Shutting down {settings.PROJECT_NAME} Backend...")
    await close_neo4j()
    await close_redis()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Predictive Cash-Out Hotspot Intelligence & Multi-Hop Mule Interdiction Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["System"])
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "operational",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/health", tags=["System"])
async def health_check():
    """Phase 0 Checkpoint: Verifies connectivity to all three data stores."""
    pg_ok = await check_postgres_connection()
    neo_ok = await check_neo4j_connection()
    redis_ok = await check_redis_connection()

    all_healthy = pg_ok and neo_ok and redis_ok

    payload = {
        "status": "healthy" if all_healthy else "degraded",
        "databases": {
            "postgres": "connected" if pg_ok else "disconnected",
            "neo4j": "connected" if neo_ok else "disconnected",
            "redis": "connected" if redis_ok else "disconnected"
        }
    }

    status_code = status.HTTP_200_OK if all_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(status_code=status_code, content=payload)
