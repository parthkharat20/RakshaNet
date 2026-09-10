# RakshaNet 🛡️
### Autonomous Cyber-Financial Fraud Interdiction & Predictive Cash-Out Intelligence Grid
*Designed for Law Enforcement Agencies (LEAs), the Indian Cyber Crime Coordination Centre (I4C), and Banking Partner Networks.*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.0-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-PostGIS_3.4-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Neo4j](https://img.shields.io/badge/Neo4j-5.18_Aura-45818e.svg?style=flat&logo=neo4j)](https://neo4j.com/)
[![Redis](https://img.shields.io/badge/Redis-7.0_PubSub-DC382D.svg?style=flat&logo=redis)](https://redis.io/)
[![PyTorch](https://img.shields.io/badge/PyTorch_Geometric-2.5.0-EE4C2C.svg?style=flat&logo=pytorch)](https://pyg.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0.3-EB8E3B.svg?style=flat&logo=xgboost)](https://xgboost.readthedocs.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=flat&logo=docker)](https://www.docker.com/)

---

## 1. Executive Summary & Problem Context

In modern cyber-financial crime (e.g., UPI QR scams, Digital Arrest extortion, task-based investment fraud), illicit funds do not remain in the primary suspect account. Instead, syndicates execute rapid, multi-tier fund dissipation across synthetic and compromised mule accounts:

```
[Citizen Victim] ──(15 min)──> [Layer 1 Mule] ──(30 min)──> [Layer 2-4 Mule Ring] ──(180-240 min)──> [ATM Cash-Out Hotspots]
                                                                                                            │
Traditional Response (24 - 72 hours) ────> Funds Permanently Liquidated ❌                                   │
RakshaNet Dual-AI Interdiction (< 60s)  ────> Pre-emptive Lien & Police Beat Interception 🎯 ───────────────┘
```

### The Critical "Golden Window" Challenge
- **Dissipation Velocity:** Over 85% of defrauded funds are withdrawn as physical cash within **180 to 240 minutes** of initial debit.
- **Traditional Limitation:** Standard banking antifraud evaluates individual account transaction histories in isolation. When a newly recruited mule account has zero prior complaints, traditional rule engines fail to flag it.
- **The RakshaNet Paradigm:** RakshaNet shifts antifraud response from **reactive forensic accounting** to **proactive topological interdiction**. By evaluating structural position within an inductive transaction graph (GraphSAGE) and forecasting physical ATM withdrawal corridors (PostGIS + XGBoost), RakshaNet freezes downstream mule hops and alerts field patrol units **before** cash-out occurs.

---

## 2. Technical Architecture & Data Infrastructure

RakshaNet utilizes a polyglot, microservice-ready backend architecture paired with an authentic cyber command operations center.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 INGESTION & TELEMETRY GATEWAY                          │
│          • Citizen NCRP Complaint Portal Feed   • Core Banking Webhooks (ISO 20022)    │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               POLYGLOT STORAGE ENGINE                                  │
│  ┌─────────────────────────────┐ ┌──────────────────────────┐ ┌──────────────────────┐ │
│  │   PostgreSQL 16 + PostGIS   │ │    Neo4j Graph Database  │ │   Redis In-Memory    │ │
│  │   • Relational Source-of-   │ │   • Multi-Hop Property   │ │   • Hot-State Cache  │ │
│  │     Record & Audit Logs     │ │     Graph (Adamic-Adar)  │ │   • Sub-ms WebSocket │ │
│  │   • Spatial ATM & Incident  │ │   • Rapid Subgraph Hop   │ │     Pub/Sub Event    │ │
│  │     Geometries (SRID 4326)  │ │     Neighborhood Traversal│ │     Dispatcher       │ │
│  └─────────────────────────────┘ └──────────────────────────┘ └──────────────────────┘ │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             DUAL-BRANCH AI PREDICTIVE ENGINE                           │
│  ┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐ │
│  │   Branch A: Graph Link Predictor     │     │  Branch B: Geo-Spatial Forecaster    │ │
│  │   (GraphSAGE / PyTorch Geometric)    │     │  (HDBSCAN + XGBoost Spatial Weights) │ │
│  │   • Inductive Node Embeddings        │     │  • Spatial Density Hotspot Clust.    │ │
│  │   • Layering & Velocity Heuristics   │     │  • PostGIS Geofenced Cash-Out Points │ │
│  └──────────────────┬───────────────────┘     └──────────────────┬───────────────────┘ │
│                     └─────────────────────┬──────────────────────┘                     │
│                                           ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Score Fusion Decision Engine:  R_fused = 0.60·S_graph + 0.40·S_geo              │  │
│  │  SHAP Explainability Engine:    Court-Admissible Feature Attribution & Audit Card│  │
│  └────────────────────────────────────────┬─────────────────────────────────────────┘  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        TACTICAL INTERDICTION & OPERATIONAL UI                          │
│   • Section 91 CrPC Automated Bank Lien Gateway (CFCFRMS Electronic Notices)           │
│   • Dynamic Police Patrol Dispatching (Nearest Beat Marshal GPS Routing)               │
│   • 3-Zone Interactive Command Studio (React 18, Leaflet GeoJSON, D3 Graph Canvas)    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Dual-Branch AI & Explainability Engine

### Branch A: Inductive Graph Neural Network (GraphSAGE)
- **Topological Link Prediction:** Computes local neighborhood embeddings across directed transaction graphs $\mathcal{G} = (\mathcal{V}, \mathcal{E})$.
- **Zero-History Detection:** Identifies mule bridge nodes using Adamic-Adar structural proximity and topological degree metrics:
  $$\text{Score}_{\text{AA}}(u, v) = \sum_{w \in N(u) \cap N(v)} \frac{1}{\log |N(w)|}$$
- **Velocity Tracking:** Quantifies rapid fund evacuation ratios ($\frac{\text{Outflow}}{\text{Inflow}}$ within 15-minute intervals).

### Branch B: Geo-Spatial ATM Hotspot Forecasting (HDBSCAN + XGBoost)
- **Spatial Density Clustering:** Utilizes HDBSCAN on coordinate tuples $(\text{lat}, \text{lon})$ with the Haversine metric to locate emerging fraud epicenters without requiring manual cluster count hyperparameter tuning.
- **XGBoost Cash-Out Classifier:** Ranks high-risk terminals using 6 spatial features:
  1. `cluster_size`: Density of nearby ATMs in the active cluster.
  2. `nearby_complaints`: Total citizen complaints within a 5 km radius.
  3. `total_loss_nearby`: Cumulative stolen funds routed through the sector.
  4. `cash_out_frequency`: Historical terminal transaction velocity.
  5. `is_in_hotspot_city`: Geographic indicator for organized cybercrime corridors.
  6. `atm_density_5km`: Local terminal redundancy ratio.

### Decision Engine & Explainable AI (SHAP)
- **Risk Fusion:** Computes a calibrated threat composite score:
  $$R_{\text{fused}} = 0.60 \cdot S_{\text{graph}} + 0.40 \cdot S_{\text{geo}}$$
- **Forensic Explainability:** Generates court-admissible feature attribution breakdowns compliant with the Indian Evidence Act, explaining precisely *why* an account was flagged (e.g., proximity to complaint, evacuation ratio, and forecasted cash-out terminal).

---

## 4. Key Functional Capabilities

### 1. Three-Zone Cyber Command Studio
- **Zone 1 (Threat Intelligence Feed):** Real-time stream of incoming NCRP complaints, automated severity categorization (Critical $\ge 0.75$, Elevated $\ge 0.40$), and suspect account metadata.
- **Zone 2 (Multi-Hop Topology Graph):** Interactive D3/SVG canvas rendering transaction lineage across 1-hop, 2-hop, and 3-hop hops, color-coded by node archetype (Victim, Mule Collector, Layering Intermediary, ATM Terminal).
- **Zone 3 (Predictive Interdiction Terminal):** Evidence docket displaying SHAP factor impact scores, target account risk analytics, statutory lien dispatch controls, and beat marshal GPS routing.

### 2. Live Incident Simulation Engine
Pre-configured, benchmark-calibrated cybercrime attack scenarios designed for live demonstration:
1. **Mumbai UPI QR Code Syndicate (₹1,20,000):** Rapid layering across SBI/ICICI mule tiers with cash-out predicted at Matunga / Dadar West ATM Hub.
2. **Delhi-NCR Digital Arrest Extortion (₹4,50,000):** High-velocity corporate mule dispersal with multi-terminal withdrawal forecasting along Connaught Place.
3. **Bengaluru Part-Time Job / Task Scam (₹2,80,000):** High out-degree fan-out tree across Whitefield & Koramangala IT corridor accounts.

### 3. Statutory Compliance & Interdiction Workflows
- **Section 91 CrPC Automated Bank Liens:** Emits structured electronic notices to partner banks to lock suspect funds in transit.
- **Section 457 CrPC Restitution Protocol:** Tracks frozen balances in digital escrow to facilitate rapid court-directed victim reimbursement.
- **Police Beat Marshal Routing:** Automatically correlates the nearest active patrol vehicle with the target ATM cluster for physical interdiction.

---

## 5. Security Architecture & Standards Compliance

- **Zero-Secret-Leakage Architecture:** Strict decoupling of application binaries from secrets. No credentials, tokens, or environment keys are committed to Git.
- **Role-Based Access Control (RBAC):** Token-based authentication using cryptographically signed JWTs (`HS256`), supporting specialized law enforcement roles (Investigating Officer, SP/Superintendent, I4C National Coordinator).
- **Forensic Audit Integrity:** All actions (login events, simulation triggers, freeze orders, patrol dispatches) are permanently written to an append-only `audit_logs` table with client IP, timestamp, and SHA-256 hash validation.

---

## 6. Repository Structure

```
RakshaNet/
├── backend/                            # FastAPI Microservices Backend
│   ├── Dockerfile                      # Production container spec (Python 3.11-slim)
│   ├── requirements.txt                # Python dependencies
│   └── app/
│       ├── main.py                     # FastAPI application entrypoint & background bootstrap
│       ├── config.py                   # Pydantic Settings with dynamic URL normalization
│       ├── api/                        # API route controllers
│       │   ├── auth.py                 # LEA officer authentication & JWT issuance
│       │   ├── alerts.py               # Threat intelligence queue & filtering
│       │   ├── demo.py                 # Live Attack Simulation endpoints
│       │   ├── freeze.py               # Section 91 CrPC statutory lien gateway
│       │   ├── heatmap.py              # Geospatial ATM risk cluster endpoints
│       │   ├── patrols.py              # Patrol unit tracking & beat dispatch
│       │   ├── restitution.py          # Section 457 CrPC victim fund restitution
│       │   └── stats.py                # Macro command overview analytics
│       ├── ai/                         # Machine Learning & Explainable AI
│       │   ├── graph_predictor.py      # Inductive GraphSAGE & link prediction
│       │   ├── geo_hotspot.py          # HDBSCAN clustering & XGBoost ATM scoring
│       │   ├── risk_fusion.py          # Dual-branch fusion decision engine
│       │   ├── shap_explainer.py       # Court-admissible feature attribution
│       │   └── models/                 # Pre-trained model weights (XGBoost)
│       ├── db/                         # Multi-Database connectivity
│       │   ├── postgres.py             # Async SQLAlchemy + PostGIS engine
│       │   ├── neo4j_driver.py         # Async Neo4j Bolt driver pool
│       │   ├── redis_client.py         # Async Redis client with TLS (rediss://)
│       │   └── init_db.py              # Automated schema & index migration
│       ├── generators/                 # Calibrated synthetic data generator
│       └── models/                     # SQLAlchemy relational entity definitions
│
├── frontend/                           # Cyber Command Tactical Interface
│   ├── Dockerfile                      # Production build container (Nginx Alpine)
│   ├── package.json                    # React 18, Vite, Lucide Icons, Leaflet, Recharts
│   ├── vite.config.js                  # Bundler configuration
│   ├── vercel.json                     # SPA client-side routing rewrites
│   ├── src/
│   │   ├── App.jsx                     # Application root & role management
│   │   ├── components/                 # Reusable tactical UI modules
│   │   │   ├── alerts/                 # Threat intelligence feed & alert cards
│   │   │   ├── docket/                 # Interdiction terminal & evidence docket
│   │   │   ├── graph/                  # D3/SVG topological transaction graph
│   │   │   ├── map/                    # Leaflet geospatial ATM hotspot canvas
│   │   │   └── simulation/             # Live attack injection modal
│   │   └── hooks/                      # WebSocket & state synchronization hooks
│   └── nginx.conf                      # Production HTTP reverse proxy & security headers
│
├── scripts/                            # Operational & verification toolkits
│   ├── demo_scenario.py                # Headless end-to-end incident injection script
│   ├── generate_technical_dossier.py   # PDF master technical report generator
│   └── verify_phase*.py                # Automated verification test suites
│
├── docker-compose.yml                  # Full-stack local multi-database composition
├── .env.example                        # Documented environment variable template
└── .gitignore                          # Strict secret & credential exclusion rules
```

---

## 7. Local Installation & Development Setup

### Prerequisites
- **Docker & Docker Compose** (v24+)
- **Python 3.11+**
- **Node.js 18+** & `npm`

### Step 1: Clone Repository & Create Environment Configuration
```bash
git clone https://github.com/parthkharat20/RakshaNet.git
cd RakshaNet
cp .env.example .env
```
*(Configure `.env` with your desired database credentials).*

### Step 2: Launch Multi-Database Infrastructure (Docker Compose)
```bash
docker compose up -d postgres neo4j redis
```
This provisions:
- **PostgreSQL 16 + PostGIS:** `localhost:5432`
- **Neo4j 5 Graph Community:** `localhost:7474` (Bolt: `localhost:7687`)
- **Redis 7 In-Memory Store:** `localhost:6379`

### Step 3: Launch Backend Application
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run server (tables and demo officers seed automatically on startup)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Gateway documentation is available at `http://localhost:8000/docs`.

### Step 4: Launch Tactical Frontend
```bash
cd frontend
npm install
npm run dev
```
Tactical Command Center is accessible at `http://localhost:5173`.

---

## 8. Demo Credentials & Simulation Walkthrough

### Law Enforcement Officer Credentials (Demo)
| Officer Name | Badge ID | Security PIN | Division |
|---|---|---|---|
| **Inspector Parth Kharat** | `LE-CYBER-MUM-4029` | `1234` | Maharashtra Cyber Cell (I4C) |
| **SP Rajesh Kumar** | `LE-CYBER-DEL-1001` | `5678` | Delhi Cyber Crime Branch |
| **ASP Priya Sharma** | `LE-CYBER-BLR-2045` | `9012` | Karnataka CID Cyber Division |
| **DIG Vikram Singh** | `LE-I4C-HQ-0001` | `admin` | I4C National Command Centre |

### Executing an End-to-End Live Attack Simulation
1. Log into the command portal using any of the officer credentials above.
2. Click the **"⚡ Simulate Attack"** button on the top navigation bar.
3. Select an attack topology (e.g., **Mumbai UPI QR Code Syndicate**).
4. Click **"Inject Incident into Live Network"**.
5. Observe the live system:
   - Real-time alert dispatched via WebSockets without page reload.
   - Graph canvas expands with multi-hop transfer lineage.
   - Predictive cash-out hotspot identifies the target ATM hub within the critical Golden Window.
   - Click **"Freeze Target Accounts"** or **"Dispatch Beat Marshal"** to execute instant statutory interdiction.

---

## 9. License & Attribution

Developed under the **Smart India Hackathon (SIH)** framework for cybercrime mitigation and public safety innovation. 
Licensed under the [MIT License](LICENSE).
