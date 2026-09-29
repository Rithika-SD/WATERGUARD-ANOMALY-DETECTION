import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.ml.edge_case_tester import EdgeCaseTester

client = TestClient(app)

def test_sudden_sensor_drops_evaluation():
    # Test negative reading and sudden zero drop
    readings = [12.5, 12.0, -1.5, 0.0]
    result = EdgeCaseTester.evaluate_sudden_sensor_drop(readings)
    
    assert result["is_sensor_fault"] is True
    assert result["is_confirmed_leak"] is False
    assert result["risk_level"] in ["Suspicious", "Watch"]
    assert len(result["evidence"]) >= 1
    assert "Negative sensor reading detected" in result["evidence"][0] or "Sudden drop" in result["evidence"][0]

def test_null_burst_evaluation():
    # Test 6 consecutive nulls
    readings = [10.0, None, None, None, None, None, None, 10.5]
    result = EdgeCaseTester.evaluate_null_burst(readings)
    
    assert result["is_null_burst"] is True
    assert result["max_null_burst_count"] == 6
    assert result["duration_minutes"] == 90
    assert result["is_confirmed_leak"] is False
    assert "Null burst detected: 6 consecutive missing intervals" in result["evidence"][0]

def test_tenant_turnover_evaluation():
    # Test occupancy update from 2 to 5 residents
    result = EdgeCaseTester.evaluate_tenant_turnover(
        old_occupancy=2,
        new_occupancy=5,
        old_baseline=12.0,
        current_consumption=28.0
    )
    
    assert result["old_occupancy"] == 2
    assert result["new_occupancy"] == 5
    assert result["old_baseline"] == 12.0
    assert result["updated_baseline"] == 30.0  # 12.0 * (5/2) = 30.0
    assert result["is_confirmed_leak"] is False
    assert result["risk_level"] == "Normal"
    assert "Validated occupancy change logged" in result["evidence"][0]

def test_all_8_edge_cases_api():
    response = client.get("/api/edge-cases")
    assert response.status_code == 200
    data = response.json()
    
    assert data["total_cases"] == 8
    assert data["passed_cases"] == 8
    assert data["failed_cases"] == 0
    
    case_ids = [c["case_id"] for c in data["results"]]
    assert "EDGE-01" in case_ids
    assert "EDGE-05" in case_ids
    assert "EDGE-06" in case_ids
    assert "EDGE-07" in case_ids
    assert "EDGE-08" in case_ids
