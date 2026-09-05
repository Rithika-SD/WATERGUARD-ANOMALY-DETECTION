from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
import json, uuid
from backend.database import get_db
from backend.models import Alert, Decision, AuditLog, MaintenanceRecord
from backend.schemas import ActionRequest

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("")
def get_alerts(
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
    zone: Optional[str] = None,
    building_id: Optional[str] = None,
    apartment_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    
    if risk_level and risk_level != "All":
        query = query.filter(Alert.risk_level == risk_level)
    if status and status != "All":
        query = query.filter(Alert.status == status)
    if zone and zone != "All":
        query = query.filter(Alert.zone == zone)
    if building_id and building_id != "All":
        query = query.filter(Alert.building_id == building_id)
    if apartment_id and apartment_id != "All":
        query = query.filter(Alert.apartment_id == apartment_id)

    alerts = query.order_by(Alert.risk_score.desc()).all()

    result = []
    for a in alerts:
        result.append({
            "id": a.id,
            "alert_id": a.alert_id,
            "apartment_id": a.apartment_id,
            "building_id": a.building_id,
            "zone": a.zone,
            "meter_id": a.meter_id,
            "risk_level": a.risk_level,
            "risk_score": a.risk_score,
            "consumption_current": a.consumption_current,
            "consumption_expected": a.consumption_expected,
            "deviation_percent": a.deviation_percent,
            "estimated_loss_liters": a.estimated_loss_liters,
            "evidence": json.loads(a.evidence) if a.evidence else [],
            "possible_cause": a.possible_cause,
            "recommendation": a.recommendation,
            "confidence_percent": a.confidence_percent,
            "status": a.status,
            "timestamp": a.timestamp.isoformat() if a.timestamp else ""
        })

    return result

@router.get("/{alert_id}")
def get_alert_detail(alert_id: str, db: Session = Depends(get_db)):
    a = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")

    decisions = db.query(Decision).filter(Decision.alert_id == alert_id).order_by(Decision.timestamp.desc()).all()
    decisions_fmt = []
    for d in decisions:
        decisions_fmt.append({
            "decision_id": d.decision_id,
            "staff_name": d.staff_name,
            "role": d.role,
            "decision_type": d.decision_type,
            "reason": d.reason,
            "notes": d.notes,
            "override_reason": d.override_reason,
            "timestamp": d.timestamp.isoformat() if d.timestamp else ""
        })

    return {
        "id": a.id,
        "alert_id": a.alert_id,
        "apartment_id": a.apartment_id,
        "building_id": a.building_id,
        "zone": a.zone,
        "meter_id": a.meter_id,
        "risk_level": a.risk_level,
        "risk_score": a.risk_score,
        "consumption_current": a.consumption_current,
        "consumption_expected": a.consumption_expected,
        "deviation_percent": a.deviation_percent,
        "estimated_loss_liters": a.estimated_loss_liters,
        "evidence": json.loads(a.evidence) if a.evidence else [],
        "possible_cause": a.possible_cause,
        "recommendation": a.recommendation,
        "confidence_percent": a.confidence_percent,
        "status": a.status,
        "timestamp": a.timestamp.isoformat() if a.timestamp else "",
        "decisions": decisions_fmt
    }

def record_human_decision(
    alert_id: str,
    action_type: str,
    new_status: str,
    req: ActionRequest,
    db: Session
):
    a = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")

    # Update Alert status
    a.status = new_status
    if new_status in ["Confirmed", "Rejected", "FalsePositive"]:
        a.resolved_at = datetime.utcnow()

    # Create Decision record
    dec_id = f"DEC-{uuid.uuid4().hex[:8].upper()}"
    dec = Decision(
        decision_id=dec_id,
        alert_id=alert_id,
        staff_name=req.staff_name,
        role=req.role,
        decision_type=action_type,
        reason=req.reason,
        notes=req.notes,
        override_reason=req.override_reason,
        timestamp=datetime.utcnow()
    )
    db.add(dec)

    # Create Audit Log entry
    audit = AuditLog(
        log_id=f"LOG-{uuid.uuid4().hex[:8].upper()}",
        action=f"Alert {action_type}",
        entity_type="Alert",
        entity_id=alert_id,
        user_name=req.staff_name,
        role=req.role,
        details=json.dumps({
            "previous_status": a.status,
            "new_status": new_status,
            "reason": req.reason,
            "override_reason": req.override_reason
        }),
        timestamp=datetime.utcnow()
    )
    db.add(audit)

    # If confirmed investigation -> create Maintenance Record automatically
    if action_type == "Confirmed":
        mr = MaintenanceRecord(
            record_id=f"MNT-{a.apartment_id}-{uuid.uuid4().hex[:4].upper()}",
            apartment_id=a.apartment_id,
            zone=a.zone,
            alert_id=alert_id,
            assigned_to="Assigned Plumbing Supervisor",
            maintenance_date=datetime.utcnow(),
            outcome="Pending",
            notes=f"Investigation confirmed by {req.staff_name}. Reason: {req.reason}"
        )
        db.add(mr)

    db.commit()
    db.refresh(a)
    return {"message": f"Alert {action_type} successfully recorded", "alert_id": alert_id, "status": new_status}

@router.post("/{alert_id}/confirm")
def confirm_alert(alert_id: str, req: ActionRequest, db: Session = Depends(get_db)):
    return record_human_decision(alert_id, "Confirmed", "Confirmed", req, db)

@router.post("/{alert_id}/reject")
def reject_alert(alert_id: str, req: ActionRequest, db: Session = Depends(get_db)):
    return record_human_decision(alert_id, "Rejected", "Rejected", req, db)

@router.post("/{alert_id}/override")
def override_alert(alert_id: str, req: ActionRequest, db: Session = Depends(get_db)):
    if not req.override_reason:
        raise HTTPException(status_code=400, detail="Override reason is strictly required for override actions.")
    return record_human_decision(alert_id, "Overridden", "Rejected", req, db)

@router.post("/{alert_id}/defer")
def defer_alert(alert_id: str, req: ActionRequest, db: Session = Depends(get_db)):
    return record_human_decision(alert_id, "Deferred", "Deferred", req, db)

@router.post("/{alert_id}/escalate")
def escalate_alert(alert_id: str, req: ActionRequest, db: Session = Depends(get_db)):
    return record_human_decision(alert_id, "Escalated", "Escalated", req, db)

@router.post("/{alert_id}/false-positive")
def mark_false_positive(alert_id: str, req: ActionRequest, db: Session = Depends(get_db)):
    return record_human_decision(alert_id, "FalsePositive", "FalsePositive", req, db)
