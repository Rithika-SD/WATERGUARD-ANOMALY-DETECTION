import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

class StreamingBuffer:
    """
    Lightweight Reading Buffer for streaming meter data.
    - Tracks event_timestamp vs ingestion_timestamp.
    - Handles deduplication by (meter_id, event_timestamp).
    - Checks lateness window threshold (default 120 minutes).
    - Sorts buffer by event_timestamp prior to downstream baseline calculation.
    - Does not silently discard invalid data; logs explicit rejection reasons.
    """
    def __init__(self, lateness_window_minutes: int = 120):
        self.lateness_window_minutes = lateness_window_minutes
        self.seen_keys = set()
        self.processed_buffer: List[Dict[str, Any]] = []
        self.rejected_buffer: List[Dict[str, Any]] = []
        
        # Statistics
        self.total_received = 0
        self.processed_count = 0
        self.delayed_count = 0
        self.out_of_order_count = 0
        self.duplicate_count = 0
        self.rejected_count = 0
        self.rejection_reasons: Dict[str, int] = {
            "INVALID_TIMESTAMP": 0,
            "MISSING_CONSUMPTION_VALUE": 0,
            "DUPLICATE_READING": 0,
            "EXCEEDED_LATENESS_WINDOW": 0,
        }

    def reset(self):
        self.seen_keys.clear()
        self.processed_buffer.clear()
        self.rejected_buffer.clear()
        self.total_received = 0
        self.processed_count = 0
        self.delayed_count = 0
        self.out_of_order_count = 0
        self.duplicate_count = 0
        self.rejected_count = 0
        for k in self.rejection_reasons:
            self.rejection_reasons[k] = 0

    def ingest_reading(self, raw_reading: Dict[str, Any], current_time: Optional[datetime] = None) -> Dict[str, Any]:
        self.total_received += 1
        ingestion_dt = current_time if current_time else datetime.utcnow()
        ingestion_str = ingestion_dt.strftime("%Y-%m-%d %H:%M:%S")

        meter_id = raw_reading.get("meter_id")
        raw_event_time = raw_reading.get("event_timestamp") or raw_reading.get("timestamp")

        # 1. Validate Timestamp
        event_dt = None
        if raw_event_time:
            try:
                if isinstance(raw_event_time, datetime):
                    event_dt = raw_event_time
                else:
                    event_dt = pd.to_datetime(raw_event_time).to_pydatetime()
            except Exception:
                event_dt = None

        if event_dt is None:
            return self._reject(raw_reading, ingestion_str, "INVALID_TIMESTAMP", "Unparseable or missing event timestamp")

        event_str = event_dt.strftime("%Y-%m-%d %H:%M:%S")

        # 2. Validate Consumption Value
        cons = raw_reading.get("water_consumption_liters", raw_reading.get("consumption_liters"))
        if cons is None or (isinstance(cons, float) and np.isnan(cons)) or float(cons) < 0:
            return self._reject(raw_reading, ingestion_str, "MISSING_CONSUMPTION_VALUE", "Missing or negative consumption value", event_str=event_str)

        cons_val = float(cons)

        # 3. Validate Deduplication
        dedup_key = (meter_id, event_str)
        if dedup_key in self.seen_keys:
            self.duplicate_count += 1
            return self._reject(raw_reading, ingestion_str, "DUPLICATE_READING", f"Duplicate reading for meter {meter_id} at {event_str}", event_str=event_str)

        # 4. Validate Lateness Window
        delay_minutes = (ingestion_dt - event_dt).total_seconds() / 60.0
        if delay_minutes > self.lateness_window_minutes:
            return self._reject(
                raw_reading,
                ingestion_str,
                "EXCEEDED_LATENESS_WINDOW",
                f"Reading arrived {delay_minutes:.1f} mins late (max allowed: {self.lateness_window_minutes} mins)",
                event_str=event_str
            )

        # Record accepted reading
        self.seen_keys.add(dedup_key)
        
        is_delayed = delay_minutes > 15.0
        if is_delayed:
            self.delayed_count += 1

        # Check out-of-order arrival relative to last processed reading for this meter
        is_out_of_order = False
        meter_prev = [r for r in self.processed_buffer if r.get("meter_id") == meter_id]
        if meter_prev:
            last_event_dt = meter_prev[-1]["event_dt"]
            if event_dt < last_event_dt:
                is_out_of_order = True
                self.out_of_order_count += 1

        record = {
            "meter_id": meter_id,
            "apartment_id": raw_reading.get("apartment_id", "A101"),
            "zone": raw_reading.get("zone", raw_reading.get("apartment_zone", "Bathroom")),
            "building_id": raw_reading.get("building_id", "B1"),
            "event_timestamp": event_str,
            "event_dt": event_dt,
            "ingestion_timestamp": ingestion_str,
            "consumption_liters": cons_val,
            "delay_minutes": round(max(0, delay_minutes), 1),
            "is_delayed": is_delayed,
            "is_out_of_order": is_out_of_order,
            "status": "ACCEPTED",
            "hour": event_dt.hour,
            "day_of_week": event_dt.strftime("%A"),
            "weekend_flag": 1 if event_dt.weekday() >= 5 else 0,
            "rainfall_flood_risk": float(raw_reading.get("rainfall_flood_risk", 0.1))
        }

        self.processed_buffer.append(record)
        self.processed_count += 1

        # Re-sort buffer by event_dt to maintain chronological sequence for rolling baselines
        self.processed_buffer.sort(key=lambda r: r["event_dt"])

        return record

    def _reject(self, raw_reading: Dict[str, Any], ingestion_str: str, reason_code: str, details: str, event_str: Optional[str] = None) -> Dict[str, Any]:
        self.rejected_count += 1
        if reason_code in self.rejection_reasons:
            self.rejection_reasons[reason_code] += 1
        else:
            self.rejection_reasons[reason_code] = 1

        rejected_record = {
            "meter_id": raw_reading.get("meter_id", "UNKNOWN"),
            "apartment_id": raw_reading.get("apartment_id", "UNKNOWN"),
            "event_timestamp": event_str or str(raw_reading.get("event_timestamp") or raw_reading.get("timestamp") or "INVALID"),
            "ingestion_timestamp": ingestion_str,
            "status": "REJECTED",
            "reason_code": reason_code,
            "details": details
        }
        self.rejected_buffer.append(rejected_record)
        return rejected_record

    def get_sorted_readings(self) -> List[Dict[str, Any]]:
        """Returns buffer sorted chronologically by event_dt."""
        return sorted(self.processed_buffer, key=lambda r: r["event_dt"])


