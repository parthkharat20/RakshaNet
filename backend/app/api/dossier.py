"""
Dossier API: Court-Admissible Electronic Evidence & Syndicate Intelligence Router.
Provides endpoints for Section 63 BSA 2023 / Section 65B IEA certificates,
formal Section 91 Cr.P.C. case briefs, and organized crime syndicate profiling.
"""

import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status as http_status

from app.schemas.dossier import (
    CourtDossierResponse,
    Section65BCertificate,
    SyndicateProfile
)
from app.services.dossier_service import DossierService
from app.api.auth import get_current_officer

logger = logging.getLogger("dossier_api")
router = APIRouter(tags=["Forensic Evidence & Syndicate Intelligence"])


@router.get("/dossier/{alert_id}", response_model=CourtDossierResponse)
async def get_court_dossier(
    alert_id: str,
    officer: dict = Depends(get_current_officer)
):
    """
    Assembles complete court-admissible electronic case dossier for the specified alert:
    1. Multi-hop fund dissipation trail with transaction hops and IFSC routing.
    2. Bank lien confirmation under Section 91 Cr.P.C. / CFCFRMS.
    3. Mobile beat patrol interdiction order and GPS coordinates.
    4. SHAP feature attributions explaining AI risk scoring to the magistrate.
    5. Statutory Section 63 BSA 2023 / Section 65B IEA Digital Certificate with root SHA-256 hash.

    Requires JWT officer authentication.
    """
    try:
        return await DossierService.generate_court_dossier(alert_id, officer=officer)
    except ValueError as e:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to generate court dossier for {alert_id}: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to assemble electronic court evidence dossier."
        )


@router.get("/dossier/{alert_id}/certificate", response_model=Section65BCertificate)
async def get_section_65b_certificate(
    alert_id: str,
    officer: dict = Depends(get_current_officer)
):
    """
    Returns standalone statutory Section 63 BSA 2023 / Section 65B IEA Electronic Evidence Certificate.
    """
    try:
        dossier = await DossierService.generate_court_dossier(alert_id, officer=officer)
        return dossier.certificate_65b
    except ValueError as e:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to extract certificate for {alert_id}: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate statutory certificate."
        )


@router.get("/syndicates", response_model=List[SyndicateProfile])
async def list_syndicate_profiles():
    """
    Returns cross-jurisdictional intelligence profiles of active cyber-fraud syndicates,
    detailing modus operandi, detected loss, funds intercepted, and disruption rate.
    """
    try:
        return await DossierService.get_syndicate_profiles()
    except Exception as e:
        logger.error(f"Failed to retrieve syndicate intelligence: {e}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch syndicate profiles."
        )
