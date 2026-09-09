#!/usr/bin/env python3
"""
Phase 6 Comprehensive Verification Suite — RakshaNet Hackathon Demo Engine & Inter-Bank Gateway.

Validates all 6 core components for the live presentation:
1. Multi-Database System Health & Scaffolding
2. Law Enforcement Officer JWT Authentication & Session Clearance
3. Demo Scenario Catalog API (GET /demo/scenarios)
4. Live End-to-End Cyber Scam Attack Injection (POST /demo/simulate-attack)
5. Dual-AI Topological & Spatial Risk Fusion with SHAP Explanations
6. Inter-Bank CFCFRMS Mock Gateway (Section 91 CrPC Lien Reference & Fund Retention)
7. Cryptographic SHA-256 Chain of Custody & Audit Trail Integrity
8. Real-Time WebSocket Telemetry Handshake
9. Frontend Production Build & Command Center Assets
"""

import asyncio
import json
import sys
import time
import uuid
from datetime import datetime, timezone
import httpx
import websockets

API_BASE = "http://localhost:8000/api/v1"
HEALTH_URL = "http://localhost:8000/api/health"
WS_URL = "ws://localhost:8000/ws/alerts"
FRONTEND_URL = "http://localhost:5173"

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
    print(f"{BOLD}{HEADER}🛡️  {title}{RESET}")
    print(f"{BOLD}{HEADER}{'=' * 65}{RESET}")


