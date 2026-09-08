import logging
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, update
from app.db.postgres import AsyncSessionLocal
from app.db.neo4j_driver import get_neo4j_driver
from app.models import Account, Alert, AuditLog
from app.schemas.account import AccountFreezeRequest, AccountFreezeResponse
from app.schemas.alert import AlertResponse

logger = logging.getLogger("alert_service")


class AlertService:
    @staticmethod
    async def get_alerts(limit: int = 50, status_filter: Optional[str] = None) -> List[AlertResponse]:
        """Fetches active intelligence alerts with joined target account details."""
        async with AsyncSessionLocal() as session:
            query = select(Alert, Account).outerjoin(Account, Alert.target_account_id == Account.id)
            if status_filter:
                query = query.where(Alert.status == status_filter)
            query = query.order_by(Alert.risk_score.desc(), Alert.created_at.desc()).limit(limit)

            results = (await session.execute(query)).all()

            alerts = []
            for alert, acc in results:
                alerts.append(AlertResponse(
                    id=alert.id,
                    alert_type=alert.alert_type,
                    target_account_id=alert.target_account_id,
                    target_account_number=acc.account_number if acc else None,
                    target_holder_name=acc.holder_name if acc else None,
                    target_atm_id=alert.target_atm_id,
                    risk_score=float(alert.risk_score),
                    graph_score=float(alert.graph_score),
                    geo_score=float(alert.geo_score),
                    explanation=alert.explanation,
                    status=alert.status,
                    created_at=alert.created_at
                ))
            return alerts

    @staticmethod
    async def freeze_account(account_identifier: str, req: AccountFreezeRequest) -> AccountFreezeResponse:
        """
        Executes a rapid Law Enforcement freeze order:
        1. Updates PostgreSQL account table to is_frozen=True.
        2. Updates Neo4j (:Account) node is_frozen=true.
        3. Creates a cryptographically signed AuditLog entry with SHA-256 hash.
        """
        now = datetime.now(timezone.utc)

        async with AsyncSessionLocal() as session:
            # 1. Locate account by UUID or account_number
            query = select(Account).where(
                (Account.id == UUID(account_identifier)) if len(account_identifier) == 36 else (Account.account_number == account_identifier)
            )
            res = await session.execute(query)
            account = res.scalar_one_or_none()

            if not account:
                raise ValueError(f"Account '{account_identifier}' not found.")

            # Mark frozen
            account.is_frozen = True
            account.updated_at = now

            # 2. Generate SHA-256 cryptographic audit log entry
            details = {
                "reason": req.reason,
                "notes": req.notes,
                "previous_risk_score": float(account.risk_score),
                "account_number": account.account_number,
                "bank_name": account.bank_name
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
                ip_address="127.0.0.1",
                timestamp=now,
                hash_signature=signature
            )
            session.add(audit_log)
            await session.commit()
            await session.refresh(account)
            await session.refresh(audit_log)

        # 3. Synchronize with Neo4j
        driver = get_neo4j_driver()
        async with driver.session() as n_session:
            await n_session.run(
                """
                MATCH (a:Account {id: $acc_id})
                SET a.is_frozen = true
                """,
                acc_id=str(account.id)
            )

        logger.info(f"🛡️ FREEZE DISPATCHED: Account {account.account_number} frozen by {req.officer_badge_id} (Signature: {signature[:12]}...)")

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
            message=f"Account {account.account_number} successfully frozen across banking gateway and Neo4j graph."
        )
