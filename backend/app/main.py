"""
RakshaNet Main Application: FastAPI entry point with production-grade middleware.

Features:
- Versioned API gateway under /api/v1
- Request ID tracking via X-Request-ID header
- Sanitized error responses (no internal detail leakage)
- Structured logging with request timing
- CORS configuration
"""
import time
import uuid
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.db.postgres import check_postgres_connection
from app.db.neo4j_driver import check_neo4j_connection, close_neo4j
from app.db.redis_client import check_redis_connection, close_redis
from app.api.router import api_router

logger = logging.getLogger("rakshanet")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown hooks."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    logger.info(f"Starting {settings.PROJECT_NAME} Backend ({settings.ENVIRONMENT})...")

    # Initialize officers and patrol units on startup
    try:
        from app.db.init_officers import seed_demo_officers
        await seed_demo_officers()
    except Exception as e:
        logger.warning(f"Officer seeding skipped: {e}")

    try:
        from app.db.init_patrols import seed_demo_patrols
        await seed_demo_patrols()
    except Exception as e:
        logger.warning(f"Patrol unit seeding skipped: {e}")


    yield

    logger.info(f"Shutting down {settings.PROJECT_NAME} Backend...")
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


# --- Middleware: Request ID & Timing ---
@app.middleware("http")
async def request_tracking_middleware(request: Request, call_next):
    """Adds X-Request-ID header and logs request timing."""
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
    start_time = time.time()

    response = await call_next(request)

    duration_ms = round((time.time() - start_time) * 1000, 2)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time-Ms"] = str(duration_ms)

    # Log request (skip noisy health checks and static assets)
    path = request.url.path
    if not path.startswith("/docs") and path != "/openapi.json":
        log_level = logging.WARNING if response.status_code >= 400 else logging.INFO
        logger.log(
            log_level,
            f"[{request_id}] {request.method} {path} → {response.status_code} ({duration_ms}ms)"
        )

    return response


# Mount Versioned API Gateway Router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# --- Exception Handlers ---

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "detail": exc.errors()
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """
    Production-safe error handler: logs full error server-side but returns
    a sanitized message to the client (no stack traces, SQL queries, or internal paths).
    """
    request_id = request.headers.get("X-Request-ID", "unknown")
    logger.error(f"[{request_id}] Unhandled Error in {request.method} {request.url}: {exc}", exc_info=True)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred. The incident has been logged for investigation.",
            "request_id": request_id
        }
    )


# --- System Endpoints ---

@app.get("/", tags=["System"])
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "operational",
        "version": "1.0.0",
        "docs": "/docs",
        "api_v1": settings.API_V1_PREFIX
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


# --- WebSocket Endpoint: Real-Time Command Center Push ---

from fastapi import WebSocket, WebSocketDisconnect
from app.realtime.socket_server import ws_manager


@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    """
    WebSocket endpoint for real-time push to the Command Center frontend.
    Broadcasts: new alerts, freeze confirmations, pipeline progress, complaint ingestions.
    """
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive — listen for client pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"event_type": "pong", "timestamp": ""})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

