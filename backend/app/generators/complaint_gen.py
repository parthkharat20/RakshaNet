import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.generators.atm_gen import INDIAN_METROS, BANKS

FRAUD_TYPES = [
    ("digital_arrest", 0.30),
    ("investment_scam", 0.35),
    ("phishing", 0.20),
    ("job_fraud", 0.15)
]

def generate_synthetic_complaints(count: int = 100) -> List[Dict[str, Any]]:
    """Generates synthetic NCRP complaints calibrated to public crime patterns."""
    complaints = []
    base_time = datetime.utcnow()

    for i in range(1, count + 1):
        metro = random.choice(INDIAN_METROS)
        fraud_type = random.choices(
            [ft[0] for ft in FRAUD_TYPES],
            weights=[ft[1] for ft in FRAUD_TYPES]
        )[0]

        if fraud_type == "digital_arrest":
            amount = round(random.uniform(40000, 250000), 2)
        elif fraud_type == "investment_scam":
            amount = round(random.uniform(75000, 500000), 2)
        else:
            amount = round(random.uniform(15000, 85000), 2)

        dlat = (random.random() - 0.5) * 0.05
        dlon = (random.random() - 0.5) * 0.05
        time_offset_hours = random.randint(1, 48)

        complaints.append({
            "ncrp_ref": f"NCRP-2026-{metro['city'][:3].upper()}-{i:04d}",
            "victim_name": f"Citizen {i:04d}",
            "fraud_type": fraud_type,
            "amount": amount,
            "suspect_account_no": f"{random.randint(100000000000, 999999999999)}",
            "initial_mule_bank": random.choice(BANKS),
            "jurisdiction": metro["state"],
            "district": metro["city"],
            "latitude": metro["lat"] + dlat,
            "longitude": metro["lon"] + dlon,
            "filed_at": base_time - timedelta(hours=time_offset_hours),
            "description": f"Victim reported {fraud_type.replace('_', ' ')} incident resulting in unauthorized debit of ₹{amount:,.2f}."
        })
    return complaints
