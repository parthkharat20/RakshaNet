from typing import List, Dict, Any

# Top metro coordinates in India calibrated for ATM clusters
INDIAN_METROS = [
    {"city": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777, "zones": ["BKC Cluster", "Colaba High Street", "Andheri Hub", "Dadar Central"]},
    {"city": "Delhi", "state": "Delhi", "lat": 28.6139, "lon": 77.2090, "zones": ["Connaught Place", "Saket District Centre", "Nehru Place", "Rohini Sector 7"]},
    {"city": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946, "zones": ["Koramangala 5th Block", "Indiranagar 100ft Rd", "Whitefield IT Hub", "MG Road"]},
    {"city": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lon": 78.4867, "zones": ["Hitec City", "Gachibowli Outer", "Banjara Hills Rd 1", "Ameerpet Metro"]},
    {"city": "Pune", "state": "Maharashtra", "lat": 18.5204, "lon": 73.8567, "zones": ["Viman Nagar", "FC Road Commercial", "Hinjawadi Phase 1", "Kothrud Depot"]},
    {"city": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lon": 88.3639, "zones": ["Park Street", "Salt Lake Sector V", "New Town Action Area", "Howrah Station"]},
    {"city": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707, "zones": ["T Nagar Ranganathan St", "OMR IT Corridor", "Anna Nagar West", "Guindy Estate"]},
    {"city": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lon": 72.5714, "zones": ["SG Highway", "Navrangpura", "Prahlad Nagar", "Maninagar Crossing"]}
]

BANKS = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Punjab National Bank", "Bank of Baroda", "Axis Bank", "Canara Bank"]

def generate_synthetic_atms(count: int = 50) -> List[Dict[str, Any]]:
    """Generates realistic ATM coordinates with clustered cash-out risk."""
    import random
    atms = []
    atm_idx = 1
    for metro in INDIAN_METROS:
        per_city = count // len(INDIAN_METROS)
        for _ in range(per_city):
            zone = random.choice(metro["zones"])
            # Small spatial jitter around city center (0.01 to 0.05 degrees ~ 1 to 5 km)
            dlat = (random.random() - 0.5) * 0.08
            dlon = (random.random() - 0.5) * 0.08
            lat = metro["lat"] + dlat
            lon = metro["lon"] + dlon
            bank = random.choice(BANKS)
            code = f"ATM-{metro['city'][:3].upper()}-{atm_idx:03d}"

            # Assign 20% of ATMs as high-risk cash-out hotspots
            is_hotspot = random.random() < 0.20
            risk_score = round(random.uniform(70.0, 95.0), 1) if is_hotspot else round(random.uniform(10.0, 55.0), 1)
            tier = "CRITICAL" if risk_score >= 70.0 else ("MEDIUM" if risk_score >= 40.0 else "LOW")

            atms.append({
                "atm_code": code,
                "bank_name": bank,
                "city": metro["city"],
                "state": metro["state"],
                "zone": zone,
                "latitude": lat,
                "longitude": lon,
                "risk_score": risk_score,
                "risk_tier": tier,
                "is_hotspot": is_hotspot,
                "cluster_id": 1 if is_hotspot else -1
            })
            atm_idx += 1
    return atms
