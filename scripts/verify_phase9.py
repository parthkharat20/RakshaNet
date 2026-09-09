#!/usr/bin/env python3
"""
Phase 9 Comprehensive Verification Suite — Citizen Restitution Engine (Section 457 Cr.P.C. / BNSS 503) & Victim Recovery Portal.

Validates all 6 core components:
1. Multi-Database System Health & Polyglot Storage Readiness
2. Law Enforcement Officer JWT Authentication & Session Clearance
3. Automated Section 457 Cr.P.C. Magisterial Court Order Petition Drafting (POST /restitution/draft)
4. One-Click Inter-Bank Reverse Settlement Execution (POST /restitution/{id}/execute) & Cryptographic Audit
5. Public Citizen Transparency & 4-Stage Recovery Tracking (GET /restitution/track/{ack_no})
6. Restitution Ledger Querying & Frontend Legal Recovery Delivery
"""

import asyncio
import json
import os
import sys
import time
from pathlib import Path
import httpx

# Add backend directory to sys.path so app modules can be loaded
backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

API_BASE = "http://localhost:8000/api/v1"
HEALTH_URL = "http://localhost:8000/api/health"

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
    print(f"{BOLD}{HEADER}💰  {title}{RESET}")
    print(f"{BOLD}{HEADER}{'=' * 65}{RESET}")


