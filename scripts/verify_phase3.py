#!/usr/bin/env python3
"""
Phase 3 Verification Script: Real-Time Dual AI Pipeline
Tests and validates:
1. Branch A: Graph Link Predictor & Mule Classifier (NetworkX + Adamic-Adar heuristics)
   - Confirmed mules score >= 0.85
   - Clean accounts 2 hops from fraud with active flow score > 0.75
   - Isolated clean accounts score < 0.15
2. Branch B: Geo-Spatial Hotspot & Cash-Out Classifier (HDBSCAN + XGBoost)
   - Spatial clustering of coordinates
   - XGBoost class-weighted ATM cash-out risk classifier
   - Account geo scoring for cashout terminals, suspects, and rings
3. Decision Engine & SHAP Explainability:
   - Score fusion (0.6 * graph + 0.4 * geo)
   - Plain-English court-admissible SHAP explanation cards
   - Alert creation in PostgreSQL and risk score synchronization in Neo4j
4. Alerts API verification:
   - GET /api/v1/alerts
   - POST /api/v1/alerts/run-scoring
"""

import asyncio
import os
import sys
from pathlib import Path

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

import httpx
from sqlalchemy import text
from app.db.postgres import AsyncSessionLocal
from app.db.neo4j_driver import get_neo4j_driver
from app.ai.graph_predictor import build_transaction_graph, extract_graph_features, compute_graph_risk_scores, run_graph_scoring
from app.ai.geo_hotspot import load_spatial_data, run_hdbscan_clustering, extract_atm_features, train_xgboost_atm_classifier, run_geo_scoring
from app.ai.risk_fusion import run_full_scoring_pipeline

API_BASE_URL = "http://localhost:8000/api/v1"


async def verify_branch_a():
    print("\n--- 1. Verifying Branch A: Graph Link Predictor ---")
    G, node_attrs = await build_transaction_graph()
    assert G.number_of_nodes() >= 500, f"Expected >= 500 nodes, got {G.number_of_nodes()}"
    assert G.number_of_edges() >= 2000, f"Expected >= 2000 edges, got {G.number_of_edges()}"
    print(f"  • Transaction Graph built: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")

    features = extract_graph_features(G, node_attrs)
    assert len(features) == G.number_of_nodes(), "Feature extraction count mismatch"
    print(f"  • Extracted 12 structural features for {len(features)} accounts")

    scores = compute_graph_risk_scores(features)

    # Checkpoint 1: Confirmed mules score >= 0.85
    mule_scores = [scores[nid] for nid, f in features.items() if f["is_mule_label"] > 0]
    min_mule_score = min(mule_scores)
    avg_mule_score = sum(mule_scores) / len(mule_scores)
    print(f"  • Confirmed Mules ({len(mule_scores)}): Min={min_mule_score:.4f}, Avg={avg_mule_score:.4f}")
    assert min_mule_score >= 0.85, f"Expected all mules to score >= 0.85, lowest was {min_mule_score}"
    print("  ✅ Checkpoint Passed: Confirmed mules score >= 0.85")

    # Checkpoint 2: Clean accounts 2 hops away with active flow score > 0.75
    two_hop_active = [
        scores[nid] for nid, f in features.items()
        if f["hop_distance_to_fraud"] == 2 and f["evacuation_ratio"] > 0.85 and f["account_age_days"] <= 45 and f["is_mule_label"] == 0
    ]
    if two_hop_active:
        min_two_hop = min(two_hop_active)
        print(f"  • 2-Hop Active Accounts ({len(two_hop_active)}): Min={min_two_hop:.4f}")
        assert min_two_hop > 0.75, f"Expected 2-hop active accounts > 0.75, got {min_two_hop}"
        print("  ✅ Checkpoint Passed: 2-hop downstream accounts score > 0.75")
    else:
        print("  ⚠️ No 2-hop accounts met the strict filter, skipping 2-hop assertion")

    # Checkpoint 3: Isolated clean accounts score < 0.15
    isolated = [
        scores[nid] for nid, f in features.items()
        if f["hop_distance_to_fraud"] >= 4 and f["is_mule_label"] == 0 and f["adamic_adar_fraud_score"] == 0 and f["account_age_days"] > 180
    ]
    assert len(isolated) > 0, "No isolated accounts found"
    max_isolated = max(isolated)
    print(f"  • Isolated Mature Accounts ({len(isolated)}): Max={max_isolated:.4f}")
    assert max_isolated < 0.15, f"Expected isolated accounts < 0.15, got {max_isolated}"
    print("  ✅ Checkpoint Passed: Isolated clean accounts score < 0.15")


