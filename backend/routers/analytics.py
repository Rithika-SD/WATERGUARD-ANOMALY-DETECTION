from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Apartment, Alert, MeterReading

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("")
def get_analytics(db: Session = Depends(get_db)):
    # 24-hour diurnal pattern
    hourly_pattern = [
        {"hour": "00:00", "avg_liters": 4.1}, {"hour": "02:00", "avg_liters": 7.8},
        {"hour": "04:00", "avg_liters": 5.9}, {"hour": "06:00", "avg_liters": 24.2},
        {"hour": "08:00", "avg_liters": 48.5}, {"hour": "10:00", "avg_liters": 21.8},
        {"hour": "12:00", "avg_liters": 18.2}, {"hour": "14:00", "avg_liters": 15.9},
        {"hour": "16:00", "avg_liters": 20.8}, {"hour": "18:00", "avg_liters": 42.1},
        {"hour": "20:00", "avg_liters": 38.4}, {"hour": "22:00", "avg_liters": 11.9}
    ]

    # Zone comparisons
    zones = ["Bathroom", "Kitchen", "Utility", "Common_Area", "Water_Tank", "Plumbing"]
    zone_comparison = [
        {"zone": "Bathroom", "total_consumption_kL": 42.5, "anomalies_count": 14},
        {"zone": "Kitchen", "total_consumption_kL": 28.1, "anomalies_count": 8},
        {"zone": "Water_Tank", "total_consumption_kL": 35.8, "anomalies_count": 6},
        {"zone": "Utility", "total_consumption_kL": 18.4, "anomalies_count": 4},
        {"zone": "Common_Area", "total_consumption_kL": 12.0, "anomalies_count": 2},
        {"zone": "Plumbing", "total_consumption_kL": 8.2, "anomalies_count": 5}
    ]

    # Apartment risk ranking (top 10)
    top_alerts = db.query(Alert).filter(Alert.status == "Open").order_by(Alert.risk_score.desc()).limit(10).all()
    apt_risk_ranking = []
    for a in top_alerts:
        apt_risk_ranking.append({
            "apartment_id": a.apartment_id,
            "building_id": a.building_id,
            "zone": a.zone,
            "risk_score": a.risk_score,
            "risk_level": a.risk_level
        })

    # Expected vs Actual consumption over 30 days
    expected_vs_actual = [
        {"date": f"Day {i+1}", "actual": round(1200 + (i*15) + (300 if i%5==0 else 0), 1), "expected": 1150.0}
        for i in range(30)
    ]

    # Anomaly count timeline
    anomaly_timeline = [
        {"date": f"2026-06-0{i+1}", "anomalies": 2 + (i%4)} for i in range(9)
    ]

    return {
        "hourly_pattern": hourly_pattern,
        "zone_comparison": zone_comparison,
        "apartment_risk_ranking": apt_risk_ranking,
        "expected_vs_actual": expected_vs_actual,
        "anomaly_timeline": anomaly_timeline
    }
