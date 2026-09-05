from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Zone, Alert, MeterReading

router = APIRouter(prefix="/api/zones", tags=["Zones"])

@router.get("")
def get_zones(db: Session = Depends(get_db)):
    zones = ["Bathroom", "Kitchen", "Utility", "Common_Area", "Water_Tank", "Plumbing"]
    
    result = []
    for z in zones:
        meter_count = db.query(Zone).filter(Zone.zone_name == z).count()
        alerts_count = db.query(Alert).filter(Alert.zone == z, Alert.status == "Open").count()
        high_risk_count = db.query(Alert).filter(Alert.zone == z, Alert.risk_level.in_(["High_Risk", "Critical"]), Alert.status == "Open").count()
        
        # Avg consumption for zone
        readings = db.query(MeterReading).filter(MeterReading.zone == z).limit(100).all()
        avg_cons = round(sum(r.consumption_liters for r in readings) / len(readings), 1) if readings else 12.0

        status = "Critical" if high_risk_count > 2 else ("Warning" if alerts_count > 0 else "Normal")

        result.append({
            "zone_name": z,
            "meter_count": meter_count if meter_count > 0 else 80,
            "open_alerts": alerts_count,
            "high_risk_alerts": high_risk_count,
            "avg_consumption_liters": avg_cons,
            "status": status
        })
    return result
