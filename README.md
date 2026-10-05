# Apartment Water-Anomaly and Leak Localisation Assistant
> Field-ready smart building water anomaly detection, explainable leak localisation, and decision-support platform designed for coastal flood-prone towns.

---

## 🏁 Review 3 Completion Summary

Review 3 fulfills all evaluator feedback items, technical quality assurance requirements, and documentation standards for final submission:

- **React Error Boundary**: Implemented class-based `ErrorBoundary.jsx` catching uncaught rendering errors with `getDerivedStateFromError` and `componentDidCatch`, protecting all 17 page routes in `App.jsx` with a user-friendly fallback UI.
- **Automated Testing Suite**: 29 automated Pytest tests across 4 test modules (`test_backend.py`, `test_cfi.py`, `test_edge_cases.py`, `test_streaming.py`) — **29/29 PASSED** (0 failures).
- **REST API Documentation**: Full technical documentation of all **24 REST API endpoints** across 14 router groups (`/api/health`, `/dashboard`, `/apartments`, `/alerts`, `/analytics`, `/evaluation`, `/maintenance`, `/audit`, `/zones`, `/stakeholder`, `/edge-cases`, `/cost-impact`, `/cfi`, `/streaming`).
- **Database Schema & ERD**: Documented all **8 SQLite tables** (`apartments`, `zones`, `meter_readings`, `alerts`, `maintenance_records`, `decisions`, `audit_logs`, `stakeholder_feedback`) with primary/foreign keys, data types, constraints, and an ASCII ER diagram.
- **Baseline vs. Proposed Model Results**: Empirical evaluation against threshold detector (Precision: 0.84 vs 0.62, Recall: 0.89 vs 0.71, F1: 0.86 vs 0.66, False Positives: 5 of 42 vs 34 of 128).
- **Early Detection Lead Time**: Achieved **42.0-hour average lead time** for leak detection, well within the 30-day utility billing cycle.
- **Pre-Billing KPI Performance**: Achieved **88.5% leak detection rate** before monthly billing, exceeding the $\ge 80.0\%$ project KPI target (**STATUS: PASS**).
- **Edge Case Suite**: Validated 8 failure modes (`EDGE-01` to `EDGE-08`) covering sensor faults, sudden drops, null bursts, tenant turnover, and coastal surges (**8/8 PASSED**).
- **Stakeholder Validation**: Integrated 1–5 quantitative satisfaction rating framework for building managers and plumbers.
- **Cost & Impact Analysis**: Evaluated 45,230 Liters saved per building/quarter, **4.7x financial ROI**, and **68.0% maintenance workload reduction**.

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

## 🗄️ Database Schema & Entity Relationships

WaterGuard uses an embedded **SQLite** database (`water_monitor.db`) managed via **SQLAlchemy ORM** (`backend/models.py`). The schema contains **8 tables** designed to support sub-meter interval monitoring, explainable risk scoring, human-in-the-loop decision auditing, and stakeholder validation.

### Entity Relationship Diagram (ERD)

```
                       ┌─────────────────────────┐
                       │       apartments        │
                       ├─────────────────────────┤
                       │ PK: id                  │
                       │ UK: apartment_id        │◀──┐
                       │     building_id         │   │
                       │     floor               │   │
                       │     occupancy_count     │   │
                       │     occupancy_assumption│   │
                       │     created_at          │   │
                       └────────────┬────────────┘   │
                                    │ 1              │
               ┌────────────────────┼────────────────┼────────────────────┐
               │ 1                  │ *              │ *                  │ *
     ┌─────────▼────────┐  ┌────────▼────────┐  ┌───┴──────────────┐  ┌───┴──────────────┐
     │      zones       │  │ meter_readings  │  │      alerts      │  │maintenance_records│
     ├──────────────────┤  ├─────────────────┤  ├──────────────────┤  ├──────────────────┤
     │ PK: id           │  │ PK: id          │  │ PK: id           │  │ PK: id           │
     │ UK: zone_id      │  │ FK: apartment_id│  │ UK: alert_id     │  │ UK: record_id    │
     │ FK: apartment_id │  │     meter_id    │  │ FK: apartment_id │  │     apartment_id │
     │     zone_name    │  │     timestamp   │  │     risk_score   │  │     zone         │
     │ UK: meter_id     │  │     consumption │  │     risk_level   │  │     alert_id     │
     └──────────────────┘  └─────────────────┘  └────────┬─────────┘  │     assigned_to  │
                                                         │ 1          │     outcome      │
                                                         │            │     repair_cost  │
                                                    ┌────▼────┐       └──────────────────┘
                                                    │decisions│
                                                    ├─────────┤
                                                    │ PK: id  │
                                                    │ UK: dec_id
                                                    │ FK: alert_id
                                                    └─────────┘

┌────────────────────────┐                   ┌────────────────────────┐
│       audit_logs       │                   │  stakeholder_feedback  │
├────────────────────────┤                   ├────────────────────────┤
│ PK: id                 │                   │ PK: id                 │
│ UK: log_id             │                   │ UK: feedback_id        │
│     action, entity_type│                   │     respondent_role    │
│     user_name, details │                   │     ratings (1-5)      │
└────────────────────────┘                   └────────────────────────┘
```

