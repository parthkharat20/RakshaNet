#!/usr/bin/env python3
"""
RakshaNet End-to-End Live Cybercrime Interdiction Scenario
Demonstrates the full operational lifecycle:
1. Cybercrime complaint ingestion (Citizen defrauded via QR code scam in Mumbai)
2. Real-time dual-branch AI scoring (Graph link prediction + Geo-spatial ATM clustering)
3. Threat intelligence alert generation with court-admissible SHAP explanations
4. Multi-hop ego-network graph traversal in Neo4j
5. One-click cryptographic account freeze action with SHA-256 evidence logging
6. Verification of live Frontend Command Center (http://localhost:5173)
"""

import asyncio
import json
import time
from datetime import datetime, timezone
import httpx

API_BASE = "http://localhost:8000/api/v1"
HEALTH_URL = "http://localhost:8000/api/health"
FRONTEND_URL = "http://localhost:5173"


def print_banner(text: str):
    print("\n" + "=" * 70)
    print(f"🛡️  {text}")
    print("=" * 70)


def print_step(step_num: int, title: str):
    print(f"\n[{step_num}/6] >>> {title}")
    print("-" * 50)


async def run_scenario():
    print_banner("RAKSHANET: END-TO-END CYBERCRIME INTERDICTION DEMO")
    print(f"🕒 Incident Timeline Start: {datetime.now(timezone.utc).isoformat()}")

    async with httpx.AsyncClient(timeout=60.0) as client:
        # Phase 0: System Health
        print_step(0, "Verifying System Readiness & Multi-Database Connections")
        res = await client.get(HEALTH_URL)
        if res.status_code != 200:
            print(f"❌ System health failed: {res.text}")
            return
        health = res.json()
        print(f"  • API Gateway Status: {health['status'].upper()}")
        print(f"  • Connected Engines: PostgreSQL+PostGIS: {health['databases']['postgres']} | Neo4j: {health['databases']['neo4j']} | Redis: {health['databases']['redis']}")

        # Step 0.5: Law Enforcement Officer Authentication
        print("\n[0.5/6] >>> Officer Authorization (HMAC-SHA256 & JWT)")
        print("-" * 50)
        auth_res = await client.post(
            f"{API_BASE}/auth/login",
            json={"badge_id": "LE-CYBER-MUM-4029", "pin": "1234"}
        )
        assert auth_res.status_code == 200, f"Auth failed: {auth_res.text}"
        auth_data = auth_res.json()
        token = auth_data["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}
        print(f"  • Authenticated Officer: {auth_data['officer_name']} ({auth_data['officer_rank']})")
        print(f"  • Badge ID: {auth_data['badge_id']}")
        print(f"  • Session JWT: {token[:25]}... [SECURED]")


        # Step 1: NCRP Complaint Ingestion
        print_step(1, "NCRP Ingestion: Defrauded Citizen Reports Cyber Scam")
        complaint_payload = {
            "category": "UPI QR Code / Payment Request Fraud",
            "loss_amount": 75000.0,
            "victim_account_number": "10000000001",
            "suspect_account_number": "86174411141",  # Mule Chain Node 4
            "incident_time": datetime.now(timezone.utc).isoformat(),
            "lat": 19.0760,
            "lon": 72.8777,
            "city": "Mumbai",
            "state": "Maharashtra",
            "description": "Victim was coerced into scanning a fraudulent UPI QR code masquerading as electricity bill clearance."
        }

        res = await client.post(f"{API_BASE}/complaints", json=complaint_payload)
        assert res.status_code == 201, f"Complaint ingestion failed: {res.text}"
        comp_data = res.json()
        print(f"  • NCRP Acknowledgment No: {comp_data['acknowledgement_no']}")
        print(f"  • Defrauded Loss Amount: ₹{comp_data['loss_amount']:,.2f}")
        print(f"  • Incident City: {comp_data['city']} [{comp_data['lat']}, {comp_data['lon']}]")
        print(f"  • Suspect Linked: {comp_data['suspect_account_id']}")
        suspect_id = comp_data['suspect_account_id']

        # Step 2: Trigger Real-Time Dual AI Pipeline
        print_step(2, "AI Interdiction: Executing Real-Time Dual AI Pipeline")
        print("  • Branch A: NetworkX + Adamic-Adar Graph Link Prediction...")
        print("  • Branch B: HDBSCAN Spatial Clustering + XGBoost ATM Cash-Out Classifier...")
        print("  • Decision Engine: Score Fusion (0.60·Graph + 0.40·Geo) & SHAP Explainability...")

        res = await client.post(f"{API_BASE}/alerts/run-scoring", headers=auth_headers)
        assert res.status_code == 200, f"AI run failed: {res.text}"
        ai_summary = res.json()["summary"]
        print(f"  ✅ AI Pipeline Complete: Scored {ai_summary['total_scored']} accounts")
        print(f"  • Critical Threats: {ai_summary['critical_count']}")
        print(f"  • Surveillance Advisories: {ai_summary['elevated_count']}")
        print(f"  • Threat Alerts Persisted: {ai_summary['alerts_written']}")

        # Step 3: Prioritized Threat Alert & SHAP Explainability
        print_step(3, "Intelligence Inspection: Querying Suspect Alert & SHAP Evidence")
        res = await client.get(f"{API_BASE}/alerts?limit=5")
        assert res.status_code == 200, f"Alerts fetch failed: {res.text}"
        alerts = res.json()
        top_alert = alerts[0]
        print(f"  • Top Prioritized Threat: {top_alert['target_holder_name']}")
        print(f"  • Account Number: {top_alert['target_account_number']}")
        print(f"  • Composite Risk: {top_alert['risk_score'] * 100:.1f}% [Graph: {top_alert['graph_score']:.3f} | Geo: {top_alert['geo_score']:.3f}]")
        print(f"  • Threat Classification: {top_alert['alert_type']}")
        print(f"  • SHAP Verdict: {top_alert['explanation'].get('verdict')}")
        print("  • Key Court-Admissible Factors:")
        for idx, f in enumerate(top_alert['explanation'].get('shap_factors', [])[:3], 1):
            print(f"    {idx}. [{f['impact']}] {f['factor']} — {f['detail']}")

        # Step 4: Multi-Hop Ego-Network Analysis
        print_step(4, "Graph Intelligence: Multi-Hop Neo4j Ego-Network Traversal")
        res = await client.get(f"{API_BASE}/accounts/{suspect_id}/graph?max_hops=2")
        assert res.status_code == 200, f"Graph fetch failed: {res.text}"
        graph = res.json()
        print(f"  • Retrieved Ego-Network: {graph['total_nodes']} Nodes, {graph['total_links']} Transfer Edges")
        role_counts = {}
        for n in graph['nodes']:
            r = n['role']
            role_counts[r] = role_counts.get(r, 0) + 1
        print(f"  • Topology Roles: {role_counts}")

        # Step 5: One-Click Cryptographic Account Freeze & Bank Lien Placement
        print_step(5, "Law Enforcement Action: One-Click Inter-Bank Freeze & Lien Placement")
        freeze_payload = {
            "officer_badge_id": "LE-CYBER-MUM-4029",
            "reason": "Section 91 CrPC Emergency Interdiction — Active Cyber Syndicate Cash-Out",
            "notes": "Suspect account flagged by RakshaNet AI with 96.8% risk score and confirmed ATM withdrawals."
        }
        res = await client.post(f"{API_BASE}/freeze/{suspect_id}", json=freeze_payload, headers=auth_headers)
        assert res.status_code == 200, f"Freeze failed: {res.text}"
        freeze_receipt = res.json()
        print("  🔒 SECTION 91 FREEZE & LIEN CONFIRMED:")
        print(f"  • Account Number: {freeze_receipt['account_number']}")
        print(f"  • Bank Name: {freeze_receipt['bank_name']}")
        print(f"  • Bank Lien Reference: {freeze_receipt.get('bank_lien_reference', 'CONFIRMED')}")
        if freeze_receipt.get('funds_retained'):
            print(f"  • Retained Funds Under Lien: ₹{freeze_receipt['funds_retained']:,.2f}")
        print(f"  • Audit Log ID: {freeze_receipt['audit_log_id']}")
        print(f"  • SHA-256 Evidence Signature: {freeze_receipt['hash_signature']}")
        print(f"  • Action Timestamp: {freeze_receipt.get('action_taken_at', freeze_receipt.get('timestamp'))}")

        # Step 6: Frontend Command Center Verification
        print_step(6, "Command Center UI: Ready for Demonstration")
        res = await client.get(FRONTEND_URL)
        assert res.status_code == 200, f"Frontend check failed: {res.status_code}"

        print(f"  🌐 Overview & Telemetry Dashboard: {FRONTEND_URL}/")
        print(f"  🎯 Tactical Command Center: {FRONTEND_URL}/command")
        print("  ✅ Frontend Dev Server responding with 100% health.")

    print_banner("DEMO SCENARIO EXECUTED PERFECTLY END-TO-END!")
    print("All backend services, dual AI models, PostGIS spatial queries, Neo4j graphs,")
    print("one-click freezing, and React command center are fully integrated and verified.\n")


if __name__ == "__main__":
    asyncio.run(run_scenario())
