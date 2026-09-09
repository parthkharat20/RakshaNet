"""
Restitution API: Section 457 Cr.P.C. / Section 503 BNSS Magisterial Restitution Engine Router.
Enables cybercrime officers to draft court release petitions, execute reverse bank settlements,
and provides public transparency for citizens tracking recovery of defrauded funds.
"""

import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status as http_status

from app.schemas.restitution import (
    RestitutionDraftRequest,
    RestitutionExecuteRequest,
    RestitutionResponse,
    VictimTrackResponse
)
from app.services.restitution_service import RestitutionService
from app.api.auth import get_current_officer

logger = logging.getLogger("restitution_api")
router = APIRouter(prefix="/restitution", tags=["Citizen Restitution & Victim Recovery (Sec 457)"])


@router.get("", response_model=List[RestitutionResponse])
async def list_restitutions(
    officer: dict = Depends(get_current_officer)
):
    """
    Returns all restitution orders and execution records.
    Requires officer authentication.
    """
    try:
        return await RestitutionService.list_restitutions()
    except Exception as e:
        logger.error(f"Failed to list restitution orders: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve restitution orders."
        )


@router.post("/draft", response_model=RestitutionResponse)
async def draft_court_order(
    req: RestitutionDraftRequest,
    officer: dict = Depends(get_current_officer)
):
    """
    Drafts an official Section 457 Cr.P.C. / Section 503 BNSS petition for the
    Chief Judicial Magistrate / Chief Metropolitan Magistrate court to authorize
    the debit of frozen funds and restitution to the victim's verified bank account.
    """
    try:
        return await RestitutionService.draft_court_order(req, officer=officer)
    except Exception as e:
        logger.error(f"Failed to draft Section 457 court petition: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to draft restitution petition."
        )


@router.post("/{restitution_id}/execute", response_model=RestitutionResponse)
async def execute_restitution(
    restitution_id: str,
    req: RestitutionExecuteRequest,
    request: Request,
    officer: dict = Depends(get_current_officer)
):
    """
    Executes a Magisterial-approved reverse bank settlement:
    Debits the indicted mule account under bank lien and credits back the victim's verified account.
    Logs an immutable cryptographic SHA-256 audit entry.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    try:
        return await RestitutionService.execute_restitution(
            restitution_id=restitution_id,
            req=req,
            officer=officer,
            client_ip=client_ip
        )
    except ValueError as e:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to execute restitution for {restitution_id}: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to execute bank reverse settlement."
        )


@router.get("/track/{acknowledgement_no}", response_model=VictimTrackResponse)
async def track_victim_complaint(acknowledgement_no: str):
    """
    Public citizen transparency endpoint:
    Allows victims to track the recovery progress of their reported cyber fraud
    across 4 transparent milestones (NCRP Ingested -> Mule Halted -> Lien Secured -> Restituted)
    without revealing sensitive police patrol locations or operational intel.
    """
    try:
        return await RestitutionService.track_victim_complaint(acknowledgement_no)
    except Exception as e:
        logger.error(f"Failed to track victim complaint '{acknowledgement_no}': {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to track complaint status."
        )