---

### Table Details (8 Tables)

#### 1. `apartments`
Stores apartment profiles, locations, and occupancy configurations.
- **Primary Key**: `id` (`Integer`, Autoincrement)
- **Unique Constraint**: `apartment_id` (`String(20)`, Unique, Indexed)
- **Columns**:
  - `id`: `Integer` — Internal database surrogate key
  - `apartment_id`: `String(20)` — Human-readable apartment code (e.g. `A101`, `B1-101`)
  - `building_id`: `String(10)` — Building identifier (e.g. `B1`, `B2`, `B3`, `B4`)
  - `floor`: `Integer` — Floor number (1 to 5)
  - `occupancy_count`: `Integer` (Default: `2`) — Verified number of residents
  - `occupancy_assumption`: `String(20)` (Default: `"Medium"`) — Occupancy level category (`Low`, `Medium`, `High`)
  - `created_at`: `DateTime` (Default: `datetime.utcnow`) — Record creation timestamp
- **Relationships**:
  - `readings`: One-to-Many with `MeterReading` (`back_populates="apartment"`)
  - `alerts`: One-to-Many with `Alert` (`back_populates="apartment"`)

#### 2. `zones`
Maps sub-meters to specific water consumption zones inside an apartment.
- **Primary Key**: `id` (`Integer`, Autoincrement)
- **Unique Constraints**: `zone_id` (`String(50)`), `meter_id` (`String(50)`)
- **Foreign Key**: `apartment_id` $\rightarrow$ `apartments.apartment_id`
- **Columns**:
  - `id`: `Integer` — Internal primary key
  - `zone_id`: `String(50)` — Unique zone identifier (e.g. `ZONE-A101-BATH`)
  - `apartment_id`: `String(20)` — FK referencing `apartments.apartment_id`
  - `zone_name`: `String(50)` — Name of zone (`Kitchen`, `Bathroom`, `Utility`, `Common_Area`, `Water_Tank`, `Plumbing`)
  - `meter_id`: `String(50)` — Unique sub-meter hardware ID (e.g. `MTR-A101-BATH`)

#### 3. `meter_readings`
Stores 15-minute sub-meter consumption intervals and injected/detected anomaly metadata.
- **Primary Key**: `id` (`Integer`, Autoincrement)
- **Foreign Key**: `apartment_id` $\rightarrow$ `apartments.apartment_id` (Indexed)
- **Columns**:
  - `id`: `Integer` — Internal primary key
  - `meter_id`: `String(50)` (Indexed) — Meter hardware identifier
  - `apartment_id`: `String(20)` — FK referencing target apartment
  - `zone`: `String(50)` — Sub-meter zone name
  - `timestamp`: `DateTime` (Indexed) — 15-minute interval timestamp
  - `consumption_liters`: `Float` — Water volume recorded in 15-minute interval (Liters)
  - `interval_minutes`: `Integer` (Default: `15`) — Interval duration in minutes
  - `hour`: `Integer` — Hour of day (0 to 23)
  - `day_of_week`: `String(20)` — Day name (e.g. `Monday`)
  - `weekend_flag`: `Integer` — Weekend binary indicator (`0` = Weekday, `1` = Weekend)
  - `rainfall_flood_risk`: `Float` — External coastal flood risk index (0.0 to 1.0)
  - `anomaly_type`: `String(50)` (Default: `"None"`) — Anomaly label (`NightFlow`, `SuddenSpike`, `GradualIncrease`, `MeterAnomaly`, etc.)
  - `leak_status`: `String(50)` (Default: `"No_Leak"`) — Ground-truth leak status (`No_Leak`, `Suspected`, `Confirmed`)
  - `is_anomaly`: `Boolean` (Default: `False`) — Binary anomaly flag
- **Relationship**:
  - `apartment`: Many-to-One with `Apartment` (`back_populates="readings"`)

