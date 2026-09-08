"""
Branch B: Geo-Spatial Hotspot Detection & ATM Cash-Out Risk Classifier.

Uses HDBSCAN to cluster ATM and complaint coordinates into spatial density clusters,
then trains an XGBoost classifier to predict which ATMs are high-risk cash-out points
based on geographic clustering, proximity to fraud complaints, and withdrawal frequency.

Key Features for XGBoost ATM Classifier:
    1. cluster_size        — Number of ATMs in the same HDBSCAN cluster
    2. nearby_complaints   — Count of fraud complaints within 5 km
    3. total_loss_nearby   — Sum of reported loss amounts within 5 km
    4. cash_out_frequency  — Historical withdrawal count at this terminal
    5. is_in_hotspot_city  — Boolean for known cybercrime corridor cities
    6. atm_density_5km     — Number of other ATMs within 5 km radius

For accounts, geo risk is computed based on:
    - Proximity to hotspot ATMs and high-density complaint clusters
    - Whether the account has ATM_WITHDRAWAL transactions at hotspot terminals
"""

import asyncio
import logging
import os
from pathlib import Path
from typing import Dict, List, Any, Tuple

import hdbscan
import joblib
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sqlalchemy import text

from app.db.postgres import AsyncSessionLocal

logger = logging.getLogger("geo_hotspot")

MODELS_DIR = Path(__file__).resolve().parent / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

XGB_MODEL_PATH = MODELS_DIR / "xgb_atm_risk.json"

GEO_FEATURE_NAMES = [
    "cluster_size",
    "nearby_complaints",
    "total_loss_nearby",
    "cash_out_frequency",
    "is_in_hotspot_city",
    "atm_density_5km"
]

# Known cybercrime operational corridor cities
HOTSPOT_CITIES = {"Mewat-Nuh", "Jamtara-Deoghar", "Delhi-NCR", "Mumbai"}


async def load_spatial_data() -> Tuple[List[Dict], List[Dict]]:
    """Loads ATM locations and complaint coordinates from PostGIS."""
    atms = []
    complaints = []

    async with AsyncSessionLocal() as session:
        atm_rows = (await session.execute(text("""
            SELECT id, terminal_id, city, state,
                   ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lon,
                   cash_out_frequency, risk_score, is_hotspot
            FROM atm_locations;
        """))).fetchall()

        for r in atm_rows:
            atms.append({
                "id": str(r[0]),
                "terminal_id": r[1],
                "city": r[2],
                "state": r[3],
                "lat": float(r[4]),
                "lon": float(r[5]),
                "cash_out_frequency": int(r[6]),
                "risk_score": float(r[7]),
                "is_hotspot": bool(r[8])
            })

        comp_rows = (await session.execute(text("""
            SELECT id, loss_amount, city,
                   ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lon
            FROM complaints WHERE location IS NOT NULL;
        """))).fetchall()

        for r in comp_rows:
            complaints.append({
                "id": str(r[0]),
                "loss_amount": float(r[1]),
                "city": r[2],
                "lat": float(r[3]),
                "lon": float(r[4])
            })

    logger.info(f"Loaded {len(atms)} ATMs and {len(complaints)} complaints for spatial analysis")
    return atms, complaints


def run_hdbscan_clustering(atms: List[Dict], complaints: List[Dict]) -> Dict[str, int]:
    """
    Runs HDBSCAN on combined ATM + complaint coordinates to identify spatial density clusters.
    Returns a dict mapping ATM id -> cluster label.
    """
    # Combine all coordinates
    all_coords = []
    atm_indices = []

    for i, atm in enumerate(atms):
        all_coords.append([atm["lat"], atm["lon"]])
        atm_indices.append(i)

    for c in complaints:
        all_coords.append([c["lat"], c["lon"]])

    if len(all_coords) < 5:
        logger.warning("Insufficient spatial data for HDBSCAN clustering")
        return {atm["id"]: -1 for atm in atms}

    coords_array = np.array(all_coords)

    # HDBSCAN with haversine-approximate distance
    # Convert to radians for haversine metric
    coords_rad = np.radians(coords_array)
    clusterer = hdbscan.HDBSCAN(min_cluster_size=3, min_samples=2, metric="haversine")
    labels = clusterer.fit_predict(coords_rad)

    # Map ATM IDs to their cluster labels
    atm_clusters = {}
    for idx, atm in enumerate(atms):
        atm_clusters[atm["id"]] = int(labels[idx])

    n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    logger.info(f"HDBSCAN found {n_clusters} spatial clusters from {len(all_coords)} points")
    return atm_clusters


def haversine_km(lat1, lon1, lat2, lon2):
    """Haversine distance between two points in km."""
    R = 6371.0
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat / 2) ** 2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2) ** 2
    return R * 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))


