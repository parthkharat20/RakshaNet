from app.config import settings
from typing import Dict, Any

class IntelligentDecisionEngine:
    """
    Combines Dual AI Engines:
    Risk = w_graph * Score_graph + w_geo * Score_geo
    Baseline: w_graph = 0.6, w_geo = 0.4
    Tiers:
      0-39: Low Risk - Monitor
      40-69: Medium Risk - Review
      70-100: High/Critical Risk - Alert and Act
    """
    def __init__(self, w_graph: float = 0.6, w_geo: float = 0.4):
        self.w_graph = w_graph
        self.w_geo = w_geo

    def evaluate_risk(self, graph_score: float, geo_score: float) -> Dict[str, Any]:
        fused = (self.w_graph * graph_score) + (self.w_geo * geo_score)
        fused_100 = round(fused * 100, 1)

        if fused_100 >= 70.0:
            tier = "CRITICAL"
            action_code = "IMMEDIATE_FREEZE_DISPATCH"
        elif fused_100 >= 40.0:
            tier = "MEDIUM"
            action_code = "MANUAL_INVESTIGATION"
        else:
            tier = "LOW"
            action_code = "MONITOR_FLOW"

        return {
            "fused_score": round(fused, 3),
            "score_100": fused_100,
            "tier": tier,
            "action_code": action_code,
            "w_graph": self.w_graph,
            "w_geo": self.w_geo
        }

decision_engine = IntelligentDecisionEngine(
    w_graph=settings.GRAPH_WEIGHT,
    w_geo=settings.GEO_WEIGHT
)