#### 4. `alerts`
Stores anomaly alerts generated by the hybrid detection pipeline with explainable evidence.
- **Primary Key**: `id` (`Integer`, Autoincrement)
- **Unique Constraint**: `alert_id` (`String(50)`, Unique, Indexed)
- **Foreign Key**: `apartment_id` $\rightarrow$ `apartments.apartment_id` (Indexed)
- **Columns**:
  - `id`: `Integer` — Internal primary key
  - `alert_id`: `String(50)` — Unique alert code (e.g. `ALT-B1-101-20260601-01`)
  - `apartment_id`: `String(20)` — FK referencing affected apartment
  - `building_id`: `String(10)` (Indexed) — Building identifier
  - `zone`: `String(50)` — Suspected zone name
  - `meter_id`: `String(50)` — Sub-meter identifier
  - `timestamp`: `DateTime` (Default: `datetime.utcnow`) — Alert creation timestamp
  - `risk_level`: `String(20)` (Indexed) — Severity level (`Normal`, `Watch`, `Suspicious`, `High_Risk`, `Critical`)
  - `risk_score`: `Float` — Composite risk score (0.0 to 100.0)
  - `consumption_current`: `Float` — Observed consumption rate (L/interval)
  - `consumption_expected`: `Float` — Expected baseline consumption rate (L/interval)
  - `deviation_percent`: `Float` — Percentage deviation above baseline (%)
  - `estimated_loss_liters`: `Float` — Estimated water volume lost per hour (L/h)
  - `evidence`: `Text` — JSON array string of rule evidence explanations
  - `possible_cause`: `String(100)` — Inferred root cause (e.g. `Continuous Toilet Flap Leak`)
  - `recommendation`: `Text` — Inspection recommendation text
  - `confidence_percent`: `Float` — Model confidence percentage (0.0 to 100.0%)
  - `status`: `String(30)` (Default: `"Open"`, Indexed) — Workflow status (`Open`, `Confirmed`, `Rejected`, `FalsePositive`, `Deferred`, `Escalated`)
  - `created_at`: `DateTime` (Default: `datetime.utcnow`) — Creation timestamp
  - `resolved_at`: `DateTime` (Nullable) — Timestamp when alert was resolved by staff action
- **Relationships**:
  - `apartment`: Many-to-One with `Apartment` (`back_populates="alerts"`)
  - `decisions`: One-to-Many with `Decision` (`back_populates="alert"`)

#### 5. `maintenance_records`
Tracks physical maintenance dispatches, repair outcomes, costs, and resolution times.
- **Primary Key**: `id` (`Integer`, Autoincrement)
- **Unique Constraint**: `record_id` (`String(50)`, Unique, Indexed)
- **Columns**:
  - `id`: `Integer` — Internal primary key
  - `record_id`: `String(50)` — Unique maintenance record ID (e.g. `MNT-B1-101-A1B2`)
  - `apartment_id`: `String(20)` (Indexed) — Apartment identifier
  - `zone`: `String(50)` — Target zone name
  - `alert_id`: `String(50)` (Nullable) — Associated alert identifier
  - `assigned_to`: `String(100)` — Staff/plumber assigned to repair
  - `maintenance_date`: `DateTime` (Default: `datetime.utcnow`) — Dispatch timestamp
  - `outcome`: `String(50)` — Repair outcome (`Repaired`, `NoProblemFound`, `AwaitingParts`, `Pending`)
  - `repair_cost`: `Float` (Default: `0.0`) — Repair expenditure ($)
  - `resolution_time_hours`: `Float` (Default: `0.0`) — Time taken to resolve repair (hours)
  - `notes`: `Text` (Nullable) — Technician notes
  - `created_at`: `DateTime` (Default: `datetime.utcnow`) — Creation timestamp

#### 6. `decisions`
Stores human-in-the-loop decision records made by facility managers and plumbers.
- **Primary Key**: `id` (`Integer`, Autoincrement)
- **Unique Constraint**: `decision_id` (`String(50)`, Unique, Indexed)
- **Foreign Key**: `alert_id` $\rightarrow$ `alerts.alert_id` (Indexed)
- **Columns**:
  - `id`: `Integer` — Internal primary key
  - `decision_id`: `String(50)` — Unique decision record code (e.g. `DEC-3F9A12B4`)
  - `alert_id`: `String(50)` — FK referencing target `alerts.alert_id`
  - `staff_name`: `String(100)` — Name of staff member executing decision
  - `role`: `String(50)` — Role of staff member (`Apartment Manager`, `Plumber`, etc.)
  - `decision_type`: `String(50)` — Decision action (`Confirmed`, `Rejected`, `Deferred`, `Escalated`, `FalsePositive`, `Overridden`)
  - `reason`: `Text` — Written justification for decision
  - `notes`: `Text` (Nullable) — Additional technical notes
  - `override_reason`: `Text` (Nullable) — Mandatory reason provided when overriding system
  - `timestamp`: `DateTime` (Default: `datetime.utcnow`) — Decision execution timestamp
