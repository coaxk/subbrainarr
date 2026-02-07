"""
Hardware detection router - detects GPU/CPU and provides recommendations
"""
from fastapi import APIRouter
from pydantic import BaseModel
import subprocess
import os
import platform
import shutil
from typing import Optional, Dict, Any

router = APIRouter()

class StorageInfo(BaseModel):
    total: float  # GB
    used: float   # GB
    free: float   # GB
    type: Optional[str] = None  # "SSD" or "HDD"

class HardwareInfo(BaseModel):
    device_type: str  # "cuda", "cpu", "mps"
    device_name: Optional[str] = None
    total_memory: Optional[float] = None  # GPU VRAM in GB
    available_memory: Optional[float] = None  # GPU VRAM free in GB
    cpu_cores: Optional[int] = None
    cpu_threads: Optional[int] = None
    ram_total: Optional[float] = None  # System RAM in GB
    ram_available: Optional[float] = None  # System RAM free in GB
    platform: str
    platform_version: Optional[str] = None
    storage: Optional[StorageInfo] = None
    recommendation: Optional[str] = None

def detect_gpu() -> Dict[str, Any]:
    """Detect NVIDIA GPU using nvidia-smi"""
    try:
        result = subprocess.run(
            ['nvidia-smi', '--query-gpu=name,memory.total,memory.free', '--format=csv,noheader,nounits'],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode == 0:
            line = result.stdout.strip().split('\n')[0]
            name, total, free = [x.strip() for x in line.split(',')]
            
            total_gb = float(total) / 1024
            free_gb = float(free) / 1024
            
            return {
                "device_type": "cuda",
                "device_name": name,
                "total_memory": round(total_gb, 1),
                "available_memory": round(free_gb, 1),
                "recommendation": get_gpu_recommendation(total_gb)
            }
    except (subprocess.TimeoutExpired, FileNotFoundError, Exception):
        pass
    
    return None

def detect_cpu() -> Dict[str, Any]:
    """Detect CPU info with detailed parsing"""
    try:
        cpu_count = os.cpu_count() or 1
        cpu_name = "Unknown CPU"
        
        # Detect CPU name based on platform
        try:
            if platform.system() == "Linux":
                with open('/proc/cpuinfo', 'r') as f:
                    for line in f:
                        if 'model name' in line:
                            cpu_name = line.split(':')[1].strip()
                            break
            elif platform.system() == "Darwin":  # macOS
                result = subprocess.run(['sysctl', '-n', 'machdep.cpu.brand_string'], 
                                      capture_output=True, text=True, timeout=2)
                if result.returncode == 0:
                    cpu_name = result.stdout.strip()
            elif platform.system() == "Windows":
                # This won't run in Docker, but good for local dev
                result = subprocess.run(['wmic', 'cpu', 'get', 'name'], 
                                      capture_output=True, text=True, timeout=2)
                if result.returncode == 0:
                    lines = result.stdout.strip().split('\n')
                    if len(lines) > 1:
                        cpu_name = lines[1].strip()
        except:
            pass
        
        return {
            "device_type": "cpu",
            "device_name": cpu_name,
            "cpu_cores": cpu_count,
            "cpu_threads": cpu_count,
            "recommendation": get_cpu_recommendation(cpu_count, cpu_name)
        }
    except Exception as e:
        return {
            "device_type": "cpu",
            "device_name": "Unknown",
            "cpu_threads": 1,
            "recommendation": "Unable to detect CPU details"
        }

def detect_ram() -> Dict[str, Any]:
    """Detect system RAM"""
    try:
        if platform.system() == "Linux":
            with open('/proc/meminfo', 'r') as f:
                lines = f.readlines()
                mem_total = 0
                mem_available = 0
                
                for line in lines:
                    if 'MemTotal' in line:
                        mem_total = int(line.split()[1]) / (1024 * 1024)  # KB to GB
                    elif 'MemAvailable' in line:
                        mem_available = int(line.split()[1]) / (1024 * 1024)
                
                return {
                    "ram_total": round(mem_total, 1),
                    "ram_available": round(mem_available, 1)
                }
    except:
        pass
    
    return {"ram_total": None, "ram_available": None}

def detect_storage() -> Optional[StorageInfo]:
    """Detect storage info for /subgen/models path"""
    try:
        # Check the models directory (where Whisper models are stored)
        path = "/subgen/models" if os.path.exists("/subgen/models") else "/app"
        
        stat = shutil.disk_usage(path)
        total_gb = stat.total / (1024**3)
        used_gb = stat.used / (1024**3)
        free_gb = stat.free / (1024**3)
        
        # Try to detect if SSD or HDD (Linux only)
        storage_type = detect_storage_type(path)
        
        return StorageInfo(
            total=round(total_gb, 1),
            used=round(used_gb, 1),
            free=round(free_gb, 1),
            type=storage_type
        )
    except:
        return None

def detect_storage_type(path: str) -> Optional[str]:
    """Detect if storage is SSD or HDD (Linux only)"""
    try:
        if platform.system() != "Linux":
            return None
        
        # Get the device for this path
        result = subprocess.run(['df', path], capture_output=True, text=True, timeout=2)
        if result.returncode != 0:
            return None
        
        lines = result.stdout.strip().split('\n')
        if len(lines) < 2:
            return None
        
        device = lines[1].split()[0]
        # Extract device name (e.g., /dev/sda1 -> sda)
        device_name = device.split('/')[-1].rstrip('0123456789')
        
        # Check rotational flag (0 = SSD, 1 = HDD)
        rotational_path = f"/sys/block/{device_name}/queue/rotational"
        if os.path.exists(rotational_path):
            with open(rotational_path, 'r') as f:
                rotational = f.read().strip()
                return "SSD" if rotational == "0" else "HDD"
    except:
        pass
    
    return None

def get_gpu_recommendation(vram_gb: float) -> str:
    """Get recommendation based on GPU VRAM"""
    if vram_gb >= 24:
        return "🦑 BEAST MODE - Release the Kraken! Your GPU can handle anything."
    elif vram_gb >= 16:
        return "🔥 High-end GPU - Perfect for large-v3 with concurrent processing"
    elif vram_gb >= 12:
        return "✅ Sweet spot - Ideal for large-v3 with optimal settings"
    elif vram_gb >= 10:
        return "⚠️ Tight fit - large-v3 will work but monitor VRAM usage"
    elif vram_gb >= 6:
        return "💡 Budget GPU - Recommend medium model or int8 quantization"
    else:
        return "🥔 Potato GPU - Use small model or consider CPU processing"

def get_cpu_recommendation(threads: int, cpu_name: str) -> str:
    """Get recommendation based on CPU threads and model"""
    # Check if it's a high-end CPU by name
    high_end_markers = ["Ryzen 9", "Ryzen 7", "i9", "i7", "Threadripper", "EPYC", "Xeon"]
    is_high_end = any(marker in cpu_name for marker in high_end_markers)
    
    if threads >= 16 or is_high_end:
        return "💪 High-end CPU - Can handle medium model efficiently (12-20min per file)"
    elif threads >= 12:
        return "✅ Strong CPU - Good for medium model (20-25min per file)"
    elif threads >= 8:
        return "✅ Mid-range CPU - Medium model works well (25-35min per file)"
    elif threads >= 4:
        return "⚠️ Budget CPU - Use small model for reasonable speed (40-60min per file)"
    else:
        return "🐌 Low-power CPU - Expect slow processing, overnight batches recommended"

def get_platform_details() -> Dict[str, str]:
    """Get detailed platform information"""
    system = platform.system()
    release = platform.release()
    
    if system == "Linux":
        try:
            # Try to get distro info
            with open('/etc/os-release', 'r') as f:
                lines = f.readlines()
                for line in lines:
                    if line.startswith('PRETTY_NAME'):
                        distro = line.split('=')[1].strip().strip('"')
                        return {"platform": system, "platform_version": distro}
        except:
            pass
        return {"platform": system, "platform_version": f"Linux {release}"}
    
    return {"platform": system, "platform_version": release}

@router.get("/detect", response_model=HardwareInfo)
async def detect_hardware():
    """
    Detect available hardware (GPU/CPU/RAM/Storage)
    """
    # Try GPU first
    gpu_info = detect_gpu()
    if gpu_info:
        ram_info = detect_ram()
        storage_info = detect_storage()
        platform_info = get_platform_details()
        
        return HardwareInfo(
            **gpu_info,
            **ram_info,
            **platform_info,
            storage=storage_info
        )
    
    # Fallback to CPU
    cpu_info = detect_cpu()
    ram_info = detect_ram()
    storage_info = detect_storage()
    platform_info = get_platform_details()
    
    return HardwareInfo(
        **cpu_info,
        **ram_info,
        **platform_info,
        storage=storage_info
    )

@router.get("/recommendations")
async def get_recommendations():
    """
    Get hardware-based recommendations for Subgen settings
    """
    hw = await detect_hardware()
    
    recommendations = {
        "detected": hw.device_type,
        "model": "large-v3" if hw.device_type == "cuda" and hw.total_memory and hw.total_memory >= 10 else "medium",
        "compute_type": "float16" if hw.device_type == "cuda" else "int8",
        "beam_size": 5 if hw.device_type == "cuda" else 3,
        "threads": hw.cpu_threads if hw.cpu_threads else 4,
        "concurrent": 1 if not hw.total_memory or hw.total_memory < 16 else 2,
        "explanation": hw.recommendation
    }
    
    return recommendations