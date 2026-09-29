import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.ml.cfi_engine import CoastalFloodIndexEngine
from backend.ml.risk_scorer import compute_risk_score

client = TestClient(app)

def test_cfi_valid_inputs_and_calculation():
    engine = CoastalFloodIndexEngine(alpha=0.40, beta=0.35, gamma=0.25)
    cfi = engine.calculate_cfi(r=0.8, s=0.6, b=0.4)
    expected = (0.40 * 0.8) + (0.35 * 0.6) + (0.25 * 0.4) # 0.32 + 0.21 + 0.10 = 0.63
    assert abs(cfi - expected) < 1e-4

def test_cfi_invalid_inputs_out_of_range():
    engine = CoastalFloodIndexEngine()
    with pytest.raises(ValueError, match="Input Rainfall .* range"):
        engine.calculate_cfi(r=1.5, s=0.5, b=0.5)
    with pytest.raises(ValueError, match="Input Storm Surge/Tide .* range"):
        engine.calculate_cfi(r=0.5, s=-0.2, b=0.5)
    with pytest.raises(ValueError, match="Input Drainage Blockage .* range"):
        engine.calculate_cfi(r=0.5, s=0.5, b=2.0)

def test_cfi_weights_not_summing_to_one():
    with pytest.raises(ValueError, match="Weights must sum to 1.0"):
        CoastalFloodIndexEngine(alpha=0.5, beta=0.5, gamma=0.5)
    with pytest.raises(ValueError, match="Weights cannot be negative"):
        CoastalFloodIndexEngine(alpha=1.2, beta=-0.1, gamma=-0.1)

def test_cfi_sensitivity_scenarios():
    engine = CoastalFloodIndexEngine(alpha=0.40, beta=0.35, gamma=0.25)
    res = engine.run_sensitivity_analysis(r=0.90, s=0.20, b=0.10)
    scenarios = res["sensitivity_scenarios"]
    assert len(scenarios) == 5
    
    # Check scenario IDs
    profile_ids = [s["profile_id"] for s in scenarios]
    assert "configured" in profile_ids
    assert "equal" in profile_ids
    assert "rainfall_heavy" in profile_ids
    assert "tide_heavy" in profile_ids
    assert "blockage_heavy" in profile_ids

    # Higher rainfall weight should give higher score when R=0.90 is high
    rainfall_heavy_score = next(s["cfi_score"] for s in scenarios if s["profile_id"] == "rainfall_heavy")
    tide_heavy_score = next(s["cfi_score"] for s in scenarios if s["profile_id"] == "tide_heavy")
    assert rainfall_heavy_score > tide_heavy_score

def test_existing_risk_scoring_regression():
    # Test without CFI (backwards compatibility)
    score_old, level_old, ev_old = compute_risk_score(
        consumption_current=12.0,
        consumption_expected=2.0,
        hour=3,
        occupancy_count=2,
        consecutive_night_intervals=2,
        z_score=3.2,
        rainfall_flood_risk=0.8
    )
    assert score_old >= 60.0
    assert "High Coastal Flood Index" in str(ev_old) or "Critical Coastal Flood Index" in str(ev_old)

    # Test with explicit cfi_score
    score_new, level_new, ev_new = compute_risk_score(
        consumption_current=12.0,
        consumption_expected=2.0,
        hour=3,
        occupancy_count=2,
        consecutive_night_intervals=2,
        z_score=3.2,
        cfi_score=0.85
    )
    assert score_new >= 60.0
    assert "Critical Coastal Flood Index (CFI: 0.85)" in str(ev_new)

def test_cfi_api_sensitivity_endpoint():
    response = client.get("/api/cfi/sensitivity?r=0.85&s=0.70&b=0.50&alpha=0.40&beta=0.35&gamma=0.25")
    assert response.status_code == 200
    data = response.json()
    assert "formula_definition" in data
    assert data["calculated_cfi"] > 0
    assert len(data["sensitivity_analysis"]["sensitivity_scenarios"]) == 5
    assert len(data["synthetic_environmental_scenarios"]) >= 4

def test_cfi_api_calculate_endpoint():
    payload = {
        "rainfall_r": 0.80,
        "surge_s": 0.60,
        "blockage_b": 0.40,
        "alpha": 0.40,
        "beta": 0.35,
        "gamma": 0.25
    }
    response = client.post("/api/cfi/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["cfi_score"] == 0.63
