import pandas as pd
import numpy as np
from typing import List, Dict, Any
from backend.ml.risk_scorer import compute_risk_score
from backend.ml.leak_localiser import localise_leak

class AnomalyDetectorPipeline:
    """
    Explainable Anomaly Detection Pipeline:
    Combines occupancy-adjusted baseline, rolling z-score, night-flow detection,
    and rule-based scoring to classify water consumption anomalies.
    """
    def __init__(self):
        pass

    def process_readings(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        if df.empty:
            return []

        alerts = []
        df = df.copy()
        
        if 'apartment_zone' in df.columns and 'zone' not in df.columns:
            df['zone'] = df['apartment_zone']

        # Sort by timestamp
        df['timestamp_dt'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values('timestamp_dt')

        # Group by apartment & zone to compute expected baselines
        zone_factors = {
            'Kitchen': 1.2, 'Bathroom': 2.5, 'Utility': 0.8,
            'Common_Area': 0.5, 'Water_Tank': 1.5, 'Plumbing': 0.2
        }

        grouped = df.groupby(['apartment_id', 'zone'])

        for (apt_id, zone), group in grouped:
            group = group.copy()
            mean_val = group['water_consumption_liters'].mean() if 'water_consumption_liters' in group.columns else group['consumption_liters'].mean()
            std_val = max(0.5, group['water_consumption_liters'].std() if 'water_consumption_liters' in group.columns else group['consumption_liters'].std())

            consecutive_night = 0
            stuck_val = None
            stuck_count = 0

            for idx, row in group.iterrows():
                cons = float(row.get('water_consumption_liters', row.get('consumption_liters', 0.0)))
                hour = int(row['hour'])
                occ = int(row.get('occupancy_count', 2))
                building_id = str(row.get('building_id', apt_id.split('-')[0]))
                flood_risk = float(row.get('rainfall_flood_risk', 0.1))

                # Diurnal expected factor
                if 1 <= hour <= 5:
                    time_factor = 0.05
                elif 6 <= hour <= 9:
                    time_factor = 1.8
                elif 18 <= hour <= 21:
                    time_factor = 1.5
                else:
                    time_factor = 0.6

                z_mult = zone_factors.get(zone, 1.0)
                expected = max(0.5, round(occ * z_mult * time_factor * 1.5, 2))

                # Track night flow consecutive counter
                if (1 <= hour <= 5) and cons > 4.0:
                    consecutive_night += 1
                else:
                    consecutive_night = 0

                # Track stuck sensor counter
                if cons > 0 and cons == stuck_val:
                    stuck_count += 1
                else:
                    stuck_val = cons
                    stuck_count = 1

                # Z-score
                z_score = (cons - mean_val) / std_val if std_val > 0 else 0.0

                # Compute risk score & evidence
                risk_score, risk_level, evidence = compute_risk_score(
                    consumption_current=cons,
                    consumption_expected=expected,
                    hour=hour,
                    occupancy_count=occ,
                    consecutive_night_intervals=consecutive_night,
                    z_score=z_score,
                    rainfall_flood_risk=flood_risk,
                    stuck_counter=stuck_count
                )

                # Localise if Watch or higher
                if risk_level in ['Watch', 'Suspicious', 'High_Risk', 'Critical']:
                    loc = localise_leak(
                        apartment_id=apt_id,
                        building_id=building_id,
                        zone=zone,
                        current_consumption=cons,
                        expected_consumption=expected,
                        hour=hour,
                        evidence=evidence
                    )

                    deviation_pct = round(((cons - expected) / expected) * 100, 1) if expected > 0 else 0.0
                    est_loss = max(0.0, round((cons - expected) * 4, 1))

                    alert_item = {
                        "alert_id": f"ALT-{apt_id}-{zone[:3].upper()}-{int(row['timestamp_dt'].timestamp())}",
                        "apartment_id": apt_id,
                        "building_id": building_id,
                        "zone": zone,
                        "meter_id": str(row['meter_id']),
                        "timestamp": row['timestamp_dt'],
                        "risk_level": risk_level,
                        "risk_score": risk_score,
                        "consumption_current": cons,
                        "consumption_expected": expected,
                        "deviation_percent": deviation_pct,
                        "estimated_loss_liters": est_loss,
                        "evidence": evidence,
                        "possible_cause": loc["possible_cause"],
                        "recommendation": loc["recommended_action"],
                        "confidence_percent": loc["confidence_percent"],
                        "status": "Open"
                    }
                    alerts.append(alert_item)

        return alerts