async def run_phase9_verification():
    global total_checks, passed_checks
    banner("PHASE 9: CITIZEN RESTITUTION ENGINE & VICTIM RECOVERY PORTAL")

    async with httpx.AsyncClient(timeout=45.0) as client:
        # -------------------------------------------------------------
        # 1. System Health & Infrastructure
        # -------------------------------------------------------------
        print("\n[Suite 1/6] System Health & Polyglot Database Readiness")
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
        # 2. Officer Authentication & JWT Issuance
        # -------------------------------------------------------------
        print("\n[Suite 2/6] Law Enforcement Authorization & Session Clearance")
        print("-" * 55)
        login_res = await client.post(f"{API_BASE}/auth/login", json={
            "badge_id": "LE-CYBER-MUM-4029",
            "pin": "1234"
        })
        check("Officer login returns HTTP 200", login_res.status_code == 200)
        auth_data = login_res.json()
        token = auth_data.get("access_token")
        check("Valid JWT bearer token issued", bool(token))
        check("Officer identity: Inspector Parth Kharat", auth_data.get("officer_name") == "Inspector Parth Kharat")
        check("Officer rank: Cyber Crime Inspector", auth_data.get("officer_rank") == "Cyber Crime Inspector")

        auth_headers = {"Authorization": f"Bearer {token}"}

        # -------------------------------------------------------------
        # 3. Section 457 Cr.P.C. Magisterial Petition Drafting
        # -------------------------------------------------------------
        print("\n[Suite 3/6] Section 457 Cr.P.C. / BNSS 503 Restitution Drafting")
        print("-" * 55)
        # Fetch an alert to link with restitution
        alerts_res = await client.get(f"{API_BASE}/alerts?limit=1")
        check("GET /alerts returns HTTP 200", alerts_res.status_code == 200)
        alerts = alerts_res.json()
        sample_alert_id = alerts[0]["id"] if alerts else None

        draft_res = await client.post(f"{API_BASE}/restitution/draft", json={
            "alert_id": sample_alert_id
        }, headers=auth_headers)
        check("POST /restitution/draft returns HTTP 200", draft_res.status_code == 200)
        draft = draft_res.json()
        order_id = draft.get("id")
        check("Restitution order ID generated", bool(order_id))
        check("Reference starts with RESTITUTION-", draft.get("restitution_reference", "").startswith("RESTITUTION-"))
        check("Draft status is ORDER_DRAFTED", draft.get("status") == "ORDER_DRAFTED")
        check("Victim account number present", bool(draft.get("victim_account_number")))
        check("Victim holder name present", bool(draft.get("victim_holder_name")))
        check("Frozen mule account number present", bool(draft.get("frozen_account_number")))
        check("Frozen bank present", bool(draft.get("frozen_bank")))
        check("CFCFRMS bank lien reference present", bool(draft.get("cfcfrms_lien_reference")))
        check("Amount restituted is positive float", draft.get("amount_restituted", 0) > 0)
        check("Chief Metropolitan Magistrate court designated", "Chief" in draft.get("magistrate_court", "") or "Court" in draft.get("magistrate_court", ""))
        check("Cryptographic SHA-256 draft hash generated", len(draft.get("sha256_hash", "")) == 64)

        # -------------------------------------------------------------
        # 4. Court-Sanctioned Reverse Settlement Execution
        # -------------------------------------------------------------
        print("\n[Suite 4/6] Magisterial Reverse Settlement Execution (Sec 457)")
        print("-" * 55)
        court_order_no = f"CJM-MUM-457-VERIFY-{int(time.time())}"
        exec_res = await client.post(f"{API_BASE}/restitution/{order_id}/execute", json={
            "court_order_number": court_order_no,
            "magistrate_court": "Esplanade Court of Chief Metropolitan Magistrate, Mumbai",
            "judicial_notes": "Official court order granted. Frozen funds sanctioned for restitution."
        }, headers=auth_headers)
        check("POST /restitution/{id}/execute returns HTTP 200", exec_res.status_code == 200)
        executed = exec_res.json()
        check("Status transitioned to RESTITUTION_COMPLETED", executed.get("status") == "RESTITUTION_COMPLETED")
        check("Reverse settlement reference generated", executed.get("reverse_settlement_ref", "").startswith("RTGS-REV-SETTLE-"))
        check("Court order number updated", executed.get("court_order_number") == court_order_no)
        check("Execution timestamp populated", bool(executed.get("executed_at")))
        check("Audit trail SHA-256 hash valid", len(executed.get("sha256_hash", "")) == 64)
        check("Success message contains amount restored", "successfully restored" in executed.get("message", "").lower())

        # -------------------------------------------------------------
        # 5. Public Citizen Transparency & 4-Stage Tracking
        # -------------------------------------------------------------
        print("\n[Suite 5/6] Public Citizen Recovery Portal (GET /track/{ack_no})")
        print("-" * 55)
        # Test default NCRP track
        track_res = await client.get(f"{API_BASE}/restitution/track/NCRP-2026-MUM-8921")
        check("GET /restitution/track/NCRP-2026-MUM-8921 returns HTTP 200", track_res.status_code == 200)
        track = track_res.json()
        check("Public citizen name visible", bool(track.get("citizen_name")))
        check("Loss amount is numeric", track.get("loss_amount", 0) > 0)
        check("Secured amount is numeric", track.get("secured_amount", 0) > 0)
        check("Recovery rate percentage >= 0", track.get("recovery_rate_pct", -1) >= 0)
        check("Current stage is between 1 and 4", 1 <= track.get("current_stage", 0) <= 4)
        timeline = track.get("timeline", [])
        check("Full 4-stage transparent audit timeline returned", len(timeline) == 4)
        stages = [item.get("stage") for item in timeline]
        check("Stages ordered 1 to 4", stages == [1, 2, 3, 4])
        check("Stage 1 is NCRP Incident Ingested", "NCRP" in timeline[0].get("title", ""))
        check("Stage 2 is Mule Interception", "Mule" in timeline[1].get("title", "") or "Interception" in timeline[1].get("title", ""))
        check("Stage 3 is Inter-Bank Lien (CFCFRMS)", "Lien" in timeline[2].get("title", "") or "CFCFRMS" in timeline[2].get("title", ""))
        check("Stage 4 is Magisterial Restitution", "Restitution" in timeline[3].get("title", "") or "457" in timeline[3].get("title", ""))

        # -------------------------------------------------------------
        # 6. Restitution Ledger Querying & Frontend Delivery
        # -------------------------------------------------------------
        print("\n[Suite 6/6] Restitution Ledger & Frontend Asset Delivery")
        print("-" * 55)
        ledger_res = await client.get(f"{API_BASE}/restitution", headers=auth_headers)
        check("GET /restitution returns HTTP 200", ledger_res.status_code == 200)
        orders = ledger_res.json()
        check("Ledger contains at least 1 restitution order", len(orders) >= 1)
        found_executed = any(o.get("id") == order_id and o.get("status") == "RESTITUTION_COMPLETED" for o in orders)
        check("Executed order present in ledger with RESTITUTION_COMPLETED", found_executed)

        # Check frontend build artifacts
        dist_dir = Path(__file__).resolve().parent.parent / "frontend" / "dist"
        check("Frontend dist directory exists", dist_dir.exists())
        check("Frontend index.html built", (dist_dir / "index.html").exists())
        assets = list((dist_dir / "assets").glob("*.js")) if (dist_dir / "assets").exists() else []
        check("Production JS bundle generated", len(assets) > 0)

    # -------------------------------------------------------------
    # Summary
    # -------------------------------------------------------------
    print(f"\n{BOLD}{'=' * 65}{RESET}")
    if passed_checks == total_checks:
        print(f"{BOLD}\033[92m🎉 PHASE 9 VERIFICATION COMPLETE: {passed_checks}/{total_checks} CHECKS PASSED (100%)\033[0m")
        print(f"{BOLD}\033[92m   Citizen Restitution Engine (Sec 457 Cr.P.C.) & Recovery Portal READY FOR DEFENSE\033[0m")
    else:
        print(f"{BOLD}\033[91m⚠️  PHASE 9 VERIFICATION FAILED: {passed_checks}/{total_checks} checks passed.\033[0m")
    print(f"{BOLD}{'=' * 65}{RESET}\n")

    return passed_checks == total_checks


if __name__ == "__main__":
    success = asyncio.run(run_phase9_verification())
    sys.exit(0 if success else 1)
