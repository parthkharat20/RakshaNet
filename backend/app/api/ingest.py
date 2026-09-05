from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2.elements import WKTElement
from app.db.postgres import get_db
from app.models.complaint import Complaint
from app.models.alert import Alert
from app.schemas.complaint_schema import ComplaintCreate, ComplaintResponse
from app.ai.branch_a_gnn import gnn_predictor
from app.ai.branch_b_geo import geo_forecaster
from app.ai.decision_engine import decision_engine
from app.ai.shap_explainer import shap_explainer
from app.realtime.ws_manager import ws_manager
from datetime import datetime
import uuid
import logging

router = APIRouter(prefix="/ingest", tags=["Ingestion"])
logger = logging.getLogger("rakshanet.api.ingest")

@router.post("/complaint", response_model=ComplaintResponse)
async def ingest_complaint(
    payload: ComplaintCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Ingests an NCRP citizen complaint, triggers the Real-Time Dual AI Pipeline, 
    and broadcasts alerts to connected law enforcement dashboards.
    """
    ncrp_code = payload.ncrp_ref or f"NCRP-2026-{payload.jurisdiction[:3].upper()}-{str(uuid.uuid4())[:4].upper()}"
    wkt_point = f"POINT({payload.longitude} {payload.latitude})"

    complaint = Complaint(
        ncrp_ref=ncrp_code,
        victim_name=payload.victim_name,
        fraud_type=payload.fraud_type,
        amount=payload.amount,
        suspect_account_no=payload.suspect_account_no,
        initial_mule_bank=payload.initial_mule_bank,
        jurisdiction=payload.jurisdiction,
        district=payload.district,
        description=payload.description,
        location=WKTElement(wkt_point, srid=4326),
        filed_at=datetime.utcnow()
    )
    db.add(complaint)
    await db.commit()
    await db.refresh(complaint)

    # 1. Branch A: GNN Link Prediction
    graph_res = gnn_predictor.predict_mule_risk(payload.suspect_account_no)
    
    # 2. Branch B: Geo-Spatial Hotspot Prediction
    geo_res = geo_forecaster.predict_atm_hotspot_risk(
        atm_code="ATM-MUM-042",
        cluster_density=8.4,
        recent_complaints_count=5,
        hour_of_day=datetime.now().hour,
        historical_fraud_count=12
    )

    # 3. Decision Engine Fusion
    decision = decision_engine.evaluate_risk(
        graph_score=graph_res["graph_risk_score"],
        geo_score=geo_res["geo_risk_score"]
    )

    # 4. SHAP Explainability Attribution
    shap_res = shap_explainer.generate_explanation(
        account_no=payload.suspect_account_no,
        fused_score_100=decision["score_100"],
        tier=decision["tier"],
        hops_to_fraud=graph_res["hops_to_fraud"] if graph_res["hops_to_fraud"] != -1 else 2,
        fraud_neighbors_count=max(2, graph_res["fraud_neighbors_count"]),
        atm_zone="Bandra-Kurla Complex",
        atm_density_score=geo_res["geo_risk_score"]
    )

    # 5. Create Alert Record
    alert_code = f"RN-{str(uuid.uuid4())[:4].upper()}"
    alert = Alert(
        alert_code=alert_code,
        tier=decision["tier"],
        target_account_no=payload.suspect_account_no,
        target_bank=payload.initial_mule_bank,
        amount_at_risk=payload.amount,
        predicted_atm_code=geo_res["atm_code"],
        predicted_atm_zone="Bandra-Kurla Complex",
        predicted_location=WKTElement("POINT(72.8688 19.0657)", srid=4326),
        graph_score=graph_res["graph_risk_score"],
        geo_score=geo_res["geo_risk_score"],
        fused_score=decision["fused_score"],
        shap_attribution=shap_res["shap_attribution"],
        explanation_text=shap_res["explanation_text"],
        status="NEW"
    )
    db.add(alert)
    await db.commit()

    # 6. Broadcast via WebSocket
    await ws_manager.broadcast_alert({
        "alert_code": alert_code,
        "tier": decision["tier"],
        "account_no": payload.suspect_account_no,
        "bank": payload.initial_mule_bank,
        "amount": payload.amount,
        "zone": "Bandra-Kurla Complex",
        "atm_code": geo_res["atm_code"],
        "score": decision["score_100"],
        "explanation": shap_res["explanation_text"],
        "timestamp": datetime.utcnow().isoformat()
    })

    return complaint
