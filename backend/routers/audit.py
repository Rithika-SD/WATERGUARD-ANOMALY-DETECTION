from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import AuditLog
import json

router = APIRouter(prefix="/api/audit-log", tags=["Audit Log"])

@router.get("")
def get_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    result = []
    for l in logs:
        det = json.loads(l.details) if l.details else {}
        result.append({
            "id": l.id,
            "log_id": l.log_id,
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "user_name": l.user_name,
            "role": l.role,
            "details": det,
            "timestamp": l.timestamp.isoformat() if l.timestamp else ""
        })
    return result
