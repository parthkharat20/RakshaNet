"""
Decision Engine: Dual-Branch Score Fusion & Alert Generation.

Orchestrates Branch A (Graph Risk) and Branch B (Geo-Spatial Risk), fuses them
into a single composite score, generates SHAP explanations, and writes Alert
records to PostgreSQL for high-risk accounts.

Fusion Formula:
    fused_score = 0.60 * graph_score + 0.40 * geo_score

Alert Thresholds:
    >= 0.75  →  CRITICAL (MULE_RING alert, freeze recommendation)
    >= 0.40  →  ELEVATED (SURVEILLANCE alert, monitoring advisory)
    <  0.40  →  No alert generated
"""

import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

from app.ai.graph_predictor import run_graph_scoring
from app.ai.geo_hotspot import run_geo_scoring
from app.ai.shap_explainer import generate_shap_explanation
from sqlalchemy import select, text
from app.db.postgres import AsyncSessionLocal
from app.models import Alert, Account


logger = logging.getLogger("risk_fusion")

# Fusion weights (tunable)
GRAPH_WEIGHT = 0.60
GEO_WEIGHT = 0.40

# Alert threshold
CRITICAL_THRESHOLD = 0.75
ELEVATED_THRESHOLD = 0.40


async def run_full_scoring_pipeline() -> Dict[str, Any]:
    """
    Executes the complete dual-branch AI pipeline:
    1. Run Branch A: Graph Link Prediction scoring
    2. Run Branch B: Geo-Spatial ATM clustering + XGBoost scoring
    3. Fuse scores with configurable weights
    4. Generate SHAP explanations for high-risk accounts
    5. Write Alert records to PostgreSQL
    """
    logger.info("==================================================")
    logger.info("🧠 Starting Dual-Branch AI Scoring Pipeline...")
    logger.info("==================================================")

    # 1. Run Branch A: Graph Scoring
    logger.info("--- Branch A: Graph Link Prediction ---")
    graph_results = await run_graph_scoring()

    # 2. Run Branch B: Geo-Spatial Scoring
    logger.info("--- Branch B: Geo-Spatial Hotspot Analysis ---")
    geo_results = await run_geo_scoring()
    account_geo_scores = geo_results.get("account_geo_scores", {})

    # 3. Fuse Scores
    logger.info("--- Decision Engine: Score Fusion ---")
    fused_results: Dict[str, Dict[str, Any]] = {}
    critical_accounts = []
    elevated_accounts = []

    for acc_id, graph_data in graph_results.items():
        graph_score = graph_data["graph_score"]
        geo_score = account_geo_scores.get(acc_id, 0.0)

        # Default geo score for accounts without ATM activity:
        # Use a small baseline proportional to their graph proximity to hotspot clusters
        if geo_score == 0.0 and graph_score > 0.3:
            geo_score = graph_score * 0.15  # Mild geo correlation

        fused_score = round(GRAPH_WEIGHT * graph_score + GEO_WEIGHT * geo_score, 4)

        explanation = generate_shap_explanation(
            account_id=acc_id,
            graph_features=graph_data.get("features", {}),
            graph_score=graph_score,
            geo_score=geo_score,
            fused_score=fused_score,
            holder_name=graph_data.get("holder_name", ""),
            account_age=graph_data.get("account_age_days", 365)
        )

        fused_results[acc_id] = {
            "fused_score": fused_score,
            "graph_score": graph_score,
            "geo_score": geo_score,
            "explanation": explanation,
            "is_mule_label": graph_data.get("is_mule_label", False),
            "holder_name": graph_data.get("holder_name", "")
        }

        if fused_score >= CRITICAL_THRESHOLD:
            critical_accounts.append(acc_id)
        elif fused_score >= ELEVATED_THRESHOLD:
            elevated_accounts.append(acc_id)

    logger.info(f"Fused {len(fused_results)} accounts: {len(critical_accounts)} CRITICAL, {len(elevated_accounts)} ELEVATED")

    # 4. Write alerts to PostgreSQL
    alerts_written = await write_alerts_to_db(fused_results, critical_accounts, elevated_accounts)

    # 5. Update account risk scores in PostgreSQL
    await update_account_risk_scores(fused_results)

    # Summary stats
    summary = {
        "total_scored": len(fused_results),
        "critical_count": len(critical_accounts),
        "elevated_count": len(elevated_accounts),
        "alerts_written": alerts_written,
        "critical_accounts": [
            {
                "id": acc_id,
                "holder": fused_results[acc_id]["holder_name"],
                "fused_score": fused_results[acc_id]["fused_score"],
                "graph_score": fused_results[acc_id]["graph_score"],
                "geo_score": fused_results[acc_id]["geo_score"],
                "is_ground_truth_mule": fused_results[acc_id]["is_mule_label"]
            }
            for acc_id in critical_accounts
        ]
    }

    logger.info("==================================================")
    logger.info(f"🎉 AI Pipeline Complete!")
    logger.info(f"   Critical Alerts: {len(critical_accounts)}")
    logger.info(f"   Elevated Alerts: {len(elevated_accounts)}")
    logger.info(f"   Alerts Written to DB: {alerts_written}")
    logger.info("==================================================")

    # 6. Broadcast results to Command Center via WebSocket
    try:
        from app.realtime.dispatcher import dispatch_alert_batch
        await dispatch_alert_batch(summary)
    except Exception as e:
        logger.warning(f"WebSocket dispatch failed (non-critical): {e}")

    return summary


