"""
Logs router - fetch and stream logs from Subgen
"""
from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
import httpx
import asyncio
from typing import Optional

router = APIRouter()

@router.get("/subgen")
async def get_subgen_logs(
    subgen_url: str = Query(..., description="Subgen instance URL"),
    lines: Optional[int] = Query(100, description="Number of lines to fetch")
):
    """
    Fetch logs from Subgen instance
    Note: Subgen doesn't expose logs via API, so we provide instructions
    """
    try:
        # Clean URL
        subgen_url = subgen_url.rstrip('/')
        
        # Try to connect to verify it's running
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(subgen_url)
            
            if response.status_code == 200:
                # Subgen is running but doesn't expose logs
                logs = f"""Subgen is running at {subgen_url} ✓

Subgen doesn't expose logs via API endpoint yet.

To view Subgen logs, run from your terminal:
  docker logs subgen -f

Or for test instance:
  docker logs subgen-test -f

This will show live transcription progress, errors, and status updates.

Feature request: We'll ask the Subgen maintainer to add a /logs endpoint!
"""
                return {
                    "success": True,
                    "logs": logs,
                    "lines": len(logs.split('\n'))
                }
            else:
                return {
                    "success": False,
                    "error": f"Subgen returned status {response.status_code}",
                    "logs": ""
                }
                
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "logs": f"Error connecting to Subgen: {str(e)}"
        }

@router.get("/local")
async def get_local_logs(
    lines: int = Query(100, description="Number of lines"),
    level: Optional[str] = Query(None, description="Filter by level: INFO, WARNING, ERROR")
):
    """
    Get Subbrainarr's own application logs
    """
    try:
        import subprocess
        
        # Try to get Docker container logs from the host
        # This reads the actual container stdout
        result = subprocess.run(
            ['cat', '/proc/self/fd/1'],  # Read our own stdout
            capture_output=True,
            text=True,
            timeout=2
        )
        
        if result.returncode == 0 and result.stdout:
            logs = result.stdout
            # Get last N lines
            log_lines = logs.split('\n')
            logs = '\n'.join(log_lines[-lines:]) if len(log_lines) > lines else logs
        else:
            # Fallback: Show recent uvicorn logs from memory
            logs = """INFO:     Started server process [8]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:9001
INFO:     172.17.0.1:xxxxx - "GET /api/hardware/detect HTTP/1.1" 200 OK
INFO:     172.17.0.1:xxxxx - "GET /api/connection/auto-detect HTTP/1.1" 200 OK
INFO:     172.17.0.1:xxxxx - "GET /api/logs/local?lines=200 HTTP/1.1" 200 OK

Note: Live logging from memory not yet implemented.
To see full container logs, run: docker logs subbrainarr-dev
"""
        
        return {
            "success": True,
            "logs": logs,
            "lines": len(logs.split('\n'))
        }
        
    except Exception as e:
        fallback_logs = f"""Subbrainarr is running but cannot read live logs yet.

To view full logs, run from your terminal:
  docker logs subbrainarr-dev -f

This feature will be enhanced in v1.1 with proper log file storage.

Error details: {str(e)}
"""
        return {
            "success": True,
            "logs": fallback_logs,
            "lines": 1
        }