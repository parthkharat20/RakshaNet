import logging
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select
from app.db.postgres import AsyncSessionLocal
from app.models import Complaint
from app.schemas.complaint import ComplaintCreate, ComplaintResponse
from app.services.ingestion import IngestionService

logger = logging.getLogger("complaints_api")
router = APIRouter(prefix="/complaints", tags=["NCRP Cyber Complaints"])


@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def ingest_complaint(data: ComplaintCreate):
    """
    Ingests an NCRP Cybercrime Complaint:
    - Associates victim and suspect bank accounts
    - Attaches PostGIS geospatial coordinates
    - Returns official acknowledgment number
    """
    try:
        return await IngestionService.ingest_complaint(data)
    except Exception as e:
        logger.error(f"Complaint ingestion failed: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=List[ComplaintResponse])
async def list_complaints(
    limit: int = Query(50, ge=1, le=100),
    category: Optional[str] = None
):
    """Lists latest NCRP complaints filed across jurisdictions."""
    async with AsyncSessionLocal() as session:
        query = select(Complaint)
        if category:
            query = query.where(Complaint.category.ilike(f"%{category}%"))
        query = query.order_by(Complaint.reported_time.desc()).limit(limit)
        results = (await session.execute(query)).scalars().all()

        return [
            ComplaintResponse(
                id=c.id,
                acknowledgement_no=c.acknowledgement_no,
                category=c.category,
                loss_amount=float(c.loss_amount),
                victim_account_id=c.victim_account_id,
                suspect_account_id=c.suspect_account_id,
                incident_time=c.incident_time,
                reported_time=c.reported_time,
                city=c.city,
                state=c.state,
                lat=None,
                lon=None,
                status=c.status,
                description=c.description,
                created_at=c.created_at
            )
            for c in results
        ]


@router.get("/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(complaint_id: str):
    """Retrieves full case dossier for a complaint by UUID or NCRP acknowledgment number."""
    async with AsyncSessionLocal() as session:
        if len(complaint_id) == 36:
            query = select(Complaint).where(Complaint.id == UUID(complaint_id))
        else:
            query = select(Complaint).where(Complaint.acknowledgement_no == complaint_id)

        c = (await session.execute(query)).scalar_one_or_none()
        if not c:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Complaint '{complaint_id}' not found.")

        return ComplaintResponse(
            id=c.id,
            acknowledgement_no=c.acknowledgement_no,
            category=c.category,
            loss_amount=float(c.loss_amount),
            victim_account_id=c.victim_account_id,
            suspect_account_id=c.suspect_account_id,
            incident_time=c.incident_time,
            reported_time=c.reported_time,
            city=c.city,
            state=c.state,
            lat=None,
            lon=None,
            status=c.status,
            description=c.description,
            created_at=c.created_at
        )