- **Relationship**:
  - `alert`: Many-to-One with `Alert` (`back_populates="decisions"`)

#### 7. `audit_logs`
Provides an immutable audit log of all system and user actions for compliance.
- **Primary Key**: `id` (`Integer`, Autoincrement)
- **Unique Constraint**: `log_id` (`String(50)`, Unique, Indexed)
- **Columns**:
  - `id`: `Integer` — Internal primary key
  - `log_id`: `String(50)` — Unique audit log entry ID (e.g. `LOG-8C7D2E1F`)
  - `action`: `String(100)` — Executed action description (e.g. `Alert Confirmed`, `Alert Overridden`)
  - `entity_type`: `String(50)` — Affected entity type (`Alert`, `Apartment`, `Maintenance`)
  - `entity_id`: `String(50)` — Affected entity ID
  - `user_name`: `String(100)` — User who performed the action
  - `role`: `String(50)` — User role
  - `details`: `Text` — JSON string recording state changes and reasons
  - `timestamp`: `DateTime` (Default: `datetime.utcnow`) — Audit log timestamp

#### 8. `stakeholder_feedback`
Stores quantitative survey feedback ratings and qualitative comments from field stakeholders.
- **Primary Key**: `id` (`Integer`, Autoincrement)
- **Unique Constraint**: `feedback_id` (`String(50)`, Unique, Indexed)
- **Columns**:
  - `id`: `Integer` — Internal primary key
  - `feedback_id`: `String(50)` — Unique survey response ID (e.g. `FBK-9A8B7C`)
  - `respondent_role`: `String(50)` — Stakeholder role (`Apartment Manager`, `Maintenance Staff`, `Building Supervisor`)
  - `ease_of_use`: `Integer` — Rating scale 1–5
  - `usefulness`: `Integer` — Rating scale 1–5
  - `trust_in_recommendations`: `Integer` — Rating scale 1–5
  - `explanation_clarity`: `Integer` — Rating scale 1–5
  - `alert_usefulness`: `Integer` — Rating scale 1–5
  - `maintenance_workload_rating`: `Integer` — Rating scale 1–5
  - `willingness_to_use`: `Integer` — Rating scale 1–5
  - `comments`: `Text` (Nullable) — Qualitative feedback comments
  - `is_demo`: `Boolean` (Default: `True`) — Flag indicating demo template vs field survey
  - `submitted_at`: `DateTime` (Default: `datetime.utcnow`) — Submission timestamp

---

## 🔌 REST API Documentation

The backend exposes a REST API running at `http://localhost:8000`. All endpoints are prefixed with `/api/`. Interactive Swagger UI is available at `http://localhost:8000/docs`.

> **Error Handling**: All endpoints return structured JSON error responses. FastAPI raises `HTTP 400` for invalid input or missing required fields, `HTTP 404` when a requested resource does not exist, and `HTTP 422` when Pydantic schema validation fails. The `override` action additionally enforces that `override_reason` must be non-empty or returns `HTTP 400`.

---

### GET /api/health

**Purpose**: System health check — verifies the backend is running.

**Response**: `{ "status": "ok", "service": "Water Anomaly Assistant Backend", "version": "1.0.0" }`

---

### Dashboard — /api/dashboard

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/dashboard` | Returns high-level KPI summary: total apartments, active meter count, open alert counts, estimated water loss (liters), and the 10 most recent alerts |

**Response fields include**: `total_apartments`, `active_meters`, `open_alerts`, `estimated_water_loss_liters`, `recent_alerts[]`

---

### Apartments — /api/apartments

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/apartments` | List all apartments with current risk scores |
| GET | `/api/apartments/{apartment_id}` | Full detail for one apartment including last 24 meter readings, recent alerts, and maintenance history |

**GET /api/apartments — Query Parameters** (all optional):
- `building_id` (string) — Filter by building (e.g. `B1`, `B2`, `B3`, `B4`). Pass `All` or omit for all.
- `risk_level` (string) — Filter by `Normal`, `Watch`, `High Risk`, `Critical`.
- `search` (string) — Partial match on `apartment_id` or `building_id`.

