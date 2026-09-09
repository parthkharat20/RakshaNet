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
            {"from": "10000000002", "to": "86174411142", "amount": 450000.0, "layer": 1}
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
            {"from": "10000000003", "to": "86174411143", "amount": 280000.0, "layer": 1}
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
                    ON CREATE SET v.id = $id, v.holder_name = $holder, v.is_mule_label = false, v.is_frozen = false
                    """,
                    acc=scenario["victim_account"],
                    id=str(uuid.uuid4()),
                    holder=scenario["victim_name"]
                )

                # Merge suspect node
                await n_session.run(
                    """
                    MERGE (s:Account {account_number: $acc})
                    ON CREATE SET s.id = $id, s.holder_name = $holder, s.is_mule_label = true, s.is_frozen = false
                    """,
                    acc=scenario["suspect_account"],
                    id=str(complaint_res.suspect_account_id or uuid.uuid4()),
                    holder=scenario["suspect_holder"]
                )


                # Inject transfer hops
                for hop in scenario.get("hops", []):
                    await n_session.run(
                        """
                        MERGE (src:Account {account_number: $src_acc})
                        MERGE (dst:Account {account_number: $dst_acc})
                        CREATE (src)-[:TRANSFERRED {
                            txn_id: $txn_id,
                            amount: $amount,
                            timestamp: $ts,
                            is_suspicious: true,
                            layer: $layer
                        }]->(dst)
                        """,
                        src_acc=hop["from"],
                        dst_acc=hop["to"],
                        txn_id=f"TXN_{uuid.uuid4().hex[:10].upper()}",
                        amount=float(hop["amount"]),
                        ts=datetime.now(timezone.utc).isoformat(),
                        layer=hop.get("layer", 1)
                    )
            logger.info("  • Neo4j transaction graph updated with multi-hop hops.")
        except Exception as e:
            logger.warning(f"Neo4j graph injection partial warning: {e}")

        # Step 3: Run Dual-Branch AI Pipeline
        await dispatch_pipeline_progress("AI_EVALUATION", 70, "Executing GraphSAGE link prediction & PostGIS ATM clustering...")
        scoring_summary = await run_full_scoring_pipeline()
        logger.info(f"  • AI pipeline complete: {scoring_summary.get('alerts_written', 0)} alerts generated")

        # Step 4: Retrieve newly created high-priority alert for suspect
        suspect_alert: Optional[Dict[str, Any]] = None
        async with AsyncSessionLocal() as session:
            query = select(Alert, Account).outerjoin(Account, Alert.target_account_id == Account.id)
            if complaint_res.suspect_account_id:
                query = query.where(Alert.target_account_id == complaint_res.suspect_account_id)
            query = query.order_by(Alert.risk_score.desc()).limit(1)
            row = (await session.execute(query)).first()
            if row:
                alert_obj, acc_obj = row
                suspect_alert = {
                    "alert_id": str(alert_obj.id),
                    "target_account_id": str(alert_obj.target_account_id),
                    "target_account_number": acc_obj.account_number if acc_obj else scenario["suspect_account"],
                    "target_holder_name": acc_obj.holder_name if acc_obj else scenario["suspect_holder"],
                    "bank_name": acc_obj.bank_name if acc_obj else scenario["suspect_bank"],
                    "risk_score": float(alert_obj.risk_score or 0.0),
                    "graph_score": float(alert_obj.graph_score or 0.0),
                    "geo_score": float(alert_obj.geo_score or 0.0),
                    "alert_type": alert_obj.alert_type,
                    "status": alert_obj.status,
                    "explanation": alert_obj.explanation
                }


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
