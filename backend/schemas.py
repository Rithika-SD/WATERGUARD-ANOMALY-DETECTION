from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class ApartmentBase(BaseModel):
    apartment_id: str
    building_id: str
    floor: int
    occupancy_count: int
    occupancy_assumption: str

class ApartmentOut(ApartmentBase):
    id: int
    risk_score: Optional[float] = 0.0
    risk_level: Optional[str] = "Normal"
    current_consumption: Optional[float] = 0.0
    expected_consumption: Optional[float] = 0.0

    class Config:
        from_attributes = True

class MeterReadingOut(BaseModel):
    id: int
    meter_id: str
    apartment_id: str
    zone: str
    timestamp: datetime
    consumption_liters: float
    hour: int
    day_of_week: str
    weekend_flag: int
    rainfall_flood_risk: float
    anomaly_type: str
    leak_status: str

    class Config:
        from_attributes = True

class AlertOut(BaseModel):
    id: int
    alert_id: str
    apartment_id: str
    building_id: str
    zone: str
    meter_id: str
    timestamp: datetime
    risk_level: str
    risk_score: float
    consumption_current: float
    consumption_expected: float
    deviation_percent: float
    estimated_loss_liters: float
    evidence: Any # list of strings or JSON parsed
    possible_cause: str
    recommendation: str
    confidence_percent: float
    status: str

    class Config:
        from_attributes = True

class ActionRequest(BaseModel):
    staff_name: str
    role: str
    reason: str
    notes: Optional[str] = None
    override_reason: Optional[str] = None

class DecisionOut(BaseModel):
    id: int
    decision_id: str
    alert_id: str
    staff_name: str
    role: str
    decision_type: str
    reason: str
    notes: Optional[str] = None
    override_reason: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class MaintenanceRecordOut(BaseModel):
    id: int
    record_id: str
    apartment_id: str
    zone: str
    alert_id: Optional[str] = None
    assigned_to: str
    maintenance_date: datetime
    outcome: str
    repair_cost: float
    resolution_time_hours: float
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class MaintenanceCreate(BaseModel):
    apartment_id: str
    zone: str
    alert_id: Optional[str] = None
    assigned_to: str
    outcome: str = "Pending"
    repair_cost: float = 0.0
    resolution_time_hours: float = 0.0
    notes: Optional[str] = None

class AuditLogOut(BaseModel):
    id: int
    log_id: str
    action: str
    entity_type: str
    entity_id: str
    user_name: str
    role: str
    details: Any
    timestamp: datetime

    class Config:
        from_attributes = True

class StakeholderFeedbackIn(BaseModel):
    respondent_role: str
    ease_of_use: int
    usefulness: int
    trust_in_recommendations: int
    explanation_clarity: int
    alert_usefulness: int
    maintenance_workload_rating: int
    willingness_to_use: int
    comments: Optional[str] = None

class StakeholderFeedbackOut(StakeholderFeedbackIn):
    id: int
    feedback_id: str
    is_demo: bool
    submitted_at: datetime

    class Config:
        from_attributes = True
