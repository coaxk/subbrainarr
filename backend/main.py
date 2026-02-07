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

# Will import routers once we create them
# from routers import connection, hardware, queue, languages, settings

app = FastAPI(
    title="Subbrainarr API",
    description="The dashboard that gives Subgen a brain",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
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
        "version": "1.0.0",
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
from routers import connection, hardware, logs

app.include_router(connection.router, prefix="/api/connection", tags=["connection"])
app.include_router(hardware.router, prefix="/api/hardware", tags=["hardware"])
app.include_router(logs.router, prefix="/api/logs", tags=["logs"])


if __name__ == "__main__":
    port = int(os.getenv("PORT", 9001))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )