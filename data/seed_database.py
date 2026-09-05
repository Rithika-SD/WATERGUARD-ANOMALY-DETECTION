import pandas as pd
import numpy as np

def seed_db():
    print("Beginning SQLite database seeding...")
    import os, json, sys
    from datetime import datetime, timedelta

    # Ensure backend path is importable
    sys.path.append(os.getcwd())

    from backend.database import engine, Base, SessionLocal
    from backend.models import (
        Apartment, Zone, MeterReading, Alert, 
        MaintenanceRecord, Decision, AuditLog, StakeholderFeedback
    )
    from backend.ml.anomaly_detector import AnomalyDetectorPipeline

    # Drop & recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    cleaned_csv_path = 'data/cleaned_dataset.csv'
    if not os.path.exists(cleaned_csv_path):
        print(f"Error: {cleaned_csv_path} not found! Run generate_dataset.py first.")
        return

    df = pd.read_csv(cleaned_csv_path)
    print(f"Loaded cleaned dataset with {len(df)} rows.")

    # 1. Seed Apartments
    apt_df = df[['apartment_id', 'building_id', 'occupancy_count', 'occupancy_assumption']].drop_duplicates()
    for _, row in apt_df.iterrows():
        b_id = row['building_id']
        apt_str = str(row['apartment_id'])
        floor_num = int(apt_str.split('-')[1][0]) if '-' in apt_str else 1
        
        apt_obj = Apartment(
            apartment_id=apt_str,
            building_id=b_id,
            floor=floor_num,
            occupancy_count=int(row['occupancy_count']),
            occupancy_assumption=str(row['occupancy_assumption']),
            created_at=datetime.utcnow()
        )
        db.add(apt_obj)
    db.commit()
    print(f"Seeded {len(apt_df)} apartments.")

    # 2. Seed Zones
    zone_df = df[['apartment_id', 'apartment_zone', 'meter_id']].drop_duplicates()
    for _, row in zone_df.iterrows():
        z_obj = Zone(
            zone_id=f"Z-{row['apartment_id']}-{row['apartment_zone']}",
            apartment_id=str(row['apartment_id']),
            zone_name=str(row['apartment_zone']),
            meter_id=str(row['meter_id'])
        )
        db.add(z_obj)
    db.commit()
    print(f"Seeded {len(zone_df)} zones & meters.")

    # 3. Seed Meter Readings (sample first 2000 for fast seeding)
    sample_df = df.head(3000)
    for _, row in sample_df.iterrows():
        ts = datetime.strptime(str(row['timestamp']), '%Y-%m-%d %H:%M:%S')
        mr = MeterReading(
            meter_id=str(row['meter_id']),
            apartment_id=str(row['apartment_id']),
            zone=str(row['apartment_zone']),
            timestamp=ts,
            consumption_liters=float(row['water_consumption_liters']),
            interval_minutes=int(row['interval_minutes']),
            hour=int(row['hour']),
            day_of_week=str(row['day_of_week']),
            weekend_flag=int(row['weekend_flag']),
            rainfall_flood_risk=float(row['rainfall_flood_risk']),
            anomaly_type=str(row['anomaly_type']),
            leak_status=str(row['leak_status']),
            is_anomaly=bool(str(row['anomaly_type']) != 'None')
        )
        db.add(mr)
    db.commit()
    print(f"Seeded {len(sample_df)} meter readings.")

    # 4. Generate & Seed Alerts
    pipeline = AnomalyDetectorPipeline()
    detected_alerts = pipeline.process_readings(sample_df)
    
    # Keep unique alerts
    unique_alerts = {}
    for a in detected_alerts:
        k = f"{a['apartment_id']}-{a['zone']}"
        if k not in unique_alerts or a['risk_score'] > unique_alerts[k]['risk_score']:
            unique_alerts[k] = a

    alert_objs = []
    for a in list(unique_alerts.values())[:35]: # seed top 35 active alerts
        alert_obj = Alert(
            alert_id=a['alert_id'],
            apartment_id=a['apartment_id'],
            building_id=a['building_id'],
            zone=a['zone'],
            meter_id=a['meter_id'],
            timestamp=a['timestamp'],
            risk_level=a['risk_level'],
            risk_score=a['risk_score'],
            consumption_current=a['consumption_current'],
            consumption_expected=a['consumption_expected'],
            deviation_percent=a['deviation_percent'],
            estimated_loss_liters=a['estimated_loss_liters'],
            evidence=json.dumps(a['evidence']),
            possible_cause=a['possible_cause'],
            recommendation=a['recommendation'],
            confidence_percent=a['confidence_percent'],
            status="Open",
            created_at=datetime.utcnow()
        )
        alert_objs.append(alert_obj)
        db.add(alert_obj)
    db.commit()
    print(f"Seeded {len(alert_objs)} alerts.")

    # 5. Seed Maintenance Records
    maint_count = 0
    for a in alert_objs[:8]:
        m_rec = MaintenanceRecord(
            record_id=f"MNT-{a.apartment_id}-{maint_count+101}",
            apartment_id=a.apartment_id,
            zone=a.zone,
            alert_id=a.alert_id,
            assigned_to="Ramesh Kumar (Plumbing Lead)",
            maintenance_date=datetime.utcnow() - timedelta(days=np.random.randint(1, 10)),
            outcome="Repaired" if a.risk_level in ["Critical", "High_Risk"] else "NoProblemFound",
            repair_cost=4500.0 if a.risk_level in ["Critical", "High_Risk"] else 500.0,
            resolution_time_hours=6.5,
            notes="Replaced faulty toilet flapper valve and tightened pipe couplings."
        )
        db.add(m_rec)
        maint_count += 1
    db.commit()
    print(f"Seeded {maint_count} maintenance records.")

    # 6. Seed Demo Audit Logs
    audit_entries = [
        ("System Startup", "System", "SYS-001", "System", "Admin", json.dumps({"event": "Database seeded with synthetic coastal flood test data"})),
        ("Alert Generated", "Alert", alert_objs[0].alert_id, "AnomalyDetector", "Automated", json.dumps({"risk_score": alert_objs[0].risk_score, "apartment": alert_objs[0].apartment_id})),
        ("Investigation Confirmed", "Alert", alert_objs[0].alert_id, "Suresh Manager", "Apartment Manager", json.dumps({"action": "Confirmed", "reason": "High night flow confirmed on meter"})),
        ("Maintenance Dispatched", "Maintenance", f"MNT-{alert_objs[0].apartment_id}-101", "Ramesh Plumber", "Maintenance Staff", json.dumps({"assigned": "Plumbing Team A"}))
    ]
    for action, etype, eid, uname, urole, det in audit_entries:
        al = AuditLog(
            log_id=f"LOG-{np.random.randint(10000, 99999)}",
            action=action,
            entity_type=etype,
            entity_id=eid,
            user_name=uname,
            role=urole,
            details=det,
            timestamp=datetime.utcnow()
        )
        db.add(al)
    db.commit()

    # 7. Seed Demo Stakeholder Feedback
    demo_feedback = [
        ("Apartment Manager", 5, 5, 4, 5, 5, 4, 5, "Very helpful for catching night leaks before monthly billing. Explanations make it easy to justify calling plumbers.", True),
        ("Maintenance Staff", 4, 5, 5, 4, 5, 3, 5, "Zone-level localisation saves hours of searching through building walls.", True),
        ("Building Supervisor", 5, 4, 4, 5, 4, 4, 4, "The baseline vs system comparison clearly demonstrates ROI for small organisation staff.", True)
    ]
    for role, e, u, t, ex, a, w, wi, comm, is_d in demo_feedback:
        sf = StakeholderFeedback(
            feedback_id=f"FBK-{np.random.randint(1000, 9999)}",
            respondent_role=role,
            ease_of_use=e,
            usefulness=u,
            trust_in_recommendations=t,
            explanation_clarity=ex,
            alert_usefulness=a,
            maintenance_workload_rating=w,
            willingness_to_use=wi,
            comments=comm,
            is_demo=is_d,
            submitted_at=datetime.utcnow()
        )
        db.add(sf)
    db.commit()
    print("Database seeding completed successfully!")

    db.close()

if __name__ == '__main__':
    seed_db()
