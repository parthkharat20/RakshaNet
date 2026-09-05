# RakshaNet 🛡️
### Predictive Cash-Out Hotspot Intelligence

> **Smart India Hackathon 2026** · **PS ID:** SIH26184  
> **Ministry:** Ministry of Home Affairs (MHA) / Indian Cyber Crime Coordination Centre (I4C)  
> **Team:** Innovex

---

## Overview
**RakshaNet** transforms cyber fraud interdiction from reactive loss recording to proactive fund preservation. Instead of waiting for victims to report losses after funds have already been liquidated at ATMs, RakshaNet predicts high-risk mule account activation and cash-out hotspot locations **before cash-out occurs**.

---

## System Architecture (Slide 3 Aligned)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA INGESTION LAYER                            │
│    • 1930 Helpline & NCRP Citizen Feed   • Bank CFCFRMS Ingestion Feed │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     UNIFIED DATA & STORAGE LAYER                       │
│    • PostgreSQL 16 + PostGIS 3.4 (Geospatial & Relational Storage)     │
│    • Neo4j 5 Community (Property Graph for Multi-Hop Mule Chains)      │
│    • Redis 7-Alpine (Hot State Cache & Real-Time Alert Pub/Sub)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     REAL-TIME DUAL AI ENGINES                          │
│    • Branch A: GNN Mule Chain Predictor (PyTorch Geometric / GraphSAGE)│
│    • Branch B: Geo-Spatial Hotspot Forecaster (HDBSCAN + XGBoost)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     INTELLIGENT DECISION ENGINE                        │
│    • Risk Detection: Low (0-39), Medium (40-69), High (70-100)        │
│    • SHAP Explainability: Court-admissible feature attribution evidence│
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     MULTI-AGENCY INTERDICTION OUTPUTS                  │
│    • CFCFRMS Bank Trigger: Machine-readable freeze request API         │
│    • LEA Live Heatmap Dashboard: React 18 + Leaflet Command Center     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack
* **Backend:** Python 3.11, FastAPI, SQLAlchemy 2.0 (async), GeoAlchemy2, Neo4j Bolt Driver, Redis-py, Uvicorn
* **AI/ML:** PyTorch Geometric, GraphSAGE, NetworkX, HDBSCAN, XGBoost, Scikit-learn, SHAP, GeoPandas
* **Databases:** PostgreSQL 16 + PostGIS, Neo4j 5 Community, Redis 7
* **Frontend:** React 18, Vite, Leaflet.js, React-Leaflet, Tailwind / Custom CSS
* **Infrastructure:** Docker Compose

---

## Quick Start (Local Development)

### 1. Start Multi-Database Containers
```bash
docker compose up -d
```
Verify health:
* PostgreSQL (PostGIS): `localhost:5432`
* Neo4j Browser: `http://localhost:7474` (Credentials: `neo4j` / `rakshanet_secret`)
* Redis: `localhost:6379`

### 2. Setup & Run Backend API
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Seed synthetic database with realistic NCRP data
python -m app.generators.generate_all

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
Interactive API docs available at: `http://localhost:8000/docs`

### 3. Setup & Run LEA Dashboard
```bash
cd frontend
npm install
npm run dev
```
Dashboard available at: `http://localhost:5173`

---

## The Core UVP: Graph Topological Prediction
Standard fraud systems evaluate transaction anomalies after funds transfer. **RakshaNet** evaluates the **graph structural position** of unflagged accounts using topological link prediction (Adamic-Adar proximity to confirmed fraud hubs). A completely clean account with zero prior complaints is flagged before large transfers occur simply because of its bridging position between known mule networks.

---

## Legal Compliance & Ethics
* All demonstration data is **synthetic**, calibrated against published statistical distributions from the Reserve Bank of India (RBI) and National Cybercrime Reporting Portal (NCRP).
* **Supreme Court SOP Compliance:** Explanations powered by SHAP feature attributions ensure every freeze recommendation includes verifiable, court-admissible reasoning.
