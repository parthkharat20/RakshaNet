#!/usr/bin/env python3
"""
Phase 8 Comprehensive Verification Suite — Court-Admissible Electronic Evidence & Syndicate Intelligence Hub.

Validates all 6 core components:
1. Multi-Database System Health & Polyglot Storage Readiness
2. Law Enforcement Officer JWT Authentication & Session Clearance
3. Court-Admissible Section 91 Cr.P.C. Case Dossier Generation (GET /dossier/{alert_id})
4. Statutory Section 63 BSA 2023 / Section 65B IEA Digital Certificate Integrity
5. Organized Crime Syndicate Profiling & Network Disruption Metrics (GET /syndicates)
6. Frontend Production Build & Legal Evidence Asset Delivery
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
    print(f"{BOLD}{HEADER}⚖️  {title}{RESET}")
    print(f"{BOLD}{HEADER}{'=' * 65}{RESET}")


async def run_phase8_verification():
    global total_checks, passed_checks
    banner("PHASE 8: SECTION 65B COURT EVIDENCE & SYNDICATE PROFILER")

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
        print("\n[Suite 2/6] Law Enforcement Authorization & JWT Issuance")
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
        # 3. Court-Admissible Case Dossier Generation (GET /dossier/{id})
        # -------------------------------------------------------------
        print("\n[Suite 3/6] Court-Admissible Section 91 Cr.P.C. Electronic Dossier")
        print("-" * 55)
        # Fetch an active alert to test dossier generation
        alerts_res = await client.get(f"{API_BASE}/alerts?limit=1")
        check("GET /alerts returns HTTP 200", alerts_res.status_code == 200)
        alerts_list = alerts_res.json()
        check("Alerts available in database", len(alerts_list) > 0)
        sample_alert = alerts_list[0]
        alert_id = sample_alert["id"]

        # Attempt unauthenticated dossier request (must fail with 401)
        unauth_dossier = await client.get(f"{API_BASE}/dossier/{alert_id}")
        check("Unauthenticated dossier request rejected (HTTP 401)", unauth_dossier.status_code == 401)

        # Authenticated dossier request
        dossier_res = await client.get(f"{API_BASE}/dossier/{alert_id}", headers=auth_headers)
        check("Authenticated GET /dossier/{id} returns HTTP 200", dossier_res.status_code == 200)
        dossier = dossier_res.json()

        check(f"Generated official Dossier Reference: {dossier.get('dossier_id')}", bool(dossier.get("dossier_id")))
        check(f"Generated official Case Reference: {dossier.get('case_reference')}", bool(dossier.get("case_reference")))
        check("Suspect account number populated", bool(dossier.get("suspect_account_number")))
        check("Suspect holder name populated", bool(dossier.get("suspect_holder_name")))
        check("Suspect bank and IFSC populated", bool(dossier.get("suspect_bank")) and bool(dossier.get("suspect_ifsc")))
        check(f"Fused risk score returned ({dossier.get('fused_risk_score')}%)", dossier.get("fused_risk_score") is not None)
        check("Citizen loss amount reported", dossier.get("citizen_loss_amount", 0) > 0)

        # Verify multi-hop transaction trail
        trail = dossier.get("transaction_trail", [])
        check(f"Multi-hop transaction trail populated ({len(trail)} hops)", len(trail) >= 2)
        if trail:
            hop1 = trail[0]
            check("Transaction hop contains source account", bool(hop1.get("from_account")))
            check("Transaction hop contains beneficiary account", bool(hop1.get("to_account")))
            check("Transaction hop contains amount", hop1.get("amount", 0) > 0)

        # Verify SHAP attributions & legal grounds
        check("SHAP feature attributions present", bool(dossier.get("shap_attributions")))
        check("Legal grounds include Section 91 Cr.P.C.", any("Section 91" in g for g in dossier.get("legal_grounds", [])))
        check("Legal grounds include Section 69B IT Act", any("Section 69B" in g for g in dossier.get("legal_grounds", [])))

        # -------------------------------------------------------------
        # 4. Statutory Section 63 BSA 2023 / Section 65B IEA Certificate
        # -------------------------------------------------------------
        print("\n[Suite 4/6] Section 63 BSA 2023 Electronic Evidence Certificate")
        print("-" * 55)
        cert = dossier.get("certificate_65b", {})
        check("Section 65B certificate object embedded in dossier", bool(cert))
        cert_id = cert.get("certificate_id")
        check(f"Certificate reference issued: {cert_id}", bool(cert_id) and "BSA-63-EVID" in cert_id)
        check("Certifying officer matches authenticated badge", cert.get("officer_badge_id") == "LE-CYBER-MUM-4029")
        check("Certifying officer name populated", cert.get("certifying_officer") == "Inspector Parth Kharat")
        check("System device ID recorded", cert.get("device_system_id") == "RAKSHANET-CORE-EVID-SRV-01")

        hash_digest = cert.get("evidence_hash_sha256")
        check(f"Root SHA-256 evidence hash digest valid ({hash_digest[:16]}...)", len(hash_digest or "") == 64)
        check("Statutory declaration incorporates BSA 2023 & Section 65B", "Bharatiya Sakshya Adhiniyam" in cert.get("legal_declaration", ""))

        # Test standalone certificate endpoint
        cert_endpoint_res = await client.get(f"{API_BASE}/dossier/{alert_id}/certificate", headers=auth_headers)
        check("GET /dossier/{id}/certificate returns HTTP 200", cert_endpoint_res.status_code == 200)
        standalone_cert = cert_endpoint_res.json()
        check("Standalone certificate hash matches dossier certificate", standalone_cert.get("evidence_hash_sha256") == hash_digest)

        # -------------------------------------------------------------
        # 5. Organized Crime Syndicate Profiler (GET /syndicates)
        # -------------------------------------------------------------
        print("\n[Suite 5/6] Organized Cybercrime Syndicate Intelligence Hub")
        print("-" * 55)
        syn_res = await client.get(f"{API_BASE}/syndicates")
        check("GET /syndicates returns HTTP 200", syn_res.status_code == 200)
        syndicates = syn_res.json()
        check(f"Returns active syndicates catalog (found {len(syndicates)})", len(syndicates) >= 4)

        names = [s["name"] for s in syndicates]
        check("Includes Jamtara QR Phishing Syndicate", any("Jamtara" in n for n in names))
        check("Includes Delhi-NCR Digital Arrest Ring", any("Delhi-NCR" in n for n in names))
        check("Includes Bengaluru Task & Crypto Network", any("Bengaluru" in n for n in names))
        check("Includes Southeast Asia Scam Gateway", any("Southeast Asia" in n for n in names))

        sample_syn = syndicates[0]
        check("Syndicate defines modus operandi", bool(sample_syn.get("modus_operandi")))
        check("Syndicate defines primary geographic corridor", bool(sample_syn.get("primary_region")))
        check("Syndicate reports detected loss vs intercepted volume", sample_syn.get("total_detected_loss", 0) > 0 and sample_syn.get("funds_intercepted", 0) > 0)
        check(f"Syndicate disruption rate calculated ({sample_syn.get('disruption_rate_pct')}%)", sample_syn.get("disruption_rate_pct", 0) > 0)
        check("Syndicate correlates target cash-out ATMs", len(sample_syn.get("top_target_atms", [])) > 0)

        # -------------------------------------------------------------
        # 6. Frontend Production Build & Asset Delivery
        # -------------------------------------------------------------
        print("\n[Suite 6/6] Frontend Production Build & Asset Pipeline")
        print("-" * 55)
        dist_path = "/Users/parthkharat/.gemini/antigravity-ide/scratch/RakshaNet/frontend/dist"
        check("Frontend dist directory exists", os.path.exists(dist_path))
        check("Production index.html generated", os.path.exists(os.path.join(dist_path, "index.html")))

        try:
            fe_res = await client.get("http://localhost:5173")
            check("Frontend dev server responding (HTTP 200)", fe_res.status_code == 200)
        except Exception:
            check("Frontend dev server responding", False, "(ensure dev server is running)")

    # -------------------------------------------------------------
    # Final Scorecard
    # -------------------------------------------------------------
    banner(f"PHASE 8 VERIFICATION COMPLETE: {passed_checks}/{total_checks} CHECKS PASSED")
    if passed_checks == total_checks:
        print(f"\n{BOLD}\033[92m🎉 ALL PHASE 8 COURT EVIDENCE & SYNDICATE INTELLIGENCE TESTS PASSED!{RESET}\n")
        return 0
    else:
        print(f"\n{BOLD}\033[91m⚠️ SOME CHECKS FAILED ({total_checks - passed_checks} failed){RESET}\n")
        return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(run_phase8_verification()))
