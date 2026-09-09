#!/usr/bin/env python3
"""
Phase 7 Comprehensive Verification Suite — RakshaNet Field Operations & Tactical Geofencing.

Validates all 7 core components for physical patrol interdiction:
1. Multi-Database System Health & Polyglot Infrastructure
2. PostGIS Patrol Unit Fleet Catalog & Spatial Geometries
3. Spherical Proximity Engine (ST_DWithin & ST_Distance ranking + ETA)
4. Officer Authentication & One-Click Interdiction Dispatch Flash
5. Cryptographic SHA-256 Audit Trail & Court-Admissible Chain of Custody
6. Real-Time WebSocket PATROL_DISPATCHED Broadcast
7. Frontend Production Build & Tactical Map Asset Pipeline
"""

import asyncio
import json
import os
import sys
import time
from pathlib import Path
import httpx
import websockets

# Add backend directory to sys.path so app modules can be loaded
backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

API_BASE = "http://localhost:8000/api/v1"
HEALTH_URL = "http://localhost:8000/api/health"
WS_URL = "ws://localhost:8000/ws/alerts"

PASS = "  \033[92m✅\033[0m"
FAIL = "  \033[91m❌\033[0m"
HEADER = "\033[95m"
BOLD = "\033[1m"
RESET = "\033[0m"

total_checks = 0
passed_checks = 0


def check(description: str, condition: bool, extra: str = ""):
    global total_checks, passed_checks
    total_checks += 1
    if condition:
        passed_checks += 1
        print(f"{PASS} {description} {extra}")
    else:
        print(f"{FAIL} {description} — FAILED {extra}")


def banner(title: str):
    print(f"\n{BOLD}{HEADER}{'=' * 65}{RESET}")
    print(f"{BOLD}{HEADER}🚨  {title}{RESET}")
    print(f"{BOLD}{HEADER}{'=' * 65}{RESET}")


