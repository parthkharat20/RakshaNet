from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.api.router import api_router
from app.realtime.ws_manager import ws_manager
from app.db.postgres import async_engine, sync_engine
from app.db.neo4j_conn import neo4j_conn
from app.models.base import Base
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("rakshanet.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing RakshaNet Unified Backend...")
    # Attempt table creation if database is connected
    if async_engine:
        try:
            async with async_engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("PostgreSQL + PostGIS tables verified.")
        except Exception as e:
            logger.warning(f"Database table verification skipped or deferred: {e}")

    # Verify Neo4j Driver
    try:
        driver = neo4j_conn.get_driver()
        if driver:
            driver.verify_connectivity()
            logger.info("Neo4j Graph Database connected successfully.")
    except Exception as e:
        logger.warning(f"Neo4j connectivity check deferred: {e}")

    yield

    logger.info("Shutting down RakshaNet services...")
    neo4j_conn.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Predictive Cash-Out Hotspot Intelligence — Ministry of Home Affairs (I4C) · SIH26184",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permissive for hackathon prototyping
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "RakshaNet Unified Backend & Dual AI",
        "version": settings.VERSION,
        "mode": "Slide 3 Full Stack"
    }

# Native WebSocket route for real-time LEA alert feed
@app.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep-alive heartbeat
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
