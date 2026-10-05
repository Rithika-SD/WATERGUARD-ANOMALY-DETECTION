import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from backend.main import app
from backend.ml.streaming_simulator import StreamingBuffer, StreamingSimulator

client = TestClient(app)

def test_normal_chronological_readings():
    """Streaming Unit Test: Verifies normal chronological meter feeds are accepted into buffer."""
    buffer = StreamingBuffer(lateness_window_minutes=120)
    base_time = datetime(2026, 6, 1, 10, 0)
    
    r1 = {"meter_id": "M1", "event_timestamp": "2026-06-01 10:00:00", "consumption_liters": 5.0}
    r2 = {"meter_id": "M1", "event_timestamp": "2026-06-01 10:15:00", "consumption_liters": 6.0}
    
    res1 = buffer.ingest_reading(r1, current_time=base_time + timedelta(seconds=2))
    res2 = buffer.ingest_reading(r2, current_time=base_time + timedelta(minutes=15, seconds=2))
    
    assert res1["status"] == "ACCEPTED"
    assert res2["status"] == "ACCEPTED"
    assert buffer.total_received == 2
    assert buffer.processed_count == 2
    assert buffer.rejected_count == 0

def test_delayed_readings_within_window():
    """Streaming Unit Test: Verifies delayed readings arriving within lateness window are accepted and flagged as delayed."""
    buffer = StreamingBuffer(lateness_window_minutes=120)
    event_time = datetime(2026, 6, 1, 10, 0)
    ingest_time = event_time + timedelta(minutes=45)
    
    r = {"meter_id": "M1", "event_timestamp": "2026-06-01 10:00:00", "consumption_liters": 4.5}
    res = buffer.ingest_reading(r, current_time=ingest_time)
    
    assert res["status"] == "ACCEPTED"
    assert res["is_delayed"] is True
    assert res["delay_minutes"] == 45.0
    assert buffer.delayed_count == 1

def test_out_of_order_readings_reordered():
    """Streaming Unit Test: Verifies out-of-order packet arrivals are re-sorted by event_timestamp prior to baseline calculation."""
    buffer = StreamingBuffer(lateness_window_minutes=120)
    base_time = datetime(2026, 6, 1, 10, 0)
    
    r_later = {"meter_id": "M1", "event_timestamp": "2026-06-01 10:30:00", "consumption_liters": 10.0}
    r_earlier = {"meter_id": "M1", "event_timestamp": "2026-06-01 10:15:00", "consumption_liters": 4.0}
    
    buffer.ingest_reading(r_later, current_time=base_time + timedelta(minutes=30))
    res = buffer.ingest_reading(r_earlier, current_time=base_time + timedelta(minutes=31))
    
    assert res["status"] == "ACCEPTED"
    assert res["is_out_of_order"] is True
    assert buffer.out_of_order_count == 1
    
    sorted_readings = buffer.get_sorted_readings()
    assert sorted_readings[0]["event_timestamp"] == "2026-06-01 10:15:00"
    assert sorted_readings[1]["event_timestamp"] == "2026-06-01 10:30:00"

def test_duplicate_reading_rejection():
    """Error Handling Test: Verifies duplicate readings with identical (meter_id, event_timestamp) are rejected with DUPLICATE_READING."""
    buffer = StreamingBuffer(lateness_window_minutes=120)
    base_time = datetime(2026, 6, 1, 10, 0)
    r = {"meter_id": "M1", "event_timestamp": "2026-06-01 10:00:00", "consumption_liters": 5.0}
    
    res1 = buffer.ingest_reading(r, current_time=base_time)
    res2 = buffer.ingest_reading(r, current_time=base_time + timedelta(seconds=10))
    
    assert res1["status"] == "ACCEPTED"
    assert res2["status"] == "REJECTED"
    assert res2["reason_code"] == "DUPLICATE_READING"
    assert buffer.duplicate_count == 1
    assert buffer.rejected_count == 1

def test_invalid_timestamp_rejection():
    """Error Handling Test: Verifies unparseable or missing event timestamps are rejected with INVALID_TIMESTAMP."""
    buffer = StreamingBuffer(lateness_window_minutes=120)
    r = {"meter_id": "M1", "event_timestamp": "NOT_A_DATE", "consumption_liters": 5.0}
    
    res = buffer.ingest_reading(r)
    assert res["status"] == "REJECTED"
    assert res["reason_code"] == "INVALID_TIMESTAMP"
    assert buffer.rejection_reasons["INVALID_TIMESTAMP"] == 1

def test_missing_consumption_value_rejection():
    """Error Handling Test: Verifies missing/NaN consumption values are rejected with MISSING_CONSUMPTION_VALUE."""
    buffer = StreamingBuffer(lateness_window_minutes=120)
    r = {"meter_id": "M1", "event_timestamp": "2026-06-01 10:00:00", "consumption_liters": None}
    
    res = buffer.ingest_reading(r)
    assert res["status"] == "REJECTED"
    assert res["reason_code"] == "MISSING_CONSUMPTION_VALUE"
    assert buffer.rejection_reasons["MISSING_CONSUMPTION_VALUE"] == 1

def test_exceeded_lateness_window_rejection():
    """Error Handling Test: Verifies readings arriving past lateness window threshold are rejected with EXCEEDED_LATENESS_WINDOW."""
    buffer = StreamingBuffer(lateness_window_minutes=60)
    event_time = datetime(2026, 6, 1, 10, 0)
    ingest_time = event_time + timedelta(minutes=150)
    
    r = {"meter_id": "M1", "event_timestamp": "2026-06-01 10:00:00", "consumption_liters": 5.0}
    res = buffer.ingest_reading(r, current_time=ingest_time)
    
    assert res["status"] == "REJECTED"
    assert res["reason_code"] == "EXCEEDED_LATENESS_WINDOW"
    assert buffer.rejection_reasons["EXCEEDED_LATENESS_WINDOW"] == 1

def test_streaming_api_endpoints():
    """API Integration Test: Verifies POST /api/streaming/start, status, and reset endpoints."""
    response = client.post("/api/streaming/reset")
    assert response.status_code == 200
    assert response.json()["status"] == "IDLE"
    
    start_res = client.post("/api/streaming/start", json={"mode": "normal", "count": 20, "lateness_window_minutes": 120})
    assert start_res.status_code == 200
    data = start_res.json()
    assert data["mode"] == "normal"
    assert data["processed_count"] == 20
    assert data["rejected_count"] == 0
    
    dup_res = client.post("/api/streaming/start", json={"mode": "duplicate", "count": 15, "lateness_window_minutes": 120})
    assert dup_res.status_code == 200
    dup_data = dup_res.json()
    assert dup_data["duplicate_count"] > 0
    assert dup_data["rejected_count"] > 0

    status_res = client.get("/api/streaming/status")
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "COMPLETED"
