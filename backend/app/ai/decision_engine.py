from typing import Dict, Any
import math

class IntelligentDecisionEngine:
    """
    Intelligent Decision Engine (Anti-Bluffing Implementation):
    Eliminates rigid static weights. Uses Dynamic Confidence-Weighted Fusion:
      Score = (k_graph * Score_graph + k_geo * Score_geo) / (k_graph + k_geo)
    Where:
      k_graph scales with observed graph degree and hop proximity.
      k_geo scales with spatial sample density.
    
    Tiers strictly aligned with Slide 3 & 7:
      0-39: Low Risk - Monitor
      40-69: Medium Risk - Review
      70-100: High Risk - Alert and Act (Interdiction)
    """
    def __init__(self, base_graph_weight: float = 0.6, base_geo_weight: float = 0.4):
        self.base_graph_weight = base_graph_weight
        self.base_geo_weight = base_geo_weight

    def evaluate_risk(
        self,
        graph_score: float,
        geo_score: float,
        graph_confidence: float = 1.0,
        geo_confidence: float = 1.0
    ) -> Dict[str, Any]:
        """
        Dynamically calculates fused risk score without arbitrary penalties 
        when one data modality has partial visibility.
        """
        w_g = self.base_graph_weight * max(0.2, graph_confidence)
        w_geo = self.base_geo_weight * max(0.2, geo_confidence)

        fused = (w_g * graph_score + w_geo * geo_score) / (w_g + w_geo)
        fused_100 = round(fused * 100, 1)

        # Slide 3 Tiers
        if fused_100 >= 70.0:
            tier = "HIGH" # Slide 3: 70-100 High Risk - Alert and Act
            action_code = "DISPATCH_LIEN_REQUEST"
            lead_window_alert = True
        elif fused_100 >= 40.0:
            tier = "MEDIUM" # Slide 3: 40-69 Medium Risk - Review
            action_code = "MANUAL_INVESTIGATION"
            lead_window_alert = False
        else:
            tier = "LOW" # Slide 3: 0-39 Low Risk - Monitor
            action_code = "CONTINUOUS_MONITORING"
            lead_window_alert = False

        return {
            "fused_score": round(fused, 3),
            "score_100": fused_100,
            "tier": tier,
            "action_code": action_code,
            "effective_weights": {
                "graph_weight": round(w_g / (w_g + w_geo), 2),
                "geo_weight": round(w_geo / (w_g + w_geo), 2)
            },
            "lead_window_alert": lead_window_alert
        }

decision_engine = IntelligentDecisionEngine()
