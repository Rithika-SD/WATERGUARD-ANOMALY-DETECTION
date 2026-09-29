from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, Optional
from pydantic import BaseModel
from backend.ml.streaming_simulator import global_streaming_simulator

router = APIRouter(prefix="/api/streaming", tags=["Streaming Data Simulation"])

class StreamingRunRequest(BaseModel):
    mode: str = "normal"  # normal, delayed, out_of_order, duplicate, edge_cases
    count: int = 50
    lateness_window_minutes: int = 120

class PushReadingRequest(BaseModel):
    meter_id: str
    apartment_id: Optional[str] = "A101"
    zone: Optional[str] = "Bathroom"
    event_timestamp: Optional[str] = None
    water_consumption_liters: Optional[float] = 5.0
    rainfall_flood_risk: Optional[float] = 0.1

@router.post("/start")
def start_streaming_simulation(payload: StreamingRunRequest):
    valid_modes = ["normal", "delayed", "out_of_order", "duplicate", "edge_cases"]
    if payload.mode not in valid_modes:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid mode '{payload.mode}'. Must be one of {valid_modes}"
        )
    
    status = global_streaming_simulator.run_simulation(
        mode=payload.mode,
        count=payload.count,
        lateness_window_minutes=payload.lateness_window_minutes
    )
    return status

@router.get("/status")
def get_streaming_status():
    return global_streaming_simulator.get_status()

@router.post("/reset")
def reset_streaming_buffer():
    global_streaming_simulator.buffer.reset()
    global_streaming_simulator.mode = "normal"
    return global_streaming_simulator.get_status()

@router.post("/push")
def push_single_reading(payload: PushReadingRequest):
    res = global_streaming_simulator.buffer.ingest_reading(payload.dict())
    return {
        "result": res,
        "current_status": global_streaming_simulator.get_status()
    }
