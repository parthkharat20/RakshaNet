"""
Simulation Service: Live Cyber Scam Attack Injection Engine for SIH Demonstrations.
Injects real-world calibrated cyber fraud scenarios end-to-end:
1. Citizen NCRP complaint ingestion
2. Neo4j multi-hop transfer chain synthesis
3. Dual-branch AI link prediction and hotspot scoring
4. Real-time WebSocket telemetry dispatch
"""

import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy import select

from app.db.postgres import AsyncSessionLocal
from app.db.neo4j_driver import get_neo4j_driver
from app.models import Account, Alert, Complaint
from app.schemas.complaint import ComplaintCreate
from app.services.ingestion import IngestionService
from app.ai.risk_fusion import run_full_scoring_pipeline
from app.realtime.dispatcher import (
    dispatch_ingestion_event,
    dispatch_pipeline_progress,
    dispatch_alert_batch,
    dispatch_attack_simulated_event
)

logger = logging.getLogger("simulation_service")

# Curated High-Impact SIH Demonstration Scenarios
DEMO_SCENARIOS = [
    {
        "id": "mumbai_upi_qr",
        "title": "Mumbai UPI QR Code Syndicate",
        "category": "UPI QR Code / Payment Request Fraud",
        "scam_type": "Rapid Layering & ATM Cash-Out",
        "city": "Mumbai",
        "state": "Maharashtra",
        "lat": 19.0760,
        "lon": 72.8777,
        "loss_amount": 120000.00,
        "victim_name": "Ramesh Chandra Sharma (Retd. Central Govt Officer)",
        "victim_account": "10000000001",
        "suspect_account": "86174411141",
        "suspect_holder": "Anand Mohan Verma",
        "suspect_bank": "State Bank of India",
        "target_atm_cluster": "Matunga Station / Dadar West ATM Hub",
        "predicted_hotspot_atms": ["ATM_MUM_001", "ATM_MUM_002"],
        "narrative": (
            "Victim received a spoofed SMS regarding immediate disconnection of MSEDCL electricity service. "
            "Coerced into scanning an emergency payment QR code. ₹1,20,000 debit divided into 3 rapid hops "
            "across State Bank of India and ICICI mule accounts. Inductive GraphSAGE flags Node 4 as high-risk "
            "bridge mule, while PostGIS ATM spatial clustering predicts cash-out within 45 minutes at Matunga."
        ),
        "hops": [
            {"from": "10000000001", "to": "86174411138", "amount": 120000.0, "layer": 1},
            {"from": "86174411138", "to": "86174411139", "amount": 65000.0, "layer": 2},
            {"from": "86174411138", "to": "86174411140", "amount": 55000.0, "layer": 2},
            {"from": "86174411139", "to": "86174411141", "amount": 60000.0, "layer": 3},
            {"from": "86174411140", "to": "86174411141", "amount": 50000.0, "layer": 3}
        ]
    },
    {
        "id": "delhi_digital_arrest",
        "title": "Delhi-NCR Digital Arrest & CBI Impersonation",
        "category": "Digital Arrest / Law Enforcement Impersonation",
        "scam_type": "Multi-Bank Coerced RTGS Transfer",
        "city": "New Delhi",
        "state": "Delhi",
        "lat": 28.6139,
        "lon": 77.2090,
        "loss_amount": 450000.00,
        "victim_name": "Dr. Sunita Deshmukh (AIIMS Senior Consultant)",
        "victim_account": "10000000002",
        "suspect_account": "86174411142",
        "suspect_holder": "Karan Singhal",
        "suspect_bank": "Punjab National Bank",
        "target_atm_cluster": "Connaught Place Inner Circle ATM Hub",
        "predicted_hotspot_atms": ["ATM_DEL_003", "ATM_DEL_005"],
        "narrative": (
            "Victim coerced during a 5-hour video call by fraudsters dressed in police uniforms claiming an illegal "
            "FedEx narcotic parcel was linked to her Aadhaar. Transferred ₹4,50,000 for 'RBI clearance verification'. "
            "Funds layered into high-turnover current accounts. Graph link predictor detects Adamic-Adar proximity to "
            "NCR cyber syndicate, and geo-engine forecasts multi-ATM withdrawals along CP Metro Ring."
        ),
        "hops": [
            {"from": "10000000002", "to": "86174411151", "amount": 450000.0, "layer": 1},
            {"from": "86174411151", "to": "86174411152", "amount": 250000.0, "layer": 2},
            {"from": "86174411152", "to": "86174411142", "amount": 240000.0, "layer": 3},
            {"from": "86174411142", "to": "ATM-DEL-003", "amount": 100000.0, "layer": 4}
        ]
    },
    {
        "id": "bengaluru_task_scam",
        "title": "Bengaluru Work-From-Home / Part-Time Job Trap",
        "category": "Investment / Part-Time Job Scam",
        "scam_type": "Dispersal Tree to Distributed Mules",
        "city": "Bengaluru",
        "state": "Karnataka",
        "lat": 12.9716,
        "lon": 77.5946,
        "loss_amount": 280000.00,
        "victim_name": "Arjun Nair (Cloud Systems Engineer)",
        "victim_account": "10000000003",
        "suspect_account": "86174411143",
        "suspect_holder": "Deepak Rajshekhar",
        "suspect_bank": "HDFC Bank",
        "target_atm_cluster": "Whitefield IT Corridor / Koramangala Hub",
        "predicted_hotspot_atms": ["ATM_BLR_002", "ATM_BLR_004"],
        "narrative": (
            "Victim lured through a sponsored Telegram channel promising ₹8,000/day for reviewing Google Maps locations. "
            "After small initial refunds, victim deposited ₹2,80,000 into a 'VIP Merchant Escrow'. Funds split across "
            "mule accounts in Whitefield. RakshaNet detects high out-degree velocity and alerts LEA officers before "
            "mules reach nearby tech-park ATMs."
        ),
        "hops": [
            {"from": "10000000003", "to": "86174411161", "amount": 280000.0, "layer": 1},
            {"from": "86174411161", "to": "86174411162", "amount": 160000.0, "layer": 2},
            {"from": "86174411162", "to": "86174411143", "amount": 150000.0, "layer": 3},
            {"from": "86174411143", "to": "ATM-BLR-002", "amount": 90000.0, "layer": 4}
        ]
    }
]


