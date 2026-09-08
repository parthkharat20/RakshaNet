import json
import logging
from pathlib import Path
from fastapi import APIRouter
from sqlalchemy import text
from app.db.postgres import AsyncSessionLocal
from app.schemas.stats import DashboardStatsResponse, FraudRingSummary

logger = logging.getLogger("stats_api")
router = APIRouter(prefix="/stats", tags=["Dashboard & Statistics"])

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "synthetic"


@router.get("/dashboard", response_model=DashboardStatsResponse)
async def get_dashboard_stats():
    """Aggregated KPI cards for the Law Enforcement Command Center header."""
    async with AsyncSessionLocal() as session:
        # 1. Total complaints & total reported loss
        comp_res = await session.execute(text("""
            SELECT COUNT(*), COALESCE(SUM(loss_amount), 0) FROM complaints;
        """))
        comp_count, total_loss = comp_res.fetchone()

        # 2. Total accounts monitored, frozen accounts, intercepted balance
        acc_res = await session.execute(text("""
            SELECT 
                COUNT(*),
                COUNT(*) FILTER (WHERE is_frozen = TRUE),
                COALESCE(SUM(balance) FILTER (WHERE is_frozen = TRUE), 0)
            FROM accounts;
        """))
        total_accounts, frozen_count, intercepted_funds = acc_res.fetchone()

        # 3. High risk ATMs
        atm_res = await session.execute(text("""
            SELECT COUNT(*) FROM atm_locations WHERE is_hotspot = TRUE;
        """))
        high_risk_atms = atm_res.scalar()

        # 4. Total transactions analyzed
        txn_res = await session.execute(text("""
            SELECT COUNT(*) FROM transactions;
        """))
        total_txns = txn_res.scalar()

    # Load Hero Fraud Rings metadata from synthetic snapshot if available
    rings_list = []
    hero_path = DATA_DIR / "hero_fraud_rings.json"
    if hero_path.exists():
        try:
            with open(hero_path, "r") as f:
                rings_data = json.load(f)
                for ring_id, info in rings_data.items():
                    # Calculate volume
                    vol = info.get("total_inflow", info.get("initial_loss", 0.0))
                    total_accs = len(info.get("victim_ids", [])) + len(info.get("mule_chain_ids", [])) + len(info.get("leaf_mule_ids", [])) + 1
                    rings_list.append(FraudRingSummary(
                        ring_id=ring_id,
                        name=info.get("name", ring_id),
                        topology=info.get("topology", "Unknown"),
                        total_accounts=total_accs,
                        total_volume_inr=float(vol),
                        status="ACTIVE"
                    ))
        except Exception as e:
            logger.warning(f"Could not load hero rings file: {e}")

    return DashboardStatsResponse(
        total_complaints=comp_count,
        total_loss_reported_inr=float(total_loss),
        total_accounts_monitored=total_accounts,
        active_mule_rings_count=len(rings_list),
        frozen_accounts_count=frozen_count,
        total_funds_intercepted_inr=float(intercepted_funds),
        high_risk_atms_count=high_risk_atms,
        total_transactions_analyzed=total_txns,
        hero_fraud_rings=rings_list
    )
