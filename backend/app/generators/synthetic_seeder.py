import asyncio
import json
import logging
import os
import random
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, List, Any

import networkx as nx
import numpy as np
from faker import Faker
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from sqlalchemy import text

from app.config import settings
from app.db.neo4j_driver import get_neo4j_driver
from app.db.postgres import AsyncSessionLocal
from app.generators.constants import (
    INDIAN_BANKS,
    INDIAN_CITIES,
    NCRP_FRAUD_CATEGORIES,
)
from app.models import Account, ATMLocation, Complaint, Transaction

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("synthetic_seeder")

fake = Faker(["en_IN"])
Faker.seed(42)
random.seed(42)
np.random.seed(42)

# Output directory for local JSON snapshots
DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "synthetic"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Configuration counts
NUM_TOTAL_ACCOUNTS = 500
NUM_ATMS = 50
NUM_NORMAL_TXNS = 2500


def get_random_city() -> Dict[str, Any]:
    weights = [c["weight"] for c in INDIAN_CITIES]
    return random.choices(INDIAN_CITIES, weights=weights, k=1)[0]


def generate_ifsc(bank_code: str) -> str:
    # 4-letter bank code + 0 + 6 alphanumeric/digits
    return f"{bank_code}0{random.randint(100000, 999999)}"


def generate_account_number(bank_code: str) -> str:
    return f"{random.randint(10000000000, 99999999999)}"


