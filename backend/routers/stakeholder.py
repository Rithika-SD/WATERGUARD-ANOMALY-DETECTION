from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
from backend.database import get_db
from backend.models import StakeholderFeedback
from backend.schemas import StakeholderFeedbackIn

router = APIRouter(prefix="/api/stakeholder", tags=["Stakeholder Validation"])

@router.get("/results")
def get_stakeholder_results(db: Session = Depends(get_db)):
    feedback = db.query(StakeholderFeedback).order_by(StakeholderFeedback.submitted_at.desc()).all()
    result = []
    for f in feedback:
        result.append({
            "id": f.id,
            "feedback_id": f.feedback_id,
            "respondent_role": f.respondent_role,
            "ease_of_use": f.ease_of_use,
            "usefulness": f.usefulness,
            "trust_in_recommendations": f.trust_in_recommendations,
            "explanation_clarity": f.explanation_clarity,
            "alert_usefulness": f.alert_usefulness,
            "maintenance_workload_rating": f.maintenance_workload_rating,
            "willingness_to_use": f.willingness_to_use,
            "comments": f.comments,
            "is_demo": f.is_demo,
            "submitted_at": f.submitted_at.isoformat() if f.submitted_at else ""
        })
    return {
        "disclaimer": "Validation Template / Demo Validation Mode: Demo responses are stored with is_demo=True to distinguish from live field feedback.",
        "responses": result
    }

@router.post("/submit")
def submit_stakeholder_feedback(req: StakeholderFeedbackIn, db: Session = Depends(get_db)):
    fb_id = f"FBK-{uuid.uuid4().hex[:6].upper()}"
    sf = StakeholderFeedback(
        feedback_id=fb_id,
        respondent_role=req.respondent_role,
        ease_of_use=req.ease_of_use,
        usefulness=req.usefulness,
        trust_in_recommendations=req.trust_in_recommendations,
        explanation_clarity=req.explanation_clarity,
        alert_usefulness=req.alert_usefulness,
        maintenance_workload_rating=req.maintenance_workload_rating,
        willingness_to_use=req.willingness_to_use,
        comments=req.comments,
        is_demo=False,
        submitted_at=datetime.utcnow()
    )
    db.add(sf)
    db.commit()
    db.refresh(sf)
    return {"message": "Stakeholder feedback submitted successfully", "feedback_id": fb_id}
