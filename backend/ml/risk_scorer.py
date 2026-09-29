import numpy as np
from typing import Dict, List, Tuple, Optional

def compute_risk_score(
    consumption_current: float,
    consumption_expected: float,
    hour: int,
    occupancy_count: int,
    consecutive_night_intervals: int = 0,
    z_score: float = 0.0,
    rainfall_flood_risk: float = 0.0,
    stuck_counter: int = 0,
    cfi_score: Optional[float] = None
) -> Tuple[float, str, List[str]]:
    """
    Computes a risk score (0-100) and risk level, returning explanation evidence list.
    Preserves all existing anomaly rules while seamlessly incorporating the Coastal Flood Index (CFI).
    """
    score = 0.0
    evidence = []
    
    # 1. Night Flow Detection (01:00 to 05:00)
    is_night = (1 <= hour <= 5)
    if is_night and consumption_current > 4.0:
        pts = min(35, 15 + consecutive_night_intervals * 5)
        score += pts
        evidence.append(f"Unusual continuous night consumption ({consumption_current:.1f}L/15m) detected between 01:00-05:00 for {consecutive_night_intervals+1} consecutive intervals.")

    # 2. Z-Score Statistical Deviation
    if z_score > 3.0:
        score += 25
        evidence.append(f"Water flow rate is statistically abnormal with a high Z-score of {z_score:.2f} (standard deviation limit > 3.0).")
    elif z_score > 2.0:
        score += 15
        evidence.append(f"Moderate statistical deviation detected (Z-score: {z_score:.2f}).")

    # 3. Consumption vs Expected Ratio
    if consumption_expected > 0:
        ratio = consumption_current / consumption_expected
        if ratio >= 3.0:
            score += 25
            evidence.append(f"Current consumption is {ratio:.1f}x higher than the occupancy-adjusted baseline ({consumption_expected:.1f}L).")
        elif ratio >= 2.0:
            score += 15
            evidence.append(f"Current consumption exceeds expected occupancy baseline by {(ratio-1)*100:.0f}%.")

    # 4. Sensor Stuck / Zero Variance Anomaly
    if stuck_counter >= 4:
        score += 20
        evidence.append(f"Meter reading static at identical non-zero value ({consumption_current:.1f}L) for {stuck_counter} consecutive intervals.")

    # 5. Coastal Flood Index (CFI) Integration
    # Use cfi_score if explicitly provided, else fall back to rainfall_flood_risk for backwards compatibility
    effective_cfi = cfi_score if cfi_score is not None else rainfall_flood_risk
    if effective_cfi >= 0.75:
        score += 15
        evidence.append(f"Critical Coastal Flood Index (CFI: {effective_cfi:.2f}) active. Severe vulnerability to drainage backflow & coastal surge.")
    elif effective_cfi >= 0.50:
        score += 10
        evidence.append(f"High Coastal Flood Index (CFI: {effective_cfi:.2f}) active for building area.")
    elif effective_cfi >= 0.25:
        score += 5
        evidence.append(f"Moderate Coastal Flood Index (CFI: {effective_cfi:.2f}) active.")

    final_score = min(100.0, round(score, 1))

    # Risk level classification
    if final_score >= 80.0:
        risk_level = "Critical"
    elif final_score >= 60.0:
        risk_level = "High_Risk"
    elif final_score >= 40.0:
        risk_level = "Suspicious"
    elif final_score >= 20.0:
        risk_level = "Watch"
    else:
        risk_level = "Normal"

    if not evidence:
        evidence.append("Consumption patterns strictly within expected normal baseline.")

    return final_score, risk_level, evidence
