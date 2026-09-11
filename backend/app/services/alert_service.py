"""
Alert Service: Intelligence alert queries and Law Enforcement freeze operations.

Handles account freezing across PostgreSQL and Neo4j with cryptographic SHA-256
audit trail entries. Now captures real client IP for forensic traceability.
"""
import logging
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, update
from app.db.postgres import AsyncSessionLocal
from app.db.neo4j_driver import get_neo4j_driver
from app.models import Account, Alert, AuditLog, ATMLocation
from geoalchemy2.functions import ST_X, ST_Y
from app.schemas.account import AccountFreezeRequest, AccountFreezeResponse
from app.schemas.alert import AlertResponse

logger = logging.getLogger("alert_service")


class AlertService:
    @staticmethod
    async def get_alerts(limit: int = 50, status_filter: Optional[str] = None) -> List[AlertResponse]:
        """Fetches active intelligence alerts with joined target account details, deduplicated by suspect account."""
        async with AsyncSessionLocal() as session:
            query = (
                select(
                    Alert,
                    Account,
                    ATMLocation,
                    ST_Y(ATMLocation.location).label("atm_lat"),
                    ST_X(ATMLocation.location).label("atm_lon")
                )
                .outerjoin(Account, Alert.target_account_id == Account.id)
                .outerjoin(ATMLocation, Alert.target_atm_id == ATMLocation.id)
            )
            if status_filter:
                query = query.where(Alert.status == status_filter)
            else:
                query = query.where(Alert.status.in_(["NEW", "INVESTIGATING", "FREEZE_DISPATCHED", "FREEZE_CONFIRMED"]))
            # Fetch extra records to account for deduplication
            query = query.order_by(Alert.risk_score.desc(), Alert.created_at.desc()).limit(limit * 3)

            results = (await session.execute(query)).all()

            seen_accounts = set()
            alerts = []
            for alert, acc, atm, atm_lat, atm_lon in results:
                # Key by account ID or alert ID
                acc_key = str(alert.target_account_id) if alert.target_account_id else str(alert.id)
                if acc_key in seen_accounts:
                    continue
                seen_accounts.add(acc_key)

                # Database-driven Target ATM resolution via PostGIS
                if atm:
                    city = atm.city or (acc.city if acc else "Metro Sector")
                    target_atm_name = f"{atm.bank_name} - {atm.address}"
                    target_terminal_id = atm.terminal_id
                    target_lat = float(atm_lat) if atm_lat is not None else None
                    target_lon = float(atm_lon) if atm_lon is not None else None
                else:
                    city = acc.city if acc else "Mumbai"
                    target_atm_name = "State Bank of India - Matunga East ATM Hub"
                    target_terminal_id = "ATM-MUM-001"
                    target_lat = 19.0270
                    target_lon = 72.8550

                alerts.append(AlertResponse(
                    id=alert.id,
                    alert_type=alert.alert_type,
                    target_account_id=alert.target_account_id,
                    target_account_number=acc.account_number if acc else None,
                    target_holder_name=acc.holder_name if acc else None,
                    bank_name=acc.bank_name if acc else "Core Banking Node",
                    city=city,
                    target_atm_id=alert.target_atm_id,
                    target_atm_name=target_atm_name,
                    target_terminal_id=target_terminal_id,
                    target_lat=target_lat,
                    target_lon=target_lon,
                    risk_score=float(alert.risk_score),
                    graph_score=float(alert.graph_score),
                    geo_score=float(alert.geo_score),
                    explanation=alert.explanation,
                    status=alert.status,
                    created_at=alert.created_at
                ))
                if len(alerts) >= limit:
                    break

            return alerts

    @staticmethod
    async def freeze_account(
        account_identifier: str,
        req: AccountFreezeRequest,
        client_ip: str = "0.0.0.0"
    ) -> AccountFreezeResponse:
        """
        Executes a rapid Law Enforcement freeze order:
        1. Updates PostgreSQL account table to is_frozen=True.
        2. Updates Neo4j (:Account) node is_frozen=true.
        3. Creates a cryptographically signed AuditLog entry with SHA-256 hash.

        Now captures real client IP from the request for forensic audit compliance.
        """
        now = datetime.now(timezone.utc)

        async with AsyncSessionLocal() as session:
            # 1. Locate account by UUID or account_number
            if len(account_identifier) == 36:
                try:
                    query = select(Account).where(Account.id == UUID(account_identifier))
                except ValueError:
                    raise ValueError(f"Invalid UUID format: '{account_identifier}'")
            else:
                query = select(Account).where(Account.account_number == account_identifier)

            res = await session.execute(query)
            account = res.scalar_one_or_none()

            if not account:
                raise ValueError(f"Account '{account_identifier}' not found.")

            if account.is_frozen:
                logger.warning(f"Account {account.account_number} is already frozen. Skipping duplicate freeze.")
                clean_bank = (account.bank_name or "BANK").split()[0].upper()
                return AccountFreezeResponse(
                    success=True,
                    account_id=account.id,
                    account_number=account.account_number,
                    holder_name=account.holder_name,
                    bank_name=account.bank_name,
                    is_frozen=True,
                    audit_log_id=UUID("00000000-0000-0000-0000-000000000000"),
                    hash_signature="already_frozen",
                    action_taken_at=now,
                    message=f"Account {account.account_number} was already frozen.",
                    bank_lien_reference=f"{clean_bank}-CFCFRMS-ACTIVE-LIEN"
                )


            # 2. Inter-Bank CFCFRMS Lien Placement
            from app.services.bank_gateway import BankGateway
            lien_receipt = await BankGateway.place_lien(
                account_number=account.account_number,
                bank_name=account.bank_name,
                officer_badge_id=req.officer_badge_id,
                account_balance=float(account.balance)
            )

            # Mark frozen
            account.is_frozen = True
            account.updated_at = now

            # 3. Generate SHA-256 cryptographic audit log entry with Bank Lien Reference
            details = {
                "reason": req.reason,
                "notes": req.notes,
                "previous_risk_score": float(account.risk_score),
                "account_number": account.account_number,
                "bank_name": account.bank_name,
                "client_ip": client_ip,
                "bank_lien_reference": lien_receipt["bank_lien_reference"],
                "cfcfrms_ack_code": lien_receipt["cfcfrms_ack_code"],
                "funds_retained": lien_receipt["funds_retained"],
                "branch_ifsc": lien_receipt["branch_ifsc"]
            }
            timestamp_str = now.isoformat()
            signature = AuditLog.compute_signature(
                badge_id=req.officer_badge_id,
                action="FREEZE_ACCOUNT",
                target_id=str(account.id),
                timestamp_str=timestamp_str,
                details_dict=details
            )

            audit_log = AuditLog(
                officer_badge_id=req.officer_badge_id,
                action="FREEZE_ACCOUNT",
                target_type="ACCOUNT",
                target_id=str(account.id),
                details=details,
                ip_address=client_ip,
                timestamp=now,
                hash_signature=signature
            )
            session.add(audit_log)
            await session.commit()
            await session.refresh(account)
            await session.refresh(audit_log)

        # 4. Synchronize with Neo4j
        try:
            driver = get_neo4j_driver()
            async with driver.session() as n_session:
                await n_session.run(
                    """
                    MATCH (a:Account {id: $acc_id})
                    SET a.is_frozen = true
                    """,
                    acc_id=str(account.id)
                )
        except Exception as e:
            logger.error(f"⚠️ Neo4j freeze sync failed for {account.account_number}: {e}. "
                        f"PostgreSQL freeze is committed. Schedule async reconciliation.")

        # 5. Broadcast real-time WebSocket events
        try:
            from app.realtime.dispatcher import dispatch_freeze_event, dispatch_lien_confirmed_event
            await dispatch_freeze_event(
                account_id=str(account.id),
                account_number=account.account_number,
                holder_name=account.holder_name,
                officer_badge_id=req.officer_badge_id,
                hash_signature=signature
            )
            await dispatch_lien_confirmed_event(
                account_number=account.account_number,
                bank_name=account.bank_name,
                bank_lien_reference=lien_receipt["bank_lien_reference"],
                funds_retained=lien_receipt["funds_retained"],
                cfcfrms_ack_code=lien_receipt["cfcfrms_ack_code"]
            )
        except Exception as e:
            logger.warning(f"WebSocket broadcast failed for freeze: {e}")

        logger.info(f"🛡️ FREEZE DISPATCHED: Account {account.account_number} frozen by "
                    f"{req.officer_badge_id} from IP {client_ip} | Lien: {lien_receipt['bank_lien_reference']}")

        return AccountFreezeResponse(
            success=True,
            account_id=account.id,
            account_number=account.account_number,
            holder_name=account.holder_name,
            bank_name=account.bank_name,
            is_frozen=True,
            audit_log_id=audit_log.id,
            hash_signature=signature,
            action_taken_at=now,
            message=f"Section 91 freeze executed. Lien confirmed by {account.bank_name} ({lien_receipt['bank_lien_reference']}). Retained ₹{lien_receipt['funds_retained']:,.2f}.",
            bank_lien_reference=lien_receipt["bank_lien_reference"],
            cfcfrms_ack_code=lien_receipt["cfcfrms_ack_code"],
            funds_retained=lien_receipt["funds_retained"],
            branch_ifsc=lien_receipt["branch_ifsc"]
        )

