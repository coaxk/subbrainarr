"""
Language tuning wizard - help users optimize subtitle settings

Tracks which languages have been tuned via the wizard. Tuning state is
persisted in settings.json via language_configs — survives container restarts.
The get_tuned_languages() helper derives the tuned set from persisted data.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Set
from . import languages
from .settings import load_settings, save_settings_to_file, LanguageConfig

router = APIRouter()


def get_tuned_languages() -> Set[str]:
    """Derive tuned language set from persisted language_configs.

    Any language present in settings.language_configs is considered tuned.
    This replaces the old in-memory _tuned_languages set, giving us
    persistence across restarts for free.
    """
    settings = load_settings()
    return set(settings.language_configs.keys())


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

class ResetRequest(BaseModel):
    language_code: str

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
    """Apply tuned settings to a language profile.

    Updates DEFAULT_LANGUAGES in-memory (for current session) and persists
    to settings.language_configs (for compose generation and restart survival).
    """
    applied = False
    for lang_code, lang_data in languages.DEFAULT_LANGUAGES.items():
        if lang_data["name"] == settings.language:
            # Update in-memory DEFAULT_LANGUAGES (immediate UI effect)
            lang_data["patience"] = settings.patience
            lang_data["length_penalty"] = settings.length_penalty
            lang_data["beam_size"] = settings.beam_size

            # Persist to settings.language_configs → settings.json
            current_settings = load_settings()
            current_settings.language_configs[lang_code] = LanguageConfig(
                patience=settings.patience,
                length_penalty=settings.length_penalty,
                beam_size=settings.beam_size,
            )
            save_settings_to_file(current_settings)

            applied = True
            break

    return {
        "success": applied,
        "language": settings.language,
        "settings_applied": {
            "patience": settings.patience,
            "length_penalty": settings.length_penalty,
            "beam_size": settings.beam_size
        },
        "message": f"Settings applied to {settings.language}. Restart Subgen for changes to take effect."
    }


@router.post("/apply-defaults")
async def apply_default_tuning():
    """Apply all languages' optimized presets to settings.language_configs.

    Writes every language's preset values into language_configs and persists
    to disk, so compose snippet generation picks them up and tuning state
    survives container restarts.
    """
    current_settings = load_settings()
    for lang_code, lang_data in languages.DEFAULT_LANGUAGES.items():
        current_settings.language_configs[lang_code] = LanguageConfig(
            patience=lang_data["patience"],
            length_penalty=lang_data["length_penalty"],
            beam_size=lang_data.get("beam_size", 5),
        )
    save_settings_to_file(current_settings)
    return {"success": True, "languages_tuned": len(languages.DEFAULT_LANGUAGES)}


@router.post("/reset")
async def reset_tuning(request: ResetRequest):
    """Remove a language's tuning, reverting to SubBrainArr presets.

    Removes the language from settings.language_configs and persists.
    The language list will then show DEFAULT_LANGUAGES preset values.
    """
    current_settings = load_settings()
    removed = request.language_code in current_settings.language_configs
    if removed:
        del current_settings.language_configs[request.language_code]
        save_settings_to_file(current_settings)

    return {
        "success": removed,
        "language_code": request.language_code,
        "message": f"Tuning reset for {request.language_code}" if removed else "Language was not tuned"
    }
