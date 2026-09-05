import asyncio
import logging
from datetime import datetime
from geoalchemy2.elements import WKTElement
from app.db.postgres import sync_engine, SyncSessionLocal
from app.db.neo4j_conn import neo4j_conn
from app.models.base import Base
from app.models.complaint import Complaint
from app.models.atm_location import ATMLocation
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.alert import Alert
from app.generators.atm_gen import generate_synthetic_atms
from app.generators.complaint_gen import generate_synthetic_complaints
from app.generators.transaction_gen import generate_synthetic_transactions
from app.ai.branch_a_gnn import gnn_predictor

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("rakshanet.seeder")

def seed_database():
    logger.info("Starting RakshaNet Synthetic Data Seeder (Slide 3 Aligned)...")

    # 1. PostgreSQL Schema Creation
    if sync_engine:
        try:
            with sync_engine.connect() as conn:
                conn.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
                conn.commit()
            Base.metadata.create_all(bind=sync_engine)
            logger.info("PostgreSQL + PostGIS tables verified.")
        except Exception as e:
            logger.warning(f"PostgreSQL connection failed or PostGIS missing: {e}")

    # 2. Seed PostgreSQL Records
    if SyncSessionLocal:
        try:
            session = SyncSessionLocal()
            
            # Seed ATMs
            atms = generate_synthetic_atms(count=40)
            for a in atms:
                point_wkt = f"POINT({a['longitude']} {a['latitude']})"
                atm_obj = ATMLocation(
                    atm_code=a["atm_code"],
                    bank_name=a["bank_name"],
                    city=a["city"],
                    state=a["state"],
                    zone=a["zone"],
                    location=WKTElement(point_wkt, srid=4326),
                    risk_score=a["risk_score"],
                    risk_tier=a["risk_tier"],
                    is_hotspot=a["is_hotspot"],
                    cluster_id=a["cluster_id"]
                )
                session.add(atm_obj)
            session.commit()
            logger.info(f"Seeded {len(atms)} ATM locations into PostgreSQL.")

            # Seed Complaints
            complaints = generate_synthetic_complaints(count=60)
            for c in complaints:
                point_wkt = f"POINT({c['longitude']} {c['latitude']})"
                c_obj = Complaint(
                    ncrp_ref=c["ncrp_ref"],
                    victim_name=c["victim_name"],
                    fraud_type=c["fraud_type"],
                    amount=c["amount"],
                    suspect_account_no=c["suspect_account_no"],
                    initial_mule_bank=c["initial_mule_bank"],
                    jurisdiction=c["jurisdiction"],
                    district=c["district"],
                    location=WKTElement(point_wkt, srid=4326),
                    filed_at=c["filed_at"],
                    description=c["description"]
                )
                session.add(c_obj)
            session.commit()
            logger.info(f"Seeded {len(complaints)} NCRP complaints into PostgreSQL.")

            # Seed Demo Baseline Alert
            baseline_alert = Alert(
                alert_code="RN-9042",
                tier="CRITICAL",
                target_account_no="888822220001",
                target_bank="HDFC Bank",
                amount_at_risk=45000.0,
                predicted_atm_code="ATM-MUM-042",
                predicted_atm_zone="Bandra-Kurla Complex",
                predicted_location=WKTElement("POINT(72.8688 19.0657)", srid=4326),
                graph_score=0.91,
                geo_score=0.88,
                fused_score=0.898,
                shap_attribution={"network_proximity": 0.34, "atm_density": 0.26, "dormancy_risk": 0.18, "velocity": 0.12},
                explanation_text="Account A/C-0001 flagged with 90% risk (CRITICAL). Key factors: Situated 2 hops from 2 confirmed mule clusters (+34%), located in high-density cash-out zone 'Bandra-Kurla Complex' (+26%), zero prior legitimate business history (+18%).",
                status="NEW"
            )
            session.add(baseline_alert)
            session.commit()
            logger.info("Seeded baseline CRITICAL demo alert (RN-9042).")
            session.close()
        except Exception as e:
            logger.warning(f"PostgreSQL seeding encountered notice: {e}")

    # 3. Seed Neo4j Property Graph
    txns, accs, fraud_accs = generate_synthetic_transactions(num_normal=200, num_fraud_rings=5)
    driver = neo4j_conn.get_driver()
    if driver:
        try:
            with driver.session() as n_sess:
                # Clear existing nodes
                n_sess.run("MATCH (n) DETACH DELETE n")
                
                # Create Unique Constraint
                n_sess.run("CREATE CONSTRAINT IF NOT EXISTS FOR (a:Account) REQUIRE a.account_number IS UNIQUE")

                # Create Accounts
                for acc in accs:
                    n_sess.run(
                        "MERGE (a:Account {account_number: $acc_num}) "
                        "SET a.bank_name = $bank, a.is_fraud_labeled = $is_fraud",
                        acc_num=acc["account_number"],
                        bank=acc["bank_name"],
                        is_fraud=acc["is_fraud"]
                    )

                # Create Transactions
                for t in txns:
                    n_sess.run(
                        "MATCH (u:Account {account_number: $from_acc}), (v:Account {account_number: $to_acc}) "
                        "CREATE (u)-[:TRANSACTED {txn_ref: $ref, amount: $amt, is_suspicious: $susp}]->(v)",
                        from_acc=t["from_account"],
                        to_acc=t["to_account"],
                        ref=t["txn_ref"],
                        amt=t["amount"],
                        susp=t["is_suspicious"]
                    )
            logger.info(f"Neo4j seeded: {len(accs)} account nodes, {len(txns)} transaction edges.")
        except Exception as e:
            logger.warning(f"Neo4j seeding deferred (Neo4j may not be running yet): {e}")

    # 4. Initialize In-Memory NetworkX Graph for Branch A
    gnn_predictor.build_graph_from_edges(txns, fraud_accs)
    logger.info("In-memory GNN NetworkX multigraph successfully initialized.")
    logger.info("✅ RakshaNet Seeding Complete!")

if __name__ == "__main__":
    seed_database()
