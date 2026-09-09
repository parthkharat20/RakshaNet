import asyncio
import json
import sys
from pathlib import Path
import httpx

# Add backend to python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.main import app

DATA_DIR = Path(__file__).resolve().parent.parent / "backend" / "app" / "data" / "synthetic"


async def run_phase2_verification():
    print("==================================================")
    print("🔍 VERIFYING PHASE 2: FASTAPI CORE & INGESTION APIS")
    print("==================================================")

    # Load hero rings to get known IDs for test queries
    with open(DATA_DIR / "hero_fraud_rings.json", "r") as f:
        hero_rings = json.load(f)

    star_ring = hero_rings["HERO_RING_STAR_01"]
    chain_ring = hero_rings["HERO_RING_CHAIN_01"]
    hub_mule_id = star_ring["hub_mule_id"]
    terminal_mule_id = chain_ring["terminal_mule_id"]

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:

        # -------------------------------------------------------------
        # 1. Health Check Test
        # -------------------------------------------------------------
        print("\n--- 1. Testing GET /api/health ---")
        res = await client.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.status_code} - {res.text}"
        data = res.json()
        print(f"  • Health Status: {data['status']}")
        print(f"  • Databases: {data['databases']}")
        assert data["databases"]["postgres"] == "connected"
        assert data["databases"]["neo4j"] == "connected"
        assert data["databases"]["redis"] == "connected"
        print("  ✅ Health check passed.")

        # -------------------------------------------------------------
        # 2. Dashboard KPI Stats API
        # -------------------------------------------------------------
        print("\n--- 2. Testing GET /api/v1/stats/dashboard ---")
        res = await client.get("/api/v1/stats/dashboard")
        assert res.status_code == 200, f"Dashboard stats failed: {res.status_code} - {res.text}"
        stats = res.json()
        print(f"  • Total Complaints: {stats['total_complaints']}")
        print(f"  • Total Reported Loss: ₹{stats['total_loss_reported_inr']:,.2f}")
        print(f"  • Accounts Monitored: {stats['total_accounts_monitored']}")
        print(f"  • Active Fraud Rings: {stats['active_mule_rings_count']}")
        print(f"  • High-Risk ATMs: {stats['high_risk_atms_count']}")
        print(f"  • Total Transactions: {stats['total_transactions_analyzed']}")
        assert stats["total_accounts_monitored"] == 500
        assert stats["active_mule_rings_count"] >= 3
        print("  ✅ Dashboard KPI stats passed.")

        # -------------------------------------------------------------
        # 3. Bank Accounts List & Detail API
        # -------------------------------------------------------------
        print("\n--- 3. Testing GET /api/v1/accounts ---")
        res = await client.get("/api/v1/accounts?limit=5&min_risk=0.5")
        assert res.status_code == 200, f"Accounts query failed: {res.text}"
        accs = res.json()
        print(f"  • Retrieved {len(accs)} high-risk accounts (min_risk >= 0.5):")
        for a in accs[:2]:
            print(f"    - {a['holder_name']} ({a['bank_name']}): Risk {a['risk_score']}, Age {a['account_age_days']} days")
        assert len(accs) > 0

        # Detail query
        res_detail = await client.get(f"/api/v1/accounts/{hub_mule_id}")
        assert res_detail.status_code == 200
        print(f"  • Retrieved single account detail for Star Hub Mule: {res_detail.json()['holder_name']}")
        print("  ✅ Accounts API passed.")

        # -------------------------------------------------------------
        # 4. 2D Force-Graph Neighborhood API (The Centerpiece)
        # -------------------------------------------------------------
        print(f"\n--- 4. Testing GET /api/v1/accounts/{hub_mule_id}/graph?max_hops=2 ---")
        res_graph = await client.get(f"/api/v1/accounts/{hub_mule_id}/graph?max_hops=2")
        assert res_graph.status_code == 200, f"Graph API failed: {res_graph.text}"
        graph = res_graph.json()
        print(f"  • Graph Nodes returned: {graph['total_nodes']}")
        print(f"  • Graph Links returned: {graph['total_links']}")
        roles = {}
        for n in graph["nodes"]:
            roles[n["role"]] = roles.get(n["role"], 0) + 1
        print(f"  • Visual Role Breakdown: {roles}")
        assert graph["total_nodes"] > 1, "Graph returned insufficient nodes"
        assert graph["total_links"] > 0, "Graph returned insufficient links"
        assert "MULE_HUB" in roles or "MULE_NODE" in roles
        print("  ✅ 2D Force-Graph neighborhood API passed.")

        # -------------------------------------------------------------
        # 5. Leaflet GeoJSON Heatmap API
        # -------------------------------------------------------------
        print("\n--- 5. Testing GET /api/v1/heatmap ---")
        res_heatmap = await client.get("/api/v1/heatmap")
        assert res_heatmap.status_code == 200
        geojson = res_heatmap.json()
        print(f"  • GeoJSON Type: {geojson['type']}")
        print(f"  • Total Spatial Features: {geojson['total_features']}")
        first_feat = geojson["features"][0]
        print(f"  • Sample Feature: {first_feat['properties']['title']} at {first_feat['geometry']['coordinates']}")
        assert geojson["type"] == "FeatureCollection"
        assert geojson["total_features"] > 0
        print("  ✅ GeoJSON heatmap API passed.")

        # -------------------------------------------------------------
        # 6. PostGIS Spatial Radius Search API
        # -------------------------------------------------------------
        print("\n--- 6. Testing GET /api/v1/heatmap/atms/nearby (Mumbai) ---")
        res_nearby = await client.get("/api/v1/heatmap/atms/nearby?lat=19.0760&lon=72.8777&radius_km=10")
        assert res_nearby.status_code == 200
        nearby = res_nearby.json()
        print(f"  • Found {nearby['total_found']} ATMs within 10 km of Mumbai Center:")
        for atm in nearby["atms"][:3]:
            print(f"    - {atm['terminal_id']} ({atm['bank_name']}): {atm['distance_km']} km away (Hotspot: {atm['is_hotspot']})")
        assert nearby["total_found"] > 0
        print("  ✅ PostGIS spatial radius search API passed.")

        # -------------------------------------------------------------
        # 7. One-Click Freeze Action & Cryptographic Audit Vault
        # -------------------------------------------------------------
        print(f"\n--- 7. Testing POST /api/v1/freeze/{terminal_mule_id} ---")
        login_res = await client.post("/api/v1/auth/login", json={"badge_id": "LE-CYBER-MUM-4029", "pin": "1234"})
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        auth_headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

        freeze_payload = {
            "officer_badge_id": "LE-CYBER-MUM-4029",
            "reason": "Section 91 CrPC: Active money laundering terminal node detected in Digital Arrest ring",
            "notes": "Emergency freeze dispatched before ATM cash-out execution."
        }
        res_freeze = await client.post(f"/api/v1/freeze/{terminal_mule_id}", json=freeze_payload, headers=auth_headers)
        assert res_freeze.status_code == 200, f"Freeze failed: {res_freeze.text}"
        freeze_data = res_freeze.json()
        print(f"  • Freeze Status: {freeze_data['success']}")
        print(f"  • Target Account: {freeze_data['account_number']} ({freeze_data['holder_name']})")
        print(f"  • Is Frozen: {freeze_data['is_frozen']}")
        print(f"  • Audit Log ID: {freeze_data['audit_log_id']}")
        print(f"  • SHA-256 Signature: {freeze_data['hash_signature']}")
        assert freeze_data["is_frozen"] is True
        assert len(freeze_data["hash_signature"]) == 64 or freeze_data["hash_signature"] == "already_frozen"
        print("  ✅ One-Click freeze & SHA-256 evidence logging passed.")

        # -------------------------------------------------------------
        # 8. NCRP Complaint Ingestion API
        # -------------------------------------------------------------
        print("\n--- 8. Testing POST /api/v1/complaints ---")
        comp_payload = {
            "category": "UPI QR Code / Payment Request Fraud",
            "loss_amount": 35000.0,
            "incident_time": "2026-09-08T10:30:00Z",
            "city": "Bengaluru",
            "state": "Karnataka",
            "lat": 12.9716,
            "lon": 77.5946,
            "description": "Victim received fake electricity bill payment link on WhatsApp with threatening notice."
        }
        res_comp = await client.post("/api/v1/complaints", json=comp_payload)
        assert res_comp.status_code == 201, f"Complaint ingestion failed: {res_comp.text}"
        comp_data = res_comp.json()
        print(f"  • Generated NCRP Acknowledgment No: {comp_data['acknowledgement_no']}")
        print(f"  • Ingested Loss Amount: ₹{comp_data['loss_amount']}")
        print(f"  • Status: {comp_data['status']}")
        assert comp_data["acknowledgement_no"].startswith("202609")
        print("  ✅ NCRP complaint ingestion API passed.")

    print("\n==================================================")
    print("🎉 ALL PHASE 2 VERIFICATION CHECKS PASSED (100%)!")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(run_phase2_verification())
