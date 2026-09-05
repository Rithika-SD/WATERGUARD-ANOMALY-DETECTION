from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import uuid
from backend.database import get_db
from backend.models import MaintenanceRecord
from backend.schemas import MaintenanceCreate

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance"])

@router.get("")
def get_maintenance_records(
    status: Optional[str] = None,
    assigned_to: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MaintenanceRecord)
    if status and status != "All":
        query = query.filter(MaintenanceRecord.outcome == status)
    if assigned_to and assigned_to != "All":
        query = query.filter(MaintenanceRecord.assigned_to == assigned_to)

    records = query.order_by(MaintenanceRecord.maintenance_date.desc()).all()
    
    result = []
    for r in records:
        result.append({
            "id": r.id,
            "record_id": r.record_id,
            "apartment_id": r.apartment_id,
            "zone": r.zone,
            "alert_id": r.alert_id,
            "assigned_to": r.assigned_to,
            "maintenance_date": r.maintenance_date.isoformat() if r.maintenance_date else "",
            "outcome": r.outcome,
            "repair_cost": r.repair_cost,
            "resolution_time_hours": r.resolution_time_hours,
            "notes": r.notes
        })
    return result

@router.post("")
def create_maintenance_record(req: MaintenanceCreate, db: Session = Depends(get_db)):
    rec_id = f"MNT-{req.apartment_id}-{uuid.uuid4().hex[:4].upper()}"
    rec = MaintenanceRecord(
        record_id=rec_id,
        apartment_id=req.apartment_id,
        zone=req.zone,
        alert_id=req.alert_id,
        assigned_to=req.assigned_to,
        maintenance_date=datetime.utcnow(),
        outcome=req.outcome,
        repair_cost=req.repair_cost,
        resolution_time_hours=req.resolution_time_hours,
        notes=req.notes
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {"message": "Maintenance record created", "record_id": rec_id}

@router.put("/{record_id}")
def update_maintenance_outcome(record_id: str, outcome: str, notes: Optional[str] = None, db: Session = Depends(get_db)):
    rec = db.query(MaintenanceRecord).filter(MaintenanceRecord.record_id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Maintenance record not found")

    rec.outcome = outcome
    if notes:
        rec.notes = notes
    db.commit()
    return {"message": "Outcome updated successfully", "record_id": record_id, "outcome": outcome}
