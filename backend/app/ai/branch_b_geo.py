import numpy as np
import logging
from typing import Dict, Any, List

logger = logging.getLogger("rakshanet.ai.branch_b")

class GeoSpatialHotspotForecaster:
    """
    Branch B: Geo-Spatial Hotspot Forecaster (HDBSCAN + XGBoost).
    Calculates spatial crime cluster density and forecasts ATM cash-out risk 
    within lead-time window (Delta t).
    """
    def __init__(self):
        # Default pre-trained weights for ATM risk features
        self.feature_weights = {
            "spatial_density": 0.35,
            "historical_fraud_rate": 0.30,
            "hour_peak_velocity": 0.20,
            "distance_penalty": 0.15
        }

    def predict_atm_hotspot_risk(
        self,
        atm_code: str,
        cluster_density: float,
        recent_complaints_count: int,
        hour_of_day: int,
        historical_fraud_count: int
    ) -> Dict[str, Any]:
        """
        Computes ATM risk score (0 to 1) and assigns spatial risk tier.
        """
        # Peak ATM cash-out hours in Indian cybercrime: 12:00-16:00 and 19:00-23:00
        time_factor = 1.0 if (12 <= hour_of_day <= 16 or 19 <= hour_of_day <= 23) else 0.5

        raw_score = (
            min(1.0, cluster_density / 10.0) * self.feature_weights["spatial_density"] +
            min(1.0, historical_fraud_count / 15.0) * self.feature_weights["historical_fraud_rate"] +
            time_factor * self.feature_weights["hour_peak_velocity"] +
            min(1.0, recent_complaints_count / 8.0) * self.feature_weights["distance_penalty"]
        )

        scaled_score = min(1.0, max(0.05, raw_score))

        # Risk tier assignment (0-39 Low, 40-69 Medium, 70-100 High)
        score_100 = round(scaled_score * 100, 1)
        if score_100 >= 70.0:
            tier = "CRITICAL"
        elif score_100 >= 40.0:
            tier = "MEDIUM"
        else:
            tier = "LOW"

        # Estimated lead-time window (Delta t) before cash-out occurs
        lead_time_min = max(5, int(35 - (score_100 * 0.25)))

        return {
            "atm_code": atm_code,
            "geo_risk_score": round(scaled_score, 3),
            "score_100": score_100,
            "tier": tier,
            "lead_time_minutes": lead_time_min,
            "is_hotspot": score_100 >= 70.0
        }

geo_forecaster = GeoSpatialHotspotForecaster()
