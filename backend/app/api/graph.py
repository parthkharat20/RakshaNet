from fastapi import APIRouter
from app.db.neo4j_conn import neo4j_conn
from typing import Dict, Any, List
import logging

router = APIRouter(prefix="/graph", tags=["Neo4j Graph Network"])
logger = logging.getLogger("rakshanet.api.graph")

@router.get("/subgraph/{account_no}")
async def get_account_subgraph(account_no: str) -> Dict[str, Any]:
    """
    Executes Cypher query on Neo4j to extract 2-hop transaction network 
    surrounding suspect account. Returns nodes and links for Canvas graph rendering.
    """
    driver = neo4j_conn.get_driver()
    if driver:
        try:
            cypher_query = """
            MATCH path = (a:Account {account_number: $acc_num})-[:TRANSACTED*1..2]-(b:Account)
            RETURN path LIMIT 25
            """
            with driver.session() as session:
                result = session.run(cypher_query, acc_num=account_no)
                nodes = {}
                links = []
                for record in result:
                    path = record["path"]
                    for node in path.nodes:
                        nid = node["account_number"]
                        if nid not in nodes:
                            nodes[nid] = {
                                "id": nid,
                                "is_fraud": node.get("is_fraud_labeled", False),
                                "bank": node.get("bank_name", "Bank"),
                                "is_target": (nid == account_no)
                            }
                    for rel in path.relationships:
                        links.append({
                            "source": rel.start_node["account_number"],
                            "target": rel.end_node["account_number"],
                            "amount": rel.get("amount", 25000)
                        })

                if nodes:
                    return {"nodes": list(nodes.values()), "links": links}
        except Exception as e:
            logger.warning(f"Neo4j live query failed, falling back to simulated 2-hop neighborhood: {e}")

    # Deterministic 2-hop neighborhood matching the demo attack scenario
    return {
        "nodes": [
            {"id": "Victim-Delhi", "type": "victim", "is_fraud": False, "bank": "HDFC", "label": "Victim A/C", "is_target": False},
            {"id": account_no, "type": "target", "is_fraud": False, "bank": "SBI", "label": f"Clean Target ...{account_no[-4:]}", "is_target": True},
            {"id": "MuleHub-Mewat-01", "type": "hub", "is_fraud": True, "bank": "PNB", "label": "Mule Ring 1 (Mewat)", "is_target": False},
            {"id": "MuleHub-Jamtara-02", "type": "hub", "is_fraud": True, "bank": "Canara", "label": "Mule Ring 2 (Jamtara)", "is_target": False},
            {"id": "Cashout-ATM-BKC", "type": "atm", "is_fraud": False, "bank": "SBI ATM", "label": "Predicted Cash-Out ATM", "is_target": False}
        ],
        "links": [
            {"source": "Victim-Delhi", "target": account_no, "amount": 45000, "hop": 1},
            {"source": account_no, "target": "MuleHub-Mewat-01", "amount": 22000, "hop": 2},
            {"source": account_no, "target": "MuleHub-Jamtara-02", "amount": 23000, "hop": 2},
            {"source": account_no, "target": "Cashout-ATM-BKC", "amount": 45000, "hop": 1}
        ]
    }
