from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from backend.database import get_db
from backend.models import Apartment, Alert, MeterReading, MaintenanceRecord
import json

router = APIRouter(prefix="/api/apartments", tags=["Apartments"])

@router.get("")
def get_apartments(
    building_id: Optional[str] = None,
    risk_level: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Apartment)
    if building_id and building_id != "All":
        query = query.filter(Apartment.building_id == building_id)

    apts = query.all()

    result = []
    for a in apts:
        # Get highest risk alert for this apt
        highest_alert = db.query(Alert).filter(Alert.apartment_id == a.apartment_id, Alert.status == "Open").order_by(Alert.risk_score.desc()).first()
        risk_s = highest_alert.risk_score if highest_alert else 15.0
        risk_l = highest_alert.risk_level if highest_alert else "Normal"

        if risk_level and risk_level != "All" and risk_l != risk_level:
            continue

        if search:
            s_lower = search.lower()
            if s_lower not in a.apartment_id.lower() and s_lower not in a.building_id.lower():
                continue

        # Last reading
        last_rdg = db.query(MeterReading).filter(MeterReading.apartment_id == a.apartment_id).order_by(MeterReading.timestamp.desc()).first()
        cons_curr = last_rdg.consumption_liters if last_rdg else 8.5

        result.append({
            "id": a.id,
            "apartment_id": a.apartment_id,
            "building_id": a.building_id,
            "floor": a.floor,
            "occupancy_count": a.occupancy_count,
            "occupancy_assumption": a.occupancy_assumption,
            "risk_score": risk_s,
            "risk_level": risk_l,
            "current_consumption": cons_curr,
            "expected_consumption": round(a.occupancy_count * 5.5, 1)
        })

    return result

@router.get("/{apartment_id}")
def get_apartment_detail(apartment_id: str, db: Session = Depends(get_db)):
    apt = db.query(Apartment).filter(Apartment.apartment_id == apartment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Apartment not found")

    # Recent alerts
    alerts = db.query(Alert).filter(Alert.apartment_id == apartment_id).order_by(Alert.timestamp.desc()).limit(5).all()
    alerts_fmt = []
    for a in alerts:
        alerts_fmt.append({
            "alert_id": a.alert_id,
            "zone": a.zone,
            "risk_level": a.risk_level,
            "risk_score": a.risk_score,
            "consumption_current": a.consumption_current,
            "consumption_expected": a.consumption_expected,
            "evidence": json.loads(a.evidence) if a.evidence else [],
            "recommendation": a.recommendation,
            "status": a.status,
            "timestamp": a.timestamp.isoformat() if a.timestamp else ""
        })

    # Historical consumption (last 24 readings)
    readings = db.query(MeterReading).filter(MeterReading.apartment_id == apartment_id).order_by(MeterReading.timestamp.desc()).limit(24).all()
    readings_fmt = []
    for r in reversed(readings):
        readings_fmt.append({
            "timestamp": r.timestamp.strftime('%H:%M'),
            "zone": r.zone,
            "consumption_liters": r.consumption_liters,
            "anomaly_type": r.anomaly_type
        })

    # Maintenance history
    maint = db.query(MaintenanceRecord).filter(MaintenanceRecord.apartment_id == apartment_id).order_by(MaintenanceRecord.maintenance_date.desc()).all()
    maint_fmt = []
    for m in maint:
        maint_fmt.append({
            "record_id": m.record_id,
            "zone": m.zone,
            "assigned_to": m.assigned_to,
            "outcome": m.outcome,
            "repair_cost": m.repair_cost,
            "resolution_time_hours": m.resolution_time_hours,
            "notes": m.notes,
            "maintenance_date": m.maintenance_date.strftime('%Y-%m-%d') if m.maintenance_date else ""
        })

    highest_alert = db.query(Alert).filter(Alert.apartment_id == apartment_id, Alert.status == "Open").order_by(Alert.risk_score.desc()).first()

    return {
        "apartment_id": apt.apartment_id,
        "building_id": apt.building_id,
        "floor": apt.floor,
        "occupancy_count": apt.occupancy_count,
        "occupancy_assumption": apt.occupancy_assumption,
        "risk_score": highest_alert.risk_score if highest_alert else 15.0,
        "risk_level": highest_alert.risk_level if highest_alert else "Normal",
        "current_consumption": readings[0].consumption_liters if readings else 8.5,
        "expected_consumption": round(apt.occupancy_count * 5.5, 1),
        "recent_alerts": alerts_fmt,
        "meter_intervals": readings_fmt,
        "maintenance_history": maint_fmt,
        "leak_probability": round((highest_alert.risk_score / 100.0) * 0.95, 2) if highest_alert else 0.08,
        "recommended_action": highest_alert.recommendation if highest_alert else "No immediate action required. Routine monitoring active."
    }
