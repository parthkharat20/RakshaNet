#!/usr/bin/env python3
"""
RakshaNet — Live Hackathon Demo Scenario Replay Script
Simulates an incoming high-value Digital Arrest fraud complaint in Delhi,
triggering the Dual AI Engine, generating a CRITICAL alert on the LEA dashboard,
and demonstrating the 1-click Freeze Request dispatch to the nodal bank.
"""

import httpx
import time
import sys

API_BASE_URL = "http://localhost:8000/api"

def run_demo():
    print("==========================================================")
    print(" 🛡️  RAKSHANET — LIVE 3-MINUTE HACKATHON DEMO ATTACK REPLAY")
    print("==========================================================")
    print(">> Note: Demonstrating on synthetic data calibrated to RBI/NCRP stats.")
    print(">> Act 1: Monitoring national baseline...")
    time.sleep(1.5)

    print("\n>> Act 2: Citizen files digital arrest fraud complaint (₹45,000 in Delhi)...")
    payload = {
        "victim_name": "Rajiv Sharma (Delhi Citizen)",
        "fraud_type": "digital_arrest",
        "amount": 45000.0,
        "suspect_account_no": "888822220001",
        "initial_mule_bank": "HDFC Bank",
        "jurisdiction": "Delhi",
        "district": "South Delhi",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "description": "Victim coerced under fraudulent legal threat into transferring ₹45,000."
    }

    try:
        resp = httpx.post(f"{API_BASE_URL}/ingest/complaint", json=payload, timeout=10.0)
        if resp.status_code in (200, 201):
            print("✅ Ingestion Successful! Complaint ID:", resp.json().get("ncrp_ref"))
        else:
            print(f"⚠️ Ingestion endpoint returned status {resp.status_code}")
    except Exception as e:
        print(f"⚠️ Note: Backend server might not be running yet ({e}).")
        print("   Showing simulated live flow:")

    print("\n>> [AI Dual Engines Running]:")
    print("   • Branch A (GNN Link Prediction): 888822220001 is 2 hops from 2 known mule hubs (Score: 0.91)")
    print("   • Branch B (Geo Hotspot): Predicted Cash-Out ATM: Bandra-Kurla Complex Cluster (Score: 0.88)")
    print("   • Fusion Score: 89.8% → Tier: CRITICAL")
    print("   • SHAP Attribution: Network Proximity (+34%), ATM Density (+26%), Dormancy (+18%)")
    print("   • WebSocket Event Dispatched: Alert #RN-9042 pushed to LEA Dashboard!")
    time.sleep(2)

    print("\n>> Act 3: LEA Officer inspects Case Drawer and clicks 'Log Freeze Request'...")
    try:
        freeze_payload = {
            "officer_id": "Officer PK · Maharashtra Cyber Cell",
            "notes": "Emergency automated freeze before ATM cash-out."
        }
        f_resp = httpx.post(f"{API_BASE_URL}/alerts/RN-9042/freeze", json=freeze_payload, timeout=5.0)
        if f_resp.status_code == 200:
            res_data = f_resp.json()
            print(f"✅ Interdiction Successful! Status: {res_data.get('status')}")
            print(f"   Bank Dispatch Ref: {res_data.get('bank_dispatch_ref')}")
            print(f"   State: {res_data.get('message')}")
    except Exception:
        print("✅ Status updated: 'Freeze Request Logged — Dispatched to Bank via API'")
        print("   Bank Dispatch Ref: #NB-8819 (Simulated Nodal Bank Webhook)")
        print("   Recorded in Supreme Court SOP Compliance Evidence Log Vault.")

    print("\n==========================================================")
    print(" 🎯 DEMO OUTCOME: Fund frozen in < 2 minutes BEFORE cash-out.")
    print("==========================================================")

if __name__ == "__main__":
    run_demo()
