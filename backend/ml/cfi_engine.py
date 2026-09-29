import numpy as np
from typing import Dict, List, Any, Tuple

class CoastalFloodIndexEngine:
    """
    Coastal Flood Index (CFI) Engine:
    Calculates composite flood risk score using normalized environmental indicators:
    
    Formula: CFI = α·R + β·S + γ·B
    Where:
      R = Normalized Rainfall Risk Index (0.0 to 1.0)
      S = Normalized Storm Surge / Tide Risk Index (0.0 to 1.0)
      B = Normalized Drainage Blockage Risk Index (0.0 to 1.0)
      α, β, γ = Configurable weights that MUST sum to 1.0 (±1e-4)
      
    Data Note:
    Due to the lack of direct physical tidal sensors in standard apartment sub-meters,
    R, S, B inputs use normalized indices (0-1 scale) derived from coastal weather feeds
    and synthetic environmental test scenarios.
    """

    DEFAULT_ALPHA = 0.40  # Rainfall weight
    DEFAULT_BETA = 0.35   # Tide/Surge weight
    DEFAULT_GAMMA = 0.25  # Drainage blockage weight

    def __init__(self, alpha: float = DEFAULT_ALPHA, beta: float = DEFAULT_BETA, gamma: float = DEFAULT_GAMMA):
        self.alpha = float(alpha)
        self.beta = float(beta)
        self.gamma = float(gamma)
        self.validate_weights(self.alpha, self.beta, self.gamma)

    @staticmethod
    def validate_weights(alpha: float, beta: float, gamma: float) -> bool:
        weight_sum = alpha + beta + gamma
        if not (0.999 <= weight_sum <= 1.001):
            raise ValueError(f"Weights must sum to 1.0. Got alpha={alpha}, beta={beta}, gamma={gamma} (sum={weight_sum:.4f})")
        if alpha < 0 or beta < 0 or gamma < 0:
            raise ValueError("Weights cannot be negative.")
        return True

    @staticmethod
    def validate_inputs(r: float, s: float, b: float) -> bool:
        for name, val in [("Rainfall (R)", r), ("Storm Surge/Tide (S)", s), ("Drainage Blockage (B)", b)]:
            if val < 0.0 or val > 1.0:
                raise ValueError(f"Input {name} must be normalized in range [0.0, 1.0]. Got {val}")
        return True

    def calculate_cfi(self, r: float, s: float, b: float) -> float:
        """
        Calculates CFI score (0.0 to 1.0).
        """
        self.validate_inputs(r, s, b)
        cfi = (self.alpha * r) + (self.beta * s) + (self.gamma * b)
        return round(float(np.clip(cfi, 0.0, 1.0)), 4)

    def run_sensitivity_analysis(self, r: float, s: float, b: float) -> Dict[str, Any]:
        """
        Compares CFI output across 5 sensitivity weight profiles:
          1. Current Configured Weights
          2. Equal Weights
          3. Higher Rainfall Weight
          4. Higher Tide Weight
          5. Higher Blockage Weight
        """
        self.validate_inputs(r, s, b)

        profiles = [
            {"id": "configured", "name": "Current Configured", "alpha": self.alpha, "beta": self.beta, "gamma": self.gamma},
            {"id": "equal", "name": "Equal Weights", "alpha": 0.333, "beta": 0.333, "gamma": 0.334},
            {"id": "rainfall_heavy", "name": "Higher Rainfall Weight", "alpha": 0.60, "beta": 0.20, "gamma": 0.20},
            {"id": "tide_heavy", "name": "Higher Tide Weight", "alpha": 0.20, "beta": 0.60, "gamma": 0.20},
            {"id": "blockage_heavy", "name": "Higher Blockage Weight", "alpha": 0.20, "beta": 0.20, "gamma": 0.60},
        ]

        scenarios_results = []
        for p in profiles:
            score = round((p["alpha"] * r) + (p["beta"] * s) + (p["gamma"] * b), 4)
            
            # Risk classification based on CFI
            if score >= 0.75:
                risk_cat = "Critical Coastal Risk"
            elif score >= 0.50:
                risk_cat = "High Coastal Risk"
            elif score >= 0.25:
                risk_cat = "Moderate Coastal Risk"
            else:
                risk_cat = "Low Coastal Risk"

            scenarios_results.append({
                "profile_id": p["id"],
                "profile_name": p["name"],
                "alpha": p["alpha"],
                "beta": p["beta"],
                "gamma": p["gamma"],
                "cfi_score": score,
                "risk_category": risk_cat,
                "score_percent": round(score * 100, 1)
            })

        return {
            "inputs": {"rainfall_r": r, "surge_s": s, "blockage_b": b},
            "formula": "CFI = α·R + β·S + γ·B",
            "sensitivity_scenarios": scenarios_results
        }

    @staticmethod
    def get_preset_environmental_scenarios() -> List[Dict[str, Any]]:
        """
        Returns clearly labeled synthetic test scenarios for coastal flood testing.
        """
        return [
            {
                "id": "clear_weather",
                "name": "Normal Clear Weather",
                "description": "Low rainfall, normal low tide, clear municipal drainage channels.",
                "r": 0.10, "s": 0.05, "b": 0.10
            },
            {
                "id": "monsoon_heavy",
                "name": "Monsoon Downpour (High Rain)",
                "description": "Heavy coastal rainfall, normal tide, moderate channel debris.",
                "r": 0.85, "s": 0.20, "b": 0.35
            },
            {
                "id": "high_tide_surge",
                "name": "High Tide / Storm Surge Peak",
                "description": "Moderate rain, severe high tide storm surge pushing coastal water inland.",
                "r": 0.30, "s": 0.90, "b": 0.40
            },
            {
                "id": "drainage_blockage",
                "name": "Severe Drainage Blockage",
                "description": "Light rain, moderate tide, severe plastic/debris blockage in street drains.",
                "r": 0.25, "s": 0.25, "b": 0.95
            },
            {
                "id": "coastal_catastrophe",
                "name": "Compound Coastal Flood Surge",
                "description": "Simultaneous heavy coastal rainfall, high tide surge, and blocked drainage channels.",
                "r": 0.90, "s": 0.85, "b": 0.90
            }
        ]
