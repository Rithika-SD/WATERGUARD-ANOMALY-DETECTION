from fastapi import APIRouter

router = APIRouter(prefix="/api/cost-impact", tags=["Cost & Impact Analysis"])

@router.get("")
def get_cost_impact_analysis():
    return {
        "environmental": {
            "estimated_liters_saved": 45230,
            "water_wastage_avoided_percent": 14.2,
            "co2_footprint_reduction_kg": 180.5
        },
        "social": {
            "service_disruptions_prevented": 12,
            "avg_investigation_lead_time_improvement_hours": 16.5,
            "resident_inconvenience_rating": "Low"
        },
        "cost": {
            "total_maintenance_invested_inr": 32500,
            "estimated_structural_damage_avoided_inr": 185000,
            "net_financial_savings_inr": 152500,
            "roi_multiplier": "4.7x"
        },
        "maintenance_burden": {
            "total_alerts_generated": 35,
            "false_positives_count": 5,
            "false_positive_rate_percent": 8.5,
            "avg_investigation_time_mins": 25
        },
        "unintended_consequences": [
            {
                "consequence": "Unnecessary Physical Inspection",
                "occurrences": 5,
                "impact": "Minor staff time overhead (25 mins per event).",
                "mitigation": "Require human confirmation with staff override reason before dispatch."
            },
            {
                "consequence": "Resident Privacy / Inspection Disruption",
                "occurrences": 3,
                "impact": "Brief resident interaction for bathroom inspection.",
                "mitigation": "Provide evidence summary to resident prior to entry."
            }
        ],
        "disclaimer": "Cost & Impact metrics use synthetic operational estimates calibrated for small coastal town apartment complexes."
    }
