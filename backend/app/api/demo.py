"""
Demo API Router: Live Attack Scenario Simulation for Hackathon Demonstrations.
Exposes endpoints to list curated scenarios and trigger live end-to-end incident injections.
"""
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.auth import get_current_officer
from app.services.simulation_service import SimulationService

logger = logging.getLogger("demo_api")
router = APIRouter(prefix="/demo", tags=["SIH Live Demonstration Engine"])


class ScenarioInfo(BaseModel):
    id: str
    title: str
    category: str
    scam_type: str
    city: str
    state: str
    lat: float
    lon: float
    loss_amount: float
    victim_name: str
    suspect_holder: str
    suspect_bank: str
    target_atm_cluster: str
    narrative: str
    hop_count: int


class SimulateAttackRequest(BaseModel):
    scenario_id: str = Field(..., description="ID of the curated scenario (e.g. mumbai_upi_qr, delhi_digital_arrest, bengaluru_task_scam)")


@router.get("/scenarios", response_model=List[ScenarioInfo])
async def list_demo_scenarios():
    """Returns metadata for all available curated cyber fraud attack scenarios."""
    return SimulationService.get_available_scenarios()


@router.post("/simulate-attack")
async def trigger_live_attack_simulation(
    payload: SimulateAttackRequest,
    officer: dict = Depends(get_current_officer)
):
    """
    Injects a live cyber scam attack scenario into the RakshaNet network in real-time.
    1. Creates realistic citizen NCRP complaint in PostgreSQL.
    2. Synthesizes multi-hop transfer hops in Neo4j graph.
    3. Executes GraphSAGE inductive link prediction + PostGIS ATM clustering.
    4. Broadcasts WebSocket events to update all active Command Centers.
    
    Requires Law Enforcement JWT authorization.
    """
    try:
        result = await SimulationService.simulate_attack(
            scenario_id=payload.scenario_id,
            officer_badge_id=officer["badge_id"]
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to execute attack simulation '{payload.scenario_id}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Simulation failed during execution: {str(e)}"
        )
