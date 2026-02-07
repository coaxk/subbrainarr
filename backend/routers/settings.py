"""
Settings router - manage Subbrainarr and Subgen configuration
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class PathMapping(BaseModel):
    host_path: str
    container_path: str

class SubgenSettings(BaseModel):
    # Connection
    subgen_url: str = "http://localhost:9000"
    
    # Model & Compute
    whisper_model: str = "large-v3"  # tiny, small, medium, large-v3
    compute_type: str = "float16"  # float32, float16, int8_float16, int8
    transcribe_device: str = "cuda"  # cuda, cpu
    beam_size: int = 5
    
    # Performance
    whisper_threads: int = 4
    concurrent_transcriptions: int = 1
    clear_vram_on_complete: bool = True
    
    # Task
    whisper_task: str = "translate"  # translate or transcribe
    subtitle_language: str = "en"
    
    # Path Mapping
    use_path_mapping: bool = False
    path_mapping: Optional[PathMapping] = None
    
    # Skip Conditions
    skip_if_english_audio: bool = True
    skip_if_english_subs_exist: bool = True
    skip_files_patterns: List[str] = ["subbed", "korsub", "dubbed"]
    
    # Advanced
    auto_skip_threshold: float = 0.75
    ssa_fix_encoding: bool = True
    ssa_fix_newlines: bool = True
    custom_regroup: Optional[str] = None

# In-memory settings (would be database in production)
current_settings = SubgenSettings()

@router.get("/current", response_model=SubgenSettings)
async def get_current_settings():
    """Get current Subgen settings"""
    return current_settings

@router.put("/update", response_model=SubgenSettings)
async def update_settings(settings: SubgenSettings):
    """Update Subgen settings"""
    global current_settings
    current_settings = settings
    
    # TODO: Actually apply these to Subgen via API or docker-compose
    # For now, just store them
    
    return current_settings

@router.get("/defaults")
async def get_default_settings():
    """Get recommended default settings"""
    return {
        "message": "Default settings based on detected hardware",
        "settings": SubgenSettings()
    }

@router.post("/test-path-mapping")
async def test_path_mapping(mapping: PathMapping):
    """Test if a path mapping is valid"""
    import os
    
    # Simple validation
    if not mapping.host_path or not mapping.container_path:
        return {
            "valid": False,
            "error": "Both paths are required"
        }
    
    # Check if container path exists (from container's perspective)
    container_exists = os.path.exists(mapping.container_path)
    
    return {
        "valid": container_exists,
        "host_path": mapping.host_path,
        "container_path": mapping.container_path,
        "container_exists": container_exists,
        "message": "Path exists in container" if container_exists else "Path not found in container"
    }