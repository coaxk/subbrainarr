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
    latest_version: str = None
    is_outdated: bool = False
    model: str = None
    device: str = None
    error: str = None

async def test_subgen_connection(url: str) -> ConnectionResult:
    """Test connection to a Subgen instance and get version info"""
    try:
        # Clean up URL
        url = url.rstrip('/')
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Test basic connection
            response = await client.get(url)
            response.raise_for_status()
            
            # Try to get logs to extract version
            version = "Unknown"
            try:
                logs_response = await client.get(f"{url}/logs", timeout=3.0)
                if logs_response.status_code == 200:
                    logs_text = logs_response.text
                    # Look for version in logs (format: "Subgen v2026.02.0")
                    import re
                    version_match = re.search(r'Subgen v(\d{4}\.\d{2}\.\d+)', logs_text)
                    if version_match:
                        version = version_match.group(1)
            except:
                pass
            
            # Check if outdated (latest is 2026.02.0 as of now)
            latest_version = "2026.02.0"
            is_outdated = False
            if version != "Unknown":
                try:
                    # Simple version comparison
                    current = version.replace(".", "")
                    latest = latest_version.replace(".", "")
                    is_outdated = int(current) < int(latest)
                except:
                    pass
            
            return ConnectionResult(
                success=True,
                url=url,
                version=version,
                latest_version=latest_version,
                is_outdated=is_outdated,
                model="Detecting...",
                device="Detecting..."
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