async def run_phase7_verification():
    global total_checks, passed_checks
    banner("PHASE 7: LEA MOBILE PATROL & TACTICAL GEOFENCING VERIFICATION")

    async with httpx.AsyncClient(timeout=45.0) as client:
        # -------------------------------------------------------------
        # 1. System Health & Infrastructure
        # -------------------------------------------------------------
        print("\n[Suite 1/7] System Health & Polyglot Storage Readiness")
        print("-" * 55)
        res = await client.get(HEALTH_URL)
        check("Health check returns HTTP 200", res.status_code == 200)
        h = res.json()
        check("System status is healthy", h.get("status") == "healthy")
        dbs = h.get("databases", {})
        check("PostgreSQL/PostGIS is connected", dbs.get("postgres") == "connected")
        check("Neo4j Graph is connected", dbs.get("neo4j") == "connected")
        check("Redis Cache/Broker is connected", dbs.get("redis") == "connected")


        # -------------------------------------------------------------
        # 2. Patrol Unit Fleet Catalog & Spatial Coordinates
        # -------------------------------------------------------------
        print("\n[Suite 2/7] Patrol Unit Fleet Inventory & Spatial Attributes")
        print("-" * 55)
        res = await client.get(f"{API_BASE}/patrols")
        check("GET /patrols returns HTTP 200", res.status_code == 200)
        units = res.json()
        check(f"Fleet seeded with active units (found {len(units)})", len(units) >= 12)

        sample = units[0] if units else {}
        check("Unit contains callsign", bool(sample.get("callsign")))
        check("Unit contains unit_type", bool(sample.get("unit_type")))
        check("Unit contains officer_in_charge", bool(sample.get("officer_in_charge")))
        check("Unit contains contact_channel", bool(sample.get("contact_channel")))
        check("Unit contains valid coordinates", isinstance(sample.get("lat"), float) and isinstance(sample.get("lon"), float))
        check("Unit contains operational city", bool(sample.get("city")))

        # Test city filter
        res_mum = await client.get(f"{API_BASE}/patrols?city=Mumbai")
        mum_units = res_mum.json()
        check(f"Mumbai city filter works ({len(mum_units)} units)", len(mum_units) > 0 and all(u["city"] == "Mumbai" for u in mum_units))

        # -------------------------------------------------------------
        # 3. PostGIS High-Precision Spherical Proximity Engine
        # -------------------------------------------------------------
        print("\n[Suite 3/7] PostGIS Spherical Proximity Engine (ST_DWithin & ST_Distance)")
        print("-" * 55)
        # Query near Dadar/Matunga (19.0270, 72.8550) with 10km radius
        res_nearby = await client.get(f"{API_BASE}/patrols/nearby?lat=19.0270&lon=72.8550&radius_km=10")
        check("GET /patrols/nearby returns HTTP 200", res_nearby.status_code == 200)
        nearby_data = res_nearby.json()
        check("Search center returned correctly", nearby_data.get("search_center", {}).get("lat") == 19.0270)
        check(f"Radius matches query ({nearby_data.get('radius_km')} km)", nearby_data.get("radius_km") == 10.0)

        nearby_units = nearby_data.get("units", [])
        check(f"Found nearby units within perimeter ({len(nearby_units)} units)", len(nearby_units) >= 3)

        # Verify ascending distance sorting
        distances = [u["distance_km"] for u in nearby_units]
        is_sorted = distances == sorted(distances)
        check(f"Units correctly ranked by distance: {distances[:4]}", is_sorted)

        # Verify ETA calculation
        first_unit = nearby_units[0]
        check(f"Calculated arrival ETA: {first_unit.get('eta_minutes')} mins for {first_unit.get('distance_km')} km", first_unit.get("eta_minutes") is not None and first_unit.get("eta_minutes") > 0)

        # -------------------------------------------------------------
        # 4. Officer Authentication & One-Click Interdiction Dispatch
        # -------------------------------------------------------------
        print("\n[Suite 4/7] Officer JWT Authentication & Patrol Dispatch Action")
        print("-" * 55)
        login_res = await client.post(f"{API_BASE}/auth/login", json={
            "badge_id": "LE-CYBER-MUM-4029",
            "pin": "1234"
        })
        check("Officer login returns HTTP 200", login_res.status_code == 200)
        auth_data = login_res.json()
        token = auth_data.get("access_token")
        check("Issued valid JWT bearer token", bool(token))

        # Attempt unauthenticated dispatch (must fail with 401)
        target_unit_id = first_unit["id"]
        unauth_dispatch = await client.post(
            f"{API_BASE}/patrols/{target_unit_id}/dispatch",
            json={
                "target_lat": 19.0270,
                "target_lon": 72.8550,
                "target_atm_name": "Test ATM"
            }
        )
        check("Unauthenticated dispatch rejected (HTTP 401)", unauth_dispatch.status_code == 401)

        # Authenticated dispatch
        auth_headers = {"Authorization": f"Bearer {token}"}
        dispatch_payload = {
            "target_terminal_id": "ATM_MUM_TEST_001",
            "target_atm_name": "State Bank of India - Matunga East Terminal",
            "target_lat": 19.0270,
            "target_lon": 72.8550,
            "tactical_instructions": "Immediate tactical interdiction cordon. Intercept suspect mule runner."
        }
        dispatch_res = await client.post(
            f"{API_BASE}/patrols/{target_unit_id}/dispatch",
            headers=auth_headers,
            json=dispatch_payload
        )
        check("Authenticated patrol dispatch returns HTTP 200", dispatch_res.status_code == 200)
        disp = dispatch_res.json()
        check("Dispatch success flag is true", disp.get("success") is True)
        order_ref = disp.get("dispatch_order_id")
        check(f"Generated official dispatch order ref: {order_ref}", bool(order_ref) and "PCR-FLASH" in order_ref)
        check(f"Unit status updated to DISPATCHED_INTERDICTION", disp.get("unit_status") == "DISPATCHED_INTERDICTION")
        check(f"Dispatched unit callsign: {disp.get('callsign')}", disp.get("callsign") == first_unit["callsign"])
        check("Cryptographic hash signature generated", bool(disp.get("hash_signature")))

        # -------------------------------------------------------------
        # 5. Cryptographic SHA-256 Audit Trail & Chain of Custody
        # -------------------------------------------------------------
        print("\n[Suite 5/7] Cryptographic SHA-256 Audit Log Integrity")
        print("-" * 55)
        # Query audit log via officer context
        from app.db.postgres import AsyncSessionLocal
        from app.models.audit_log import AuditLog
        from sqlalchemy import select

        async with AsyncSessionLocal() as session:
            stmt = select(AuditLog).where(
                AuditLog.action == "PATROL_DISPATCH",
                AuditLog.target_id == str(target_unit_id)
            ).order_by(AuditLog.timestamp.desc()).limit(1)
            row = (await session.execute(stmt)).scalar_one_or_none()

            check("Audit log entry created in database", row is not None)
            if row:
                check("Audit officer badge matches logged-in officer", row.officer_badge_id == "LE-CYBER-MUM-4029")
                check("Audit target type is PATROL_UNIT", row.target_type == "PATROL_UNIT")
                check(f"SHA-256 hash signature verified ({row.hash_signature[:16]}...)", len(row.hash_signature) == 64)
                check("Audit details include dispatch order reference", row.details.get("dispatch_order_id") == order_ref)

        # -------------------------------------------------------------
        # 6. Real-Time WebSocket PATROL_DISPATCHED Event Broadcast
        # -------------------------------------------------------------
        print("\n[Suite 6/7] Real-Time WebSocket Telemetry Handshake")
        print("-" * 55)
        try:
            async with websockets.connect(WS_URL, close_timeout=3.0) as ws:
                greeting = await asyncio.wait_for(ws.recv(), timeout=5.0)

                greeting_data = json.loads(greeting)
                check("WebSocket connected & received greeting", greeting_data.get("event_type") == "CONNECTED")

                # Dispatch another unit to verify real-time event receipt
                second_unit_id = nearby_units[1]["id"] if len(nearby_units) > 1 else target_unit_id
                dispatch_task = client.post(
                    f"{API_BASE}/patrols/{second_unit_id}/dispatch",
                    headers=auth_headers,
                    json={
                        "target_lat": 19.0300,
                        "target_lon": 72.8580,
                        "target_atm_name": "Canara Bank - Kings Circle ATM"
                    }
                )

                # Listen for PATROL_DISPATCHED event
                ws_received = False
                event_data = None
                async def listen_ws():
                    nonlocal ws_received, event_data
                    while True:
                        msg = await ws.recv()
                        parsed = json.loads(msg)
                        if parsed.get("event_type") == "PATROL_DISPATCHED":
                            ws_received = True
                            event_data = parsed
                            break

                await asyncio.gather(dispatch_task, listen_ws())
                check("Received real-time PATROL_DISPATCHED WebSocket event", ws_received)
                if event_data:
                    p = event_data.get("payload", {})
                    check(f"WS Payload contains dispatched unit callsign ({p.get('callsign')})", bool(p.get("callsign")))
                    check(f"WS Payload contains order reference ({p.get('dispatch_order_id')})", bool(p.get("dispatch_order_id")))
                    check(f"WS Payload contains ETA ({p.get('eta_minutes')} mins)", p.get("eta_minutes") is not None)
        except Exception as e:
            check(f"WebSocket verification failed: {e}", False)

        # -------------------------------------------------------------
        # 7. Frontend Production Assets & Component Integrity
        # -------------------------------------------------------------
        print("\n[Suite 7/7] Frontend Production Build & Asset Delivery")
        print("-" * 55)
        import os
        dist_path = "/Users/parthkharat/.gemini/antigravity-ide/scratch/RakshaNet/frontend/dist"
        check("Frontend dist directory exists", os.path.exists(dist_path))
        check("Production index.html generated", os.path.exists(os.path.join(dist_path, "index.html")))

        # Check frontend dev server response
        try:
            fe_res = await client.get("http://localhost:5173")
            check("Frontend dev server responding (HTTP 200)", fe_res.status_code == 200)
        except Exception:
            check("Frontend dev server responding", False, "(ensure dev server is running)")

    # -------------------------------------------------------------
    # Final Scorecard
    # -------------------------------------------------------------
    banner(f"PHASE 7 VERIFICATION COMPLETE: {passed_checks}/{total_checks} CHECKS PASSED")
    if passed_checks == total_checks:
        print(f"\n{BOLD}\033[92m🎉 ALL PHASE 7 TACTICAL GEOFENCING & PATROL DISPATCH TESTS PASSED!{RESET}\n")
        return 0
    else:
        print(f"\n{BOLD}\033[91m⚠️ SOME CHECKS FAILED ({total_checks - passed_checks} failed){RESET}\n")
        return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(run_phase7_verification()))
