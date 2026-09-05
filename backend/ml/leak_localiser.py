from typing import Dict, Any, List

def localise_leak(
    apartment_id: str,
    building_id: str,
    zone: str,
    current_consumption: float,
    expected_consumption: float,
    hour: int,
    evidence: List[str]
) -> Dict[str, Any]:
    """
    Localises the most likely leak source zone, estimated loss rate, possible cause, and recommended action.
    Returns recommendation with explicit disclaimer.
    """
    excess_flow = max(0.0, current_consumption - expected_consumption)
    loss_liters_per_hour = excess_flow * 4.0 # 4 intervals per hour
    
    cause_mapping = {
        "Bathroom": ("Toilet Flapper Leak or Continuous Flush", "Inspect Bathroom Zone immediately. Check toilet cistern flapper valve, shower fixtures, and drain joints for continuous runoff between 01:00–04:00."),
        "Kitchen": ("Under-sink Pipe Joint Leak / Appliance Line Break", "Inspect Kitchen sink plumbing, dishwasher line connections, and main shut-off valve for persistent dripping or joint seepage."),
        "Utility": ("Washing Machine Inlet Valve or Drain Overflow", "Check washing machine hose connections, water heater pressure release valve, and utility basin drains."),
        "Common_Area": ("Corridor Main Line Joint Burst", "Check floor riser pipes and main corridor distribution valves."),
        "Water_Tank": ("Rooftop Tank Float Valve Overflow", "Inspect rooftop storage tank float valve, overflow bypass outlet, and pump auto-shutoff mechanism."),
        "Plumbing": ("Riser Pipe Rupture / Hidden Wall Leak", "Inspect vertical plumbing shaft and floor boundary walls for dampness or pressure drops.")
    }
    
    possible_cause, recommendation = cause_mapping.get(
        zone, 
        ("General Plumbing Anomaly", "Perform full physical inspection of water fixtures and line connections in apartment.")
    )

    # Confidence calculation
    if current_consumption > 3 * expected_consumption:
        confidence = 92.0
    elif current_consumption > 2 * expected_consumption:
        confidence = 84.0
    else:
        confidence = 72.0

    return {
        "apartment_id": apartment_id,
        "building_id": building_id,
        "zone": zone,
        "current_consumption": round(current_consumption, 2),
        "expected_consumption": round(expected_consumption, 2),
        "difference_liters": round(excess_flow, 2),
        "estimated_loss_liters_per_hour": round(loss_liters_per_hour, 1),
        "confidence_percent": confidence,
        "top_evidence": evidence[:3] if evidence else ["Abnormal flow rate relative to baseline."],
        "possible_cause": possible_cause,
        "recommended_action": recommendation,
        "disclaimer": "RECOMMENDATION ONLY: Localisation relies on meter interval pattern matching. Physical inspection by maintenance staff is required before taking high-impact invasive repairs."
    }