class SyntheticDataGenerator:
    def __init__(self):
        self.accounts: List[Dict[str, Any]] = []
        self.atms: List[Dict[str, Any]] = []
        self.transactions: List[Dict[str, Any]] = []
        self.complaints: List[Dict[str, Any]] = []
        self.hero_rings: Dict[str, Any] = {}
        self.account_by_num: Dict[str, Dict[str, Any]] = {}
        self.account_by_id: Dict[str, Dict[str, Any]] = {}

    def generate_accounts_and_atms(self):
        logger.info(f"Generating {NUM_TOTAL_ACCOUNTS} accounts and {NUM_ATMS} clustered ATMs...")

        # 1. Generate ATMs clustered near commercial centers in weighted cities
        for i in range(NUM_ATMS):
            city_info = get_random_city()
            bank = random.choice(INDIAN_BANKS)
            # Commercial cluster Gaussian offset (within ~1.5 - 3 km radius)
            lat_offset = float(np.random.normal(0, 0.012))
            lon_offset = float(np.random.normal(0, 0.012))
            lat = city_info["lat"] + lat_offset
            lon = city_info["lon"] + lon_offset
            atm_id = str(uuid.uuid4())
            terminal_id = f"ATM_{city_info['city'][:3].upper()}_{bank['code']}_{1000 + i}"

            atm = {
                "id": atm_id,
                "terminal_id": terminal_id,
                "bank_name": bank["name"],
                "address": f"Near {fake.street_name()}, Commercial Zone, {city_info['city']}",
                "city": city_info["city"],
                "state": city_info["state"],
                "lat": lat,
                "lon": lon,
                "cash_out_frequency": random.randint(10, 150),
                "risk_score": round(random.uniform(0.05, 0.25), 2),
                "is_hotspot": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            self.atms.append(atm)

        # 2. Generate Accounts with structural split in Account Age
        # 85% legitimate old accounts (700 to 3650 days old)
        # 15% suspicious / mule pool (3 to 45 days old)
        for i in range(NUM_TOTAL_ACCOUNTS):
            bank = random.choice(INDIAN_BANKS)
            acc_num = generate_account_number(bank["code"])
            acc_id = str(uuid.uuid4())
            first_name = fake.first_name()
            last_name = fake.last_name()
            holder_name = f"{first_name} {last_name}"
            handle = random.choice(bank["upi_handles"])
            upi_id = f"{first_name.lower()}.{last_name.lower()}{random.randint(10, 99)}{handle}"

            is_potential_mule = (i < int(NUM_TOTAL_ACCOUNTS * 0.15))
            if is_potential_mule:
                # Young account age: critical SHAP feature
                account_age_days = random.randint(3, 45)
                acc_type = random.choice(["SAVINGS", "CURRENT"])
                balance = round(random.uniform(1000, 25000), 2)
                initial_risk = round(random.uniform(0.10, 0.25), 2)
            else:
                # Mature legitimate account: 2 to 10 years old
                account_age_days = random.randint(700, 3650)
                acc_type = random.choice(["SAVINGS", "SALARY", "CURRENT"])
                balance = round(random.uniform(15000, 450000), 2)
                initial_risk = round(random.uniform(0.01, 0.06), 2)

            acc = {
                "id": acc_id,
                "account_number": acc_num,
                "holder_name": holder_name,
                "bank_name": bank["name"],
                "ifsc_code": generate_ifsc(bank["code"]),
                "upi_id": upi_id,
                "account_type": acc_type,
                "balance": balance,
                "risk_score": initial_risk,
                "is_frozen": False,
                "account_age_days": account_age_days,
                "is_mule_label": False,  # Will be explicitly set for Hero Ring members
                "created_at": (datetime.now(timezone.utc) - timedelta(days=account_age_days)).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            self.accounts.append(acc)
            self.account_by_num[acc_num] = acc
            self.account_by_id[acc_id] = acc

    def generate_hero_fraud_rings(self):
        """Constructs Star, Chain, and Fan-out fraud ring topologies with realistic timing & clean neighbors."""
        logger.info("Embedding 3 Hero Fraud Rings (Star, Chain, Fan-out) & ATM Cash-Out Hotspots...")

        now = datetime.now(timezone.utc)

        # Helper to grab candidate accounts
        mule_candidates = [a for a in self.accounts if a["account_age_days"] <= 45 and not a["is_mule_label"]]
        mature_candidates = [a for a in self.accounts if a["account_age_days"] > 700 and not a["is_mule_label"]]

        # -------------------------------------------------------------
        # 1. HERO RING 1: STAR TOPOLOGY (Hub-and-Spoke Inflow)
        # -------------------------------------------------------------
        star_hub = mule_candidates.pop(0)
        star_hub["is_mule_label"] = True
        star_hub["risk_score"] = 0.88
        star_hub["holder_name"] = "Vikram Solanki (Mule Collector)"

        num_star_victims = 8
        star_victims = mature_candidates[:num_star_victims]
        mature_candidates = mature_candidates[num_star_victims:]

        star_txns = []
        star_base_time = now - timedelta(hours=3)
        total_inflow = 0

        for idx, victim in enumerate(star_victims):
            # Lognormal loss amount between ₹25,000 and ₹1,20,000
            amt = round(float(np.random.lognormal(mean=10.8, sigma=0.4)), 2)
            amt = min(max(amt, 25000), 120000)
            total_inflow += amt
            txn_time = star_base_time + timedelta(minutes=idx * 2 + random.randint(0, 1))

            txn = {
                "id": str(uuid.uuid4()),
                "txn_ref": f"UPI{txn_time.strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}",
                "sender_account_id": victim["id"],
                "receiver_account_id": star_hub["id"],
                "amount": amt,
                "timestamp": txn_time.isoformat(),
                "channel": "UPI",
                "is_flagged": True,
                "hop_level": 1,
                "ring_id": "HERO_RING_STAR_01",
                "created_at": txn_time.isoformat()
            }
            star_txns.append(txn)

            # File corresponding NCRP complaint for victim
            comp_city = get_random_city()
            complaint = {
                "id": str(uuid.uuid4()),
                "acknowledgement_no": f"20260908{random.randint(10000000, 99999999)}",
                "category": "UPI QR Code / Payment Request Fraud",
                "loss_amount": amt,
                "victim_account_id": victim["id"],
                "suspect_account_id": star_hub["id"],
                "incident_time": txn_time.isoformat(),
                "reported_time": (txn_time + timedelta(minutes=45)).isoformat(),
                "lat": comp_city["lat"] + float(np.random.normal(0, 0.01)),
                "lon": comp_city["lon"] + float(np.random.normal(0, 0.01)),
                "city": comp_city["city"],
                "state": comp_city["state"],
                "status": "PENDING",
                "description": f"Victim scanned a QR code sent on WhatsApp for buying second-hand goods on OLX. Instant debit of ₹{amt}.",
                "created_at": (txn_time + timedelta(minutes=45)).isoformat()
            }
            self.complaints.append(complaint)

        # Star hub rapidly forwards consolidated funds to Layer-2 mule
        star_layer2_mule = mule_candidates.pop(0)
        star_layer2_mule["is_mule_label"] = True
        star_layer2_mule["risk_score"] = 0.82
        star_layer2_mule["holder_name"] = "Ramesh Rathod (L2 Layering Mule)"

        consolidated_outflow = round(total_inflow * 0.95, 2)
        outflow_time = star_base_time + timedelta(minutes=25)
        star_txns.append({
            "id": str(uuid.uuid4()),
            "txn_ref": f"IMPS{outflow_time.strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}",
            "sender_account_id": star_hub["id"],
            "receiver_account_id": star_layer2_mule["id"],
            "amount": consolidated_outflow,
            "timestamp": outflow_time.isoformat(),
            "channel": "IMPS",
            "is_flagged": True,
            "hop_level": 2,
            "ring_id": "HERO_RING_STAR_01",
            "created_at": outflow_time.isoformat()
        })

        # CRITICAL TEST CASE: Clean account sitting 2 hops away (innocent Kirana Merchant)
        clean_merchant = mature_candidates.pop(0)
        clean_merchant["is_mule_label"] = False
        clean_merchant["risk_score"] = 0.04
        clean_merchant["holder_name"] = "Om Sai Kirana Store (Clean Merchant)"
        star_txns.append({
            "id": str(uuid.uuid4()),
            "txn_ref": f"UPI{outflow_time.strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}",
            "sender_account_id": star_hub["id"],
            "receiver_account_id": clean_merchant["id"],
            "amount": 320.0,
            "timestamp": (star_base_time + timedelta(minutes=15)).isoformat(),
            "channel": "UPI",
            "is_flagged": False,
            "hop_level": 2,
            "ring_id": None,  # Not part of the fraud scheme, purely clean neighbor
            "created_at": (star_base_time + timedelta(minutes=15)).isoformat()
        })

        self.transactions.extend(star_txns)
        self.hero_rings["HERO_RING_STAR_01"] = {
            "name": "Star Hub Fraud Ring",
            "topology": "Star (Hub-and-Spoke)",
            "hub_mule_id": star_hub["id"],
            "hub_mule_acc": star_hub["account_number"],
            "victim_ids": [v["id"] for v in star_victims],
            "layer2_mule_id": star_layer2_mule["id"],
            "clean_neighbor_id": clean_merchant["id"],
            "total_inflow": total_inflow,
            "consolidated_outflow": consolidated_outflow,
            "category": "UPI QR Code / Payment Request Fraud"
        }

        # -------------------------------------------------------------
        # 2. HERO RING 2: CHAIN TOPOLOGY (Sequential 4-Hop Layering)
        # -------------------------------------------------------------
        chain_victim = mature_candidates.pop(0)
        chain_mules = [mule_candidates.pop(0) for _ in range(4)]
        for i, m in enumerate(chain_mules):
            m["is_mule_label"] = True
            m["risk_score"] = round(0.92 - (i * 0.04), 2)
            m["holder_name"] = f"Mule Chain Node {i+1} ({m['holder_name'].split()[0]})"

        chain_base_time = now - timedelta(hours=2)
        chain_stolen_amount = 540000.0  # ₹5.4 Lakhs Digital Arrest
        chain_txns = []

        # Hop 1: Victim -> Mule 1
        t1 = chain_base_time
        chain_txns.append({
            "id": str(uuid.uuid4()),
            "txn_ref": f"RTGS{t1.strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}",
            "sender_account_id": chain_victim["id"],
            "receiver_account_id": chain_mules[0]["id"],
            "amount": chain_stolen_amount,
            "timestamp": t1.isoformat(),
            "channel": "RTGS",
            "is_flagged": True,
            "hop_level": 1,
            "ring_id": "HERO_RING_CHAIN_01",
            "created_at": t1.isoformat()
        })

        # File NCRP complaint for Digital Arrest
        comp_city = get_random_city()
        self.complaints.append({
            "id": str(uuid.uuid4()),
            "acknowledgement_no": f"20260908{random.randint(10000000, 99999999)}",
            "category": "Digital Arrest Scam",
            "loss_amount": chain_stolen_amount,
            "victim_account_id": chain_victim["id"],
            "suspect_account_id": chain_mules[0]["id"],
            "incident_time": t1.isoformat(),
            "reported_time": (t1 + timedelta(minutes=30)).isoformat(),
            "lat": comp_city["lat"] + float(np.random.normal(0, 0.01)),
            "lon": comp_city["lon"] + float(np.random.normal(0, 0.01)),
            "city": comp_city["city"],
            "state": comp_city["state"],
            "status": "PENDING",
            "description": "Victim held under coercive Skype video call for 36 hours by fake ED/CBI officials threatening immediate arrest.",
            "created_at": (t1 + timedelta(minutes=30)).isoformat()
        })

        # Sequential Hops: Mule 1 -> Mule 2 -> Mule 3 -> Mule 4
        curr_amt = chain_stolen_amount
        for hop_idx in range(1, 4):
            t_hop = chain_base_time + timedelta(minutes=hop_idx * 9 + random.randint(1, 3))
            curr_amt = round(curr_amt * random.uniform(0.96, 0.98), 2)  # Cut/fee skimmed
            chain_txns.append({
                "id": str(uuid.uuid4()),
                "txn_ref": f"IMPS{t_hop.strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}",
                "sender_account_id": chain_mules[hop_idx - 1]["id"],
                "receiver_account_id": chain_mules[hop_idx]["id"],
                "amount": curr_amt,
                "timestamp": t_hop.isoformat(),
                "channel": "IMPS",
                "is_flagged": True,
                "hop_level": hop_idx + 1,
                "ring_id": "HERO_RING_CHAIN_01",
                "created_at": t_hop.isoformat()
            })

        # CRITICAL TEST CASE: Clean Landlord connected 2 hops from Mule 2
        clean_landlord = mature_candidates.pop(0)
        clean_landlord["is_mule_label"] = False
        clean_landlord["risk_score"] = 0.05
        clean_landlord["holder_name"] = "Suresh Kulkarni (Clean Landlord)"
        chain_txns.append({
            "id": str(uuid.uuid4()),
            "txn_ref": f"UPI{t1.strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}",
            "sender_account_id": chain_mules[1]["id"],
            "receiver_account_id": clean_landlord["id"],
            "amount": 22000.0,
            "timestamp": (chain_base_time + timedelta(minutes=15)).isoformat(),
            "channel": "UPI",
            "is_flagged": False,
            "hop_level": 3,
            "ring_id": None,
            "created_at": (chain_base_time + timedelta(minutes=15)).isoformat()
        })

        self.transactions.extend(chain_txns)
        self.hero_rings["HERO_RING_CHAIN_01"] = {
            "name": "Chain Layering Fraud Ring",
            "topology": "Chain (Sequential 4-Hop)",
            "victim_id": chain_victim["id"],
            "mule_chain_ids": [m["id"] for m in chain_mules],
            "clean_neighbor_id": clean_landlord["id"],
            "initial_loss": chain_stolen_amount,
            "terminal_mule_id": chain_mules[-1]["id"],
            "category": "Digital Arrest Scam"
        }

        # -------------------------------------------------------------
        # 3. HERO RING 3: FAN-OUT TOPOLOGY (Smurfing Under ₹50k Limit)
        # -------------------------------------------------------------
        fanout_victim = mature_candidates.pop(0)
        fanout_aggregator = mule_candidates.pop(0)
        fanout_aggregator["is_mule_label"] = True
        fanout_aggregator["risk_score"] = 0.90
        fanout_aggregator["holder_name"] = "Harish Dave (Smurfing Aggregator)"

        num_leaf_mules = 7
        fanout_leaf_mules = [mule_candidates.pop(0) for _ in range(num_leaf_mules)]
        for idx, lm in enumerate(fanout_leaf_mules):
            lm["is_mule_label"] = True
            lm["risk_score"] = 0.78
            lm["holder_name"] = f"Micro Mule {idx+1} ({lm['holder_name'].split()[0]})"

        fanout_base_time = now - timedelta(hours=1)
        fanout_loss = 330000.0  # ₹3.3 Lakhs Investment Scam
        fanout_txns = []

        # Inflow: Victim -> Aggregator
        fanout_txns.append({
            "id": str(uuid.uuid4()),
            "txn_ref": f"IMPS{fanout_base_time.strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}",
            "sender_account_id": fanout_victim["id"],
            "receiver_account_id": fanout_aggregator["id"],
            "amount": fanout_loss,
            "timestamp": fanout_base_time.isoformat(),
            "channel": "IMPS",
            "is_flagged": True,
            "hop_level": 1,
            "ring_id": "HERO_RING_FANOUT_01",
            "created_at": fanout_base_time.isoformat()
        })

        # File NCRP complaint for Investment Scam
        comp_city = get_random_city()
        self.complaints.append({
            "id": str(uuid.uuid4()),
            "acknowledgement_no": f"20260908{random.randint(10000000, 99999999)}",
            "category": "Investment / Stock Trading Scam",
            "loss_amount": fanout_loss,
            "victim_account_id": fanout_victim["id"],
            "suspect_account_id": fanout_aggregator["id"],
            "incident_time": fanout_base_time.isoformat(),
            "reported_time": (fanout_base_time + timedelta(minutes=40)).isoformat(),
            "lat": comp_city["lat"] + float(np.random.normal(0, 0.01)),
            "lon": comp_city["lon"] + float(np.random.normal(0, 0.01)),
            "city": comp_city["city"],
            "state": comp_city["state"],
            "status": "PENDING",
            "description": "WhatsApp group promised 300% IPO profits. Money routed to institutional trading wallet.",
            "created_at": (fanout_base_time + timedelta(minutes=40)).isoformat()
        })

        # Fan-out: Aggregator -> 7 Micro Mules (all strictly under ₹50,000 threshold: ₹46k to ₹49k)
        for idx, lm in enumerate(fanout_leaf_mules):
            t_leaf = fanout_base_time + timedelta(minutes=10 + idx * 2)
            leaf_amt = round(random.uniform(46000, 48500), 2)
            fanout_txns.append({
                "id": str(uuid.uuid4()),
                "txn_ref": f"UPI{t_leaf.strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}",
                "sender_account_id": fanout_aggregator["id"],
                "receiver_account_id": lm["id"],
                "amount": leaf_amt,
                "timestamp": t_leaf.isoformat(),
                "channel": "UPI",
                "is_flagged": True,
                "hop_level": 2,
                "ring_id": "HERO_RING_FANOUT_01",
                "created_at": t_leaf.isoformat()
            })

        self.transactions.extend(fanout_txns)
        self.hero_rings["HERO_RING_FANOUT_01"] = {
            "name": "Smurfing Fan-Out Fraud Ring",
            "topology": "Fan-Out (Threshold Evasion)",
            "victim_id": fanout_victim["id"],
            "aggregator_id": fanout_aggregator["id"],
            "leaf_mule_ids": [lm["id"] for lm in fanout_leaf_mules],
            "initial_loss": fanout_loss,
            "category": "Investment / Stock Trading Scam"
        }

        # -------------------------------------------------------------
        # 4. ATM CASHOUT HOTSPOT GEO CLUSTER
        # -------------------------------------------------------------
        # Connect terminal chain mules to 3 nearby ATMs in Mumbai or Delhi
        target_city = "Mumbai"
        mumbai_atms = [a for a in self.atms if a["city"] == target_city]
        if len(mumbai_atms) < 3:
            mumbai_atms = self.atms[:3]

        cashout_atms = mumbai_atms[:3]
        for atm in cashout_atms:
            atm["is_hotspot"] = True
            atm["risk_score"] = 0.89

        terminal_mule = chain_mules[-1]
        for idx, atm in enumerate(cashout_atms):
            t_atm = chain_base_time + timedelta(minutes=40 + idx * 8)
            # Cash withdrawal transaction
            self.transactions.append({
                "id": str(uuid.uuid4()),
                "txn_ref": f"ATM{t_atm.strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}",
                "sender_account_id": terminal_mule["id"],
                "receiver_account_id": terminal_mule["id"],  # Self withdrawal
                "amount": 20000.0,
                "timestamp": t_atm.isoformat(),
                "channel": "ATM_WITHDRAWAL",
                "is_flagged": True,
                "hop_level": 5,
                "ring_id": "HERO_RING_CHAIN_01",
                "atm_terminal_id": atm["terminal_id"],
                "created_at": t_atm.isoformat()
            })

    def generate_normal_transactions(self):
        """Generates ~2,500 normal background commercial and P2P transactions."""
        logger.info(f"Generating {NUM_NORMAL_TXNS} legitimate background transactions (10x ratio)...")

        now = datetime.now(timezone.utc)
        legit_accounts = [a for a in self.accounts if not a["is_mule_label"]]

        for _ in range(NUM_NORMAL_TXNS):
            sender = random.choice(legit_accounts)
            receiver = random.choice(legit_accounts)
            while receiver["id"] == sender["id"]:
                receiver = random.choice(legit_accounts)

            # Normal spending amount: lognormal with median ~₹1,800
            amt = round(float(np.random.lognormal(mean=7.5, sigma=1.0)), 2)
            amt = min(max(amt, 100), 45000)

            channel = random.choices(
                ["UPI", "IMPS", "NEFT", "RTGS"],
                weights=[0.75, 0.15, 0.08, 0.02],
                k=1
            )[0]

            random_days_ago = random.uniform(0.05, 30.0)
            txn_time = now - timedelta(days=random_days_ago)

            txn = {
                "id": str(uuid.uuid4()),
                "txn_ref": f"{channel}{txn_time.strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}",
                "sender_account_id": sender["id"],
                "receiver_account_id": receiver["id"],
                "amount": amt,
                "timestamp": txn_time.isoformat(),
                "channel": channel,
                "is_flagged": False,
                "hop_level": 0,
                "ring_id": None,
                "created_at": txn_time.isoformat()
            }
            self.transactions.append(txn)

    def save_json_snapshots(self):
        logger.info(f"Writing synthetic JSON snapshots to {DATA_DIR}...")

        with open(DATA_DIR / "accounts.json", "w") as f:
            json.dump(self.accounts, f, indent=2)

        with open(DATA_DIR / "atms.json", "w") as f:
            json.dump(self.atms, f, indent=2)

        with open(DATA_DIR / "transactions.json", "w") as f:
            json.dump(self.transactions, f, indent=2)

        with open(DATA_DIR / "complaints.json", "w") as f:
            json.dump(self.complaints, f, indent=2)

        with open(DATA_DIR / "hero_fraud_rings.json", "w") as f:
            json.dump(self.hero_rings, f, indent=2)

        logger.info("✅ JSON snapshots written successfully.")

    async def seed_postgres(self):
        logger.info("Seeding PostgreSQL + PostGIS tables...")
        async with AsyncSessionLocal() as session:
            # Clear existing data for clean re-seed
            await session.execute(text("TRUNCATE TABLE alerts, audit_logs, transactions, complaints, atm_locations, accounts CASCADE;"))
            await session.commit()

            # 1. Seed Accounts
            acc_objs = [
                Account(
                    id=uuid.UUID(a["id"]),
                    account_number=a["account_number"],
                    holder_name=a["holder_name"],
                    bank_name=a["bank_name"],
                    ifsc_code=a["ifsc_code"],
                    upi_id=a["upi_id"],
                    account_type=a["account_type"],
                    balance=a["balance"],
                    risk_score=a["risk_score"],
                    is_frozen=a["is_frozen"],
                    account_age_days=a["account_age_days"],
                    is_mule_label=a["is_mule_label"],
                    created_at=datetime.fromisoformat(a["created_at"]),
                    updated_at=datetime.fromisoformat(a["updated_at"])
                )
                for a in self.accounts
            ]
            session.add_all(acc_objs)
            await session.flush()

            # 2. Seed ATMs with PostGIS geometry
            atm_objs = [
                ATMLocation(
                    id=uuid.UUID(atm["id"]),
                    terminal_id=atm["terminal_id"],
                    bank_name=atm["bank_name"],
                    address=atm["address"],
                    city=atm["city"],
                    state=atm["state"],
                    location=from_shape(Point(atm["lon"], atm["lat"]), srid=4326),
                    cash_out_frequency=atm["cash_out_frequency"],
                    risk_score=atm["risk_score"],
                    is_hotspot=atm["is_hotspot"],
                    created_at=datetime.fromisoformat(atm["created_at"])
                )
                for atm in self.atms
            ]
            session.add_all(atm_objs)
            await session.flush()

            # 3. Seed Complaints
            comp_objs = [
                Complaint(
                    id=uuid.UUID(c["id"]),
                    acknowledgement_no=c["acknowledgement_no"],
                    category=c["category"],
                    loss_amount=c["loss_amount"],
                    victim_account_id=uuid.UUID(c["victim_account_id"]) if c.get("victim_account_id") else None,
                    suspect_account_id=uuid.UUID(c["suspect_account_id"]) if c.get("suspect_account_id") else None,
                    incident_time=datetime.fromisoformat(c["incident_time"]),
                    reported_time=datetime.fromisoformat(c["reported_time"]),
                    location=from_shape(Point(c["lon"], c["lat"]), srid=4326) if "lon" in c else None,
                    city=c.get("city"),
                    state=c.get("state"),
                    status=c["status"],
                    description=c.get("description"),
                    created_at=datetime.fromisoformat(c["created_at"])
                )
                for c in self.complaints
            ]
            session.add_all(comp_objs)
            await session.flush()

            # 4. Seed Transactions
            txn_objs = [
                Transaction(
                    id=uuid.UUID(t["id"]),
                    txn_ref=t["txn_ref"],
                    sender_account_id=uuid.UUID(t["sender_account_id"]),
                    receiver_account_id=uuid.UUID(t["receiver_account_id"]),
                    amount=t["amount"],
                    timestamp=datetime.fromisoformat(t["timestamp"]),
                    channel=t["channel"],
                    is_flagged=t["is_flagged"],
                    hop_level=t["hop_level"],
                    ring_id=t["ring_id"],
                    created_at=datetime.fromisoformat(t["created_at"])
                )
                for t in self.transactions
            ]
            session.add_all(txn_objs)
            await session.commit()

        logger.info("✅ PostgreSQL tables successfully populated.")

    async def seed_neo4j(self):
        logger.info("Seeding Neo4j graph nodes and transaction relationships...")
        driver = get_neo4j_driver()

        async with driver.session() as session:
            # Clear old graph
            logger.info("Clearing old Neo4j graph...")
            await session.run("MATCH (n) DETACH DELETE n;")

            # 1. Batch create Account nodes
            logger.info(f"Creating {len(self.accounts)} (:Account) nodes in Neo4j...")
            account_batches = [
                {
                    "id": a["id"],
                    "account_number": a["account_number"],
                    "holder_name": a["holder_name"],
                    "bank_name": a["bank_name"],
                    "account_type": a["account_type"],
                    "risk_score": float(a["risk_score"]),
                    "account_age_days": int(a["account_age_days"]),
                    "is_mule": bool(a["is_mule_label"])
                }
                for a in self.accounts
            ]
            await session.run(
                """
                UNWIND $batch AS a
                CREATE (:Account {
                    id: a.id,
                    account_number: a.account_number,
                    holder_name: a.holder_name,
                    bank_name: a.bank_name,
                    account_type: a.account_type,
                    risk_score: a.risk_score,
                    account_age_days: a.account_age_days,
                    is_mule: a.is_mule
                })
                """,
                batch=account_batches
            )

            # 2. Batch create ATM nodes
            logger.info(f"Creating {len(self.atms)} (:ATM) nodes in Neo4j...")
            atm_batches = [
                {
                    "id": atm["id"],
                    "terminal_id": atm["terminal_id"],
                    "bank_name": atm["bank_name"],
                    "city": atm["city"],
                    "lat": float(atm["lat"]),
                    "lon": float(atm["lon"]),
                    "is_hotspot": bool(atm["is_hotspot"])
                }
                for atm in self.atms
            ]
            await session.run(
                """
                UNWIND $batch AS atm
                CREATE (:ATM {
                    id: atm.id,
                    terminal_id: atm.terminal_id,
                    bank_name: atm.bank_name,
                    city: atm.city,
                    lat: atm.lat,
                    lon: atm.lon,
                    is_hotspot: atm.is_hotspot
                })
                """,
                batch=atm_batches
            )

            # 3. Batch create [:TRANSFERRED] relationships
            logger.info(f"Creating {len(self.transactions)} [:TRANSFERRED] edges in Neo4j...")
            # Split transactions into normal transfers vs ATM cashouts
            transfer_txns = [t for t in self.transactions if t["channel"] != "ATM_WITHDRAWAL"]
            atm_txns = [t for t in self.transactions if t["channel"] == "ATM_WITHDRAWAL"]

            # Process in chunks of 500 for optimal Cypher throughput
            chunk_size = 500
            for i in range(0, len(transfer_txns), chunk_size):
                chunk = [
                    {
                        "txn_ref": t["txn_ref"],
                        "sender_id": t["sender_account_id"],
                        "receiver_id": t["receiver_account_id"],
                        "amount": float(t["amount"]),
                        "timestamp": t["timestamp"],
                        "channel": t["channel"],
                        "is_flagged": bool(t["is_flagged"]),
                        "hop_level": int(t["hop_level"]),
                        "ring_id": t["ring_id"] or ""
                    }
                    for t in transfer_txns[i:i + chunk_size]
                ]
                await session.run(
                    """
                    UNWIND $batch AS t
                    MATCH (s:Account {id: t.sender_id})
                    MATCH (r:Account {id: t.receiver_id})
                    CREATE (s)-[:TRANSFERRED {
                        txn_ref: t.txn_ref,
                        amount: t.amount,
                        timestamp: t.timestamp,
                        channel: t.channel,
                        is_flagged: t.is_flagged,
                        hop_level: t.hop_level,
                        ring_id: t.ring_id
                    }]->(r)
                    """,
                    batch=chunk
                )

            # 4. Batch create [:WITHDREW_AT] edges for ATM withdrawals
            if atm_txns:
                atm_chunk = [
                    {
                        "txn_ref": t["txn_ref"],
                        "sender_id": t["sender_account_id"],
                        "terminal_id": t.get("atm_terminal_id", ""),
                        "amount": float(t["amount"]),
                        "timestamp": t["timestamp"]
                    }
                    for t in atm_txns
                ]
                await session.run(
                    """
                    UNWIND $batch AS w
                    MATCH (s:Account {id: w.sender_id})
                    MATCH (atm:ATM {terminal_id: w.terminal_id})
                    CREATE (s)-[:WITHDREW_AT {
                        txn_ref: w.txn_ref,
                        amount: w.amount,
                        timestamp: w.timestamp
                    }]->(atm)
                    """,
                    batch=atm_chunk
                )

        logger.info("✅ Neo4j graph nodes and relationships seeded successfully.")


async def main():
    logger.info("==================================================")
    logger.info("🚀 Starting RakshaNet Synthetic Data Generation...")
    logger.info("==================================================")

    gen = SyntheticDataGenerator()
    gen.generate_accounts_and_atms()
    gen.generate_hero_fraud_rings()
    gen.generate_normal_transactions()
    gen.save_json_snapshots()

    await gen.seed_postgres()
    await gen.seed_neo4j()

    logger.info("==================================================")
    logger.info("🎉 SUCCESS: Synthetic Seeding Completed for Both DBs!")
    logger.info(f"📊 Summary:")
    logger.info(f"   • Accounts: {len(gen.accounts)}")
    logger.info(f"   • ATMs: {len(gen.atms)}")
    logger.info(f"   • Transactions: {len(gen.transactions)}")
    logger.info(f"   • Complaints: {len(gen.complaints)}")
    logger.info(f"   • Hero Rings Embedded: {len(gen.hero_rings)}")
    logger.info("==================================================")


if __name__ == "__main__":
    asyncio.run(main())