class StreamingSimulator:
    """
    Simulates streaming water meter data under 4 distinct operational modes:
    1. Normal: Chronological 15-minute readings.
    2. Delayed: Readings delayed by 30-90 minutes (within lateness window).
    3. Out_of_Order: Readings shuffled out of chronological sequence.
    4. Duplicate: Ingestion of duplicate reading events.
    5. Edge_Cases: Ingestion of malformed timestamps, missing values, and window breaches.
    """
    def __init__(self, dataset_path: str = "data/cleaned_dataset.csv"):
        self.dataset_path = dataset_path
        self.df = None
        self.buffer = StreamingBuffer(lateness_window_minutes=120)
        self.mode = "normal"
        self._load_dataset()

    def _load_dataset(self):
        if os.path.exists(self.dataset_path):
            self.df = pd.read_csv(self.dataset_path)
        else:
            # Fallback synthetic frame if file missing
            times = [datetime(2026, 6, 1, 0, 0) + timedelta(minutes=15*i) for i in range(100)]
            self.df = pd.DataFrame({
                "meter_id": ["M_A101_Bathroom"] * 100,
                "apartment_id": ["A101"] * 100,
                "apartment_zone": ["Bathroom"] * 100,
                "building_id": ["B1"] * 100,
                "timestamp": [t.strftime("%Y-%m-%d %H:%M:%S") for t in times],
                "water_consumption_liters": [4.2 + (i % 5) for i in range(100)],
                "hour": [t.hour for t in times],
                "day_of_week": [t.strftime("%A") for t in times],
                "weekend_flag": [1 if t.weekday() >= 5 else 0 for t in times],
                "rainfall_flood_risk": [0.1] * 100
            })

    def run_simulation(self, mode: str = "normal", count: int = 50, lateness_window_minutes: int = 120) -> Dict[str, Any]:
        self.mode = mode
        self.buffer.lateness_window_minutes = lateness_window_minutes
        self.buffer.reset()

        if self.df is None or self.df.empty:
            return self.get_status()

        sample_df = self.df.head(min(count, len(self.df))).copy()

        if mode == "normal":
            for idx, row in sample_df.iterrows():
                event_dt = pd.to_datetime(row["timestamp"]).to_pydatetime()
                reading = row.to_dict()
                reading["event_timestamp"] = event_dt.strftime("%Y-%m-%d %H:%M:%S")
                self.buffer.ingest_reading(reading, current_time=event_dt + timedelta(seconds=5))

        elif mode == "delayed":
            for idx, row in sample_df.iterrows():
                event_dt = pd.to_datetime(row["timestamp"]).to_pydatetime()
                reading = row.to_dict()
                reading["event_timestamp"] = event_dt.strftime("%Y-%m-%d %H:%M:%S")
                # 45 to 90 minutes delay (within 120 window)
                delay_mins = 45 + (idx % 45)
                ingest_time = event_dt + timedelta(minutes=delay_mins)
                self.buffer.ingest_reading(reading, current_time=ingest_time)

        elif mode == "out_of_order":
            records = sample_df.to_dict("records")
            np.random.seed(42)
            shuffled_indices = list(range(len(records)))
            np.random.shuffle(shuffled_indices)

            for i in shuffled_indices:
                row = records[i]
                event_dt = pd.to_datetime(row["timestamp"]).to_pydatetime()
                row["event_timestamp"] = event_dt.strftime("%Y-%m-%d %H:%M:%S")
                self.buffer.ingest_reading(row, current_time=event_dt + timedelta(seconds=10))

        elif mode == "duplicate":
            records = sample_df.to_dict("records")
            for idx, row in enumerate(records):
                event_dt = pd.to_datetime(row["timestamp"]).to_pydatetime()
                row["event_timestamp"] = event_dt.strftime("%Y-%m-%d %H:%M:%S")
                self.buffer.ingest_reading(row, current_time=event_dt + timedelta(seconds=5))
                if idx % 3 == 0:
                    self.buffer.ingest_reading(row, current_time=event_dt + timedelta(seconds=15))

        elif mode == "edge_cases":
            records = sample_df.to_dict("records")
            for idx, row in enumerate(records):
                event_dt = pd.to_datetime(row["timestamp"]).to_pydatetime()
                row["event_timestamp"] = event_dt.strftime("%Y-%m-%d %H:%M:%S")
                
                if idx == 2:
                    bad_row = dict(row)
                    bad_row["event_timestamp"] = "INVALID_STAMP"
                    self.buffer.ingest_reading(bad_row, current_time=event_dt)
                elif idx == 5:
                    bad_row = dict(row)
                    bad_row["water_consumption_liters"] = None
                    self.buffer.ingest_reading(bad_row, current_time=event_dt)
                elif idx == 8:
                    bad_row = dict(row)
                    self.buffer.ingest_reading(bad_row, current_time=event_dt + timedelta(minutes=180))
                else:
                    self.buffer.ingest_reading(row, current_time=event_dt + timedelta(seconds=5))

        return self.get_status()

    def get_status(self) -> Dict[str, Any]:
        recent_processed = [
            {
                "meter_id": r["meter_id"],
                "apartment_id": r["apartment_id"],
                "zone": r["zone"],
                "event_timestamp": r["event_timestamp"],
                "ingestion_timestamp": r["ingestion_timestamp"],
                "consumption_liters": r["consumption_liters"],
                "delay_minutes": r["delay_minutes"],
                "is_delayed": r["is_delayed"],
                "is_out_of_order": r["is_out_of_order"],
                "status": r["status"]
            }
            for r in self.buffer.processed_buffer[-15:]
        ]

        return {
            "mode": self.mode,
            "lateness_window_minutes": self.buffer.lateness_window_minutes,
            "total_received": self.buffer.total_received,
            "processed_count": self.buffer.processed_count,
            "delayed_count": self.buffer.delayed_count,
            "out_of_order_count": self.buffer.out_of_order_count,
            "duplicate_count": self.buffer.duplicate_count,
            "rejected_count": self.buffer.rejected_count,
            "rejection_reasons": self.buffer.rejection_reasons,
            "recent_processed": recent_processed,
            "recent_rejected": self.buffer.rejected_buffer[-10:],
            "status": "COMPLETED" if self.buffer.total_received > 0 else "IDLE"
        }

# Global Instance
global_streaming_simulator = StreamingSimulator()