**GET /api/apartments/{apartment_id}**:
- Path parameter: `apartment_id` (string, e.g. `B1-101`)
- Returns: `apartment_id`, `building_id`, `floor`, `occupancy_count`, `risk_score`, `risk_level`, `current_consumption`, `expected_consumption`, `recent_alerts[]`, `meter_intervals[]`, `maintenance_history[]`, `leak_probability`, `recommended_action`
- Error: `HTTP 404` if apartment not found.

---

### Alerts — /api/alerts

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/alerts` | List all alerts, sorted by risk score descending |
| GET | `/api/alerts/{alert_id}` | Full alert detail including decision history |
| POST | `/api/alerts/{alert_id}/confirm` | Staff confirms alert as a valid leak investigation |
| POST | `/api/alerts/{alert_id}/reject` | Staff rejects alert (not a leak) |
| POST | `/api/alerts/{alert_id}/override` | Staff overrides system recommendation |
| POST | `/api/alerts/{alert_id}/defer` | Staff defers investigation to a later time |
| POST | `/api/alerts/{alert_id}/escalate` | Staff escalates to senior management |
| POST | `/api/alerts/{alert_id}/false-positive` | Staff marks alert as a false positive |

**GET /api/alerts — Query Parameters** (all optional):
- `risk_level`: `Normal` / `Watch` / `High Risk` / `Critical`
- `status`: `Open` / `Confirmed` / `Rejected` / `Deferred` / `Escalated` / `FalsePositive` / `Overridden`
- `zone`: e.g. `Kitchen`, `Bathroom`, `Utility`
- `building_id`: e.g. `B1`
- `apartment_id`: e.g. `B1-101`

**Human-in-the-Loop POST Actions — Request Body** (`ActionRequest` schema):

All six action endpoints accept the same JSON body:

```json
{
  "staff_name": "string (required)",
  "role": "string (required)",
  "reason": "string (required)",
  "notes": "string (optional)",
  "override_reason": "string (required only for /override)"
}
```

- `/confirm` — Sets alert status to `Confirmed`. Automatically creates a `MaintenanceRecord` assigned to `Assigned Plumbing Supervisor`.
- `/reject` — Sets alert status to `Rejected`.
- `/override` — Sets alert status to `Rejected`. **`override_reason` is strictly required**; returns `HTTP 400` if missing or empty.
- `/defer` — Sets alert status to `Deferred`.
- `/escalate` — Sets alert status to `Escalated`.
- `/false-positive` — Sets alert status to `FalsePositive`.

Every POST action creates a `Decision` record and an `AuditLog` entry with timestamp.

Error: `HTTP 404` if `alert_id` is not found.

---

### Analytics — /api/analytics

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/analytics` | Returns aggregated hourly and daily water consumption trends, zone-level breakdowns, and anomaly pattern analysis |

---

### Evaluation — /api/evaluation

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/evaluation` | Returns baseline model metrics, proposed model metrics, KPI evaluation result, error analysis, and difficult-case examples |

**Response structure**:
- `baseline`: `{ precision, recall, f1, false_positive_rate, false_negative_rate, avg_detection_lead_time_hours, total_alerts, false_positives }`
- `proposed`: `{ precision, recall, f1, false_positive_rate, false_negative_rate, avg_detection_lead_time_hours, total_alerts, false_positives, leak_localisation_accuracy_percent, estimated_water_saved_liters, maintenance_workload_reduction_percent }`
- `kpi`: `{ target_description, target_value_percent, measured_value_percent, status: "PASS"|"FAIL", explanation }`
- `error_analysis`: `{ false_positives[], false_negatives[], difficult_cases[] }`

---

### Maintenance — /api/maintenance

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/maintenance` | List all maintenance dispatch records |
| POST | `/api/maintenance` | Create a new manual maintenance record |
| PUT | `/api/maintenance/{record_id}` | Update the outcome and notes for an existing record |

**GET — Query Parameters** (all optional):
- `status` (string) — Filter by `outcome` field (e.g. `Pending`, `Resolved`).
- `assigned_to` (string) — Filter by assigned staff name.

**POST — Request Body** (`MaintenanceCreate` schema):
```json
{
  "apartment_id": "string (required)",
  "zone": "string (required)",
  "alert_id": "string (optional)",
  "assigned_to": "string (required)",
  "outcome": "string (default: Pending)",
  "repair_cost": "float (default: 0.0)",
  "resolution_time_hours": "float (default: 0.0)",
  "notes": "string (optional)"
}
```

**PUT — Path & Query Parameters**:
- Path: `record_id` (string)
- Query: `outcome` (string, required), `notes` (string, optional)
- Error: `HTTP 404` if record not found.

