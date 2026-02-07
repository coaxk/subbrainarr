"""
Connection router - handles Subgen instance detection and connection
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
import httpx
import asyncio

router = APIRouter()

class ConnectionTest(BaseModel):
    url: str

class ConnectionResult(BaseModel):
    success: bool
    url: str
    version: str = None
    model: str = None
    device: str = None
    error: str = None

async def test_subgen_connection(url: str) -> ConnectionResult:
    """Test connection to a Subgen instance"""
    try:
        # Clean up URL
        url = url.rstrip('/')
        
        # Try to connect
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url)
            
            # Subgen returns a simple message or list
            data = response.json()
            
            # Try to get version info from logs endpoint if available
            # For now, just confirm it's responding
            return ConnectionResult(
                success=True,
                url=url,
                version="Detected",
                model="Unknown",
                device="Unknown"
            )
            
    except httpx.ConnectError:
        return ConnectionResult(
            success=False,
            url=url,
            error="Could not connect. Is Subgen running?"
        )
    except httpx.TimeoutException:
        return ConnectionResult(
            success=False,
            url=url,
            error="Connection timeout. Check URL and firewall."
        )
    except Exception as e:
        return ConnectionResult(
            success=False,
            url=url,
            error=f"Error: {str(e)}"
        )

@router.post("/test", response_model=ConnectionResult)
async def test_connection(conn: ConnectionTest):
    """Test connection to a Subgen URL"""
    result = await test_subgen_connection(conn.url)
    return result

@router.get("/auto-detect")
async def auto_detect():
    """
    Auto-detect Subgen instances on common ports
    """
    common_urls = [
    "http://subgen:9000",                      # Docker same network
    "http://host.docker.internal:9000",        # Host Docker default
    "http://host.docker.internal:9007",        # Host production Subgen
    "http://host.docker.internal:9919",        # Host test Subgen
    "http://172.17.0.1:9000",                  # Docker bridge default
    "http://172.17.0.1:9007",                  # Docker bridge production
    "http://172.17.0.1:9919",                  # Docker bridge test
]
    
    results = []
    
    # Test all URLs concurrently
    tasks = [test_subgen_connection(url) for url in common_urls]
    results = await asyncio.gather(*tasks)
    
    # Return all results
    return {
        "found": [r for r in results if r.success],
        "tested": results
    }