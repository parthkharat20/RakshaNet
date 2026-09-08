from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class GraphNode(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    label: str
    role: str  # VICTIM, MULE_HUB, MULE_NODE, CLEAN, ATM
    account_number: Optional[str] = None
    holder_name: Optional[str] = None
    bank_name: Optional[str] = None
    risk_score: float = 0.0
    is_frozen: bool = False
    account_age_days: int = 0
    is_mule: bool = False


class GraphLink(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    source: str
    target: str
    amount: float
    channel: str = "UPI"
    timestamp: str
    hop_level: int = 0
    is_flagged: bool = False
    ring_id: Optional[str] = None


class GraphResponse(BaseModel):
    root_id: str
    max_hops: int
    total_nodes: int
    total_links: int
    nodes: List[GraphNode]
    links: List[GraphLink]
