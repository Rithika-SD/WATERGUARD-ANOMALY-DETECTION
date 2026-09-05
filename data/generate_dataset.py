import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

def generate_water_dataset():
    np.random.seed(42)
    start_date = datetime(2026, 6, 1, 0, 0)
    intervals_per_day = 96 # 15-minute intervals
    days = 90
    total_intervals = intervals_per_day * days
    
    # 80 apartments across 4 buildings (B1..B4), 5 floors each (1..5), 4 apts/floor
    apartments = []
    buildings = ['B1', 'B2', 'B3', 'B4']
    zones = ['Kitchen', 'Bathroom', 'Utility', 'Common_Area', 'Water_Tank', 'Plumbing']
    
    apt_list = []
    for b in buildings:
        for f in range(1, 6):
            for a in range(1, 5):
                apt_id = f"{b}-{f}0{a}"
                occ = np.random.randint(1, 6)
                occ_assump = 'Low' if occ <= 2 else ('Medium' if occ <= 4 else 'High')
                apt_list.append({
                    'apartment_id': apt_id,
                    'building_id': b,
                    'floor': f,
                    'occupancy_count': occ,
                    'occupancy_assumption': occ_assump
                })
    
    # Designate leak apartments
    confirmed_leak_apts = set(np.random.choice([a['apartment_id'] for a in apt_list], size=6, replace=False))
    suspected_leak_apts = set(np.random.choice([a['apartment_id'] for a in apt_list if a['apartment_id'] not in confirmed_leak_apts], size=10, replace=False))
    stuck_meter_apts = set(np.random.choice([a['apartment_id'] for a in apt_list if a['apartment_id'] not in confirmed_leak_apts and a['apartment_id'] not in suspected_leak_apts], size=4, replace=False))
    
    records = []
    
    timestamps = [start_date + timedelta(minutes=15 * i) for i in range(total_intervals)]
    
    print(f"Generating data for {len(apt_list)} apartments over {days} days ({total_intervals} intervals per meter)...")
    
    # Generate readings
    for apt in apt_list:
        apt_id = apt['apartment_id']
        b_id = apt['building_id']
        occ = apt['occupancy_count']
        
        # Primary zone for meter readings in dataset sample
        for zone in zones:
            meter_id = f"MTR-{apt_id}-{zone[:3].upper()}"
            
            # Base multiplier
            zone_multiplier = {
                'Kitchen': 1.2,
                'Bathroom': 2.5,
                'Utility': 0.8,
                'Common_Area': 0.5,
                'Water_Tank': 1.5,
                'Plumbing': 0.2
            }[zone]
            
            is_confirmed_leak = apt_id in confirmed_leak_apts and zone in ['Bathroom', 'Plumbing', 'Kitchen']
            is_suspected_leak = apt_id in suspected_leak_apts and zone in ['Bathroom', 'Utility']
            is_stuck_meter = apt_id in stuck_meter_apts and zone == 'Utility'
            
            for t_idx, ts in enumerate(timestamps):
                hour = ts.hour
                day_of_week = ts.strftime('%A')
                is_weekend = 1 if ts.weekday() >= 5 else 0
                
                # Coastal flood / rainfall indicator (higher around mid July)
                day_num = (ts - start_date).days
                flood_risk = 0.85 if 40 <= day_num <= 45 or 70 <= day_num <= 73 else float(np.clip(np.random.normal(0.15, 0.05), 0, 1))
                
                # Diurnal pattern
                if 1 <= hour <= 5:
                    time_factor = 0.05 # Night time low
                elif 6 <= hour <= 9:
                    time_factor = 1.8 # Morning peak
                elif 18 <= hour <= 21:
                    time_factor = 1.5 # Evening peak
                else:
                    time_factor = 0.6 # Normal day
                
                weekend_mult = 1.25 if is_weekend else 1.0
                base_consumption = occ * zone_multiplier * time_factor * weekend_mult * np.random.uniform(0.7, 1.3)
                
                anomaly_type = 'None'
                leak_status = 'No_Leak'
                maint_status = 'Normal'
                maint_outcome = 'None'
                conf_leak = False
                repair_req = False
                repair_cost = 0.0
                res_time = 0.0
                
                # Leak injection logic
                if is_confirmed_leak and day_num >= 30:
                    # Continuous leak pattern
                    if zone == 'Bathroom':
                        anomaly_type = 'ToiletLeakage'
                        base_consumption += np.random.uniform(12.0, 25.0) # continuous flow
                    else:
                        anomaly_type = 'PipeLeakage'
                        base_consumption += np.random.uniform(18.0, 35.0)
                    
                    leak_status = 'Confirmed'
                    conf_leak = True
                    repair_req = True
                    repair_cost = float(np.random.choice([1500, 2500, 4000, 6000]))
                    res_time = float(np.random.uniform(4.0, 24.0))
                    
                    if day_num >= 85:
                        maint_status = 'Completed'
                        maint_outcome = 'Repaired'
                    elif day_num >= 75:
                        maint_status = 'Under_Maintenance'
                        maint_outcome = 'AwaitingParts'
                        
                elif is_suspected_leak and day_num >= 50:
                    if 1 <= hour <= 5:
                        anomaly_type = 'NightFlow'
                        base_consumption += np.random.uniform(6.0, 14.0)
                    elif np.random.rand() < 0.15:
                        anomaly_type = 'SuddenSpike'
                        base_consumption += np.random.uniform(30.0, 60.0)
                    else:
                        anomaly_type = 'GradualIncrease'
                        base_consumption *= 1.8
                    leak_status = 'Suspected'
                    
                elif is_stuck_meter and day_num >= 60:
                    anomaly_type = 'MeterAnomaly'
                    base_consumption = 5.0 # Fixed reading anomaly
                    
                elif np.random.rand() < 0.005: # Edge case: legitimate high usage (e.g. party/cleaning)
                    anomaly_type = 'LegitimateHighUsage'
                    base_consumption *= np.random.uniform(3.5, 5.0)
                
                consumption = max(0.0, round(float(base_consumption), 2))
                
                # Keep subset of entries to keep CSV compact yet rich
                # Include all anomalies + sampling of normal to avoid gigantic file size
                if anomaly_type != 'None' or t_idx % 8 == 0:
                    records.append({
                        'timestamp': ts.strftime('%Y-%m-%d %H:%M:%S'),
                        'apartment_id': apt_id,
                        'building_id': b_id,
                        'apartment_zone': zone,
                        'meter_id': meter_id,
                        'water_consumption_liters': consumption,
                        'interval_minutes': 15,
                        'occupancy_count': occ,
                        'occupancy_assumption': occ_assump,
                        'day_of_week': day_of_week,
                        'hour': hour,
                        'weekend_flag': is_weekend,
                        'rainfall_flood_risk': round(flood_risk, 3),
                        'maintenance_status': maint_status,
                        'maintenance_date': (start_date + timedelta(days=day_num)).strftime('%Y-%m-%d') if maint_status != 'Normal' else '',
                        'leak_status': leak_status,
                        'anomaly_type': anomaly_type,
                        'maintenance_outcome': maint_outcome,
                        'confirmed_leak': conf_leak,
                        'repair_required': repair_req,
                        'repair_cost': repair_cost,
                        'resolution_time_hours': res_time
                    })

    df = pd.DataFrame(records)
    
    os.makedirs('data', exist_ok=True)
    raw_path = 'data/raw_dataset.csv'
    cleaned_path = 'data/cleaned_dataset.csv'
    
    df.to_csv(raw_path, index=False)
    
    # Cleaning steps
    df_cleaned = df.drop_duplicates().copy()
    # Fill missing or clean negative values if any
    df_cleaned['water_consumption_liters'] = df_cleaned['water_consumption_liters'].clip(lower=0.0)
    df_cleaned.to_csv(cleaned_path, index=False)
    
    print(f"Dataset generated successfully! Raw rows: {len(df)}, Cleaned rows: {len(df_cleaned)}")
    print("Anomaly Distribution:\n", df_cleaned['anomaly_type'].value_counts())
    print("Leak Status Distribution:\n", df_cleaned['leak_status'].value_counts())

if __name__ == '__main__':
    generate_water_dataset()
