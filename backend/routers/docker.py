"""
Docker integration - read volumes and suggest path mappings
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import docker
import os

router = APIRouter()

class VolumeMapping(BaseModel):
    host_path: str
    container_path: str
    suggested: bool = True

class DockerVolumes(BaseModel):
    subgen_volumes: List[VolumeMapping]
    suggested_mapping: Optional[VolumeMapping] = None

def get_subgen_volumes() -> List[VolumeMapping]:
    """
    Try to detect Subgen container volumes
    """
    volumes = []

    try:
        # Connect to Docker and get the subgen container
        client = docker.from_env()
        container = client.containers.get("subgen")

        # Get the mounts from the container
        mounts = container.attrs.get("Mounts", [])

        for mount in mounts:
            if mount.get("Type") == "bind":
                volumes.append(VolumeMapping(
                    host_path=mount.get("Source", ""),
                    container_path=mount.get("Destination", ""),
                    suggested=True
                ))
    except docker.errors.NotFound:
        print("Subgen container not found")
    except docker.errors.DockerException as e:
        print(f"Docker error: {e}")
    except Exception as e:
        print(f"Could not inspect subgen container: {e}")

    return volumes

def suggest_best_mapping(volumes: List[VolumeMapping]) -> Optional[VolumeMapping]:
    """
    Analyze volumes and suggest the most likely media path
    """
    if not volumes:
        return None
    
    # Look for common media paths
    media_keywords = ["media", "tv", "movies", "library", "data"]
    
    for volume in volumes:
        container_lower = volume.container_path.lower()
        if any(keyword in container_lower for keyword in media_keywords):
            return volume
    
    # If no media path found, return first volume
    return volumes[0] if volumes else None

@router.get("/volumes", response_model=DockerVolumes)
async def get_docker_volumes():
    """
    Detect Subgen docker volumes and suggest path mappings
    """
    volumes = get_subgen_volumes()
    suggested = suggest_best_mapping(volumes)
    
    return DockerVolumes(
        subgen_volumes=volumes,
        suggested_mapping=suggested
    )

@router.get("/platform")
async def detect_platform():
    """
    Detect the platform we're running on
    """
    platform_info = {
        "os": os.name,
        "platform": "unknown"
    }
    
    # Try to detect specific platforms
    if os.path.exists("/etc/unraid-version"):
        platform_info["platform"] = "unraid"
    elif os.path.exists("/volume1"):
        platform_info["platform"] = "synology"
    elif os.name == "nt":
        platform_info["platform"] = "windows"
    elif os.name == "posix":
        platform_info["platform"] = "linux"
    
    return platform_info