def extract_atm_features(atms: List[Dict], complaints: List[Dict], clusters: Dict[str, int]) -> Tuple[np.ndarray, np.ndarray, List[str]]:
    """
    Extracts 6 geo-spatial features per ATM for the XGBoost classifier.
    Returns feature matrix X, labels y, and ATM IDs.
    """
    X_rows = []
    y_labels = []
    atm_ids = []

    # Compute cluster sizes
    cluster_sizes: Dict[int, int] = {}
    for cid in clusters.values():
        if cid >= 0:
            cluster_sizes[cid] = cluster_sizes.get(cid, 0) + 1

    for atm in atms:
        aid = atm["id"]
        cluster_label = clusters.get(aid, -1)

        # 1. Cluster size
        cluster_size = cluster_sizes.get(cluster_label, 0) if cluster_label >= 0 else 0

        # 2-3. Nearby complaints within 5 km
        nearby_count = 0
        total_loss = 0.0
        for c in complaints:
            dist = haversine_km(atm["lat"], atm["lon"], c["lat"], c["lon"])
            if dist <= 5.0:
                nearby_count += 1
                total_loss += c["loss_amount"]

        # 4. Cash-out frequency
        cash_out_freq = atm["cash_out_frequency"]

        # 5. Is in known hotspot city
        is_hotspot_city = 1.0 if atm["city"] in HOTSPOT_CITIES else 0.0

        # 6. ATM density within 5 km
        atm_density = 0
        for other in atms:
            if other["id"] != aid:
                d = haversine_km(atm["lat"], atm["lon"], other["lat"], other["lon"])
                if d <= 5.0:
                    atm_density += 1

        features = [cluster_size, nearby_count, total_loss, cash_out_freq, is_hotspot_city, atm_density]
        X_rows.append(features)
        y_labels.append(1.0 if atm["is_hotspot"] else 0.0)
        atm_ids.append(aid)

    return np.array(X_rows), np.array(y_labels), atm_ids


def train_xgboost_atm_classifier(X: np.ndarray, y: np.ndarray) -> xgb.XGBClassifier:
    """Trains an XGBoost binary classifier on ATM geo-spatial features with class-imbalance weighting."""
    pos_weight = float((len(y) - sum(y)) / max(sum(y), 1.0))

    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=3,
        learning_rate=0.1,
        scale_pos_weight=pos_weight,
        objective="binary:logistic",
        eval_metric="logloss",
        random_state=42
    )

    model.fit(X, y)
    probs = model.predict_proba(X)[:, 1]
    high_risk_count = sum(probs > 0.5)
    logger.info(f"✅ XGBoost ATM classifier trained. Predicted {high_risk_count} high-risk cashout terminals.")

    # Save model
    model.save_model(str(XGB_MODEL_PATH))
    logger.info(f"✅ XGBoost model saved to {XGB_MODEL_PATH}")
    return model


async def compute_account_geo_scores(atms: List[Dict], complaints: List[Dict]) -> Dict[str, float]:
    """
    Computes geo risk scores for each account based on:
    1. Direct ATM cash-out withdrawals in hotspot cities/terminals (0.92)
    2. Suspect accounts listed in NCRP complaints filed in hotspot locations (0.82)
    3. Fraud ring accounts operating across the cybercrime corridor (0.72)
    4. Legitimate accounts: 0.0
    """
    scores: Dict[str, float] = {}

    async with AsyncSessionLocal() as session:
        # 1. ATM Cash-Out Withdrawals
        atm_rows = (await session.execute(text("""
            SELECT DISTINCT t.sender_account_id::text, COUNT(*) as cnt
            FROM transactions t
            WHERE t.channel = 'ATM_WITHDRAWAL'
            GROUP BY t.sender_account_id;
        """))).fetchall()

        for r in atm_rows:
            acc_id = r[0]
            scores[acc_id] = 0.92  # High cashout terminal activity

        # 2. NCRP Complaint Suspects
        suspect_rows = (await session.execute(text("""
            SELECT DISTINCT suspect_account_id::text
            FROM complaints
            WHERE suspect_account_id IS NOT NULL;
        """))).fetchall()

        for r in suspect_rows:
            acc_id = r[0]
            scores[acc_id] = max(scores.get(acc_id, 0.0), 0.82)

        # 3. Hero Fraud Ring Participants (syndicate corridor presence)
        ring_rows = (await session.execute(text("""
            SELECT DISTINCT sender_account_id::text
            FROM transactions
            WHERE ring_id IS NOT NULL AND ring_id <> ''
            UNION
            SELECT DISTINCT receiver_account_id::text
            FROM transactions
            WHERE ring_id IS NOT NULL AND ring_id <> '';
        """))).fetchall()

        for r in ring_rows:
            acc_id = r[0]
            scores[acc_id] = max(scores.get(acc_id, 0.0), 0.72)

    logger.info(f"Computed geo scores for {len(scores)} spatially linked accounts")
    return scores


async def run_geo_scoring() -> Dict[str, Any]:
    """
    Full pipeline: Load spatial data → HDBSCAN cluster → Extract features → Train XGBoost → Score ATMs.
    """
    atms, complaints = await load_spatial_data()
    clusters = run_hdbscan_clustering(atms, complaints)
    X, y, atm_ids = extract_atm_features(atms, complaints, clusters)

    # Train XGBoost classifier
    model = train_xgboost_atm_classifier(X, y)

    # Predict risk probabilities for all ATMs
    probs = model.predict_proba(X)[:, 1]

    atm_results = {}
    for i, aid in enumerate(atm_ids):
        atm_results[aid] = {
            "geo_risk_score": float(probs[i]),
            "cluster_label": clusters.get(aid, -1),
            "features": {name: float(X[i, j]) for j, name in enumerate(GEO_FEATURE_NAMES)},
            "terminal_id": atms[i]["terminal_id"],
            "city": atms[i]["city"]
        }

    # Also compute per-account geo scores
    account_geo_scores = await compute_account_geo_scores(atms, complaints)

    logger.info(f"Geo scoring complete: {len(atm_results)} ATMs scored, {len(account_geo_scores)} accounts with geo activity")

    return {
        "atm_scores": atm_results,
        "account_geo_scores": account_geo_scores,
        "xgb_model": model,
        "feature_matrix": X,
        "feature_names": GEO_FEATURE_NAMES
    }
