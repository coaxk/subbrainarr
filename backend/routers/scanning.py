"""
Scanning router - intelligent orchestration of Subgen scans
We are the brain Subgen doesn't have
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import httpx
import asyncio

router = APIRouter()

class ScanRequest(BaseModel):
    subgen_url: str
    scan_type: Optional[str] = "smart"  # smart, forward, reverse, custom
    paths: Optional[List[str]] = None

class ScanResult(BaseModel):
    status: str
    scan_type: str
    reason: str
    message: str
    subgen_response: Optional[dict] = None

@router.post("/smart-scan", response_model=ScanResult)
async def smart_scan(request: ScanRequest):
    """
    Intelligent scan orchestration - analyzes what needs scanning
    and triggers Subgen with optimal settings
    """
    
    # For now, we'll start simple and build up
    # v1.0: Just trigger a scan
    # v1.1: Analyze library state and decide forward/reverse
    # v2.0: Integration with Sonarr/Radarr for new content detection
    
    scan_type = "forward"  # Default to forward scan
    reason = "User requested smart scan"
    
    # TODO: Add intelligence here
    # - Check for new content (Sonarr/Radarr API)
    # - Detect missing subtitles
    # - Choose forward vs reverse based on analysis
    
    # For now, just trigger Subgen
    try:
        # Subgen scan endpoint (we'll need to verify this)
        # This is a placeholder - actual Subgen API may differ
        async with httpx.AsyncClient() as client:
            # Try to trigger a scan via Subgen API
            # NOTE: We need to discover Subgen's actual scan endpoint
            scan_url = f"{request.subgen_url}/api/scan"
            
            response = await client.post(
                scan_url,
                json={"type": scan_type, "paths": request.paths or []},
                timeout=10.0
            )
            
            if response.status_code == 200:
                return ScanResult(
                    status="success",
                    scan_type=scan_type,
                    reason=reason,
                    message=f"Scan triggered successfully ({scan_type})",
                    subgen_response=response.json()
                )
            else:
                return ScanResult(
                    status="error",
                    scan_type=scan_type,
                    reason=reason,
                    message=f"Subgen returned error: {response.status_code}"
                )
                
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Cannot connect to Subgen. Is it running?"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Scan failed: {str(e)}"
        )

@router.post("/forward-scan", response_model=ScanResult)
async def forward_scan(request: ScanRequest):
    """
    Forward scan - processes new content first
    Best for: Catching up on recently added media
    """
    request.scan_type = "forward"
    return await smart_scan(request)

@router.post("/reverse-scan", response_model=ScanResult)
async def reverse_scan(request: ScanRequest):
    """
    Reverse scan - processes oldest content first
    Best for: Filling gaps in existing library
    """
    request.scan_type = "reverse"
    return await smart_scan(request)

@router.get("/scan-status")
async def get_scan_status(subgen_url: str):
    """
    Get current scan status from Subgen
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{subgen_url}/api/status",
                timeout=5.0
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"status": "unknown", "message": "Could not fetch status"}
                
    except Exception as e:
        return {"status": "error", "message": str(e)}