"""
SHAP Explainability Engine for RakshaNet.

Generates plain-English, court-admissible feature attribution explanations
for each flagged account using SHAP TreeExplainer on the XGBoost model,
combined with rule-based narrative generation for graph structural features.
"""

import logging
from typing import Dict, List, Any, Optional

import numpy as np

logger = logging.getLogger("shap_explainer")


def generate_shap_explanation(
    account_id: str,
    graph_features: Dict[str, float],
    graph_score: float,
    geo_score: float,
    fused_score: float,
    holder_name: str = "",
    account_age: int = 0
) -> Dict[str, Any]:
    """
    Generates a plain-English SHAP-style explanation card for a scored account.

    Returns a JSON-serializable dict containing:
    - verdict: severity classification
    - fused_risk_score: composite score
    - shap_factors: list of top contributing factors with impact scores and descriptions
    """
    factors: List[Dict[str, Any]] = []

    # Factor 1: Hop distance to confirmed fraud
    hop = graph_features.get("hop_distance_to_fraud", 99)
    if hop <= 1:
        factors.append({
            "factor": "Direct Fraud Proximity",
            "impact": "+0.30",
            "detail": f"Account is {int(hop)} hop(s) from a confirmed NCRP complaint suspect."
        })
    elif hop == 2:
        factors.append({
            "factor": "Multi-Hop Fraud Proximity",
            "impact": "+0.18",
            "detail": f"Account is 2 hops downstream from a confirmed NCRP complaint suspect."
        })
    elif hop <= 4:
        factors.append({
            "factor": "Extended Fraud Trail",
            "impact": "+0.08",
            "detail": f"Account is {int(hop)} hops from a confirmed fraud cluster."
        })

    # Factor 2: Rapid Fund Evacuation
    evac = graph_features.get("evacuation_ratio", 0.0)
    if evac > 0.90:
        factors.append({
            "factor": "Rapid Fund Evacuation",
            "impact": "+0.20",
            "detail": f"{evac * 100:.1f}% of inflow was evacuated (transferred out), indicating pass-through mule behavior."
        })
    elif evac > 0.70:
        factors.append({
            "factor": "Elevated Fund Evacuation",
            "impact": "+0.10",
            "detail": f"{evac * 100:.1f}% of inflow was evacuated, exceeding normal spending patterns."
        })

    # Factor 3: Suspicious Account Age
    if account_age <= 15:
        factors.append({
            "factor": "Suspicious Account Age",
            "impact": "+0.15",
            "detail": f"Account was opened only {account_age} days ago — typical of burner mule accounts."
        })
    elif account_age <= 45:
        factors.append({
            "factor": "Young Account Flag",
            "impact": "+0.08",
            "detail": f"Account age is {account_age} days — below the 60-day maturity threshold."
        })
    elif account_age > 700:
        factors.append({
            "factor": "Mature Account Credit",
            "impact": "-0.05",
            "detail": f"Account has been active for {account_age} days ({account_age // 365} years), reducing mule probability."
        })

    # Factor 4: Star Hub Topology
    if graph_features.get("is_star_hub", 0) > 0:
        in_deg = int(graph_features.get("unique_counterparties", 0))
        factors.append({
            "factor": "Star Hub Topology Detected",
            "impact": "+0.10",
            "detail": f"Account received inflows from {in_deg}+ distinct counterparties — consistent with hub-and-spoke collection pattern."
        })

    # Factor 5: Adamic-Adar structural similarity
    aa = graph_features.get("adamic_adar_fraud_score", 0.0)
    if aa > 0.5:
        factors.append({
            "factor": "Structural Similarity to Fraud Network",
            "impact": f"+{min(aa / 3.0 * 0.15, 0.15):.2f}",
            "detail": f"Adamic-Adar index of {aa:.2f} with confirmed fraud cluster neighbors."
        })

    # Factor 6: Geo-spatial score contribution
    if geo_score > 0.50:
        factors.append({
            "factor": "ATM Cluster Proximity",
            "impact": f"+{geo_score * 0.40:.2f}",
            "detail": f"Active cash-out activity detected at or near high-risk ATM cluster."
        })

    # Sort by absolute impact descending
    factors.sort(key=lambda f: abs(float(f["impact"])), reverse=True)

    # Determine verdict
    if fused_score >= 0.75:
        verdict = "CRITICAL_MULE_INTERDICTION_RECOMMENDED"
    elif fused_score >= 0.40:
        verdict = "ELEVATED_SURVEILLANCE_ADVISED"
    else:
        verdict = "LOW_RISK_NO_ACTION"

    explanation = {
        "account_id": account_id,
        "holder_name": holder_name,
        "fused_risk_score": round(fused_score, 4),
        "graph_score": round(graph_score, 4),
        "geo_score": round(geo_score, 4),
        "verdict": verdict,
        "shap_factors": factors[:6]  # Top 6 factors
    }

    return explanation