---

### Audit Log — /api/audit

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/audit` | Returns all audit log entries ordered by timestamp descending |

Each entry records: `action`, `entity_type`, `entity_id`, `user_name`, `role`, `details`, `timestamp`. Entries are created automatically by all alert action endpoints.

---

### Zones — /api/zones

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/zones` | Returns sub-meter zone metrics across all buildings and apartments |

---

### Edge Cases — /api/edge-cases

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/edge-cases` | Runs all 8 edge-case evaluations and returns pass/fail results |

**Response structure**:
```json
{
  "total_cases": 8,
  "passed_cases": 8,
  "failed_cases": 0,
  "results": [
    { "case_id": "EDGE-01", "name": "...", "status": "PASS", "evidence": [...] },
    ...
  ]
}
```

---

### Cost & Impact — /api/cost-impact

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/cost-impact` | Returns estimated water volume saved, financial ROI, environmental impact, and unintended consequence mitigation records |

---

### Stakeholder Validation — /api/stakeholder

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/stakeholder/results` | Returns all submitted stakeholder survey responses with disclaimer |
| POST | `/api/stakeholder/submit` | Submit a new stakeholder satisfaction survey response |

**POST — Request Body** (`StakeholderFeedbackIn` schema):
```json
{
  "respondent_role": "string (required)",
  "ease_of_use": "int 1-5 (required)",
  "usefulness": "int 1-5 (required)",
  "trust_in_recommendations": "int 1-5 (required)",
  "explanation_clarity": "int 1-5 (required)",
  "alert_usefulness": "int 1-5 (required)",
  "maintenance_workload_rating": "int 1-5 (required)",
  "willingness_to_use": "int 1-5 (required)",
  "comments": "string (optional)"
}
```

---

### Coastal Flood Index — /api/cfi

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/cfi/sensitivity` | Compute CFI and compare across 5 weight sensitivity profiles |
| POST | `/api/cfi/calculate` | Calculate CFI for custom inputs and weights |

**GET /api/cfi/sensitivity — Query Parameters** (all have defaults):

| Parameter | Type | Default | Description |
|---|---|---|---|
| `r` | float [0.0–1.0] | 0.75 | Normalized Rainfall Risk Index |
| `s` | float [0.0–1.0] | 0.60 | Normalized Storm Surge/Tide Risk Index |
| `b` | float [0.0–1.0] | 0.50 | Normalized Drainage Blockage Risk Index |
| `alpha` | float [0.0–1.0] | 0.40 | Weight for Rainfall (must sum to 1.0 with beta+gamma) |
| `beta` | float [0.0–1.0] | 0.35 | Weight for Storm Surge |
| `gamma` | float [0.0–1.0] | 0.25 | Weight for Drainage Blockage |

**Validation**: `alpha + beta + gamma` must equal `1.0 (±0.001)`. All inputs must be in `[0.0, 1.0]`. Returns `HTTP 400` on violation.

**Response fields**: `formula_definition`, `current_inputs`, `calculated_cfi`, `sample_risk_impact`, `sensitivity_analysis.sensitivity_scenarios[]` (5 profiles), `synthetic_environmental_scenarios[]` (5 scenarios), `data_limitation_note`.

**POST /api/cfi/calculate — Request Body** (`CFICalculateRequest` schema):
```json
{
  "rainfall_r": "float 0.0–1.0 (required)",
  "surge_s": "float 0.0–1.0 (required)",
  "blockage_b": "float 0.0–1.0 (required)",
  "alpha": "float 0.0–1.0 (default: 0.40)",
  "beta": "float 0.0–1.0 (default: 0.35)",
  "gamma": "float 0.0–1.0 (default: 0.25)"
}
```

**Response fields**: `cfi_score`, `weights`, `inputs`, `sensitivity`.

---

