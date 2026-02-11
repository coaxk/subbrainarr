"""
Language tuning wizard - help users optimize subtitle settings
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from . import languages

router = APIRouter()

class TuningRequest(BaseModel):
    language: str
    issues: List[str]  # Now accepts multiple issues
    current_patience: float = 1.0
    current_length_penalty: float = 1.0
    current_beam_size: int = 5

class TuningResult(BaseModel):
    recommended_patience: float
    recommended_length_penalty: float
    recommended_beam_size: int
    explanation: str
    before_settings: dict
    after_settings: dict

class ApplySettings(BaseModel):
    language: str
    patience: float
    length_penalty: float
    beam_size: int

@router.post("/recommend", response_model=TuningResult)
async def get_tuning_recommendations(request: TuningRequest):
    """
    Analyze user's issues and recommend optimal settings
    Supports multiple issues - will merge recommendations
    """

    # Base recommendations based on issue
    adjustments = {
        "too_fast": {
            "patience": 1.5,
            "length_penalty": 1.2,
            "beam_size": 7,
            "explanation": "Increased patience and length penalty to give subtitles more time on screen"
        },
        "too_slow": {
            "patience": 0.8,
            "length_penalty": 0.8,
            "beam_size": 5,
            "explanation": "Reduced patience and length penalty for snappier subtitle timing"
        },
        "lines_short": {
            "patience": 1.0,
            "length_penalty": 1.3,
            "beam_size": 6,
            "explanation": "Increased length penalty to create fuller, more natural line breaks"
        },
        "lines_long": {
            "patience": 1.0,
            "length_penalty": 0.7,
            "beam_size": 6,
            "explanation": "Reduced length penalty to break text into more readable chunks"
        },
        "optimize": {
            "patience": 1.2,
            "length_penalty": 1.0,
            "beam_size": 6,
            "explanation": "Balanced settings for optimal subtitle quality and timing"
        }
    }

    # If no issues selected, use optimize
    if not request.issues:
        request.issues = ["optimize"]

    # Get settings for each selected issue
    selected_settings = [adjustments.get(issue, adjustments["optimize"]) for issue in request.issues]

    # Merge settings (average patience/length, max beam_size)
    avg_patience = sum(s["patience"] for s in selected_settings) / len(selected_settings)
    avg_length = sum(s["length_penalty"] for s in selected_settings) / len(selected_settings)
    max_beam = max(s["beam_size"] for s in selected_settings)

    # Combine explanations
    combined_explanation = " + ".join(s["explanation"] for s in selected_settings)

    return TuningResult(
        recommended_patience=round(avg_patience, 2),
        recommended_length_penalty=round(avg_length, 2),
        recommended_beam_size=max_beam,
        explanation=combined_explanation,
        before_settings={
            "patience": request.current_patience,
            "length_penalty": request.current_length_penalty,
            "beam_size": request.current_beam_size
        },
        after_settings={
            "patience": round(avg_patience, 2),
            "length_penalty": round(avg_length, 2),
            "beam_size": max_beam
        }
    )

@router.post("/apply")
async def apply_tuning_settings(settings: ApplySettings):
    """
    Apply tuned settings to a language profile
    """
    # Find and update the language in DEFAULT_LANGUAGES
    # This updates in-memory until v1.1+ when we add persistence
    for lang_code, lang_data in languages.DEFAULT_LANGUAGES.items():
        if lang_data["name"] == settings.language:
            lang_data["patience"] = settings.patience
            lang_data["length_penalty"] = settings.length_penalty
            lang_data["beam_size"] = settings.beam_size
            # In v1.1+ this will be saved to database
            break

    return {
        "success": True,
        "language": settings.language,
        "settings_applied": {
            "patience": settings.patience,
            "length_penalty": settings.length_penalty,
            "beam_size": settings.beam_size
        },
        "message": f"Settings applied to {settings.language}. Restart Subgen for changes to take effect."
    }