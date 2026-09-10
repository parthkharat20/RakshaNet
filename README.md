# RakshaNet 🛡️
### Autonomous Cyber-Financial Fraud Interdiction & Predictive Cash-Out Intelligence Grid

> **Mission Statement:** Empowering Law Enforcement Agencies (LEAs), the Indian Cyber Crime Coordination Centre (I4C), and Banking Partner Networks with inductive graph neural networks and geo-spatial predictive intelligence to neutralize cyber-financial mule rings within the critical **180–240 minute "Golden Window"** before illicit funds are permanently liquidated.

[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB.svg?style=flat&logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.0-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL_16-PostGIS_3.4-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Neo4j 5](https://img.shields.io/badge/Neo4j-5.18_Property_Graph-45818e.svg?style=flat&logo=neo4j)](https://neo4j.com/)
[![Redis 7](https://img.shields.io/badge/Redis-7.0_PubSub-DC382D.svg?style=flat&logo=redis)](https://redis.io/)
[![PyTorch](https://img.shields.io/badge/PyTorch_Geometric-2.5.0-EE4C2C.svg?style=flat&logo=pytorch)](https://pyg.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0.3-EB8E3B.svg?style=flat&logo=xgboost)](https://xgboost.readthedocs.io/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED.svg?style=flat&logo=docker)](https://www.docker.com/)
[![Statutory Compliance](https://img.shields.io/badge/Compliance-Sec_91_%7C_457_CrPC-10B981.svg)](#7-statutory-legal-automation--interdiction-workflows)
[![Evidence Admissibility](https://img.shields.io/badge/Evidence-Sec_65B_Certified-6366F1.svg)](#5-explainable-ai-xai--statutory-evidence-dossier)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📑 Table of Contents

1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [The "Golden Window" & Mule Layering Dynamics](#2-the-golden-window--mule-layering-dynamics)
3. [System Architecture & Polyglot Persistence](#3-system-architecture--polyglot-persistence)
4. [Dual-Branch AI & Predictive Intelligence Engine](#4-dual-branch-ai--predictive-intelligence-engine)
5. [Explainable AI (XAI) & Statutory Evidence Dossier](#5-explainable-ai-xai--statutory-evidence-dossier)
6. [Tactical Cyber Command Center (3-Zone UI)](#6-tactical-cyber-command-center-3-zone-ui)
7. [Statutory Legal Automation & Interdiction Workflows](#7-statutory-legal-automation--interdiction-workflows)
8. [Live Incident Simulation Engine](#8-live-incident-simulation-engine)
9. [Complete REST & WebSocket API Reference](#9-complete-rest--websocket-api-reference)
10. [Security Architecture & RBAC Policy](#10-security-architecture--rbac-policy)
11. [Project Directory Structure](#11-project-directory-structure)
12. [Local Installation & Docker Setup Guide](#12-local-installation--docker-setup-guide)
13. [Automated Verification & Test Suites](#13-automated-verification--test-suites)
14. [Hackathon & Institutional Context](#14-hackathon--institutional-context)

---

## 1. Executive Summary & Problem Statement

Modern financial cybercrime in India—spanning **UPI QR code deception, "Digital Arrest" extortion, part-time job/task scams, and fake institutional investment portals**—inflicts over **₹1,750+ Crore** in documented annual losses across citizen victims. 

Organized cyber syndicates do not store looted capital in primary suspect accounts. Instead, they exploit high-velocity, automated disbursement scripts that fracture stolen funds across complex, multi-tiered networks of compromised and synthetic "mule" bank accounts.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE MULE MONEY LAUNDERING TRAJECTORY                            │
│                                                                                                  │
│  [Citizen Victim]                                                                                │
│         │ (0 - 15 min: Deception / Transfer)                                                     │
│         ▼                                                                                        │
│  [Layer 1 Mule: Aggregator Account]                                                              │
│         │ (15 - 45 min: Splitting / Layering)                                                    │
│         ├───► [Layer 2 Mule: Intermediary A] ───► [Layer 3 Mule] ──┐                             │
│         │                                                          │ (180 - 240 min)             │
│         └───► [Layer 2 Mule: Intermediary B] ───► [Layer 3 Mule] ──┴─► [ATM Terminal Cash-Out]  │
│                                                                        (Physical Liquidation)    │
│                                                                                                  │
│  Traditional Response (24 to 72 hours): Funds Extracted ❌                                      │
│  RakshaNet Autonomous Response (< 60 seconds): Automated Freeze & Beat Interception 🎯           │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### The Systemic Failures of Traditional Antifraud Solutions:
1. **Isolated Single-Account Scrutiny:** Traditional banking fraud engines evaluate accounts in silos. Newly rented mule accounts with pristine KYC and zero complaint history pass rule-based threshold filters unnoticed.
2. **Inter-Agency Jurisdictional Latency:** Under existing protocols (CFCFRMS / 1930 manual intake), transmitting freeze requests between disparate commercial banks takes between 24 and 72 hours—by which time 90%+ of funds have been withdrawn as un-traceable physical cash.
3. **The Physical-Digital Disconnect:** Digital transaction analysis tools operate completely detached from physical policing. No system predicts *where* the physical cash-out will occur before the card or OTP hits the ATM.

### The RakshaNet Solution
**RakshaNet** transforms cybercrime response from **post-mortem forensic investigation** into **real-time, predictive interdiction**. By unifying:
- **Inductive Graph Neural Networks (GraphSAGE)** to classify unseen mule accounts based on transaction graph topology,
- **Geo-Spatial Density Forecasters (HDBSCAN + XGBoost)** to identify targeted ATM cash-out hubs in advance,
- **Statutory Legal Automation** under **Section 91 & 457 CrPC** to emit legally binding freeze notices to core banking systems in milliseconds,
- **Police Beat Dispatch Integration** to route the nearest patrol vehicle to the forecasted ATM cluster.

---

## 2. The "Golden Window" & Mule Layering Dynamics

Field studies by the Indian Cyber Crime Coordination Centre (I4C) indicate that the **Golden Window** for cyber-financial recovery is **180 to 240 minutes** from the moment of fraudulent debit. After this window, funds transition from digital ledger entries into physical banknotes.

| Timeline Milestone | Syndicate Activity | Traditional LEA Status | RakshaNet Autonomous Action |
|---|---|---|---|
| **$T_0 + 00\text{m}$ to $15\text{m}$** | Citizen reports fraud on helpline 1930 / NCRP portal. | Manual complaint logging; officer assignment pending. | Webhook ingestion; complaint parsed and correlated with transaction stream. |
| **$T_0 + 15\text{m}$ to $45\text{m}$** | Funds routed to Layer-1 mule; rapid fan-out to Layer-2/3 mules. | Inter-bank email / ticket generation; banks unnotified. | **GraphSAGE Link Predictor** flags high-risk mule ring topology; risk score calculated. |
| **$T_0 + 45\text{m}$ to $90\text{m}$** | Mule network conducts micro-splits to stay under ₹50,000 threshold. | Bureaucratic delay; jurisdiction verification. | **HDBSCAN + XGBoost** forecasts physical ATM cash-out hub based on mule geospatial history. |
| **$T_0 + 90\text{m}$ to $180\text{m}$** | Mules deploy physical runners / cards to target ATM corridors. | Notice under preparation by police clerk. | **Section 91 CrPC notice** emitted to bank API; nearest **Beat Marshal** alerted with GPS waypoint. |
| **$T_0 + 180\text{m}$ to $240\text{m}$** | ATM cash withdrawal attempts initiated. | Police arrive after transaction is completed (Failure). | **Account frozen at switch level**; physical runner apprehended at ATM terminal. |

---

## 3. System Architecture & Polyglot Persistence

RakshaNet is engineered on a resilient, polyglot microservice foundation ensuring sub-second throughput under enterprise national cybercrime complaint loads.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       INGESTION & INTAKE LAYER                                         │
│          • Citizen NCRP Complaint Stream (1930 Helpline)    • Core Banking ISO 20022 Webhooks          │
└───────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  POLYGLOT PERSISTENCE ARCHITECTURE                                     │
│                                                                                                        │
│   ┌──────────────────────────────┐ ┌──────────────────────────────┐ ┌──────────────────────────────┐   │
│   │   PostgreSQL 16 + PostGIS    │ │     Neo4j 5 Graph Database   │ │    Redis 7 In-Memory Cache   │   │
│   │   • Relational System of     │ │   • Multi-Hop Property Graph │ │   • Sub-ms Hot-State Cache   │   │
│   │     Record & Audit Trails    │ │     (:Account)-[:SENT]->     │ │   • Pub/Sub WebSocket Event  │   │
│   │   • PostGIS Spatial Points   │ │   • Real-Time Subgraph       │ │     Dispatcher for Alerts    │   │
│   │     (SRID 4326), ST_DWithin  │ │     Traversal (1 to 4 Hops)  │ │   • Distributed Concurrency  │   │
│   │   • Section 91/457 Registers │ │   • Adamic-Adar Proximity    │ │     Lock Coordinator         │   │
│   └──────────────────────────────┘ └──────────────────────────────┘ └──────────────────────────────┘   │
└───────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DUAL-BRANCH AI INFERENCE PIPELINE                                    │
│                                                                                                        │
│   ┌────────────────────────────────────────┐          ┌────────────────────────────────────────────┐   │
│   │   Branch A: Graph Link Predictor       │          │   Branch B: Geo-Spatial Hotspot Forecaster │   │
│   │   (Inductive GraphSAGE / PyTorch)      │          │   (HDBSCAN Clustering + XGBoost Spatial)   │   │
│   │   • Dynamic Neighborhood Embeddings    │          │   • Density-Based Cluster Geometry         │   │
│   │   • Velocity & Evacuation Ratios       │          │   • 6-Feature Spatial ATM Risk Weights     │   │
│   │   • Output: S_graph in [0, 1]          │          │   • Output: S_geo in [0, 1]                │   │
│   └───────────────────┬────────────────────┘          └─────────────────────┬──────────────────────┘   │
│                       └─────────────────────────┬───────────────────────────┘                          │
│                                                 ▼                                                      │
│                       ┌──────────────────────────────────────────────────┐                             │
│                       │   Score Fusion Decision Engine                   │                             │
│                       │   R_fused = 0.60 * S_graph + 0.40 * S_geo        │                             │
│                       │   Severity Tiers: CRITICAL (>=0.75) | ELEVATED   │                             │
│                       └─────────────────────────┬────────────────────────┘                             │
│                                                 ▼                                                      │
│                       ┌──────────────────────────────────────────────────┐                             │
│                       │   SHAP Forensic Explainability Engine            │                             │
│                       │   Court-Admissible Evidence Attribution Breakdown│                             │
│                       └─────────────────────────┬────────────────────────┘                             │
└───────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                TACTICAL COMMAND & STATUTORY INTERDICTION                               │
│   • Section 91 CrPC Automated Bank Lien Dispatch       • Beat Marshal Patrol GPS Dispatch              │
│   • Section 457 CrPC Victim Restitution Ledger         • 3-Zone Interactive Law Enforcement Portal    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Storage Engines & Justification

| Datastore | Version | Purpose in RakshaNet | Performance Characteristic |
|---|---|---|---|
| **PostgreSQL** | 16.2 | Relational source-of-truth for accounts, officers, complaints, dispatches, audit logs. | ACID transactional guarantees; relational foreign key integrity. |
| **PostGIS** | 3.4 | Spatial engine for geofencing, distance calculation (`ST_DistanceSphere`), and ATM clustering. | Sub-millisecond geographic proximity querying across millions of coordinates. |
| **Neo4j** | 5.18 | Property graph mapping directed money flows (`:Account`, `:Complaint`, `:Transaction`). | Constant-time local hop traversals regardless of total database volume. |
| **Redis** | 7.0 | In-memory caching, distributed rate-limiting, and WebSocket Pub/Sub event distribution. | Sub-millisecond event dispatching to thousands of concurrent officer terminals. |

---

## 4. Dual-Branch AI & Predictive Intelligence Engine

RakshaNet repudiates monolithic, opaque neural models in favor of a **dual-branch decoupled architecture** that marries topological graph intelligence with geospatial behavioral forecasting.

```
                  ┌───────────────────────────────┐
                  │   Incoming Fraud Incident    │
                  └───────────────┬───────────────┘
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
   ┌───────────────────────────┐     ┌───────────────────────────┐
   │  Branch A: Topological    │     │  Branch B: Geo-Spatial    │
   │  Graph Link Predictor     │     │  Hotspot Forecaster       │
   │  (GraphSAGE / PyTorch)    │     │  (HDBSCAN + XGBoost)      │
   └─────────────┬─────────────┘     └─────────────┬─────────────┘
                 │ S_graph                         │ S_geo
                 └────────────────┬────────────────┘
                                  ▼
                 ┌─────────────────────────────────┐
                 │    Score Fusion & SHAP XAI      │
                 │    R_fused = 0.6·Sg + 0.4·Sgeo  │
                 └────────────────┬────────────────┘
                                  ▼
                 ┌─────────────────────────────────┐
                 │  Statutory Actionable Directive │
                 └─────────────────────────────────┘
```

### Branch A: Inductive Graph Neural Network (GraphSAGE)

Traditional graph methods (like DeepWalk or standard GCNs) are transductive—they cannot score nodes that were not present during training. In cyber-financial crime, syndicates generate brand new mule accounts continuously. RakshaNet employs **Inductive GraphSAGE (Sample and Aggregate)** to generate real-time node embeddings for newly observed accounts:

$$\mathbf{h}_{\mathcal{N}(v)}^{(k)} = \text{AGGREGATE}_k \left( \left\{ \mathbf{h}_u^{(k-1)}, \forall u \in \mathcal{N}(v) \right\} \right)$$

$$\mathbf{h}_v^{(k)} = \sigma \left( \mathbf{W}^{(k)} \cdot \left[ \mathbf{h}_v^{(k-1)} \,\|\, \mathbf{h}_{\mathcal{N}(v)}^{(k)} \right] \right)$$

#### Topological Features Extracted:
1. **Adamic-Adar Structural Proximity:** Penalizes shared common nodes with high global degree to pinpoint covert mule bridges:
   $$\text{Score}_{\text{AA}}(u, v) = \sum_{w \in \mathcal{N}(u) \cap \mathcal{N}(v)} \frac{1}{\log |\mathcal{N}(w)|}$$
2. **Fund Evacuation Ratio:** Proportion of inbound stolen funds transferred out within 15 minutes:
   $$\text{EvacRatio} = \frac{\sum \text{Outflow}_{\Delta t \le 15\text{m}}}{\sum \text{Inflow}}$$
3. **Directed In-Degree to Out-Degree Skew:** Distinguishes aggregator accounts (high in, low out count) from distributor accounts (single in, wide fan-out).

### Branch B: Geo-Spatial ATM Hotspot Forecasting (HDBSCAN + XGBoost)

Once a mule ring is detected, the critical task is preventing physical cash liquidation. Branch B predicts which ATM terminals will be targeted:

1. **Unsupervised Spatial Density Clustering (HDBSCAN):**
   - Applies the Haversine metric on geographic coordinates $(\text{lat}, \text{lon})$ of historical cash-out points and citizen incident locations.
   - Automatically identifies irregularly shaped urban crime corridors (e.g., Dadar/Matunga in Mumbai, Connaught Place in Delhi) without requiring a pre-specified cluster count $k$.
2. **Supervised Spatial Gradient Boosting (XGBoost):**
   - An optimized tree model evaluates each candidate ATM against 6 spatial-temporal attributes:
     - `cluster_size`: Total number of co-located terminals within the spatial cluster.
     - `nearby_complaints`: Total citizen complaints registered within a 5 km radius.
     - `total_loss_nearby`: Gross quantum of stolen capital routed through the sector.
     - `cash_out_frequency`: Historical terminal transaction velocity within the past 48 hours.
     - `is_in_hotspot_city`: Geographic weight multiplier for Tier-1 cybercrime epicenters.
     - `atm_density_5km`: Local terminal redundancy index (allowing mules to hop between machines).

### Decision Engine & Risk Fusion

The outputs of both branches are synthesized by the **Risk Fusion Decision Engine**:

$$R_{\text{fused}} = \alpha \cdot S_{\text{graph}} + (1 - \alpha) \cdot S_{\text{geo}} \quad \text{where } \alpha = 0.60$$

| Threat Severity | Score Range | Operational Directive | Automated System Response |
|---|---|---|---|
| **CRITICAL** | $R_{\text{fused}} \ge 0.75$ | Imminent Physical Liquidation | Section 91 CrPC notice emitted; Beat Marshal dispatch queued; Audio chime on UI. |
| **ELEVATED** | $0.40 \le R_{\text{fused}} < 0.75$ | Active Layering / Splitting | Top-tier placement in review feed; graph highlighted in yellow; bank notified. |
| **LOW** | $R_{\text{fused}} < 0.40$ | Telemetry Monitoring | Logged in background audit index; continuous passive monitoring. |

---

## 5. Explainable AI (XAI) & Statutory Evidence Dossier

In Indian jurisprudence, automated machine-learning decisions cannot stand alone. Under **Section 65B of the Indian Evidence Act**, evidence derived from computer systems must provide a verifiable, transparent chain of reasoning.

RakshaNet implements **SHAP (SHapley Additive exPlanations)** to dissect the exact feature contributions for every interdiction decision:

$$\phi_i(x) = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|!(|F| - |S| - 1)!}{|F|!} \left[ f(S \cup \{i\}) - f(S) \right]$$

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             COURT-ADMISSIBLE EVIDENCE DOCKET (SAMPLE)                           │
│  Target Account: 918234901238 (SBI)  |  Suspect: Priya Suresh Sharma  |  Risk: 0.94 (CRITICAL)   │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│  SHAP Factor Attribution:                                                                        │
│  [████████████████████] +0.30  Direct Fraud Proximity: 1 Hop from NCRP Complaint #2026-MUM-4821 │
│  [████████████████]     +0.25  Rapid Fund Evacuation: 92% of funds transferred out in 12 min     │
│  [██████████████]       +0.22  Predictive Cash-Out Hotspot: Matunga / Dadar West ATM Cluster     │
│  [████████]             +0.12  Abnormal Out-Degree Spike: 7 fan-out transfers to layer-2 nodes   │
│  [███]                  +0.05  Unusual Night-Time Velocity: Transactions executed at 02:41 AM    │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Judicial Hash: SHA-256: 8f4b23c91a02d45e6b7...  |  Officer Authorization: LE-CYBER-MUM-4029   │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

The system automatically generates a **Master Legal Dossier** containing:
- Chronological transaction audit trail with cryptographic timestamps,
- Interactive network topology diagram snapshot,
- Section 91 CrPC compliance certificate,
- Section 65B Indian Evidence Act electronic affidavit.

---

## 6. Tactical Cyber Command Center (3-Zone UI)

The frontend is constructed using **React 18, Vite, and Vanilla CSS tokens**, providing a high-contrast tactical operations layout designed for 24/7 law enforcement monitoring centers.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  RAKSHANET TACTICAL COMMAND STUDIO                        [LIVE] LE-CYBER-MUM-4029 🛡️           │
├─────────────────────────┬──────────────────────────────────────┬─────────────────────────────────┤
│  ZONE 1: THREAT FEED    │  ZONE 2: MULTI-HOP TOPOLOGY GRAPH    │  ZONE 3: INTERDICTION TERMINAL  │
│  • WebSocket Streaming  │  • Interactive SVG/Canvas Graph      │  • Leaflet Geospatial Hotspots  │
│  • Severity Badges      │  • Directional Fund Flow Edges       │  • PostGIS Geofenced Circles    │
│  • Audio Alert Chimes   │  • Node Inspector (Victim, Mule, ATM)│  • Beat Marshal GPS Pins        │
│  • Search & Filter      │  • Multi-Tier Path Highlighting      │  • 1-Click Sec 91 CrPC Freeze   │
│  • Real-Time Statistics │  • Dynamic Physics Layout            │  • SHAP Explainability Cards    │
└─────────────────────────┴──────────────────────────────────────┴─────────────────────────────────┘
```

### Zone Breakdown:
1. **Zone 1: Real-Time Threat Feed (Left Panel)**
   - Displays incoming alerts streaming directly over WebSockets (`/ws/alerts`).
   - Categorizes incidents by severity (`CRITICAL`, `ELEVATED`, `LOW`).
   - Web Audio API radar chimes alert operators when high-severity threats arrive.
2. **Zone 2: Topological Graph Canvas (Center Panel)**
   - Renders directed transaction lineages across 1 to 4 hops.
   - Distinct color-coded nodes:
     - 🔴 **Red:** Confirmed victim accounts.
     - 🟠 **Orange:** Suspect layer-1 aggregator mules.
     - 🟡 **Yellow:** Layer-2/3 routing intermediaries.
     - 🟣 **Purple:** Target ATM terminal cash-out nodes.
   - Click-to-inspect displays full account balance, bank name, holder name, and transaction velocity.
3. **Zone 3: Interdiction & Evidence Terminal (Right Panel)**
   - Embedded Leaflet map displaying real-time ATM risk clusters, colored by threat intensity.
   - Real-time GPS markers of active police beat patrol units (`PATROL-MH-01`, `PATROL-MH-02`).
   - Instant action triggers: **"Freeze Target Accounts (Sec 91 CrPC)"** and **"Dispatch Beat Marshal"**.

---

## 7. Statutory Legal Automation & Interdiction Workflows

RakshaNet is built specifically for Indian Law Enforcement operational compliance, translating technical alerts into enforceable legal instruments:

```
                  ┌───────────────────────────────┐
                  │    Confirmed Mule Detected    │
                  └───────────────┬───────────────┘
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
   ┌───────────────────────────┐     ┌───────────────────────────┐
   │    Section 91 CrPC        │     │     Section 457 CrPC      │
   │    Automated Freeze Notice│     │     Restitution Protocol  │
   └─────────────┬─────────────┘     └─────────────┬─────────────┘
                 │                                 │
                 ▼                                 ▼
   ┌───────────────────────────┐     ┌───────────────────────────┐
   │ Core Banking Gateway Lien │     │ Digital Escrow & Judicial │
   │ (CFCFRMS ISO 20022 Notice)│     │ Return to Victim Account  │
   └───────────────────────────┘     └───────────────────────────┘
```

### 1. Section 91 CrPC Automated Bank Lien Gateway
- Automatically generates a legally compliant notice under Section 91 of the Code of Criminal Procedure (Summons to produce document or other thing).
- Dispatches electronic debit-freeze instructions to partner bank gateways.
- Records bank response, transaction reference, and timestamp in the immutable audit log.

### 2. Section 457 CrPC Victim Fund Restitution Ledger
- When funds are frozen before liquidation, they enter a state of **Secured Digital Escrow**.
- Section 457 CrPC regulates the disposal of seized property by police officers.
- RakshaNet maintains an automated restitution ledger tracking the full chain of custody from victim debit to recovery, enabling magistrate courts to release seized funds back to victims in days rather than years.

### 3. Police Beat Marshal Dynamic GPS Routing
- Real-time spatial query calculates the geodesic distance between active patrol cars and the threatened ATM cluster:
  $$d = 2R \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)} \right)$$
- Dispatches direct intercept coordinates, suspect vehicle/mule descriptions, and ETA estimates to the nearest beat officer.

---

## 8. Live Incident Simulation Engine

To enable rigorous evaluation, training, and demonstrations, RakshaNet incorporates a built-in **Live Attack Injection Engine** with three calibrated cybercrime scenarios:

| Scenario Title | Category | Stolen Quantum | Attack Signature | Predicted Liquidation Terminal |
|---|---|---|---|---|
| **Mumbai UPI QR Code Syndicate** | UPI Phishing | ₹1,20,000 | Dynamic QR spoofing; rapid layer-1 splitting across SBI and ICICI mules. | Matunga / Dadar West ATM Cluster (Mumbai) |
| **Delhi-NCR Digital Arrest Extortion** | Extortion / Impersonation | ₹4,50,000 | Coercive video-call intimidation; high-volume corporate mule dispersal. | Connaught Place Financial Hub (New Delhi) |
| **Bengaluru Task Fraud Ring** | Investment / Telegram | ₹2,80,000 | Multi-level commission bait; high out-degree fan-out to tech corridor accounts. | Koramangala / Whitefield IT Corridor (Bengaluru) |

### Demonstration Execution Walkthrough:
1. Access the Command Center using an officer account (e.g., `LE-CYBER-MUM-4029` / PIN: `1234`).
2. Click **"⚡ Simulate Attack"** in the top navigation header.
3. Select an attack scenario and click **"Inject Incident into Live Network"**.
4. The system executes the complete lifecycle:
   - Ingestion of synthetic citizen complaint,
   - Neo4j graph injection of multi-hop transactions,
   - Real-time inference through GraphSAGE and XGBoost,
   - WebSocket broadcast of threat alert with audio alert chime,
   - Evidence docket expansion with SHAP attribution bars,
   - 1-click execution of Section 91 CrPC freeze and beat marshal dispatch.

---

## 9. Complete REST & WebSocket API Reference

The backend exposes a fully documented, OpenAPI 3.1-compliant REST interface.

### Authentication & Officer Operations
| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | Authenticates LEA officer via Badge ID + PIN; issues JWT token. |
| `POST` | `/api/v1/auth/refresh` | Bearer Token | Extends valid officer session; issues renewed access token. |
| `GET` | `/api/v1/auth/me` | Bearer Token | Retrieves authenticated officer profile, division, and clearance level. |

### Threat Intelligence & Case Management
| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `GET` | `/api/v1/alerts` | Bearer Token | Paginated query of active threat alerts; supports severity and status filters. |
| `GET` | `/api/v1/alerts/{alert_id}` | Bearer Token | Returns complete alert record with graph scores, geo scores, and SHAP factors. |
| `PATCH` | `/api/v1/alerts/{alert_id}/status` | Bearer Token | Updates alert operational status (`INVESTIGATING`, `FROZEN`, `DISMISSED`). |
| `GET` | `/api/v1/stats/overview` | Bearer Token | Aggregated command statistics (total seized, active mules, response velocity). |

### Predictive AI & Geospatial Hotspots
| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `GET` | `/api/v1/heatmap/hotspots` | Bearer Token | Returns HDBSCAN spatial clusters and high-risk ATM terminals with coordinates. |
| `GET` | `/api/v1/heatmap/atms` | Bearer Token | Returns individual ATM terminal locations, risk tiers, and transaction volume. |
| `POST` | `/api/v1/dossier/generate` | Bearer Token | Compiles and generates court-admissible PDF legal evidence dossier. |

### Statutory Interdiction & Police Operations
| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `POST` | `/api/v1/freeze/execute` | Superintendent+ | Emits Section 91 CrPC electronic debit freeze notice to partner bank. |
| `GET` | `/api/v1/freeze/records` | Bearer Token | Lists all executed statutory freeze orders with bank acknowledgment codes. |
| `GET` | `/api/v1/patrols/nearby` | Bearer Token | Queries PostGIS for nearest active beat patrol vehicles within radius. |
| `POST` | `/api/v1/patrols/dispatch` | Bearer Token | Dispatches patrol unit with targeted ATM waypoint and ETA calculation. |
| `GET` | `/api/v1/restitution/cases` | Bearer Token | Retrieves Section 457 CrPC digital escrow recovery and restitution register. |

### Live Simulation Engine
| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `GET` | `/api/v1/demo/scenarios` | Bearer Token | Lists all pre-calibrated cybercrime attack scenarios. |
| `POST` | `/api/v1/demo/simulate-attack` | Bearer Token | Injects multi-hop incident into live database, triggers AI, broadcasts alert. |

### Real-Time WebSocket Channel
- **Endpoint:** `ws://<host>:<port>/ws/alerts`
- **Protocol:** JSON message frame broadcast
- **Events Emitted:**
  - `alert.new`: Dispatched instantaneously when a new threat is flagged by the AI engine.
  - `freeze.confirmed`: Emitted when a partner bank acknowledges a Section 91 CrPC freeze.
  - `patrol.dispatched`: Emitted when a beat marshal acknowledges tactical waypoint assignment.

---

## 10. Security Architecture & RBAC Policy

RakshaNet is engineered in strict compliance with the **Bureau of Police Research and Development (BPR&D)** cybersecurity guidelines:

1. **Zero-Credential-Leakage Policy:**
   - Strict separation of application code from operational secrets.
   - All connection URIs, database credentials, and signing keys are injected via environment variables.
   - Repository tracking excludes `.env`, credential backups, and build artifacts.
2. **Role-Based Access Control (RBAC):**
   - Cryptographically signed JWT tokens (`HS256`) with strict expiry windows.
   - Three distinct operational clearance levels:
     - `INVESTIGATING_OFFICER`: View alerts, inspect graphs, generate investigation notes.
     - `SUPERINTENDENT`: Authorize Section 91 CrPC bank freezes and law enforcement dispatches.
     - `I4C_NATIONAL_COORDINATOR`: Cross-state jurisdiction oversight, national statistics, and audit logs.
3. **Immutable Forensic Audit Trail:**
   - Every login, alert status change, statutory freeze order, and patrol dispatch is permanently recorded in the `audit_logs` table.
   - Each audit entry captures:
     - Timestamp (ISO 8601 UTC),
     - Officer Badge ID and IP Address,
     - Action category and payload snapshot,
     - Cryptographic SHA-256 integrity hash chaining to prevent retroactive alteration.

---

## 11. Project Directory Structure

```
RakshaNet/
├── backend/                                # FastAPI Microservice Backend
│   ├── Dockerfile                          # Production container specification (Python 3.11-slim)
│   ├── requirements.txt                    # Pinned Python package dependencies
│   ├── alembic.ini                         # Database migration configuration
│   └── app/
│       ├── main.py                         # Application lifecycle, CORS, route registration
│       ├── config.py                       # Pydantic BaseSettings with dynamic URI parsing
│       ├── api/                            # REST endpoint controllers
│       │   ├── auth.py                     # LEA officer authentication & JWT management
│       │   ├── alerts.py                   # Threat queue, filtering, and status updates
│       │   ├── demo.py                     # Live attack injection & simulation endpoints
│       │   ├── dossier.py                  # Legal PDF report generation service
│       │   ├── freeze.py                   # Section 91 CrPC automated freeze gateway
│       │   ├── heatmap.py                  # Geospatial ATM risk cluster endpoints
│       │   ├── patrols.py                  # Beat marshal GPS tracking and dispatch
│       │   ├── restitution.py              # Section 457 CrPC victim recovery ledger
│       │   └── stats.py                    # Macro command center analytics
│       ├── ai/                             # Dual-Branch AI & Explainability Engine
│       │   ├── graph_predictor.py          # Inductive GraphSAGE link prediction
│       │   ├── geo_hotspot.py              # HDBSCAN clustering + XGBoost ATM risk scoring
│       │   ├── risk_fusion.py              # Dual-branch weighted risk fusion engine
│       │   ├── shap_explainer.py           # Court-admissible SHAP feature attribution
│       │   └── models/                     # Serialized XGBoost model artifacts
│       ├── db/                             # Multi-Database connectivity layer
│       │   ├── postgres.py                 # Async SQLAlchemy + PostGIS connection engine
│       │   ├── neo4j_driver.py             # Async Neo4j Bolt driver session pool
│       │   ├── redis_client.py             # Async Redis client with TLS connection support
│       │   ├── init_db.py                  # Automated schema and spatial index bootstrap
│       │   └── init_officers.py            # LEA officer seed records
│       ├── models/                         # SQLAlchemy ORM entity definitions
│       │   ├── account.py                  # Bank account entity with risk metrics
│       │   ├── alert.py                    # Real-time threat alert record
│       │   ├── atm_location.py             # ATM terminal entity with PostGIS geometry
│       │   ├── audit_log.py                # Append-only forensic action log
│       │   ├── complaint.py                # NCRP citizen fraud complaint
│       │   ├── officer.py                  # Law enforcement officer credentials & role
│       │   ├── patrol_unit.py              # Active police patrol vehicle with GPS coordinates
│       │   ├── restitution.py              # Digital escrow seized fund recovery ledger
│       │   └── transaction.py              # Inter-account money transfer ledger
│       ├── realtime/                       # Real-Time Event Distribution
│       │   ├── dispatcher.py               # Redis Pub/Sub event publisher
│       │   └── socket_server.py            # WebSocket connection manager & broadcast hub
│       ├── schemas/                        # Pydantic validation & serialization schemas
│       └── services/                       # Business logic and cross-service orchestration
│
├── frontend/                               # React 18 Cyber Command Operations Center
│   ├── Dockerfile                          # Production Nginx Alpine container
│   ├── package.json                        # Frontend dependencies (React, Vite, Leaflet, Lucide)
│   ├── vite.config.js                      # Vite bundler & development proxy configuration
│   ├── nginx.conf                          # Production reverse proxy & security headers
│   ├── vercel.json                         # Client-side routing configuration
│   └── src/
│       ├── App.jsx                         # Root application component & layout routing
│       ├── main.jsx                        # React 18 DOM entrypoint
│       ├── index.css                       # Tactical dark-theme CSS design system
│       ├── components/                     # Modular tactical interface components
│       │   ├── alerts/                     # Zone 1: Threat feed & real-time alert cards
│       │   ├── graph/                      # Zone 2: Interactive transaction topology graph
│       │   ├── map/                        # Zone 3: Leaflet geospatial ATM hotspot map
│       │   ├── docket/                     # Case Evidence Docket & SHAP factor display
│       │   ├── demo/                       # Attack simulation modal & scenario selector
│       │   ├── patrols/                    # Beat marshal patrol dispatch modal
│       │   └── restitution/                # Section 457 CrPC victim restitution modal
│       ├── contexts/                       # React context providers (AuthContext, AlertContext)
│       ├── hooks/                          # Custom React hooks (useAlerts, useSocket, useApi)
│       └── utils/                          # API client, audio synthesizer, and constants
│
├── scripts/                                # Verification, Seeding, and Tooling
│   ├── demo_scenario.py                    # Headless end-to-end incident simulation script
│   ├── generate_technical_dossier_pdf.py   # PDF master documentation compiler
│   └── verify_phase*.py                    # Automated test suites for all project phases
│
├── docker-compose.yml                      # Local multi-database composition specification
├── .env.example                            # Documented environment variable template
└── .gitignore                              # Comprehensive secret and build artifact filter
```

---

## 12. Local Installation & Docker Setup Guide

### Prerequisites
- **Docker & Docker Compose** (v24.0+)
- **Python** (v3.11+)
- **Node.js** (v18.0+) and `npm`

### Step 1: Repository Initialization
```bash
git clone https://github.com/parthkharat20/RakshaNet.git
cd RakshaNet
cp .env.example .env
```
*(Review `.env` to verify your local configuration).*

### Step 2: Provision Multi-Database Infrastructure
Launch the database tier using the pre-configured `docker-compose.yml`:
```bash
docker compose up -d postgres neo4j redis
```

This starts:
- **PostgreSQL 16 + PostGIS:** `localhost:5432` (Database: `rakshanet`, User: `raksha`)
- **Neo4j 5 Community:** `localhost:7474` (Bolt Protocol: `localhost:7687`)
- **Redis 7 In-Memory Engine:** `localhost:6379`

### Step 3: Configure and Start the FastAPI Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Launch FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Note: Database tables, spatial PostGIS indexes, and initial demo officers are seeded automatically on first startup.*

- **Interactive API Documentation (Swagger UI):** `http://localhost:8000/docs`
- **Alternative ReDoc Documentation:** `http://localhost:8000/redoc`

### Step 4: Configure and Start the Tactical Frontend
```bash
cd ../frontend
npm install
npm run dev
```

The Command Center interface will be available at:
- **Command Center URL:** `http://localhost:5173`

---

## 13. Automated Verification & Test Suites

RakshaNet includes end-to-end automated verification scripts covering all architectural layers:

### Running Phase Verification Scripts
```bash
# Verify database connections (Postgres, PostGIS, Neo4j, Redis)
python3 scripts/verify_phase1.py

# Verify synthetic data generator & graph ingestion
python3 scripts/verify_phase2.py

# Verify GraphSAGE, HDBSCAN, and XGBoost model outputs
python3 scripts/verify_phase3.py

# Verify API endpoints, JWT auth, and RBAC permissions
python3 scripts/verify_phase5.py

# Verify Section 91 CrPC freeze gateway and audit logging
python3 scripts/verify_phase6.py

# Verify WebSocket alert dispatch and Pub/Sub delivery
python3 scripts/verify_phase7.py

# Verify Section 457 CrPC restitution ledger
python3 scripts/verify_phase8.py

# Verify end-to-end incident simulation pipeline
python3 scripts/verify_phase9.py
```

### Running Headless End-to-End Simulation
To run a complete simulated attack and interdiction workflow directly from the command line:
```bash
python3 scripts/demo_scenario.py
```

---

## 14. Hackathon & Institutional Context

### Pre-Configured Law Enforcement Demo Credentials
For testing and demonstration evaluations:

| Officer Name | Badge ID | Access PIN | Assigned Jurisdiction | Role Level |
|---|---|---|---|---|
| **Inspector Parth Kharat** | `LE-CYBER-MUM-4029` | `1234` | Maharashtra Cyber Cell (I4C) | `INVESTIGATING_OFFICER` |
| **SP Rajesh Kumar** | `LE-CYBER-DEL-1001` | `5678` | Delhi Cyber Crime Branch | `SUPERINTENDENT` |
| **ASP Priya Sharma** | `LE-CYBER-BLR-2045` | `9012` | Karnataka CID Cyber Division | `INVESTIGATING_OFFICER` |
| **DIG Vikram Singh** | `LE-I4C-HQ-0001` | `admin` | I4C National Command Centre | `I4C_NATIONAL_COORDINATOR` |

---

### Developed for Public Safety & Cyber Defense Innovation
RakshaNet was architected as an operational framework addressing the escalating challenges of cyber-financial fraud in India, providing a tangible, reproducible bridge between advanced graph artificial intelligence and frontline law enforcement interdiction.

**License:** [MIT License](LICENSE) — Open for evaluation, research, and non-commercial law enforcement adaptation.
