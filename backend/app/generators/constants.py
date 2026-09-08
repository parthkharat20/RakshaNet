"""Hand-supplied reference data calibrated to Indian banking standards and NCRP statistics."""

# Real Indian Cities with coordinates and metro weightings for realistic clustering
INDIAN_CITIES = [
    {"city": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777, "weight": 0.18},
    {"city": "Delhi-NCR", "state": "Delhi", "lat": 28.6139, "lon": 77.2090, "weight": 0.18},
    {"city": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946, "weight": 0.14},
    {"city": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lon": 78.4867, "weight": 0.10},
    {"city": "Pune", "state": "Maharashtra", "lat": 18.5204, "lon": 73.8567, "weight": 0.08},
    {"city": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lon": 88.3639, "weight": 0.06},
    {"city": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lon": 72.5714, "weight": 0.05},
    {"city": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707, "weight": 0.05},
    {"city": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lon": 75.7873, "weight": 0.04},
    {"city": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462, "weight": 0.03},
    {"city": "Surat", "state": "Gujarat", "lat": 21.1702, "lon": 72.8311, "weight": 0.02},
    {"city": "Indore", "state": "Madhya Pradesh", "lat": 22.7196, "lon": 75.8577, "weight": 0.02},
    {"city": "Patna", "state": "Bihar", "lat": 25.5941, "lon": 85.1376, "weight": 0.01},
    {"city": "Chandigarh", "state": "Punjab", "lat": 30.7333, "lon": 76.7794, "weight": 0.01},
    {"city": "Bhubaneswar", "state": "Odisha", "lat": 20.2961, "lon": 85.8245, "weight": 0.01},
    # Known cybercrime corridor operational hubs
    {"city": "Mewat-Nuh", "state": "Haryana", "lat": 28.1062, "lon": 77.0125, "weight": 0.01},
    {"city": "Jamtara-Deoghar", "state": "Jharkhand", "lat": 23.9587, "lon": 86.8016, "weight": 0.01}
]

# Real Indian Banks with valid 4-letter IFSC prefixes and UPI handles
INDIAN_BANKS = [
    {"name": "State Bank of India", "code": "SBIN", "upi_handles": ["@oksbi", "@sbi"]},
    {"name": "HDFC Bank", "code": "HDFC", "upi_handles": ["@okhdfcbank", "@hdfcbank"]},
    {"name": "ICICI Bank", "code": "ICIC", "upi_handles": ["@okicici", "@icici"]},
    {"name": "Axis Bank", "code": "UTIB", "upi_handles": ["@okaxis", "@axisbank"]},
    {"name": "Punjab National Bank", "code": "PUNB", "upi_handles": ["@pnb"]},
    {"name": "Bank of Baroda", "code": "BARB", "upi_handles": ["@barodampay"]},
    {"name": "Kotak Mahindra Bank", "code": "KKBK", "upi_handles": ["@kotak"]},
    {"name": "Yes Bank", "code": "YESB", "upi_handles": ["@yesbank"]},
    {"name": "Canara Bank", "code": "CNRB", "upi_handles": ["@cnrb"]},
    {"name": "Union Bank of India", "code": "UBIN", "upi_handles": ["@unionbank"]}
]

# Official NCRP-aligned fraud categories with calibrated financial loss parameters
NCRP_FRAUD_CATEGORIES = [
    {
        "category": "Digital Arrest Scam",
        "description": "Scammers impersonating CBI/ED/Police via Skype threatening immediate arrest over fake parcel containing narcotics or money laundering.",
        "min_loss": 150000,
        "max_loss": 1500000,
        "mode_loss": 350000,
        "weight": 0.15
    },
    {
        "category": "UPI QR Code / Payment Request Fraud",
        "description": "Phishing via fake OLX buyer QR code or misleading Google Pay collect requests.",
        "min_loss": 5000,
        "max_loss": 75000,
        "mode_loss": 25000,
        "weight": 0.35
    },
    {
        "category": "Investment / Stock Trading Scam",
        "description": "Fake institutional WhatsApp trading groups offering VIP pre-IPO allocations and bogus high-yield crypto platforms.",
        "min_loss": 50000,
        "max_loss": 800000,
        "mode_loss": 180000,
        "weight": 0.25
    },
    {
        "category": "Part-Time Task / Telegram Job Scam",
        "description": "Luring victims with paid YouTube likes, Google reviews, or travel booking ratings, escalating to prepaid investment tasks.",
        "min_loss": 10000,
        "max_loss": 120000,
        "mode_loss": 45000,
        "weight": 0.12
    },
    {
        "category": "Romance / Sextortion Scam",
        "description": "Video call recording followed by immediate extortion threatening video release to social media contacts.",
        "min_loss": 20000,
        "max_loss": 150000,
        "mode_loss": 40000,
        "weight": 0.08
    },
    {
        "category": "Phishing / Bank KYC Expiry Scam",
        "description": "SMS panic baiting regarding imminent account suspension or SIM card deactivation containing fraudulent APK links.",
        "min_loss": 15000,
        "max_loss": 100000,
        "mode_loss": 35000,
        "weight": 0.05
    }
]
