import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple

def generate_synthetic_transactions(
    num_normal: int = 500,
    num_fraud_rings: int = 5
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[str]]:
    """
    Generates bank transactions with embedded multi-hop mule networks for Neo4j.
    Returns:
      1. transaction_records (list of edges)
      2. account_records (list of node metadata)
      3. fraud_labeled_accounts (list of confirmed fraud account numbers)
    """
    transactions = []
    accounts = {}
    fraud_accounts = []
    base_time = datetime.utcnow()

    # 1. Embed Multi-Hop Fraud Rings (Star, Chain, Fan-out)
    for r in range(1, num_fraud_rings + 1):
        ring_id = f"RING-{r:02d}"
        hub_acc = f"99991111{r:04d}"
        fraud_accounts.append(hub_acc)
        accounts[hub_acc] = {"account_number": hub_acc, "bank_name": "State Bank of India", "is_fraud": True}

        # Layer 1 Mule (Bridge Node — The Core UVP target)
        bridge_mule = f"88882222{r:04d}"
        accounts[bridge_mule] = {"account_number": bridge_mule, "bank_name": "HDFC Bank", "is_fraud": False}

        # Victim Account
        victim_acc = f"77773333{r:04d}"
        accounts[victim_acc] = {"account_number": victim_acc, "bank_name": "ICICI Bank", "is_fraud": False}

        # Cashout ATM Node
        atm_node = f"ATM-CASHOUT-{r:02d}"
        accounts[atm_node] = {"account_number": atm_node, "bank_name": "ATM Network", "is_fraud": False}

        # Multi-Hop Flow: Victim -> Bridge Mule -> Hub -> Cashout
        t1 = base_time - timedelta(minutes=45)
        t2 = base_time - timedelta(minutes=30)
        t3 = base_time - timedelta(minutes=15)

        transactions.append({
            "txn_ref": f"TXN-RING-{r}-01",
            "from_account": victim_acc,
            "to_account": bridge_mule,
            "amount": 45000.0,
            "txn_type": "UPI",
            "timestamp": t1,
            "is_suspicious": True,
            "fraud_ring_id": ring_id
        })
        transactions.append({
            "txn_ref": f"TXN-RING-{r}-02",
            "from_account": bridge_mule,
            "to_account": hub_acc,
            "amount": 44000.0,
            "txn_type": "IMPS",
            "timestamp": t2,
            "is_suspicious": True,
            "fraud_ring_id": ring_id
        })
        transactions.append({
            "txn_ref": f"TXN-RING-{r}-03",
            "from_account": hub_acc,
            "to_account": atm_node,
            "amount": 40000.0,
            "txn_type": "ATM_WITHDRAWAL",
            "timestamp": t3,
            "is_suspicious": True,
            "fraud_ring_id": ring_id
        })

    # 2. Normal Legitimate Transactions
    for n in range(1, num_normal + 1):
        u = f"{random.randint(100000000000, 999999999999)}"
        v = f"{random.randint(100000000000, 999999999999)}"
        if u not in accounts:
            accounts[u] = {"account_number": u, "bank_name": "Axis Bank", "is_fraud": False}
        if v not in accounts:
            accounts[v] = {"account_number": v, "bank_name": "Punjab National Bank", "is_fraud": False}

        transactions.append({
            "txn_ref": f"TXN-NORM-{n:05d}",
            "from_account": u,
            "to_account": v,
            "amount": round(random.uniform(500, 15000), 2),
            "txn_type": random.choice(["UPI", "IMPS", "NEFT"]),
            "timestamp": base_time - timedelta(hours=random.randint(1, 72)),
            "is_suspicious": False,
            "fraud_ring_id": None
        })

    return transactions, list(accounts.values()), fraud_accounts
