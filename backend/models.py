from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class Apartment(Base):
    __tablename__ = "apartments"

    id = Column(Integer, primary_key=True, index=True)
    apartment_id = Column(String(20), unique=True, index=True)
    building_id = Column(String(10), index=True)
    floor = Column(Integer)
    occupancy_count = Column(Integer, default=2)
    occupancy_assumption = Column(String(20), default="Medium")
    created_at = Column(DateTime, default=datetime.utcnow)

    readings = relationship("MeterReading", back_populates="apartment")
    alerts = relationship("Alert", back_populates="apartment")

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String(50), unique=True, index=True)
    apartment_id = Column(String(20), ForeignKey("apartments.apartment_id"))
    zone_name = Column(String(50))
    meter_id = Column(String(50), unique=True, index=True)

class MeterReading(Base):
    __tablename__ = "meter_readings"

    id = Column(Integer, primary_key=True, index=True)
    meter_id = Column(String(50), index=True)
    apartment_id = Column(String(20), ForeignKey("apartments.apartment_id"), index=True)
    zone = Column(String(50))
    timestamp = Column(DateTime, index=True)
    consumption_liters = Column(Float)
    interval_minutes = Column(Integer, default=15)
    hour = Column(Integer)
    day_of_week = Column(String(20))
    weekend_flag = Column(Integer)
    rainfall_flood_risk = Column(Float)
    anomaly_type = Column(String(50), default="None")
    leak_status = Column(String(50), default="No_Leak")
    is_anomaly = Column(Boolean, default=False)

    apartment = relationship("Apartment", back_populates="readings")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(50), unique=True, index=True)
    apartment_id = Column(String(20), ForeignKey("apartments.apartment_id"), index=True)
    building_id = Column(String(10), index=True)
    zone = Column(String(50))
    meter_id = Column(String(50))
    timestamp = Column(DateTime, default=datetime.utcnow)
    risk_level = Column(String(20), index=True) # Normal, Watch, Suspicious, High_Risk, Critical
    risk_score = Column(Float) # 0 to 100
    consumption_current = Column(Float)
    consumption_expected = Column(Float)
    deviation_percent = Column(Float)
    estimated_loss_liters = Column(Float)
    evidence = Column(Text) # JSON string array
    possible_cause = Column(String(100))
    recommendation = Column(Text)
    confidence_percent = Column(Float)
    status = Column(String(30), default="Open", index=True) # Open, Confirmed, Rejected, FalsePositive, Deferred, Escalated
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    apartment = relationship("Apartment", back_populates="alerts")
    decisions = relationship("Decision", back_populates="alert")

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(String(50), unique=True, index=True)
    apartment_id = Column(String(20), index=True)
    zone = Column(String(50))
    alert_id = Column(String(50), nullable=True)
    assigned_to = Column(String(100))
    maintenance_date = Column(DateTime, default=datetime.utcnow)
    outcome = Column(String(50)) # Repaired, NoProblemFound, AwaitingParts, Pending
    repair_cost = Column(Float, default=0.0)
    resolution_time_hours = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(String(50), unique=True, index=True)
    alert_id = Column(String(50), ForeignKey("alerts.alert_id"), index=True)
    staff_name = Column(String(100))
    role = Column(String(50))
    decision_type = Column(String(50)) # Confirmed, Rejected, Deferred, Escalated, FalsePositive
    reason = Column(Text)
    notes = Column(Text, nullable=True)
    override_reason = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    alert = relationship("Alert", back_populates="decisions")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(String(50), unique=True, index=True)
    action = Column(String(100))
    entity_type = Column(String(50))
    entity_id = Column(String(50))
    user_name = Column(String(100))
    role = Column(String(50))
    details = Column(Text) # JSON string
    timestamp = Column(DateTime, default=datetime.utcnow)

class StakeholderFeedback(Base):
    __tablename__ = "stakeholder_feedback"

    id = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(String(50), unique=True, index=True)
    respondent_role = Column(String(50)) # Apartment Manager, Maintenance Staff, Building Supervisor
    ease_of_use = Column(Integer) # 1-5
    usefulness = Column(Integer) # 1-5
    trust_in_recommendations = Column(Integer) # 1-5
    explanation_clarity = Column(Integer) # 1-5
    alert_usefulness = Column(Integer) # 1-5
    maintenance_workload_rating = Column(Integer) # 1-5
    willingness_to_use = Column(Integer) # 1-5
    comments = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
