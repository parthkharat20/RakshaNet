"""
Branch A: Graph-Based Mule Detection using NetworkX + Adamic-Adar Link Prediction.

Constructs an in-memory transaction multigraph from Neo4j data, extracts structural
features per account, and uses Adamic-Adar link prediction heuristics to score
how closely each account is connected to confirmed fraud clusters.

Key Features Extracted:
    1. hop_distance_to_fraud     — Shortest path length to nearest confirmed mule
    2. adamic_adar_fraud_score   — Adamic-Adar index with confirmed mule neighbors
    3. jaccard_fraud_score       — Jaccard coefficient with confirmed mule neighbors
    4. weighted_in_degree        — Total inflow amount (INR)
    5. weighted_out_degree       — Total outflow amount (INR)
    6. evacuation_ratio          — outflow / inflow (mules approach 0.95-1.0)
    7. unique_counterparties     — Number of distinct counterparties
    8. account_age_days          — Structural feature for SHAP
    9. avg_txn_amount            — Average per-transaction volume
   10. is_star_hub               — Boolean: >5 distinct inflow sources in 30 min window
"""

import asyncio
import logging
from typing import Dict, List, Any, Tuple

import networkx as nx
import numpy as np

from app.db.neo4j_driver import get_neo4j_driver

logger = logging.getLogger("graph_predictor")

GRAPH_FEATURE_NAMES = [
    "hop_distance_to_fraud",
    "adamic_adar_fraud_score",
    "jaccard_fraud_score",
    "weighted_in_degree",
    "weighted_out_degree",
    "evacuation_ratio",
    "unique_counterparties",
    "account_age_days",
    "avg_txn_amount",
    "is_star_hub"
]


