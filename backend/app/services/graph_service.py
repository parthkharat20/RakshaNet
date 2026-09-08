import logging
from typing import Dict, Any, List, Optional
from app.db.neo4j_driver import get_neo4j_driver
from app.schemas.graph import GraphNode, GraphLink, GraphResponse

logger = logging.getLogger("graph_service")


class GraphService:
    @staticmethod
    async def get_account_subgraph(account_identifier: str, max_hops: int = 2) -> GraphResponse:
        """
        Retrieves the multi-hop transaction network around an account (by UUID or account_number).
        Returns nodes and links formatted specifically for React-Force-Graph-2D.
        """
        max_hops = min(max(max_hops, 1), 4)  # Bound hops between 1 and 4
        driver = get_neo4j_driver()

        query = f"""
        MATCH (root:Account)
        WHERE root.id = $id_or_num OR root.account_number = $id_or_num
        OPTIONAL MATCH path = (root)-[r:TRANSFERRED*1..{max_hops}]-(neighbor:Account)
        WITH root, collect(path) AS paths
        UNWIND (CASE WHEN size(paths) > 0 THEN paths ELSE [null] END) AS p
        WITH root,
             collect(DISTINCT root) + [n IN collect(DISTINCT (CASE WHEN p IS NOT NULL THEN nodes(p) ELSE [] END)) | n] AS raw_nodes_list,
             [rel IN collect(DISTINCT (CASE WHEN p IS NOT NULL THEN relationships(p) ELSE [] END)) | rel] AS raw_rels_list
        RETURN root, raw_nodes_list, raw_rels_list
        """

        async with driver.session() as session:
            result = await session.run(query, id_or_num=account_identifier)
            record = await result.single()

            if not record or not record["root"]:
                # Try ATM lookup or return empty graph
                return GraphResponse(
                    root_id=account_identifier,
                    max_hops=max_hops,
                    total_nodes=0,
                    total_links=0,
                    nodes=[],
                    links=[]
                )

            root_node_props = dict(record["root"])
            root_id = root_node_props.get("id", account_identifier)

            # Flatten nodes and links
            nodes_dict: Dict[str, GraphNode] = {}
            links_list: List[GraphLink] = []
            seen_link_ids = set()

            # Helper to add Account node with role styling
            def process_account_node(props: dict) -> GraphNode:
                n_id = props.get("id")
                risk = float(props.get("risk_score", 0.0))
                age = int(props.get("account_age_days", 365))
                is_mule = bool(props.get("is_mule", False))

                # Dynamic role tagging for visual display
                if is_mule:
                    role = "MULE_HUB" if risk >= 0.85 else "MULE_NODE"
                elif age > 700 and risk <= 0.10:
                    role = "CLEAN"
                elif risk > 0.40:
                    role = "SUSPICIOUS"
                else:
                    role = "VICTIM"

                holder = props.get("holder_name", "Account")
                acc_num = props.get("account_number", "")

                return GraphNode(
                    id=n_id,
                    label=f"{holder} ({acc_num[-4:]})",
                    role=role,
                    account_number=acc_num,
                    holder_name=holder,
                    bank_name=props.get("bank_name", ""),
                    risk_score=risk,
                    is_frozen=bool(props.get("is_frozen", False)),
                    account_age_days=age,
                    is_mule=is_mule
                )

            # Add root node first
            nodes_dict[root_id] = process_account_node(root_node_props)

            # Process collected paths
            # Raw Cypher returns list of lists of nodes
            raw_nodes = record.get("raw_nodes_list", [])
            for item in raw_nodes:
                if isinstance(item, list):
                    for n in item:
                        if hasattr(n, "items"):
                            props = dict(n)
                            n_id = props.get("id")
                            if n_id and n_id not in nodes_dict:
                                nodes_dict[n_id] = process_account_node(props)
                elif hasattr(item, "items"):
                    props = dict(item)
                    n_id = props.get("id")
                    if n_id and n_id not in nodes_dict:
                        nodes_dict[n_id] = process_account_node(props)

            # Process relationships
            raw_rels = record.get("raw_rels_list", [])
            for item in raw_rels:
                if isinstance(item, list):
                    for rel in item:
                        if hasattr(rel, "type"):
                            # rel has start_node, end_node, type, properties
                            start_id = rel.start_node.get("id") if hasattr(rel.start_node, "get") else None
                            end_id = rel.end_node.get("id") if hasattr(rel.end_node, "get") else None
                            r_props = dict(rel)
                            txn_ref = r_props.get("txn_ref", f"txn_{len(links_list)}")

                            if start_id and end_id and txn_ref not in seen_link_ids:
                                seen_link_ids.add(txn_ref)
                                links_list.append(GraphLink(
                                    id=txn_ref,
                                    source=start_id,
                                    target=end_id,
                                    amount=float(r_props.get("amount", 0.0)),
                                    channel=r_props.get("channel", "UPI"),
                                    timestamp=r_props.get("timestamp", ""),
                                    hop_level=int(r_props.get("hop_level", 0)),
                                    is_flagged=bool(r_props.get("is_flagged", False)),
                                    ring_id=r_props.get("ring_id")
                                ))

            return GraphResponse(
                root_id=root_id,
                max_hops=max_hops,
                total_nodes=len(nodes_dict),
                total_links=len(links_list),
                nodes=list(nodes_dict.values()),
                links=links_list
            )