async def write_alerts_to_db(
    fused_results: Dict[str, Dict[str, Any]],
    critical_ids: List[str],
    elevated_ids: List[str]
) -> int:
    """Writes intelligence alerts to PostgreSQL for critical and elevated accounts.
    Archives previous AI-generated alerts instead of deleting them to preserve investigation history."""
    count = 0
    async with AsyncSessionLocal() as session:
        # Archive old AI-generated alerts (preserve investigation history, don't destroy)
        from sqlalchemy import text
        await session.execute(text(
            "UPDATE alerts SET status = 'ARCHIVED' "
            "WHERE alert_type IN ('MULE_RING', 'SURVEILLANCE', 'ATM_CASHOUT_SURGE') "
            "AND status NOT IN ('FREEZE_DISPATCHED', 'ARCHIVED', 'RESOLVED');"
        ))

        async def resolve_target_uuid(id_val: str) -> Optional[uuid.UUID]:
            try:
                return uuid.UUID(str(id_val))
            except (ValueError, TypeError):
                res = await session.execute(select(Account.id).where(Account.account_number == str(id_val)))
                return res.scalar_one_or_none()

        for acc_id in critical_ids:
            data = fused_results[acc_id]
            target_uuid = await resolve_target_uuid(acc_id)
            alert = Alert(
                alert_type="MULE_RING",
                target_account_id=target_uuid,
                risk_score=data["fused_score"],
                graph_score=data["graph_score"],
                geo_score=data["geo_score"],
                explanation=data["explanation"],
                status="NEW"
            )
            session.add(alert)
            count += 1

        for acc_id in elevated_ids:
            data = fused_results[acc_id]
            target_uuid = await resolve_target_uuid(acc_id)
            alert = Alert(
                alert_type="SURVEILLANCE",
                target_account_id=target_uuid,
                risk_score=data["fused_score"],
                graph_score=data["graph_score"],
                geo_score=data["geo_score"],
                explanation=data["explanation"],
                status="NEW"
            )
            session.add(alert)
            count += 1

        await session.commit()


    logger.info(f"✅ Wrote {count} alerts to PostgreSQL")
    return count


async def update_account_risk_scores(fused_results: Dict[str, Dict[str, Any]]):
    """Updates the risk_score column in PostgreSQL and Neo4j with fused AI scores."""
    from app.db.neo4j_driver import get_neo4j_driver

    # 1. Update PostgreSQL
    async with AsyncSessionLocal() as session:
        from sqlalchemy import text
        now_ts = datetime.now(timezone.utc)
        for acc_id, data in fused_results.items():
            if data["fused_score"] > 0.01:
                is_valid_uuid = False
                target_uuid = None
                try:
                    target_uuid = uuid.UUID(str(acc_id))
                    is_valid_uuid = True
                except (ValueError, TypeError):
                    is_valid_uuid = False

                if is_valid_uuid:
                    await session.execute(
                        text("UPDATE accounts SET risk_score = :score, updated_at = :now WHERE id = :id"),
                        {"score": data["fused_score"], "now": now_ts, "id": target_uuid}
                    )
                else:
                    await session.execute(
                        text("UPDATE accounts SET risk_score = :score, updated_at = :now WHERE account_number = :acc_num"),
                        {"score": data["fused_score"], "now": now_ts, "acc_num": str(acc_id)}
                    )
        await session.commit()
    logger.info(f"✅ Updated risk_score for {len(fused_results)} accounts in PostgreSQL")

    # 2. Update Neo4j Account nodes
    try:
        neo_driver = get_neo4j_driver()
        neo_updates = [
            {"id": acc_id, "score": float(data["fused_score"])}
            for acc_id, data in fused_results.items()
            if data["fused_score"] > 0.01
        ]
        async with neo_driver.session() as session:
            await session.run("""
                UNWIND $updates AS u
                MATCH (a:Account)
                WHERE a.id = u.id OR a.account_number = u.id
                SET a.risk_score = u.score
            """, updates=neo_updates)
        logger.info(f"✅ Synchronized risk_score for {len(neo_updates)} accounts in Neo4j")

    except Exception as e:
        logger.warning(f"Failed to sync risk_score to Neo4j: {e}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run_full_scoring_pipeline())
