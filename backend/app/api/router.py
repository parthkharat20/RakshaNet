from fastapi import APIRouter
from app.api.stats import router as stats_router
from app.api.accounts import router as accounts_router
from app.api.heatmap import router as heatmap_router
from app.api.complaints import router as complaints_router
from app.api.freeze import router as freeze_router
from app.api.alerts import router as alerts_router

api_router = APIRouter()

api_router.include_router(stats_router)
api_router.include_router(accounts_router)
api_router.include_router(heatmap_router)
api_router.include_router(complaints_router)
api_router.include_router(freeze_router)
api_router.include_router(alerts_router)
