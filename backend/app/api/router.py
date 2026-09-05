from fastapi import APIRouter
from app.api.ingest import router as ingest_router
from app.api.alerts import router as alerts_router
from app.api.heatmap import router as heatmap_router
from app.api.graph import router as graph_router
from app.api.stats import router as stats_router

api_router = APIRouter()

api_router.include_router(ingest_router)
api_router.include_router(alerts_router)
api_router.include_router(heatmap_router)
api_router.include_router(graph_router)
api_router.include_router(stats_router)
