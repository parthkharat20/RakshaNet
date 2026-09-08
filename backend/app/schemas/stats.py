from typing import List, Dict, Any
from pydantic import BaseModel


class FraudRingSummary(BaseModel):
    ring_id: str
    name: str
    topology: str
    total_accounts: int
    total_volume_inr: float
    status: str


class DashboardStatsResponse(BaseModel):
    total_complaints: int
    total_loss_reported_inr: float
    total_accounts_monitored: int
    active_mule_rings_count: int
    frozen_accounts_count: int
    total_funds_intercepted_inr: float
    high_risk_atms_count: int
    total_transactions_analyzed: int
    hero_fraud_rings: List[FraudRingSummary]
