"""
Scanning router - intelligent orchestration of Subgen scans
We are the brain Subgen doesn't have

Subgen's batch scan API:
  POST /batch?directory=<path>         — scan all media under <path>
  POST /batch?directory=<path>&reverse=true  — scan in reverse (Z-A) order
  GET  /status                         — current processing status

Directory paths are inside Subgen's container (e.g. /media/library).
Folder names with special chars (parens, apostrophes) must be URL-encoded.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from urllib.parse import quote
import httpx

from .url_validation import validate_subgen_url

router = APIRouter()

class ScanRequest(BaseModel):
    subgen_url: str
    scan_type: Optional[str] = "smart"  # smart, forward, reverse
    media_path: str = "/media/library"  # Base media path inside Subgen container

class FolderScanRequest(BaseModel):
    subgen_url: str
    folder_name: str  # e.g. "Breaking Bad" or "Bob's Burgers (2011)"
    media_path: str = "/media"  # Parent media path inside Subgen container

class ScanResult(BaseModel):
    status: str
    scan_type: str
    reason: str
    message: str
    subgen_response: Optional[dict] = None


async def _call_subgen_batch(clean_url: str, directory: str, reverse: bool = False) -> dict:
    """Call Subgen's POST /batch endpoint with the given directory.

    Returns the parsed JSON response or raises HTTPException on failure.
    The directory path is URL-encoded to handle special characters
    (parentheses, apostrophes, spaces, etc.) safely.
    """
    encoded_dir = quote(directory, safe="/")
    batch_url = f"{clean_url}/batch?directory={encoded_dir}"
    if reverse:
        batch_url += "&reverse=true"

    async with httpx.AsyncClient() as client:
        response = await client.post(batch_url, timeout=30.0)

        if response.status_code == 200:
            try:
                return response.json()
            except Exception:
                # Subgen may return plain text on success
                return {"message": response.text}
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Subgen returned {response.status_code}: {response.text[:200]}"
            )


@router.post("/smart-scan", response_model=ScanResult)
async def smart_scan(request: ScanRequest):
    """
    Intelligent scan orchestration — triggers Subgen's batch endpoint.
    Smart scan defaults to forward (A-Z) order which catches new content first.
    """
    # Validate URL to prevent SSRF
    valid, clean_url = validate_subgen_url(request.subgen_url)
    if not valid:
        raise HTTPException(status_code=400, detail=f"Invalid Subgen URL: {clean_url}")

    scan_type = request.scan_type if request.scan_type in ("forward", "reverse") else "forward"
    reverse = scan_type == "reverse"

    try:
        result = await _call_subgen_batch(clean_url, request.media_path, reverse=reverse)
        return ScanResult(
            status="success",
            scan_type=scan_type,
            reason=f"User requested {scan_type} scan",
            message=f"Scan triggered successfully ({scan_type})",
            subgen_response=result
        )
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Cannot connect to Subgen. Is it running?"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Scan failed: {str(e)}"
        )

@router.post("/forward-scan", response_model=ScanResult)
async def forward_scan(request: ScanRequest):
    """
    Forward scan (A-Z) — processes new content first.
    Best for: Catching up on recently added media.
    """
    request.scan_type = "forward"
    return await smart_scan(request)

@router.post("/reverse-scan", response_model=ScanResult)
async def reverse_scan(request: ScanRequest):
    """
    Reverse scan (Z-A) — processes oldest content first.
    Best for: Filling gaps in existing library.
    """
    request.scan_type = "reverse"
    return await smart_scan(request)

@router.post("/folder-scan", response_model=ScanResult)
async def folder_scan(request: FolderScanRequest):
    """
    Scan a single folder — great for testing or priority processing.
    Folder name is combined with media_path to form the full directory.
    Special characters in folder names are URL-encoded automatically.
    """
    valid, clean_url = validate_subgen_url(request.subgen_url)
    if not valid:
        raise HTTPException(status_code=400, detail=f"Invalid Subgen URL: {clean_url}")

    if not request.folder_name.strip():
        raise HTTPException(status_code=400, detail="Folder name cannot be empty")

    # Build the full directory path inside Subgen's container
    full_path = f"{request.media_path.rstrip('/')}/{request.folder_name.strip()}"

    try:
        result = await _call_subgen_batch(clean_url, full_path)
        return ScanResult(
            status="success",
            scan_type="folder",
            reason=f"User requested scan of: {request.folder_name}",
            message=f"Folder scan triggered for '{request.folder_name}'",
            subgen_response=result
        )
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Cannot connect to Subgen. Is it running?"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Folder scan failed: {str(e)}"
        )

@router.get("/scan-status")
async def get_scan_status(subgen_url: str):
    """
    Get current scan/processing status from Subgen.
    Subgen exposes GET /status for this.
    """
    valid, clean_url = validate_subgen_url(subgen_url)
    if not valid:
        return {"status": "error", "message": f"Invalid URL: {clean_url}"}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{clean_url}/status",
                timeout=5.0
            )

            if response.status_code == 200:
                try:
                    return response.json()
                except Exception:
                    return {"status": "ok", "raw": response.text}
            else:
                return {"status": "unknown", "message": "Could not fetch status"}

    except Exception as e:
        return {"status": "error", "message": str(e)}
