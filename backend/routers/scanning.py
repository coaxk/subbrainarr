"""
Scanning router - intelligent orchestration of Subgen scans
We are the brain Subgen doesn't have
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import httpx
import asyncio

from .url_validation import validate_subgen_url

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
    
    # Validate URL to prevent SSRF
    valid, clean_url = validate_subgen_url(request.subgen_url)
    if not valid:
        raise HTTPException(status_code=400, detail=f"Invalid Subgen URL: {clean_url}")

    # For now, just trigger Subgen
    try:
        async with httpx.AsyncClient() as client:
            scan_url = f"{clean_url}/api/scan"
            
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
    # Validate URL to prevent SSRF
    valid, clean_url = validate_subgen_url(subgen_url)
    if not valid:
        return {"status": "error", "message": f"Invalid URL: {clean_url}"}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{clean_url}/api/status",
                timeout=5.0
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"status": "unknown", "message": "Could not fetch status"}
                
    except Exception as e:
        return {"status": "error", "message": str(e)}