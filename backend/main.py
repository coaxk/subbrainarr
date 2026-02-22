"""
Subbrainarr Backend
The brain that makes Subgen smart.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from typing import List

from routers import connection, hardware, logs, languages, settings, scanning, docker, github, community, tuning

app = FastAPI(
    title="Subbrainarr API",
    description="The dashboard that gives Subgen a brain",
    version="1.5.0"
)

# CORS middleware for frontend
# CORS: Allow the Vite dev server and the production frontend origin.
# In Docker, the frontend is served from the same origin so CORS is moot,
# but these cover local development and reverse-proxy setups.
_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5918,http://localhost:9918").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_origins],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# WebSocket connection manager for live updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

@app.get("/")
async def root():
    """Welcome endpoint"""
    return {
        "message": "Subbrainarr API",
        "tagline": "Subgen, but with a brain",
        "version": "1.5.0",
        "status": "The brain is online 🧠"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "brain": "operational"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for live updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, broadcast updates from other endpoints
            data = await websocket.receive_text()
            # Echo back for now (will handle real updates later)
            await websocket.send_json({"type": "pong", "message": "Brain is listening"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Include routers
app.include_router(connection.router, prefix="/api/connection", tags=["connection"])
app.include_router(hardware.router, prefix="/api/hardware", tags=["hardware"])
app.include_router(logs.router, prefix="/api/logs", tags=["logs"])
app.include_router(languages.router, prefix="/api/languages", tags=["languages"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(scanning.router, prefix="/api/scanning", tags=["scanning"])
app.include_router(docker.router, prefix="/api/docker", tags=["docker"])
app.include_router(github.router, prefix="/api/github", tags=["github"])
app.include_router(community.router, prefix="/api/community", tags=["community"])
app.include_router(tuning.router, prefix="/api/tuning", tags=["tuning"])


if __name__ == "__main__":
    port = int(os.getenv("PORT", 9001))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("DEBUG", "false").lower() == "true",
        log_level="info"
    )