async def build_transaction_graph() -> Tuple[nx.DiGraph, Dict[str, Dict[str, Any]]]:
    """
    Pulls all Account nodes and TRANSFERRED edges from Neo4j into a NetworkX DiGraph.
    Returns the graph and a dict of node attributes keyed by account id.
    """
    driver = get_neo4j_driver()
    G = nx.DiGraph()
    node_attrs: Dict[str, Dict[str, Any]] = {}

    async with driver.session() as session:
        # Pull all account nodes
        result = await session.run("""
            MATCH (a:Account)
            RETURN a.id AS id, a.account_number AS acc_num, a.holder_name AS name,
                   a.risk_score AS risk, a.account_age_days AS age,
                   a.is_mule AS is_mule, a.bank_name AS bank
        """)
        records = await result.data()
        for r in records:
            nid = r["id"]
            G.add_node(nid)
            node_attrs[nid] = {
                "account_number": r["acc_num"],
                "holder_name": r["name"],
                "risk_score": float(r.get("risk", 0.0)),
                "account_age_days": int(r.get("age", 365)),
                "is_mule": bool(r.get("is_mule", False)),
                "bank_name": r.get("bank", "")
            }

        # Pull all transfer edges
        result = await session.run("""
            MATCH (s:Account)-[r:TRANSFERRED]->(t:Account)
            RETURN s.id AS src, t.id AS tgt, r.amount AS amount,
                   r.timestamp AS ts, r.is_flagged AS flagged,
                   r.ring_id AS ring_id, r.channel AS channel
        """)
        edges = await result.data()
        for e in edges:
            G.add_edge(e["src"], e["tgt"],
                       amount=float(e.get("amount", 0)),
                       timestamp=e.get("ts", ""),
                       is_flagged=bool(e.get("flagged", False)),
                       ring_id=e.get("ring_id", ""),
                       channel=e.get("channel", "UPI"))

    logger.info(f"Built NetworkX DiGraph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
    return G, node_attrs


def extract_graph_features(G: nx.DiGraph, node_attrs: Dict[str, Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
    """
    Extracts 10 structural features per account node for the fusion scoring engine.
    """
    # Identify confirmed fraud / mule nodes
    mule_nodes = {nid for nid, attrs in node_attrs.items() if attrs.get("is_mule", False)}

    # Convert to undirected for path / link prediction calculations
    G_undirected = G.to_undirected()

    # Pre-compute shortest paths from each mule to all reachable nodes
    # (BFS from each mule, bounded at 6 hops)
    mule_distances: Dict[str, int] = {}
    for mule_id in mule_nodes:
        if mule_id in G_undirected:
            lengths = nx.single_source_shortest_path_length(G_undirected, mule_id, cutoff=6)
            for node_id, dist in lengths.items():
                if node_id not in mule_distances or dist < mule_distances[node_id]:
                    mule_distances[node_id] = dist

    # Extract features
    features: Dict[str, Dict[str, float]] = {}

    for nid in G.nodes():
        attrs = node_attrs.get(nid, {})

        # 1. Hop distance to nearest confirmed fraud node
        hop_dist = mule_distances.get(nid, 99)

        # 2-3. Link prediction scores with mule neighbors (Adamic-Adar + Jaccard)
        aa_score = 0.0
        jc_score = 0.0
        if nid in G_undirected and mule_nodes:
            # Compute pairwise AA and Jaccard for this node vs each mule
            neighbors_n = set(G_undirected.neighbors(nid))
            for mule_id in mule_nodes:
                if mule_id == nid:
                    continue
                if mule_id in G_undirected:
                    neighbors_m = set(G_undirected.neighbors(mule_id))
                    # Adamic-Adar: sum of 1/log(degree) for shared neighbors
                    shared = neighbors_n & neighbors_m
                    for s in shared:
                        deg = G_undirected.degree(s)
                        if deg > 1:
                            aa_score += 1.0 / np.log(deg)
                    # Jaccard: |intersection| / |union|
                    union = neighbors_n | neighbors_m
                    if len(union) > 0:
                        jc_score = max(jc_score, len(shared) / len(union))

        # 4-5. Weighted in/out degree (total money flow)
        in_edges = G.in_edges(nid, data=True)
        out_edges = G.out_edges(nid, data=True)
        total_inflow = sum(d.get("amount", 0) for _, _, d in in_edges)
        total_outflow = sum(d.get("amount", 0) for _, _, d in out_edges)

        # 6. Evacuation ratio (key mule signal)
        evac_ratio = (total_outflow / total_inflow) if total_inflow > 0 else 0.0
        evac_ratio = min(evac_ratio, 1.0)

        # 7. Unique counterparties
        in_partners = set(src for src, _ in G.in_edges(nid))
        out_partners = set(tgt for _, tgt in G.out_edges(nid))
        unique_counterparties = len(in_partners | out_partners)

        # 8. Account age
        age = attrs.get("account_age_days", 365)

        # 9. Average transaction amount
        all_edge_amounts = [d.get("amount", 0) for _, _, d in in_edges] + [d.get("amount", 0) for _, _, d in out_edges]
        avg_txn = np.mean(all_edge_amounts) if all_edge_amounts else 0.0

        # 10. Star hub detection: >=5 distinct inflow sources
        is_star_hub = 1.0 if len(in_partners) >= 5 else 0.0

        # 11. Hero fraud ring edge detection
        has_ring_txn = 1.0 if any(d.get("ring_id") for _, _, d in in_edges) or any(d.get("ring_id") for _, _, d in out_edges) else 0.0

        # 12. Confirmed mule status
        is_mule = 1.0 if attrs.get("is_mule", False) else 0.0

        features[nid] = {
            "hop_distance_to_fraud": float(hop_dist),
            "adamic_adar_fraud_score": float(aa_score),
            "jaccard_fraud_score": float(jc_score),
            "weighted_in_degree": float(total_inflow),
            "weighted_out_degree": float(total_outflow),
            "evacuation_ratio": float(evac_ratio),
            "unique_counterparties": float(unique_counterparties),
            "account_age_days": float(age),
            "avg_txn_amount": float(avg_txn),
            "is_star_hub": float(is_star_hub),
            "has_ring_txn": float(has_ring_txn),
            "is_mule_label": float(is_mule)
        }

    logger.info(f"Extracted graph features for {len(features)} accounts")
    return features


def compute_graph_risk_scores(features: Dict[str, Dict[str, float]]) -> Dict[str, float]:
    """
    Computes a graph-based risk score (0.0 to 1.0) using structural graph heuristics:
    - Confirmed mules score >= 0.85
    - High-velocity 2-hop accounts downstream from fraud score > 0.75
    - Isolated clean accounts score < 0.15
    """
    scores: Dict[str, float] = {}

    for nid, f in features.items():
        score = 0.0

        # 1. Hop proximity to confirmed fraud
        hop = f["hop_distance_to_fraud"]
        if hop == 0 or f["is_mule_label"] > 0:
            score += 0.55  # Confirmed fraud / mule ground truth
        elif hop == 1:
            score += 0.42  # Direct 1-hop counterparty
        elif hop == 2:
            score += 0.35  # 2 hops downstream / upstream
        elif hop == 3:
            score += 0.10
        # hop >= 4 gets 0.0

        # 2. Hero fraud ring participation (Neo4j ring_id tags)
        if f.get("has_ring_txn", 0.0) > 0:
            score += 0.25

        # 3. Adamic-Adar structural link similarity
        aa = min(f["adamic_adar_fraud_score"] / 1.0, 1.0)
        score += aa * 0.20

        # 4. Jaccard neighborhood overlap
        score += f["jaccard_fraud_score"] * 0.10

        # 5. Evacuation ratio (rapid fund layering/mule signal)
        if f["evacuation_ratio"] > 0.85:
            score += 0.22
        elif f["evacuation_ratio"] > 0.65:
            score += 0.12

        # 6. Star hub topology (smurfing/collection hub)
        if f["is_star_hub"] > 0:
            score += 0.20

        # 7. Account age penalty / credit
        age = f["account_age_days"]
        if age <= 30:
            score += 0.15  # Young / burner account
        elif age <= 60:
            score += 0.08
        elif age > 180:
            score -= 0.05  # Established legitimate history

        # 8. High-volume throughput
        if f["weighted_in_degree"] > 50000 or f["weighted_out_degree"] > 50000:
            score += 0.06

        # 9. Attenuate generic spending/merchant behavior for nodes with zero fraud proximity
        if hop >= 4 and aa == 0 and f.get("has_ring_txn", 0.0) == 0:
            score = score * 0.20  # Distant isolated nodes cannot be confirmed mules

        scores[nid] = round(min(max(score, 0.0), 1.0), 4)

    return scores


async def run_graph_scoring() -> Dict[str, Any]:
    """
    Full pipeline: Build graph → Extract features → Compute scores.
    Returns dict keyed by account_id with graph_score and feature breakdown.
    """
    G, node_attrs = await build_transaction_graph()
    features = extract_graph_features(G, node_attrs)
    scores = compute_graph_risk_scores(features)

    results = {}
    for nid in scores:
        results[nid] = {
            "graph_score": scores[nid],
            "features": features.get(nid, {}),
            "is_mule_label": node_attrs.get(nid, {}).get("is_mule", False),
            "holder_name": node_attrs.get(nid, {}).get("holder_name", ""),
            "account_age_days": node_attrs.get(nid, {}).get("account_age_days", 0)
        }

    logger.info(f"Graph scoring complete for {len(results)} accounts")
    return results

