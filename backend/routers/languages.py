"""
Languages router - manage per-language settings and recommendations
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Optional, List

router = APIRouter()

class LanguageSettings(BaseModel):
    code: str
    name: str
    flag: str
    patience: float
    length_penalty: float
    beam_size: int = 5
    files_processed: int = 0
    last_used: Optional[str] = None
    recommendation: Optional[str] = None
    is_optimized: bool = True

# Default optimized settings per language
DEFAULT_LANGUAGES = {
    "ar": {
        "code": "ar",
        "name": "Arabic",
        "flag": "🇸🇦",
        "patience": 1.6,
        "length_penalty": 0.85,
        "recommendation": "Optimized for Modern Standard Arabic"
    },
    "bn": {
        "code": "bn",
        "name": "Bengali",
        "flag": "🇧🇩",
        "patience": 1.4,
        "length_penalty": 0.9,
        "beam_size": 5,
        "recommendation": "Handles Bengali script and grammar"
    },
    "zh": {
        "code": "zh",
        "name": "Chinese",
        "flag": "🇨🇳",
        "patience": 1.2,
        "length_penalty": 0.85,
        "recommendation": "Works for Mandarin content"
    },
    "cs": {
        "code": "cs",
        "name": "Czech",
        "flag": "🇨🇿",
        "patience": 1.6,
        "length_penalty": 0.85,
        "recommendation": "Handles Czech declensions and grammar"
    },
    "da": {
        "code": "da",
        "name": "Danish",
        "flag": "🇩🇰",
        "patience": 1.4,
        "length_penalty": 0.9,
        "recommendation": "Optimized for Danish pronunciation nuances"
    },
    "nl": {
        "code": "nl",
        "name": "Dutch",
        "flag": "🇳🇱",
        "patience": 1.6,
        "length_penalty": 0.85,
        "recommendation": "Balanced for natural Dutch speech patterns"
    },
    "en": {
        "code": "en",
        "name": "English",
        "flag": "🇬🇧",
        "patience": 1.0,
        "length_penalty": 1.0,
        "recommendation": "Transcribe mode - generates English subtitles from English audio"
    },
    "fi": {
        "code": "fi",
        "name": "Finnish",
        "flag": "🇫🇮",
        "patience": 1.7,
        "length_penalty": 0.85,
        "recommendation": "Handles complex Finnish case system"
    },
    "fr": {
        "code": "fr",
        "name": "French",
        "flag": "🇫🇷",
        "patience": 1.8,
        "length_penalty": 0.85,
        "recommendation": "Optimized for complex grammar and formality levels"
    },
    "de": {
        "code": "de",
        "name": "German",
        "flag": "🇩🇪",
        "patience": 1.8,
        "length_penalty": 0.8,
        "recommendation": "Preserves formal/informal (Sie/du), handles compound words"
    },
    "el": {
        "code": "el",
        "name": "Greek",
        "flag": "🇬🇷",
        "patience": 1.6,
        "length_penalty": 0.85,
        "recommendation": "Optimized for Modern Greek"
    },
    "he": {
        "code": "he",
        "name": "Hebrew",
        "flag": "🇮🇱",
        "patience": 1.4,
        "length_penalty": 0.9,
        "beam_size": 5,
        "recommendation": "Optimized for Modern Hebrew"
    },
    "hi": {
        "code": "hi",
        "name": "Hindi",
        "flag": "🇮🇳",
        "patience": 1.4,
        "length_penalty": 0.9,
        "beam_size": 5,
        "recommendation": "Works for Bollywood and Hindi content"
    },
    "hu": {
        "code": "hu",
        "name": "Hungarian",
        "flag": "🇭🇺",
        "patience": 1.5,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "Handles complex Hungarian grammar"
    },
    "id": {
        "code": "id",
        "name": "Indonesian",
        "flag": "🇮🇩",
        "patience": 1.1,
        "length_penalty": 0.95,
        "beam_size": 5,
        "recommendation": "Works for Indonesian/Malay content"
    },
    "it": {
        "code": "it",
        "name": "Italian",
        "flag": "🇮🇹",
        "patience": 1.5,
        "length_penalty": 0.85,
        "recommendation": "Handles expressive Italian dialogue well"
    },
    "ja": {
        "code": "ja",
        "name": "Japanese",
        "flag": "🇯🇵",
        "patience": 1.0,
        "length_penalty": 1.3,
        "recommendation": "Optimized for concise subtitles (anime, dramas)"
    },
    "ko": {
        "code": "ko",
        "name": "Korean",
        "flag": "🇰🇷",
        "patience": 1.2,
        "length_penalty": 0.85,
        "recommendation": "Balanced for K-dramas and variety shows"
    },
    "ms": {
        "code": "ms",
        "name": "Malay",
        "flag": "🇲🇾",
        "patience": 1.1,
        "length_penalty": 0.95,
        "beam_size": 5,
        "recommendation": "Malaysian Malay variant"
    },
    "no": {
        "code": "no",
        "name": "Norwegian",
        "flag": "🇳🇴",
        "patience": 1.4,
        "length_penalty": 0.9,
        "recommendation": "Works for both Bokmål and Nynorsk"
    },
    "fa": {
        "code": "fa",
        "name": "Persian",
        "flag": "🇮🇷",
        "patience": 1.5,
        "length_penalty": 0.9,
        "beam_size": 5,
        "recommendation": "Handles Persian/Farsi grammar"
    },
    "pl": {
        "code": "pl",
        "name": "Polish",
        "flag": "🇵🇱",
        "patience": 1.6,
        "length_penalty": 0.85,
        "recommendation": "Optimized for Polish declensions and grammar"
    },
    "pt": {
        "code": "pt",
        "name": "Portuguese",
        "flag": "🇵🇹",
        "patience": 1.6,
        "length_penalty": 0.9,
        "recommendation": "Optimized for Brazilian and European Portuguese"
    },
    "ro": {
        "code": "ro",
        "name": "Romanian",
        "flag": "🇷🇴",
        "patience": 1.4,
        "length_penalty": 0.9,
        "beam_size": 5,
        "recommendation": "Romance language with Slavic influences"
    },
    "ru": {
        "code": "ru",
        "name": "Russian",
        "flag": "🇷🇺",
        "patience": 1.6,
        "length_penalty": 0.85,
        "recommendation": "Handles complex Russian grammar structures"
    },
    "es": {
        "code": "es",
        "name": "Spanish",
        "flag": "🇪🇸",
        "patience": 1.6,
        "length_penalty": 0.9,
        "recommendation": "Works for both European and Latin American Spanish"
    },
    "sv": {
        "code": "sv",
        "name": "Swedish",
        "flag": "🇸🇪",
        "patience": 1.4,
        "length_penalty": 0.9,
        "recommendation": "Clean Swedish subtitle generation"
    },
    "th": {
        "code": "th",
        "name": "Thai",
        "flag": "🇹🇭",
        "patience": 1.3,
        "length_penalty": 1.0,
        "beam_size": 5,
        "recommendation": "Optimized for Thai dramas and content"
    },
    "tr": {
        "code": "tr",
        "name": "Turkish",
        "flag": "🇹🇷",
        "patience": 1.3,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "Optimized for Turkish vowel harmony"
    },
    "uk": {
        "code": "uk",
        "name": "Ukrainian",
        "flag": "🇺🇦",
        "patience": 1.6,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "Similar to Russian with distinct features"
    },
    "vi": {
        "code": "vi",
        "name": "Vietnamese",
        "flag": "🇻🇳",
        "patience": 1.2,
        "length_penalty": 0.95,
        "beam_size": 5,
        "recommendation": "Handles Vietnamese tonal marks"
    }
}

@router.get("/list", response_model=List[LanguageSettings])
async def list_languages():
    """
    Get list of all configured languages with their settings
    """
    languages = []
    for lang_data in DEFAULT_LANGUAGES.values():
        # beam_size may already be in lang_data from tuning updates
        # Only add it if not present (use default from model)
        settings_data = {
            **lang_data,
            "files_processed": 0,  # TODO: Track from database
            "last_used": None,     # TODO: Track from database
            "is_optimized": True
        }
        # Add beam_size default only if not already present
        if "beam_size" not in settings_data:
            settings_data["beam_size"] = 5

        languages.append(LanguageSettings(**settings_data))

    # Sort by name
    languages.sort(key=lambda x: x.name)
    return languages

@router.get("/{language_code}", response_model=LanguageSettings)
async def get_language(language_code: str):
    """
    Get settings for a specific language
    """
    if language_code in DEFAULT_LANGUAGES:
        lang_data = DEFAULT_LANGUAGES[language_code]
        return LanguageSettings(
            **lang_data,
            beam_size=5,
            files_processed=0,
            last_used=None,
            is_optimized=True
        )
    else:
        return LanguageSettings(
            code=language_code,
            name=language_code.upper(),
            flag="🌐",
            patience=1.5,
            length_penalty=0.9,
            beam_size=5,
            files_processed=0,
            last_used=None,
            recommendation="Using default settings",
            is_optimized=False
        )