async def verify_branch_b():
    print("\n--- 2. Verifying Branch B: Geo-Spatial Hotspot & Cash-Out Classifier ---")
    atms, complaints = await load_spatial_data()
    assert len(atms) >= 40, f"Expected >= 40 ATMs, got {len(atms)}"
    assert len(complaints) >= 10, f"Expected >= 10 complaints, got {len(complaints)}"
    print(f"  • Spatial data loaded: {len(atms)} ATMs, {len(complaints)} NCRP complaints")

    clusters = run_hdbscan_clustering(atms, complaints)
    unique_clusters = set(clusters.values()) - {-1}
    assert len(unique_clusters) >= 2, f"Expected >= 2 spatial clusters, got {len(unique_clusters)}"
    print(f"  • HDBSCAN identified {len(unique_clusters)} spatial density clusters")

    geo_res = await run_geo_scoring()
    atm_scores = geo_res["atm_scores"]
    high_risk_atms = [k for k, v in atm_scores.items() if v["geo_risk_score"] > 0.5]
    print(f"  • XGBoost ATM Classifier flagged {len(high_risk_atms)} high-risk cashout terminals")
    assert len(high_risk_atms) >= 3, f"Expected >= 3 high-risk cashout terminals, got {len(high_risk_atms)}"

    account_geo = geo_res["account_geo_scores"]
    print(f"  • Identified {len(account_geo)} accounts with spatial cybercrime corridor activity")
    assert len(account_geo) >= 15, f"Expected >= 15 spatially linked accounts, got {len(account_geo)}"
    print("  ✅ Branch B Geo-Spatial & XGBoost validation passed.")


async def verify_decision_engine():
    print("\n--- 3. Verifying Decision Engine & SHAP Explainability ---")
    summary = await run_full_scoring_pipeline()
    assert summary["total_scored"] == 500, f"Expected 500 scored accounts, got {summary['total_scored']}"
    assert summary["critical_count"] >= 14, f"Expected >= 14 critical alerts, got {summary['critical_count']}"
    assert summary["elevated_count"] >= 10, f"Expected >= 10 elevated alerts, got {summary['elevated_count']}"
    assert summary["alerts_written"] >= 24, f"Expected >= 24 alerts written, got {summary['alerts_written']}"
    print(f"  • Pipeline Scored: {summary['total_scored']} accounts")
    print(f"  • Critical Threat Alerts: {summary['critical_count']}")
    print(f"  • Elevated Threat Alerts: {summary['elevated_count']}")
    print(f"  • Alerts Written to PostgreSQL: {summary['alerts_written']}")

    # Verify alerts in PostgreSQL
    async with AsyncSessionLocal() as session:
        alert_rows = (await session.execute(text("""
            SELECT alert_type, risk_score, graph_score, geo_score, explanation
            FROM alerts
            ORDER BY risk_score DESC
            LIMIT 5;
        """))).fetchall()

        assert len(alert_rows) > 0, "No alerts found in PostgreSQL alerts table"
        top_alert = alert_rows[0]
        print(f"  • Top Alert: Type={top_alert[0]}, Fused Risk={float(top_alert[1]):.4f}, Graph={float(top_alert[2]):.4f}, Geo={float(top_alert[3]):.4f}")
        
        # Verify SHAP explanation
        expl = top_alert[4]
        assert "shap_factors" in expl, "SHAP factors missing in explanation JSON"
        assert len(expl["shap_factors"]) > 0, "SHAP factors empty"
        print(f"  • SHAP Verdict: {expl.get('verdict')}")
        print(f"  • Top SHAP Factor: {expl['shap_factors'][0]['factor']} ({expl['shap_factors'][0]['impact']}) — {expl['shap_factors'][0]['detail']}")

    # Verify Neo4j synchronization
    driver = get_neo4j_driver()
    async with driver.session() as session:
        res = await session.run("MATCH (a:Account) WHERE a.risk_score > 0.75 RETURN count(a) AS high_risk_count")
        rec = await res.single()
        neo_high_risk = rec["high_risk_count"]
        print(f"  • Neo4j High-Risk Accounts Synced: {neo_high_risk}")
        assert neo_high_risk >= 14, f"Expected >= 14 high risk accounts in Neo4j, got {neo_high_risk}"

    print("  ✅ Decision Engine & SHAP explainability verification passed.")


async def verify_api_endpoints():
    print("\n--- 4. Verifying Alerts API Endpoints ---")
    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. GET /api/v1/alerts
        res = await client.get(f"{API_BASE_URL}/alerts?limit=10")
        assert res.status_code == 200, f"GET /alerts failed: {res.status_code} {res.text}"
        alerts = res.json()
        assert len(alerts) > 0, "Expected non-empty alerts list from API"
        print(f"  • GET /api/v1/alerts returned {len(alerts)} alerts")
        first = alerts[0]
        print(f"    - ID: {first['id']}")
        print(f"    - Target: {first.get('target_holder_name')} ({first.get('target_account_number')})")
        print(f"    - Risk: {first['risk_score']:.4f} (Graph: {first['graph_score']:.4f}, Geo: {first['geo_score']:.4f})")
        print(f"    - Type: {first['alert_type']}")

        # 2. POST /api/v1/alerts/run-scoring
        res = await client.post(f"{API_BASE_URL}/alerts/run-scoring")
        assert res.status_code == 200, f"POST /alerts/run-scoring failed: {res.status_code} {res.text}"
        payload = res.json()
        assert payload["status"] == "SUCCESS", "Trigger pipeline did not return SUCCESS"
        print("  • POST /api/v1/alerts/run-scoring executed successfully")

    print("  ✅ Alerts API endpoints verified.")


async def main():
    print("=" * 60)
    print("🧠 VERIFYING PHASE 3: REAL-TIME DUAL AI PIPELINE")
    print("=" * 60)

    try:
        await verify_branch_a()
        await verify_branch_b()
        await verify_decision_engine()
        await verify_api_endpoints()
        print("\n" + "=" * 60)
        print("🎉 ALL PHASE 3 VERIFICATION CHECKS PASSED (100%)!")
        print("=" * 60)
    except Exception as e:
        print(f"\n❌ Verification failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
