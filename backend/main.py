from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.database import engine, Base
from backend.routers import (
    dashboard, apartments, alerts, analytics, 
    evaluation, maintenance, audit, zones, 
    stakeholder, edge_cases, cost_impact
)
import os, sys

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Apartment Water-Anomaly and Leak Localisation Assistant",
    description="Field-ready smart building water anomaly detection & leak localisation platform for coastal flood-prone towns.",
    version="1.0.0"
)

# Enable CORS for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All API Routers
app.include_router(dashboard.router)
app.include_router(apartments.router)
app.include_router(alerts.router)
app.include_router(analytics.router)
app.include_router(evaluation.router)
app.include_router(maintenance.router)
app.include_router(audit.router)
app.include_router(zones.router)
app.include_router(stakeholder.router)
app.include_router(edge_cases.router)
app.include_router(cost_impact.router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": "Water Anomaly Assistant Backend",
        "version": "1.0.0"
    }

# Mount SPA static files from frontend/dist if built
if os.path.exists("frontend/dist"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api/"):
            return None
        file_path = os.path.join("frontend/dist", full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse("frontend/dist/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
