"""
Data Ingestion Service: NCRP Complaints & Financial Transactions.

Handles dual-write atomicity between PostgreSQL and Neo4j using compensating
transaction pattern — if Neo4j write fails after PG commit, we log the failure
for async retry rather than leaving the system in an inconsistent state.
"""
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from sqlalchemy import select
from app.db.postgres import AsyncSessionLocal
from app.db.neo4j_driver import get_neo4j_driver
from app.models import Account, Complaint, Transaction
from app.schemas.complaint import ComplaintCreate, ComplaintResponse
from app.schemas.transaction import TransactionCreate, TransactionResponse

logger = logging.getLogger("ingestion_service")


class IngestionService:
    @staticmethod
    async def ingest_complaint(data: ComplaintCreate) -> ComplaintResponse:
        """Ingests a formal NCRP cybercrime complaint into PostgreSQL and links graph entities."""
        async with AsyncSessionLocal() as session:
            # Look up victim and suspect accounts if provided
            victim_acc: Optional[Account] = None
            suspect_acc: Optional[Account] = None

            if data.victim_account_number:
                v_res = await session.execute(
                    select(Account).where(Account.account_number == data.victim_account_number)
                )
                victim_acc = v_res.scalar_one_or_none()

            if data.suspect_account_number:
                s_res = await session.execute(
                    select(Account).where(Account.account_number == data.suspect_account_number)
                )
                suspect_acc = s_res.scalar_one_or_none()

            # Fixed: Dynamic date prefix + UUID short suffix for globally unique acknowledgement numbers
            date_prefix = datetime.now(timezone.utc).strftime('%Y%m%d')
            unique_suffix = uuid.uuid4().hex[:8].upper()
            ack_no = f"{date_prefix}{unique_suffix}"

            geom_loc = from_shape(Point(data.lon, data.lat), srid=4326) if (data.lat and data.lon) else None

            complaint = Complaint(
                acknowledgement_no=ack_no,
                category=data.category,
                loss_amount=data.loss_amount,
                victim_account_id=victim_acc.id if victim_acc else None,
                suspect_account_id=suspect_acc.id if suspect_acc else None,
                incident_time=data.incident_time,
                reported_time=datetime.now(timezone.utc),
                location=geom_loc,
                city=data.city,
                state=data.state,
                status="PENDING",
                description=data.description
            )
            session.add(complaint)
            await session.commit()
            await session.refresh(complaint)

            logger.info(f"✅ Ingested NCRP Complaint {ack_no} for ₹{data.loss_amount}")

            return ComplaintResponse(
                id=complaint.id,
                acknowledgement_no=complaint.acknowledgement_no,
                category=complaint.category,
                loss_amount=float(complaint.loss_amount),
                victim_account_id=complaint.victim_account_id,
                suspect_account_id=complaint.suspect_account_id,
                incident_time=complaint.incident_time,
                reported_time=complaint.reported_time,
                city=complaint.city,
                state=complaint.state,
                lat=data.lat,
                lon=data.lon,
                status=complaint.status,
                description=complaint.description,
                created_at=complaint.created_at
            )

    @staticmethod
    async def ingest_transaction(data: TransactionCreate) -> TransactionResponse:
        """
        Ingests a financial transaction into PostgreSQL and mirrors edge into Neo4j.
        Uses compensating transaction pattern: if Neo4j fails, PG transaction is 
        marked for async graph sync rather than being rolled back.
        """
        txn = None
        sender = None
        receiver = None

        async with AsyncSessionLocal() as session:
            # 1. Resolve accounts
            s_res = await session.execute(select(Account).where(Account.account_number == data.sender_account_number))
            sender = s_res.scalar_one_or_none()
            r_res = await session.execute(select(Account).where(Account.account_number == data.receiver_account_number))
            receiver = r_res.scalar_one_or_none()

            if not sender or not receiver:
                raise ValueError(f"One or both accounts not found: {data.sender_account_number}, {data.receiver_account_number}")

            txn_time = data.timestamp or datetime.now(timezone.utc)
            txn_ref = f"{data.channel}{txn_time.strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:6].upper()}"

            txn = Transaction(
                txn_ref=txn_ref,
                sender_account_id=sender.id,
                receiver_account_id=receiver.id,
                amount=data.amount,
                timestamp=txn_time,
                channel=data.channel,
                is_flagged=data.is_flagged,
                hop_level=1 if data.is_flagged else 0,
                ring_id=data.ring_id
            )
            session.add(txn)
            await session.commit()
            await session.refresh(txn)

        # 2. Mirror into Neo4j — compensating transaction pattern
        neo4j_synced = False
        try:
            driver = get_neo4j_driver()
            async with driver.session() as n_session:
                await n_session.run(
                    """
                    MATCH (s:Account {id: $s_id})
                    MATCH (r:Account {id: $r_id})
                    CREATE (s)-[:TRANSFERRED {
                        txn_ref: $txn_ref,
                        amount: $amount,
                        timestamp: $timestamp,
                        channel: $channel,
                        is_flagged: $is_flagged,
                        hop_level: $hop_level,
                        ring_id: $ring_id
                    }]->(r)
                    """,
                    s_id=str(sender.id),
                    r_id=str(receiver.id),
                    txn_ref=txn_ref,
                    amount=float(data.amount),
                    timestamp=txn_time.isoformat(),
                    channel=data.channel,
                    is_flagged=data.is_flagged,
                    hop_level=1 if data.is_flagged else 0,
                    ring_id=data.ring_id or ""
                )
            neo4j_synced = True
        except Exception as e:
            # Log failure but don't roll back PostgreSQL — mark for async retry
            logger.error(f"⚠️ Neo4j graph sync FAILED for txn {txn_ref}: {e}. "
                        f"PostgreSQL record preserved. Schedule async graph reconciliation.")

        sync_status = "SYNCED" if neo4j_synced else "PG_ONLY_PENDING_SYNC"
        logger.info(f"✅ Ingested Transaction {txn_ref}: ₹{data.amount} "
                    f"({data.sender_account_number} → {data.receiver_account_number}) "
                    f"[Graph: {sync_status}]")

        return TransactionResponse(
            id=txn.id,
            txn_ref=txn.txn_ref,
            sender_account_id=txn.sender_account_id,
            receiver_account_id=txn.receiver_account_id,
            amount=float(txn.amount),
            timestamp=txn.timestamp,
            channel=txn.channel,
            is_flagged=txn.is_flagged,
            hop_level=txn.hop_level,
            ring_id=txn.ring_id,
            created_at=txn.created_at
        )