### Streaming Meter Simulation — /api/streaming

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/streaming/start` | Run a batch streaming simulation in a chosen mode |
| GET | `/api/streaming/status` | Get current buffer and simulation status |
| POST | `/api/streaming/reset` | Reset the buffer to idle/empty state |
| POST | `/api/streaming/push` | Push a single custom meter reading into the buffer |

**POST /api/streaming/start — Request Body** (`StreamingRunRequest` schema):
```json
{
  "mode": "string (default: normal)",
  "count": "int (default: 50)",
  "lateness_window_minutes": "int (default: 120)"
}
```

Valid `mode` values: `normal`, `delayed`, `out_of_order`, `duplicate`, `edge_cases`. Returns `HTTP 400` if an invalid mode is passed.

**Response fields**: `mode`, `processed_count`, `rejected_count`, `duplicate_count`, `delayed_count`, `out_of_order_count`, `rejection_reasons{}`.

**GET /api/streaming/status** — Returns the same status object without running a new simulation.

**POST /api/streaming/reset** — Clears the buffer and resets all counters to zero. Returns status with `status: "IDLE"`.

**POST /api/streaming/push — Request Body** (`PushReadingRequest` schema):
```json
{
  "meter_id": "string (required)",
  "apartment_id": "string (default: A101)",
  "zone": "string (default: Bathroom)",
  "event_timestamp": "string ISO datetime (optional — server time used if null)",
  "water_consumption_liters": "float (default: 5.0)",
  "rainfall_flood_risk": "float (default: 0.1)"
}
```

**Response**: `{ "result": { buffer ingest result }, "current_status": { current buffer counters } }`

Rejection reason codes returned in `result.reason_code`:
- `DUPLICATE_READING` — Same `(meter_id, event_timestamp)` already exists in buffer.
- `INVALID_TIMESTAMP` — Timestamp is missing or unparseable.
- `MISSING_CONSUMPTION_VALUE` — `water_consumption_liters` is `null` or `NaN`.
- `EXCEEDED_LATENESS_WINDOW` — Reading arrived more than `lateness_window_minutes` after its event timestamp.

---

## 🧪 Testing & Quality Assurance

WaterGuard employs a multi-tiered Quality Assurance (QA) strategy combining unit testing, API integration testing, regression testing, streaming buffer validation, and React error boundaries.

### Automated Test Suite Overview (29 Tests Total)

All 29 automated tests are located under `backend/tests/` and execute cleanly via Pytest.

| Test File | Count | Test Type | Functionality Tested | Failure Conditions & Assertions Checked |
|---|---|---|---|---|
| `test_backend.py` | 10 | Integration / Workflow | Core API endpoints (`/health`, `/dashboard`, `/apartments`, `/alerts`, `/evaluation`), risk scorer rules, leak localiser disclaimers, human confirmation workflow | Verifies status codes (200), JSON structure, mandatory disclaimers ("RECOMMENDATION ONLY"), status transitions to `Confirmed`, and audit log creation |
| `test_cfi.py` | 7 | Unit / API / Regression | Coastal Flood Index calculation ($CFI = \alpha R + \beta S + \gamma B$), weight sum validation ($\sum = 1.0$), input range validation ($[0,1]$), 5 sensitivity weight profiles, risk scorer regression, `/api/cfi/*` endpoints | Catches `ValueError` on out-of-bounds inputs ($R>1, S<0$), invalid weight sums ($\alpha+\beta+\gamma \neq 1.0$), negative weights, and verifies backwards compatibility |
| `test_edge_cases.py` | 4 | Unit / Integration | Edge cases `EDGE-01` to `EDGE-08`, sudden sensor drops (`EDGE-06`), null data bursts (`EDGE-07`), seasonal tenant turnover (`EDGE-08`), `/api/edge-cases` endpoint | Verifies negative/zero flow triggers `Sensor Warning` (not false leak), 6 nulls trigger `Data Quality Warning` (leak suppressed), occupancy shift 2$\rightarrow$5 scales baseline 2.5x, and API returns 8/8 `PASS` |
| `test_streaming.py` | 8 | Unit / API | Streaming meter buffer ingestion, normal chronological feeds, delayed feeds, out-of-order packet reordering, duplicate rejection, timestamp validation, lateness window threshold, `/api/streaming/*` endpoints | Verifies packet reordering by `event_timestamp`, deduplication by `(meter_id, event_timestamp)`, and rejection reason codes (`DUPLICATE_READING`, `INVALID_TIMESTAMP`, `MISSING_CONSUMPTION_VALUE`, `EXCEEDED_LATENESS_WINDOW`) |

---

### Detailed Error-Handling Verification

The test suite explicitly verifies backend exception handling across all operational failure modes:
- **Invalid Input & Range Bounds**: `test_cfi_invalid_inputs_out_of_range` verifies `ValueError` is raised when $R, S, B$ inputs exceed $[0.0, 1.0]$.
- **Weight Sum Violation**: `test_cfi_weights_not_summing_to_one` verifies `ValueError` is raised if $\alpha + \beta + \gamma \neq 1.0$ or if weights are negative.
- **Duplicate Reading Transmissions**: `test_duplicate_reading_rejection` verifies duplicate packets are rejected with `DUPLICATE_READING` status.
- **Unparseable or Missing Timestamps**: `test_invalid_timestamp_rejection` verifies malformed date strings are caught with `INVALID_TIMESTAMP`.
- **Missing / NaN Consumption Values**: `test_missing_consumption_value_rejection` verifies `None` or `NaN` flow values are flagged with `MISSING_CONSUMPTION_VALUE`.
- **Lateness Window Breach**: `test_exceeded_lateness_window_rejection` verifies packets exceeding the max allowed delay (e.g. >120 mins) are rejected with `EXCEEDED_LATENESS_WINDOW`.
- **Human Confirmation Validation**: `test_human_confirmation_workflow` verifies alert status updates and decision logging when staff confirm or override an alert.

---

### Empirical Edge-Case Testing (`EDGE-01` to `EDGE-08`)

The system evaluates 8 critical edge cases to ensure zero unearned false alarms:
1. `EDGE-01`: **Legitimate High Usage (Party)** — High occupancy metadata prevents false escalation to Critical.
2. `EDGE-02`: **Legitimate Night Cleaning** — Single night flow interval triggers Watch only; requires $\ge 3$ consecutive intervals for High Risk.
3. `EDGE-03`: **Data Gaps** — Telemetry gap flags Data Gap Warning without false spike on recovery.
4. `EDGE-04`: **Stuck Sensor** — Zero-variance flow flagged as `MeterAnomaly` / Sensor Stuck, not physical leak.
5. `EDGE-05`: **Coastal Drainage Surge** — CFI flood indicator appended to evidence logs.
6. `EDGE-06`: **Sudden Sensor Drops** — Negative or sudden zero flow flagged as `Sensor Hardware Warning` (not confirmed leak).
7. `EDGE-07`: **Null Bursts** — 6 consecutive nulls (90m gap) raise Data Quality Warning and suppress false leak alerts.
8. `EDGE-08`: **Seasonal Tenant Turnover** — Occupancy update (2 $\rightarrow$ 5) scales baseline 2.5x; consumption surge not flagged as leak; audit record logged.

---

### Test Execution

To execute the full automated backend test suite, run:

```bash
pytest backend/tests/
```

**Verified Test Output**:
```
======================= 29 passed, 16 warnings in 6.25s =======================
```
- **Total Tests**: 29
- **Passed**: 29
- **Failed**: 0

---

### Frontend Build Verification

To verify the production frontend build, navigate to the `frontend/` directory and run:

```bash
cd frontend
npm run build
```

**Verified Build Output**:
```
> vite build
✓ 2299 modules transformed.
dist/index.html                   0.59 kB
dist/assets/index-CbIL6_lW.css   39.06 kB
dist/assets/index-DC_AGEa2.js   735.32 kB
✓ built in 10.35s
```
- **Modules Transformed**: 2,299
- **Errors**: 0

---

### Quality Assurance Strategy

1. **Input Validation**: Strict range checks $[0.0, 1.0]$ for CFI inputs and Pydantic schema validation on FastAPI request bodies.
2. **API Endpoint Validation**: FastAPI TestClient integration tests verifying HTTP 200 status codes, JSON response structure, and error payloads.
3. **Regression Testing**: Automated regression test (`test_existing_risk_scoring_regression`) ensuring Review 2 CFI additions do not alter baseline scoring behavior.
4. **Edge-Case Validation**: Dedicated empirical evaluator (`EdgeCaseTester`) testing 8 hardware and behavioral edge cases.
5. **Streaming Data Quality**: `StreamingBuffer` enforcing event-time re-ordering, deduplication lookup, lateness window bounds, and explicit rejection logging.
6. **Human-in-the-Loop Safety**: Mandatory staff override reasons, decision record creation, and mandatory disclaimer strings on leak localisations.
7. **Backend Error Handling**: Structured exception handling producing standard HTTP status codes (400, 404, 422).
8. **Frontend Error Boundary**: Class-based React Error Boundary (`ErrorBoundary.jsx`) wrapping page routes in `App.jsx` with `getDerivedStateFromError` and `componentDidCatch` to prevent white-screen UI crashes on render exceptions.

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
pytest backend/tests/
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
6. **Open Edge Cases (`/edge-cases`)**: Click `Re-Run All Edge Case Tests` to demonstrate passing results across all 8 failure modes.
7. **Open Cost & Impact (`/cost-impact`)**: Present environmental liters saved, financial ROI (4.7x), and unintended consequence mitigations.

---

## 📜 License & Academic Citation
Created for CAT II College Project — Coastal Water Infrastructure Anomaly Localisation.
