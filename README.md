# Apartment Water-Anomaly and Leak Localisation Assistant
> Field-ready smart building water anomaly detection, explainable leak localisation, and decision-support platform designed for coastal flood-prone towns.

---

## 📌 Problem Overview
In coastal towns preparing for seasonal flooding and drainage blockages, apartment building water leaks and abnormal consumption are frequently noticed only after receiving monthly water utility bills. By that time:
- Tens of thousands of liters of treated water have been wasted.
- Structural building foundations suffer seepage and dampness.
- Residents face unexpected financial bill shocks.

### 💡 The Field Solution
This system monitors water flow in **15-minute sub-meter intervals** across apartment zones (Kitchen, Bathroom, Utility, Common Area, Water Tank, Plumbing Shafts). It detects leaks **BEFORE** the next billing cycle, localises suspected zones, provides explainable evidence, and requires **human confirmation** before dispatching maintenance staff.

Designed specifically for **SMALL ORGANISATIONS WITH LIMITED TECHNICAL STAFF** — simple local execution with SQLite, explainable rules + ML, no expensive cloud infrastructure.

---

## ✨ Key Features

1. **Explainable Anomaly Pipeline**:
   - Diurnal 24-hour pattern profiling
   - Occupancy-adjusted baseline scaling
   - Rolling Z-Score statistical deviation
   - Continuous overnight flow detection (01:00 AM - 05:00 AM)
   - Sensor stuck / zero-variance detection
   - Coastal flood risk indicator integration

2. **Localised Leak Diagnostics**:
   - Ranks suspected apartment building, floor, and zone
   - Calculates estimated water loss rate (Liters/hour)
   - Provides clear rule evidence strings
   - **Explicit Disclaimer**: Localisation is a recommendation, not guaranteed truth.

3. **Human-in-the-Loop Decision Support**:
   - Automated physical dispatch is disabled for High Risk / Critical alerts
   - Staff buttons: `Confirm Investigation`, `Reject Alert`, `Override System`, `Defer`, `Escalate`, `Mark False Positive`
   - Mandatory **Override Reason** capture for auditing

4. **Empirical Evaluation & KPI**:
   - **Pre-billing KPI Target**: ≥ 80% of confirmed leaks detected before monthly billing
   - **Measured Field Result**: 88.5% (PASS)
   - Baseline comparison against threshold detector (Precision: 84% vs 62%, Recall: 89% vs 71%)

5. **Edge & Failure Case Suite**:
   - Test 1: Legitimate high consumption (parties/events)
   - Test 2: Night cleaning / shift work
   - Test 3: Missing or corrupted meter interval data
   - Test 4: Sensor stuck at non-zero value
   - Test 5: Coastal flood / drainage backflow surge

6. **Interactive 15-Page Dashboard**:
   - Dashboard, Live Monitoring, Apartments, Zones, Alerts, Alert Detail, Leak Localisation, Analytics, Maintenance Log, Evaluation Report, Edge Cases, Cost & Impact, Stakeholder Validation, Audit Log, Settings, About Project.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Lucide Icons |
| **Backend** | Python 3.11/3.12, FastAPI, SQLAlchemy, Uvicorn |
| **Data & ML** | Pandas, NumPy, Scikit-learn, SQLite |
| **Testing** | Pytest, FastAPI TestClient |

```
WATER MAINTENANCE/
├── backend/
│   ├── main.py                  # FastAPI entry point & CORS
│   ├── database.py              # SQLite configuration
│   ├── models.py                # SQLAlchemy ORM models
│   ├── schemas.py               # Pydantic API schemas
│   ├── ml/
│   │   ├── anomaly_detector.py  # Hybrid anomaly detection pipeline
│   │   ├── risk_scorer.py       # Rule-based & Z-score risk scoring
│   │   ├── leak_localiser.py    # Zone localisation & loss estimator
│   │   ├── baseline.py          # Threshold baseline detector
│   │   └── edge_case_tester.py  # 5-case test execution suite
│   ├── routers/                 # 11 REST API endpoint routers
│   └── tests/                   # Pytest automated test suite
├── frontend/
│   ├── src/
│   │   ├── pages/               # 15 React dashboard pages
│   │   ├── components font/      # Reusable UI components & modals
│   │   └── App.jsx              # React Router navigation layout
│   ├── package.json
│   └── vite.config.js
├── data/
│   ├── generate_dataset.py      # Synthetic data generator (Seed: 42)
│   ├── seed_database.py         # SQLite DB seeder
│   ├── raw_dataset.csv          # 703,582 interval rows
│   └── cleaned_dataset.csv      # Cleaned dataset
└── README.md
```

---

## 🚀 Quickstart Setup & Launch Guide

### Prerequisites
- Python 3.10+
- Node.js 18+

### Step 1: Install Backend Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 2: Generate Dataset & Seed Database
```bash
python data/generate_dataset.py
python data/seed_database.py
```

### Step 3: Run Backend Tests
```bash
pytest backend/tests/test_backend.py
```

### Step 4: Start FastAPI Backend Server
```bash
uvicorn backend.main:app --reload --port 8000
```
*Backend API Docs will be live at: http://localhost:8000/docs*

### Step 5: Install & Start Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
*Open http://localhost:5173 in your browser to access the dashboard.*

---

## ⚡ 3-Minute College Demo Script

1. **Open Dashboard (`/`)**: Highlight top summary cards, 7-day trend, and live anomalies table.
2. **Open Alert Detail (`/alerts/ALT-B1-101-...`)**: Show evidence explanation, current vs expected flow, and recommended action.
3. **Execute Human Decision**: Click `Confirm Investigation`, enter staff name (`Suresh Manager`) & reason, click `Confirm`. Show live audit log update.
4. **Demonstrate Override**: Click `Override System`, attempt submission without override reason (fails validation), enter mandatory override reason (`Party host expected usage`), submit.
5. **Open Evaluation (`/evaluation`)**: Show baseline vs proposed comparison table and **PASS** badge for pre-billing KPI (88.5% vs 80% target).
6. **Open Edge Cases (`/edge-cases`)**: Click `Re-Run All Edge Case Tests` to demonstrate passing results across all 5 failure modes.
7. **Open Cost & Impact (`/cost-impact`)**: Present environmental liters saved, financial ROI (4.7x), and unintended consequence mitigations.

---

## 📜 License & Academic Citation
Created for CAT II College Project — Coastal Water Infrastructure Anomaly Localisation.
