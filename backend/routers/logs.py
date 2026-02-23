"""
Logs router - fetch and stream logs from Subgen and SubBrainArr

Attempts real log fetching via Docker SDK first. The Docker socket
must be mounted (-v /var/run/docker.sock:/var/run/docker.sock)
for container log access. Falls back to guidance text if unavailable.
"""
from fastapi import APIRouter, Query
import httpx
from typing import Optional

from .url_validation import validate_subgen_url

router = APIRouter()

# Container names to try when fetching Subgen logs via Docker SDK
_SUBGEN_CONTAINER_NAMES = ["subgen", "subgen-test"]
_SELF_CONTAINER_NAMES = ["subbrainarr", "subbrainarr-dev"]


def _get_docker_client():
    """Try to create a Docker client. Returns None if unavailable."""
    try:
        import docker
        return docker.from_env()
    except Exception:
        return None


def _fetch_container_logs(client, container_names: list, lines: int, level: str = None) -> str:
    """Fetch logs from the first matching container name.

    Returns log text or None if no container found.
    """
    for name in container_names:
        try:
            container = client.containers.get(name)
            raw = container.logs(tail=lines, timestamps=True)
            log_text = raw.decode("utf-8", errors="replace")

            if level:
                # Filter by log level keyword
                filtered = [
                    line for line in log_text.splitlines()
                    if level.upper() in line.upper()
                ]
                return "\n".join(filtered) if filtered else f"No {level.upper()} logs found in last {lines} lines."

            return log_text
        except Exception:
            continue
    return None


@router.get("/subgen")
async def get_subgen_logs(
    subgen_url: str = Query(..., description="Subgen instance URL"),
    lines: Optional[int] = Query(500, description="Number of lines to fetch"),
    level: Optional[str] = Query(None, description="Filter by level: INFO, WARNING, ERROR"),
):
    """
    Fetch logs from Subgen — tries Docker SDK first, then falls back to
    a connectivity check with guidance on manual log viewing.
    """
    valid, clean_url = validate_subgen_url(subgen_url)
    if not valid:
        return {"success": False, "error": clean_url, "logs": ""}

    # Attempt 1: Docker SDK (requires socket mount)
    client = _get_docker_client()
    if client:
        log_text = _fetch_container_logs(client, _SUBGEN_CONTAINER_NAMES, lines, level)
        if log_text:
            return {
                "success": True,
                "source": "docker",
                "logs": log_text,
                "lines": len(log_text.splitlines()),
            }

    # Attempt 2: Connectivity check + guidance
    try:
        async with httpx.AsyncClient(timeout=5.0) as http:
            response = await http.get(clean_url)

            if response.status_code == 200:
                return {
                    "success": True,
                    "source": "fallback",
                    "logs": (
                        f"INFO  Subgen is running at {clean_url}\n"
                        "INFO  Docker socket not available — cannot fetch live logs.\n"
                        "INFO  To enable live logs, mount the Docker socket:\n"
                        "INFO    -v /var/run/docker.sock:/var/run/docker.sock\n"
                        "\n"
                        "INFO  Manual alternative:\n"
                        "INFO    docker logs subgen -f --tail 500\n"
                    ),
                    "lines": 7,
                }
            else:
                return {
                    "success": False,
                    "error": f"Subgen returned status {response.status_code}",
                    "logs": "",
                }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "logs": f"ERROR  Cannot connect to Subgen: {str(e)}",
        }


@router.get("/local")
async def get_local_logs(
    lines: int = Query(500, description="Number of lines"),
    level: Optional[str] = Query(None, description="Filter by level: INFO, WARNING, ERROR"),
):
    """
    Get SubBrainArr's own application logs via Docker SDK.
    Falls back to guidance text if Docker socket is unavailable.
    """
    # Attempt: Docker SDK
    client = _get_docker_client()
    if client:
        log_text = _fetch_container_logs(client, _SELF_CONTAINER_NAMES, lines, level)
        if log_text:
            return {
                "success": True,
                "source": "docker",
                "logs": log_text,
                "lines": len(log_text.splitlines()),
            }

    # Fallback
    return {
        "success": True,
        "source": "fallback",
        "logs": (
            "INFO  SubBrainArr is running.\n"
            "INFO  Docker socket not available — cannot fetch live logs.\n"
            "INFO  To enable live logs, mount the Docker socket:\n"
            "INFO    -v /var/run/docker.sock:/var/run/docker.sock\n"
            "\n"
            "INFO  Manual alternative:\n"
            "INFO    docker logs subbrainarr -f --tail 500\n"
        ),
        "lines": 7,
    }
