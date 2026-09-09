"""
Inter-Bank CFCFRMS Mock Gateway & Lien Protocol Service.
Simulates real-time inter-bank lien dispatch to core banking systems (SBI, HDFC, ICICI, PNB, Axis)
under Section 91 CrPC / Section 69B IT Act via the Citizen Financial Cyber Fraud Reporting
and Management System (CFCFRMS / I4C).
"""
import logging
import uuid
from datetime import datetime, timezone
import random
from typing import Dict, Any, Optional

logger = logging.getLogger("bank_gateway")

BANK_IFSC_PREFIXES = {
    "State Bank of India": "SBIN0001234",
    "SBI": "SBIN0001234",
    "HDFC Bank": "HDFC0000456",
    "HDFC": "HDFC0000456",
    "ICICI Bank": "ICIC0000789",
    "ICICI": "ICIC0000789",
    "Punjab National Bank": "PUNB0002345",
    "PNB": "PUNB0002345",
    "Axis Bank": "UTIB0000321",
    "Axis": "UTIB0000321",
    "Kotak Mahindra Bank": "KKBK0000654",
    "Bank of Baroda": "BARB0000987"
}


class BankGateway:
    """
    Mock gateway simulating automated API integration with major Indian Core Banking Systems (CBS)
    and I4C CFCFRMS national cyber financial fraud ledger.
    """

    @classmethod
    async def place_lien(
        cls,
        account_number: str,
        bank_name: str,
        officer_badge_id: str,
        account_balance: float = 0.0,
        amount_claimed: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Dispatches an emergency inter-bank lien request to the beneficiary bank's CBS.
        Returns cryptographic acknowledgement with unique Bank Lien Reference ID.
        """
        now = datetime.now(timezone.utc)
        date_str = now.strftime("%Y%m%d")
        hex_suffix = uuid.uuid4().hex[:6].upper()

        # Resolve clean bank short code
        bank_clean = "BANK"
        for known_bank in BANK_IFSC_PREFIXES:
            if known_bank.lower() in bank_name.lower():
                bank_clean = known_bank.split()[0].upper()
                break

        ifsc = BANK_IFSC_PREFIXES.get(bank_name, f"{bank_clean[:4]}0001999")
        lien_reference = f"{bank_clean}-CFCFRMS-{date_str}-{hex_suffix}"
        cfcfrms_ack = f"I4C-SEC91-{date_str}-{uuid.uuid4().hex[:8].upper()}"

        # Calculate retained funds
        if amount_claimed and amount_claimed > 0:
            funds_retained = min(account_balance, amount_claimed) if account_balance > 0 else amount_claimed
        elif account_balance > 0:
            funds_retained = account_balance
        else:
            funds_retained = float(random.randint(45000, 125000))

        logger.info(
            f"🏛️ [CFCFRMS GATEWAY] Lien order dispatched: Account={account_number} ({bank_name}) | "
            f"Officer={officer_badge_id} | LienRef={lien_reference} | Retained=₹{funds_retained:,.2f}"
        )

        return {
            "success": True,
            "status": "CONFIRMED_PLACED",
            "bank_lien_reference": lien_reference,
            "cfcfrms_ack_code": cfcfrms_ack,
            "bank_name": bank_name,
            "branch_ifsc": ifsc,
            "account_number": account_number,
            "funds_retained": round(funds_retained, 2),
            "lien_placed_at": now.isoformat(),
            "legal_mandate": "Section 91 Cr.P.C. / Sec 69B IT Act 2000",
            "message": f"Bank lien confirmed by {bank_name}. Retained funds: ₹{funds_retained:,.2f}."
        }
