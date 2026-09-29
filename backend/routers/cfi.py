from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from backend.ml.cfi_engine import CoastalFloodIndexEngine
from backend.ml.risk_scorer import compute_risk_score

router = APIRouter(prefix="/api/cfi", tags=["Coastal Flood Index"])

class CFICalculateRequest(BaseModel):
    rainfall_r: float = Field(..., ge=0.0, le=1.0, description="Normalized rainfall risk (0.0 to 1.0)")
    surge_s: float = Field(..., ge=0.0, le=1.0, description="Normalized storm surge/tide risk (0.0 to 1.0)")
    blockage_b: float = Field(..., ge=0.0, le=1.0, description="Normalized drainage blockage risk (0.0 to 1.0)")
    alpha: Optional[float] = Field(0.40, ge=0.0, le=1.0, description="Weight for rainfall")
    beta: Optional[float] = Field(0.35, ge=0.0, le=1.0, description="Weight for surge/tide")
    gamma: Optional[float] = Field(0.25, ge=0.0, le=1.0, description="Weight for blockage")

@router.get("/sensitivity")
def get_cfi_sensitivity(
    r: float = Query(0.75, ge=0.0, le=1.0),
    s: float = Query(0.60, ge=0.0, le=1.0),
    b: float = Query(0.50, ge=0.0, le=1.0),
    alpha: float = Query(0.40, ge=0.0, le=1.0),
    beta: float = Query(0.35, ge=0.0, le=1.0),
    gamma: float = Query(0.25, ge=0.0, le=1.0)
):
    try:
        engine = CoastalFloodIndexEngine(alpha=alpha, beta=beta, gamma=gamma)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        cfi_val = engine.calculate_cfi(r, s, b)
        sensitivity = engine.run_sensitivity_analysis(r, s, b)
        presets = engine.get_preset_environmental_scenarios()

        # Compute sample risk score impact
        sample_score, sample_level, sample_evidence = compute_risk_score(
            consumption_current=12.5,
            consumption_expected=4.0,
            hour=2,
            occupancy_count=2,
            consecutive_night_intervals=2,
            z_score=2.8,
            cfi_score=cfi_val
        )

        return {
            "formula_definition": {
                "formula": "CFI = α·R + β·S + γ·B",
                "variables": {
                    "R": "Normalized Rainfall Risk Index (0.0 to 1.0)",
                    "S": "Normalized Storm Surge / Tide Risk Index (0.0 to 1.0)",
                    "B": "Normalized Drainage Blockage Risk Index (0.0 to 1.0)"
                },
                "configured_weights": {
                    "alpha": engine.alpha,
                    "beta": engine.beta,
                    "gamma": engine.gamma,
                    "weights_sum": round(engine.alpha + engine.beta + engine.gamma, 4)
                }
            },
            "current_inputs": {"r": r, "s": s, "b": b},
            "calculated_cfi": cfi_val,
            "sample_risk_impact": {
                "risk_score": sample_score,
                "risk_level": sample_level,
                "evidence": sample_evidence
            },
            "sensitivity_analysis": sensitivity,
            "synthetic_environmental_scenarios": presets,
            "data_limitation_note": "Data Limitation Note: Standard apartment sub-meters do not measure raw tidal levels or physical channel debris. Inputs R, S, B use normalized coastal indicators (0-1) and synthetic environmental test scenarios."
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/calculate")
def calculate_custom_cfi(req: CFICalculateRequest):
    alpha = req.alpha if req.alpha is not None else 0.40
    beta = req.beta if req.beta is not None else 0.35
    gamma = req.gamma if req.gamma is not None else 0.25

    try:
        engine = CoastalFloodIndexEngine(alpha=alpha, beta=beta, gamma=gamma)
        cfi_val = engine.calculate_cfi(req.rainfall_r, req.surge_s, req.blockage_b)
        sensitivity = engine.run_sensitivity_analysis(req.rainfall_r, req.surge_s, req.blockage_b)
        
        return {
            "cfi_score": cfi_val,
            "weights": {"alpha": alpha, "beta": beta, "gamma": gamma},
            "inputs": {"r": req.rainfall_r, "s": req.surge_s, "b": req.blockage_b},
            "sensitivity": sensitivity
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