class SimulationService:
    @classmethod
    def get_available_scenarios(cls) -> List[Dict[str, Any]]:
        """Returns metadata for all pre-calibrated live demo scenarios."""
        return [
            {
                "id": s["id"],
                "title": s["title"],
                "category": s["category"],
                "scam_type": s["scam_type"],
                "city": s["city"],
                "state": s["state"],
                "lat": s["lat"],
                "lon": s["lon"],
                "loss_amount": s["loss_amount"],
                "victim_name": s["victim_name"],
                "suspect_holder": s["suspect_holder"],
                "suspect_bank": s["suspect_bank"],
                "target_atm_cluster": s["target_atm_cluster"],
                "narrative": s["narrative"],
                "hop_count": len(s.get("hops", []))
            }
            for s in DEMO_SCENARIOS
        ]

    @classmethod
    def get_scenario_by_id(cls, scenario_id: str) -> Optional[Dict[str, Any]]:
        for s in DEMO_SCENARIOS:
            if s["id"] == scenario_id:
                return s
        return None

    @classmethod
    async def simulate_attack(
        cls,
        scenario_id: str,
        officer_badge_id: str = "LE-CYBER-MUM-4029"
    ) -> Dict[str, Any]:
        """
        Executes an end-to-end cybercrime attack scenario:
        1. Ingests citizen complaint into PostgreSQL
        2. Synthesizes Neo4j multi-hop transaction topology
        3. Executes dual AI pipeline (GraphSAGE + PostGIS)
        4. Broadcasts real-time events via WebSocket
        5. Returns complete incident package with top generated alert
        """
        scenario = cls.get_scenario_by_id(scenario_id)
        if not scenario:
            raise ValueError(f"Unknown scenario ID: '{scenario_id}'")

        start_time = datetime.now(timezone.utc)
        logger.info(f"⚡ SIMULATION START: {scenario['title']} triggered by {officer_badge_id}")

        # Ensure Suspect and Victim Accounts exist in PostgreSQL
        suspect_account_id: uuid.UUID = uuid.uuid4()
        victim_account_id: Optional[uuid.UUID] = None

        try:
            async with AsyncSessionLocal() as session:
                # 1. Suspect Account
                s_res = await session.execute(
                    select(Account).where(Account.account_number == scenario["suspect_account"])
                )
                suspect_acc = s_res.scalar_one_or_none()
                if not suspect_acc:
                    suspect_acc = Account(
                        id=uuid.uuid4(),
                        account_number=scenario["suspect_account"],
                        holder_name=scenario["suspect_holder"],
                        bank_name=scenario["suspect_bank"],
                        ifsc_code=f"{scenario['suspect_bank'][:4].upper()}0001029",
                        is_mule_label=True,
                        risk_score=0.94,
                        account_age_days=18
                    )
                    session.add(suspect_acc)
                    await session.commit()
                    await session.refresh(suspect_acc)
                suspect_account_id = suspect_acc.id

                # 2. Victim Account
                v_res = await session.execute(
                    select(Account).where(Account.account_number == scenario["victim_account"])
                )
                victim_acc = v_res.scalar_one_or_none()
                if not victim_acc:
                    victim_acc = Account(
                        id=uuid.uuid4(),
                        account_number=scenario["victim_account"],
                        holder_name=scenario["victim_name"],
                        bank_name="State Bank of India",
                        ifsc_code="SBIN0000001",
                        is_mule_label=False,
                        risk_score=0.05,
                        account_age_days=1450
                    )
                    session.add(victim_acc)
                    await session.commit()
                    await session.refresh(victim_acc)
                victim_account_id = victim_acc.id
        except Exception as e:
            logger.warning(f"PostgreSQL account preparation non-fatal note: {e}")

        # Step 1: Ingest Complaint via NCRP Service
        await dispatch_pipeline_progress("NCRP_INGESTION", 20, f"Ingesting citizen complaint for {scenario['city']}...")

        complaint_data = ComplaintCreate(
            category=scenario["category"],
            loss_amount=scenario["loss_amount"],
            victim_account_number=scenario["victim_account"],
            suspect_account_number=scenario["suspect_account"],
            incident_time=start_time,
            lat=scenario["lat"],
            lon=scenario["lon"],
            city=scenario["city"],
            state=scenario["state"],
            description=scenario["narrative"]
        )

        complaint_res = await IngestionService.ingest_complaint(complaint_data)
        logger.info(f"  • Ingested NCRP Complaint: {complaint_res.acknowledgement_no}")

        # Broadcast ingestion event
        await dispatch_ingestion_event(
            acknowledgement_no=complaint_res.acknowledgement_no,
            category=complaint_res.category,
            loss_amount=complaint_res.loss_amount,
            city=complaint_res.city or scenario["city"]
        )

        # Step 2: Ensure accounts and transfer edges in Neo4j
        await dispatch_pipeline_progress("GRAPH_TOPOLOGY", 45, "Synthesizing multi-hop mule layering in Neo4j...")
        try:
            driver = get_neo4j_driver()
            async with driver.session() as n_session:
                # Merge victim node
                await n_session.run(
                    """
                    MERGE (v:Account {account_number: $acc})
                    SET v.id = coalesce(v.id, $id),
                        v.holder_name = $holder,
                        v.bank_name = 'State Bank of India',
                        v.is_mule = false,
                        v.is_mule_label = false,
                        v.risk_score = 0.05
                    """,
                    acc=scenario["victim_account"],
                    id=str(victim_account_id or uuid.uuid4()),
                    holder=scenario["victim_name"]
                )

                # Merge suspect node
                await n_session.run(
                    """
                    MERGE (s:Account {account_number: $acc})
                    SET s.id = coalesce(s.id, $id),
                        s.holder_name = $holder,
                        s.bank_name = $bank,
                        s.is_mule = true,
                        s.is_mule_label = true,
                        s.risk_score = 0.94
                    """,
                    acc=scenario["suspect_account"],
                    id=str(suspect_account_id),
                    holder=scenario["suspect_holder"],
                    bank=scenario["suspect_bank"]
                )

                # Inject transfer hops with realistic identities
                NODE_META = {
                    "86174411138": {"name": "Suresh Kulkarni (L1)", "bank": "HDFC Bank", "is_mule": True, "risk": 0.78},
                    "86174411139": {"name": "Rajesh Shinde (L2-A)", "bank": "ICICI Bank", "is_mule": True, "risk": 0.82},
                    "86174411140": {"name": "Vikram Patil (L2-B)", "bank": "Axis Bank", "is_mule": True, "risk": 0.84},
                    "ATM-MUM-001": {"name": "Matunga Stn ATM Hub", "bank": "SBI ATM #402", "is_mule": False, "risk": 0.95},
                    "86174411151": {"name": "Tarun Mehra (L1)", "bank": "Canara Bank", "is_mule": True, "risk": 0.78},
                    "86174411152": {"name": "Rohit Bansal (L2)", "bank": "HDFC Bank", "is_mule": True, "risk": 0.85},
                    "ATM-DEL-003": {"name": "Connaught Place ATM Hub", "bank": "PNB ATM #108", "is_mule": False, "risk": 0.96},
                    "86174411161": {"name": "Manjunath Hegde (L1)", "bank": "Kotak Mahindra Bank", "is_mule": True, "risk": 0.76},
                    "86174411162": {"name": "Pradeep Gowda (L2)", "bank": "Axis Bank", "is_mule": True, "risk": 0.83},
                    "ATM-BLR-002": {"name": "Whitefield ATM Hub", "bank": "HDFC ATM #02", "is_mule": False, "risk": 0.94}
                }

                for hop in scenario.get("hops", []):
                    src_m = NODE_META.get(hop["from"], {})
                    dst_m = NODE_META.get(hop["to"], {})

                    src_name = src_m.get("name") or ("Dr. Sunita Deshmukh" if hop["from"] == "10000000002" else "Victim" if "1000" in hop["from"] else f"Mule {hop['from'][-4:]}")
                    src_bank = src_m.get("bank") or ("State Bank of India" if "1000" in hop["from"] else "HDFC Bank")
                    dst_name = dst_m.get("name") or (scenario["suspect_holder"] if hop["to"] == scenario["suspect_account"] else f"Mule {hop['to'][-4:]}")
                    dst_bank = dst_m.get("bank") or (scenario["suspect_bank"] if hop["to"] == scenario["suspect_account"] else "ICICI Bank")

                    await n_session.run(
                        """
                        MERGE (src:Account {account_number: $src_acc})
                        SET src.id = coalesce(src.id, $src_id),
                            src.holder_name = coalesce(src.holder_name, $src_name),
                            src.bank_name = coalesce(src.bank_name, $src_bank),
                            src.is_mule = $src_is_mule,
                            src.risk_score = coalesce(src.risk_score, $src_risk)
                        MERGE (dst:Account {account_number: $dst_acc})
                        SET dst.id = coalesce(dst.id, $dst_id),
                            dst.holder_name = coalesce(dst.holder_name, $dst_name),
                            dst.bank_name = coalesce(dst.bank_name, $dst_bank),
                            dst.is_mule = $dst_is_mule,
                            dst.risk_score = coalesce(dst.risk_score, $dst_risk)
                        CREATE (src)-[:TRANSFERRED {
                            txn_ref: $txn_id,
                            txn_id: $txn_id,
                            amount: $amount,
                            timestamp: $ts,
                            channel: $channel,
                            is_flagged: true,
                            is_suspicious: true,
                            layer: $layer,
                            hop_level: $layer
                        }]->(dst)
                        """,
                        src_acc=hop["from"],
                        dst_acc=hop["to"],
                        src_id=str(uuid.uuid4()),
                        dst_id=str(uuid.uuid4()),
                        src_name=src_name,
                        src_bank=src_bank,
                        src_is_mule=src_m.get("is_mule", "1000" not in hop["from"] and not hop["from"].startswith("ATM")),
                        src_risk=src_m.get("risk", 0.05 if "1000" in hop["from"] else 0.82),
                        dst_name=dst_name,
                        dst_bank=dst_bank,
                        dst_is_mule=dst_m.get("is_mule", not hop["to"].startswith("ATM")),
                        dst_risk=dst_m.get("risk", 0.95 if hop["to"].startswith("ATM") else 0.88),
                        txn_id=f"TXN_{uuid.uuid4().hex[:10].upper()}",
                        amount=float(hop["amount"]),
                        channel="ATM_WITHDRAWAL" if hop["to"].startswith("ATM") else ("RTGS" if hop.get("layer") == 1 else "IMPS"),
                        ts=datetime.now(timezone.utc).isoformat(),
                        layer=hop.get("layer", 1)
                    )
            logger.info("  • Neo4j transaction graph updated with multi-hop hops.")
        except Exception as e:
            logger.warning(f"Neo4j graph injection partial warning: {e}")

        # Step 3: Run Dual-Branch AI Pipeline in background (sub-second response)
        await dispatch_pipeline_progress("AI_EVALUATION", 70, "Executing GraphSAGE link prediction & PostGIS ATM clustering...")
        
        # Schedule full database scoring as a background task so it updates everything without delaying UI
        asyncio.create_task(run_full_scoring_pipeline())

        scoring_summary = {
            "total_scored": len(scenario.get("hops", [])) + 2,
            "critical_count": 1,
            "elevated_count": 1,
            "alerts_written": 1
        }

        # Step 4: Construct and persist high-priority suspect alert immediately
        alert_uuid = uuid.uuid4()
        alert_id_str = str(alert_uuid)
        suspect_alert = {
            "id": alert_id_str,
            "alert_id": alert_id_str,
            "target_account_id": str(suspect_account_id),
            "target_account_number": scenario["suspect_account"],
            "target_holder_name": scenario["suspect_holder"],
            "bank_name": scenario["suspect_bank"],
            "city": scenario.get("city", "Mumbai"),
            "risk_score": 0.94,
            "graph_score": 0.96,
            "geo_score": 0.91,
            "alert_type": "MULE_RING",
            "status": "NEW",
            "target_atm_name": f"{scenario.get('target_atm_cluster', 'Dadar West')} ATM Hub",
            "target_terminal_id": scenario.get("predicted_hotspot_atms", ["ATM_MUM_001"])[0],
            "target_lat": 12.9716 if scenario.get("city") == "Bengaluru" else (28.6290 if scenario.get("city") == "Delhi" or scenario.get("city") == "New Delhi" else 19.0270),
            "target_lon": 77.5946 if scenario.get("city") == "Bengaluru" else (77.2260 if scenario.get("city") == "Delhi" or scenario.get("city") == "New Delhi" else 72.8550),
            "explanation": {
                "verdict": "CRITICAL",
                "fused_risk_score": 0.94,
                "shap_factors": [
                    {"factor": "Direct Fraud Proximity", "impact": "+0.30", "detail": f"Account is 1 hop from confirmed NCRP complaint {complaint_res.acknowledgement_no}."},
                    {"factor": "Rapid Fund Evacuation", "impact": "+0.25", "detail": "Account received stolen funds and transferred 92% within 12 minutes."},
                    {"factor": "Predictive Cash-Out Hotspot", "impact": "+0.22", "detail": f"Target ATM Cluster: {scenario['target_atm_cluster']}."}
                ]
            }
        }

        # Save to DB so it immediately appears in the alerts feed
        try:
            async with AsyncSessionLocal() as session:
                new_alert = Alert(
                    id=alert_uuid,
                    alert_type="MULE_RING",
                    target_account_id=suspect_account_id,
                    risk_score=0.94,
                    graph_score=0.96,
                    geo_score=0.91,
                    status="NEW",
                    explanation=suspect_alert["explanation"]
                )
                session.add(new_alert)
                await session.commit()
                logger.info(f"✅ Persisted simulated Alert {alert_id_str} into PostgreSQL")
        except Exception as e:
            logger.warning(f"Could not persist alert to DB: {e}")

        # Step 5: Broadcast Real-Time Events
        await dispatch_pipeline_progress("READY", 100, "Attack simulation live in Command Center!")
        await dispatch_attack_simulated_event(
            scenario_name=scenario["title"],

            victim_city=scenario["city"],
            loss_amount=scenario["loss_amount"]
        )
        await dispatch_alert_batch(scoring_summary, triggered_by=f"DEMO:{officer_badge_id}")

        elapsed_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
        logger.info(f"✅ SIMULATION COMPLETE: {scenario['title']} in {elapsed_ms}ms")

        return {
            "success": True,
            "scenario": scenario,
            "complaint": {
                "id": str(complaint_res.id),
                "acknowledgement_no": complaint_res.acknowledgement_no,
                "category": complaint_res.category,
                "loss_amount": complaint_res.loss_amount,
                "city": complaint_res.city,
                "reported_time": complaint_res.reported_time.isoformat()
            },
            "suspect_alert": suspect_alert,
            "ai_scoring_summary": {
                "total_scored": scoring_summary.get("total_scored", 0),
                "critical_count": scoring_summary.get("critical_count", 0),
                "elevated_count": scoring_summary.get("elevated_count", 0),
                "alerts_written": scoring_summary.get("alerts_written", 0)
            },
            "elapsed_ms": elapsed_ms,
            "message": f"Live incident '{scenario['title']}' injected and evaluated. Threat alert generated."
        }
