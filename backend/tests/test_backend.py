import pytest
import os, sys
from fastapi.testclient import TestClient

# Ensure root path is in sys.path for test execution
sys.path.append(os.getcwd())

from backend.main import app
from backend.ml.risk_scorer import compute_risk_score
from backend.ml.leak_localiser import localise_leak
from backend.ml.edge_case_tester import EdgeCaseTester

client = TestClient(app)

def test_api_health():
    """Integration Test: Verifies system health check endpoint /api/health."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_dataset_files_exist():
    """Unit Test: Verifies that raw and cleaned CSV dataset files exist in data/ directory."""
    assert os.path.exists("data/raw_dataset.csv")
    assert os.path.exists("data/cleaned_dataset.csv")

def test_dashboard_endpoint():
    """API Integration Test: Verifies GET /api/dashboard returns apartment metrics & recent alerts."""
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "total_apartments" in data
    assert "estimated_water_loss_liters" in data
    assert "recent_alerts" in data

def test_apartments_endpoint():
    """API Integration Test: Verifies GET /api/apartments returns non-empty array of apartments."""
    response = client.get("/api/apartments")
    assert response.status_code == 200
    apts = response.json()
    assert isinstance(apts, list)
    assert len(apts) > 0

def test_alerts_endpoint():
    """API Integration Test: Verifies GET /api/alerts returns alerts list."""
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)

def test_evaluation_endpoint():
    """API Integration Test: Verifies GET /api/evaluation returns baseline, proposed, and KPI metrics."""
    response = client.get("/api/evaluation")
    assert response.status_code == 200
    data = response.json()
    assert "baseline" in data
    assert "proposed" in data
    assert "kpi" in data
    assert data["kpi"]["status"] in ["PASS", "FAIL"]

def test_edge_cases_endpoint():
    """API Integration Test: Verifies GET /api/edge-cases returns edge case evaluation results."""
    response = client.get("/api/edge-cases")
    assert response.status_code == 200
    data = response.json()
    assert data["passed_cases"] >= 5

def test_risk_scorer_night_flow():
    """Unit Test: Verifies risk scoring engine classifies high night flow as Critical risk with evidence."""
    score, level, evidence = compute_risk_score(
        consumption_current=12.0,
        consumption_expected=1.0,
        hour=3,
        occupancy_count=2,
        consecutive_night_intervals=4,
        z_score=3.5,
        rainfall_flood_risk=0.8
    )
    assert score >= 80.0
    assert level == "Critical"
    assert len(evidence) > 0

def test_leak_localiser_disclaimer():
    """Unit Test: Verifies leak localiser outputs mandatory recommendation disclaimer."""
    res = localise_leak(
        apartment_id="B1-101",
        building_id="B1",
        zone="Bathroom",
        current_consumption=18.0,
        expected_consumption=2.5,
        hour=2,
        evidence=["Night flow detected"]
    )
    assert "disclaimer" in res
    assert "RECOMMENDATION ONLY" in res["disclaimer"]

def test_human_confirmation_workflow():
    """Workflow Integration Test: Verifies staff confirmation workflow, status update, and audit tracking."""
    alerts_resp = client.get("/api/alerts")
    alerts = alerts_resp.json()
    if alerts:
        alert_id = alerts[0]["alert_id"]
        confirm_resp = client.post(
            f"/api/alerts/{alert_id}/confirm",
            json={
                "staff_name": "Ramesh Kumar",
                "role": "Apartment Manager",
                "reason": "Verified continuous bathroom flow on meter interval.",
                "notes": "Dispatched plumber"
            }
        )
        assert confirm_resp.status_code == 200
        
        detail_resp = client.get(f"/api/alerts/{alert_id}")
        assert detail_resp.status_code == 200
        assert detail_resp.json()["status"] == "Confirmed"