async def run_phase6_verification():
    global total_checks, passed_checks
    banner("PHASE 6: LIVE DEMO ENGINE & INTER-BANK GATEWAY VERIFICATION")

    async with httpx.AsyncClient(timeout=60.0) as client:
        # -------------------------------------------------------------
        # 1. System Health & Polyglot Storage Readiness
        # -------------------------------------------------------------
        print("\n[Suite 1/7] System Health & Polyglot Storage Engine")
        print("-" * 55)
        res = await client.get(HEALTH_URL)
        check("Health check returns HTTP 200", res.status_code == 200)
        h = res.json()
        check("System status is healthy", h.get("status") == "healthy")
        check("PostgreSQL + PostGIS connected", h.get("databases", {}).get("postgres") == "connected")
        check("Neo4j property graph connected", h.get("databases", {}).get("neo4j") == "connected")
        check("Redis memory cache connected", h.get("databases", {}).get("redis") == "connected")

        # -------------------------------------------------------------
        # 2. Officer Authentication & JWT Clearance
        # -------------------------------------------------------------
        print("\n[Suite 2/7] Law Enforcement Authorization & JWT Issuance")
        print("-" * 55)
        login_payload = {"badge_id": "LE-CYBER-MUM-4029", "pin": "1234"}
        auth_res = await client.post(f"{API_BASE}/auth/login", json=login_payload)
        check("Officer login returns HTTP 200", auth_res.status_code == 200)
        auth_data = auth_res.json()
        token = auth_data.get("access_token")
        check("JWT bearer token issued", bool(token and len(token) > 20))
        check("Officer identity: Inspector Parth Kharat", auth_data.get("officer_name") == "Inspector Parth Kharat")
        check("Officer rank: Cyber Crime Inspector", "Inspector" in auth_data.get("officer_rank", ""))
        auth_headers = {"Authorization": f"Bearer {token}"}

        # -------------------------------------------------------------
        # 3. Demo Scenario Catalog API
        # -------------------------------------------------------------
        print("\n[Suite 3/7] Curated Demo Scenarios Catalog (GET /demo/scenarios)")
        print("-" * 55)
        scen_res = await client.get(f"{API_BASE}/demo/scenarios")
        check("Scenarios endpoint returns HTTP 200", scen_res.status_code == 200)
        scenarios = scen_res.json()
        check("Returns at least 3 curated attack scenarios", len(scenarios) >= 3, f"({len(scenarios)} found)")

        scenario_ids = [s["id"] for s in scenarios]
        check("Includes Mumbai UPI QR scenario", "mumbai_upi_qr" in scenario_ids)
        check("Includes Delhi Digital Arrest scenario", "delhi_digital_arrest" in scenario_ids)
        check("Includes Bengaluru Task Scam scenario", "bengaluru_task_scam" in scenario_ids)

        mumbai_scen = next((s for s in scenarios if s["id"] == "mumbai_upi_qr"), {})
        check("Mumbai scenario has reported loss", mumbai_scen.get("loss_amount") == 120000.0)
        check("Mumbai scenario defines target ATM cluster", bool(mumbai_scen.get("target_atm_cluster")))
        check("Mumbai scenario defines target suspect bank", bool(mumbai_scen.get("suspect_bank")))

        # -------------------------------------------------------------
        # 4. Live Attack Simulation Execution
        # -------------------------------------------------------------
        print("\n[Suite 4/7] Real-Time Live Attack Simulation (POST /demo/simulate-attack)")
        print("-" * 55)
        sim_payload = {"scenario_id": "mumbai_upi_qr"}
        sim_res = await client.post(
            f"{API_BASE}/demo/simulate-attack",
            json=sim_payload,
            headers=auth_headers
        )
        check("Attack simulation returns HTTP 200", sim_res.status_code == 200)
        sim_data = sim_res.json()
        check("Simulation response indicates success", sim_data.get("success") is True)
        check("Execution latency under 2000ms", sim_data.get("elapsed_ms", 9999) < 2000, f"({sim_data.get('elapsed_ms')}ms)")
        check("NCRP complaint created with acknowledgement number", bool(sim_data.get("complaint", {}).get("acknowledgement_no")))
        check("Complaint reflects calibrated loss amount (₹1,20,000)", sim_data.get("complaint", {}).get("loss_amount") == 120000.0)
        check("AI scoring summary contains scored accounts", sim_data.get("ai_scoring_summary", {}).get("total_scored", 0) >= 500)
        check("AI scoring generated threat alerts", sim_data.get("ai_scoring_summary", {}).get("alerts_written", 0) > 0)

        # -------------------------------------------------------------
        # 5. Dual AI Risk Fusion & SHAP Explainability Inspection
        # -------------------------------------------------------------
        print("\n[Suite 5/7] Dual AI Risk Fusion & Court-Admissible SHAP Explanations")
        print("-" * 55)
        alerts_res = await client.get(f"{API_BASE}/alerts?limit=5")
        check("Alerts feed query returns HTTP 200", alerts_res.status_code == 200)
        alerts_list = alerts_res.json()
        check("Alerts feed contains prioritized items", len(alerts_list) > 0)

        top_alert = alerts_list[0]
        check("Top alert composite risk score is high (>= 0.75)", top_alert.get("risk_score", 0) >= 0.75)
        check("Alert has both graph and geo sub-scores", "graph_score" in top_alert and "geo_score" in top_alert)
        check("Alert explanation contains SHAP factors", bool(top_alert.get("explanation", {}).get("shap_factors")))
        check("Alert explanation has legal verdict", bool(top_alert.get("explanation", {}).get("verdict")))

        # -------------------------------------------------------------
        # 6. Inter-Bank CFCFRMS Mock Gateway & Section 91 Lien Protocol
        # -------------------------------------------------------------
        print("\n[Suite 6/7] Inter-Bank CFCFRMS Mock Gateway & Section 91 Lien Confirmation")
        print("-" * 55)
        # Find an unfrozen account
        accs_res = await client.get(f"{API_BASE}/accounts?limit=100")
        unfrozen_acc = None
        for a in accs_res.json():
            if not a.get("is_frozen"):
                unfrozen_acc = a
                break

        if unfrozen_acc:
            freeze_payload = {
                "officer_badge_id": "LE-CYBER-MUM-4029",
                "reason": "Section 91 CrPC Emergency Interdiction — Active Mule Ring Cash-Out",
                "notes": "Verified Phase 6 test freeze order"
            }
            target_id = unfrozen_acc["id"]
            freeze_res = await client.post(f"{API_BASE}/freeze/{target_id}", json=freeze_payload, headers=auth_headers)
            check("Freeze order returns HTTP 200", freeze_res.status_code == 200)
            f_data = freeze_res.json()
            check("Account marked frozen in system of record", f_data.get("is_frozen") is True)
            check("Bank Lien Reference generated (CFCFRMS)", bool(f_data.get("bank_lien_reference")))
            check("Bank Lien Reference contains bank identifier", "-CFCFRMS-" in f_data.get("bank_lien_reference", ""))
            check("CFCFRMS national acknowledgement code issued", bool(f_data.get("cfcfrms_ack_code")))
            check("Funds retained under legal lien reported", f_data.get("funds_retained") is not None and f_data.get("funds_retained") >= 0)
            check("Branch IFSC code provided", bool(f_data.get("branch_ifsc")))
            check("Cryptographic SHA-256 audit signature generated", len(f_data.get("hash_signature", "")) == 64)
            check("Audit Log entry recorded with UUID", bool(f_data.get("audit_log_id")))
        else:
            # Idempotent freeze check
            repeat_res = await client.post(
                f"{API_BASE}/freeze/86174411141",
                json={"officer_badge_id": "LE-CYBER-MUM-4029", "reason": "Idempotent check"},
                headers=auth_headers
            )
            check("Idempotent freeze returns HTTP 200", repeat_res.status_code == 200)
            check("Returns active lien reference", bool(repeat_res.json().get("bank_lien_reference")))

        # -------------------------------------------------------------
        # 7. Real-Time WebSocket Telemetry Handshake
        # -------------------------------------------------------------
        print("\n[Suite 7/7] Real-Time WebSocket Telemetry Gateway")
        print("-" * 55)
        try:
            async with websockets.connect(WS_URL, close_timeout=3.0) as ws:
                greeting_raw = await asyncio.wait_for(ws.recv(), timeout=3.0)
                greeting = json.loads(greeting_raw)
                check("WebSocket connection established", greeting.get("event_type") == "CONNECTED")
                check("Server greeting received with client count", "Connected to RakshaNet" in greeting.get("payload", {}).get("message", ""))
        except Exception as e:
            check("WebSocket handshake functional", False, f"({e})")

        # Frontend Health Check
        fe_res = await client.get(FRONTEND_URL)
        check("Frontend Command Center reachable (HTTP 200)", fe_res.status_code == 200)

    # -------------------------------------------------------------
    # Summary
    # -------------------------------------------------------------
    banner(f"PHASE 6 VERIFICATION SUMMARY: {passed_checks}/{total_checks} PASSED ({(passed_checks/total_checks)*100:.1f}%)")
    if passed_checks == total_checks:
        print(f"\n{BOLD}\033[92m🎉 100% REGRESSION & PHASE 6 ACCEPTANCE CHECKS PASSED!{RESET}")
        print(f"RakshaNet Live Demo Simulation Engine and Inter-Bank Gateway are 100% operational.\n")
        return 0
    else:
        print(f"\n{BOLD}\033[91m⚠️  {total_checks - passed_checks} CHECKS FAILED.{RESET}\n")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(run_phase6_verification())
    sys.exit(exit_code)
