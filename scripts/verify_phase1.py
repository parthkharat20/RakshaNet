import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from sqlalchemy import text
from app.db.postgres import AsyncSessionLocal
from app.db.neo4j_driver import get_neo4j_driver
from app.generators.synthetic_seeder import DATA_DIR


async def verify_postgres():
    print("\n--- 1. Testing PostgreSQL + PostGIS Data ---")
    async with AsyncSessionLocal() as session:
        # Check counts
        acc_count = (await session.execute(text("SELECT COUNT(*) FROM accounts;"))).scalar()
        atm_count = (await session.execute(text("SELECT COUNT(*) FROM atm_locations;"))).scalar()
        txn_count = (await session.execute(text("SELECT COUNT(*) FROM transactions;"))).scalar()
        comp_count = (await session.execute(text("SELECT COUNT(*) FROM complaints;"))).scalar()

        print(f"  • Accounts in PostgreSQL: {acc_count}")
        print(f"  • ATMs in PostgreSQL: {atm_count}")
        print(f"  • Transactions in PostgreSQL: {txn_count}")
        print(f"  • Complaints in PostgreSQL: {comp_count}")

        assert acc_count == 500, f"Expected 500 accounts, got {acc_count}"
        assert atm_count == 50, f"Expected 50 ATMs, got {atm_count}"
        assert txn_count >= 2500, f"Expected >=2500 txns, got {txn_count}"

        # Test PostGIS spatial query: ATMs within 15km of Mumbai center (19.0760, 72.8777)
        spatial_query = text("""
            SELECT terminal_id, city, 
                   ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326)::geography) / 1000.0 AS dist_km
            FROM atm_locations
            WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326)::geography, 15000)
            ORDER BY dist_km ASC
            LIMIT 5;
        """)
        spatial_results = (await session.execute(spatial_query)).fetchall()
        print(f"\n  • PostGIS Spatial Query: Found {len(spatial_results)} ATMs within 15km of Mumbai center:")
        for row in spatial_results:
            print(f"    - {row[0]} in {row[1]}: {row[2]:.2f} km away")

        assert len(spatial_results) > 0, "PostGIS spatial query returned 0 ATMs!"
        print("  ✅ PostgreSQL + PostGIS verification PASSED.")


async def verify_neo4j():
    print("\n--- 2. Testing Neo4j Graph Network ---")
    driver = get_neo4j_driver()
    async with driver.session() as session:
        # Check node & edge counts
        res_acc = await session.run("MATCH (a:Account) RETURN count(a) AS count;")
        acc_nodes = (await res_acc.single())["count"]

        res_atm = await session.run("MATCH (atm:ATM) RETURN count(atm) AS count;")
        atm_nodes = (await res_atm.single())["count"]

        res_txns = await session.run("MATCH ()-[r:TRANSFERRED]->() RETURN count(r) AS count;")
        txn_edges = (await res_txns.single())["count"]

        print(f"  • (:Account) Nodes in Neo4j: {acc_nodes}")
        print(f"  • (:ATM) Nodes in Neo4j: {atm_nodes}")
        print(f"  • [:TRANSFERRED] Edges in Neo4j: {txn_edges}")

        assert acc_nodes == 500, f"Expected 500 Account nodes, got {acc_nodes}"
        assert atm_nodes == 50, f"Expected 50 ATM nodes, got {atm_nodes}"
        assert txn_edges >= 2500, f"Expected >=2500 transfer edges, got {txn_edges}"

        # Test Multi-Hop Money Laundering Path Query on Chain Ring
        print("\n  • Testing Multi-Hop Traversal (3-4 hops) on Chain Fraud Ring:")
        path_query = """
        MATCH p = (v:Account)-[:TRANSFERRED*3..4]->(m:Account)
        WHERE any(r IN relationships(p) WHERE r.ring_id = 'HERO_RING_CHAIN_01')
        RETURN length(p) AS hops,
               [n IN nodes(p) | n.holder_name] AS path_names,
               [r IN relationships(p) | r.amount] AS amounts
        LIMIT 2;
        """
        path_res = await session.run(path_query)
        records = await path_res.data()
        for r in records:
            print(f"    - Found {r['hops']}-Hop Trail:")
            print(f"      Hops: {' ➔ '.join(r['path_names'])}")
            print(f"      Amounts: {r['amounts']}")

        assert len(records) > 0, "No multi-hop chain paths found in Neo4j!"

        # Test Clean Neighbor Discrimination Test
        clean_res = await session.run("""
        MATCH (clean:Account {is_mule: false})<-[:TRANSFERRED]-(hub:Account {is_mule: true})
        RETURN clean.holder_name AS name, clean.account_age_days AS age, clean.risk_score AS risk
        LIMIT 2;
        """)
        clean_records = await clean_res.data()
        print(f"\n  • Clean Neighbor Check (UVP Test Scenario):")
        for cr in clean_records:
            print(f"    - Clean account connected to mule: {cr['name']} (Age: {cr['age']} days, Risk: {cr['risk']})")
        assert len(clean_records) > 0, "Clean neighbor not found connected to mule!"
        print("  ✅ Neo4j Graph verification PASSED.")


def verify_snapshots():
    print("\n--- 3. Testing Local JSON Snapshots ---")
    files = ["accounts.json", "atms.json", "transactions.json", "complaints.json", "hero_fraud_rings.json"]
    for f in files:
        p = DATA_DIR / f
        assert p.exists(), f"Snapshot file {f} is missing!"
        size_kb = p.stat().st_size / 1024.0
        print(f"  • {f}: {size_kb:.1f} KB")
    print("  ✅ Local JSON snapshots verification PASSED.")


async def main():
    print("==================================================")
    print("🔍 VERIFYING PHASE 1 IMPLEMENTATION & DATA SEEDING")
    print("==================================================")
    await verify_postgres()
    await verify_neo4j()
    verify_snapshots()
    print("\n==================================================")
    print("🎉 ALL PHASE 1 VERIFICATION CHECKS PASSED (100%)!")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(main())
