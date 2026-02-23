"""
Languages router - manage per-language settings and recommendations

optimization_status tri-state:
  "default" — using SubBrainArr's preset tuning (no user action taken)
  "tuned"   — user applied tuning wizard (wizard confirmed changes)
  "custom"  — reserved for future manual edits outside wizard
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Optional, List

router = APIRouter()

class LanguageSettings(BaseModel):
    code: str
    name: str
    native_name: str
    flag: str
    patience: float
    length_penalty: float
    beam_size: int = 5
    files_processed: int = 0
    last_used: Optional[str] = None
    recommendation: Optional[str] = None
    is_optimized: bool = True  # Kept for backwards compat with frontend
    optimization_status: str = "default"  # "default", "tuned", "custom"

# Default optimized settings per language
DEFAULT_LANGUAGES = {
    "af": {
        "code": "af",
        "name": "Afrikaans",
        "native_name": "Afrikaans",
        "flag": "🇿🇦",
        "patience": 1.3,
        "length_penalty": 0.9,
        "recommendation": "Germanic language, similar patterns to Dutch"
    },
    "ar": {
        "code": "ar",
        "name": "Arabic",
        "native_name": "العربية",
        "flag": "🇸🇦",
        "patience": 1.6,
        "length_penalty": 0.85,
        "recommendation": "Optimized for Modern Standard Arabic"
    },
    "hy": {
        "code": "hy",
        "name": "Armenian",
        "native_name": "Հայերեն",
        "flag": "🇦🇲",
        "patience": 1.5,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "Handles Armenian script and agglutinative grammar"
    },
    "az": {
        "code": "az",
        "name": "Azerbaijani",
        "native_name": "Azərbaycanca",
        "flag": "🇦🇿",
        "patience": 1.4,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "Turkic language with vowel harmony"
    },
    "be": {
        "code": "be",
        "name": "Belarusian",
        "native_name": "Беларуская",
        "flag": "🇧🇾",
        "patience": 1.6,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "East Slavic language, similar to Russian/Ukrainian"
    },
    "bn": {
        "code": "bn",
        "name": "Bengali",
        "native_name": "বাংলা",
        "flag": "🇧🇩",
        "patience": 1.4,
        "length_penalty": 0.9,
        "beam_size": 5,
        "recommendation": "Handles Bengali script and grammar"
    },
    "bs": {
        "code": "bs",
        "name": "Bosnian",
        "native_name": "Bosanski",
        "flag": "🇧🇦",
        "patience": 1.5,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "South Slavic language, mutually intelligible with Croatian/Serbian"
    },
    "bg": {
        "code": "bg",
        "name": "Bulgarian",
        "native_name": "Български",
        "flag": "🇧🇬",
        "patience": 1.5,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "South Slavic with Cyrillic script, no case system"
    },
    "ca": {
        "code": "ca",
        "name": "Catalan",
        "native_name": "Català",
        "flag": "🇪🇸",
        "patience": 1.5,
        "length_penalty": 0.9,
        "recommendation": "Romance language spoken in Catalonia and Andorra"
    },
    "zh": {
        "code": "zh",
        "name": "Chinese",
        "native_name": "中文",
        "flag": "🇨🇳",
        "patience": 1.2,
        "length_penalty": 0.85,
        "recommendation": "Works for Mandarin content"
    },
    "hr": {
        "code": "hr",
        "name": "Croatian",
        "native_name": "Hrvatski",
        "flag": "🇭🇷",
        "patience": 1.5,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "South Slavic with Latin script, complex case system"
    },
    "cs": {
        "code": "cs",
        "name": "Czech",
        "native_name": "Čeština",
        "flag": "🇨🇿",
        "patience": 1.6,
        "length_penalty": 0.85,
        "recommendation": "Handles Czech declensions and grammar"
    },
    "da": {
        "code": "da",
        "name": "Danish",
        "native_name": "Dansk",
        "flag": "🇩🇰",
        "patience": 1.4,
        "length_penalty": 0.9,
        "recommendation": "Optimized for Danish pronunciation nuances"
    },
    "nl": {
        "code": "nl",
        "name": "Dutch",
        "native_name": "Nederlands",
        "flag": "🇳🇱",
        "patience": 1.6,
        "length_penalty": 0.85,
        "recommendation": "Balanced for natural Dutch speech patterns"
    },
    "en": {
        "code": "en",
        "name": "English",
        "native_name": "English",
        "flag": "🇬🇧",
        "patience": 1.0,
        "length_penalty": 1.0,
        "recommendation": "Transcribe mode - generates English subtitles from English audio"
    },
    "et": {
        "code": "et",
        "name": "Estonian",
        "native_name": "Eesti",
        "flag": "🇪🇪",
        "patience": 1.6,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "Finno-Ugric language with complex case system (14 cases)"
    },
    "fi": {
        "code": "fi",
        "name": "Finnish",
        "native_name": "Suomi",
        "flag": "🇫🇮",
        "patience": 1.7,
        "length_penalty": 0.85,
        "recommendation": "Handles complex Finnish case system"
    },
    "gl": {
        "code": "gl",
        "name": "Galician",
        "native_name": "Galego",
        "flag": "🇪🇸",
        "patience": 1.5,
        "length_penalty": 0.9,
        "recommendation": "Romance language closely related to Portuguese"
    },
    "fr": {
        "code": "fr",
        "name": "French",
        "native_name": "Français",
        "flag": "🇫🇷",
        "patience": 1.8,
        "length_penalty": 0.85,
        "recommendation": "Optimized for complex grammar and formality levels"
    },
    "de": {
        "code": "de",
        "name": "German",
        "native_name": "Deutsch",
        "flag": "🇩🇪",
        "patience": 1.8,
        "length_penalty": 0.8,
        "recommendation": "Preserves formal/informal (Sie/du), handles compound words"
    },
    "el": {
        "code": "el",
        "name": "Greek",
        "native_name": "Ελληνικά",
        "flag": "🇬🇷",
        "patience": 1.6,
        "length_penalty": 0.85,
        "recommendation": "Optimized for Modern Greek"
    },
    "he": {
        "code": "he",
        "name": "Hebrew",
        "native_name": "עברית",
        "flag": "🇮🇱",
        "patience": 1.4,
        "length_penalty": 0.9,
        "beam_size": 5,
        "recommendation": "Optimized for Modern Hebrew"
    },
    "hi": {
        "code": "hi",
        "name": "Hindi",
        "native_name": "हिन्दी",
        "flag": "🇮🇳",
        "patience": 1.4,
        "length_penalty": 0.9,
        "beam_size": 5,
        "recommendation": "Works for Bollywood and Hindi content"
    },
    "hu": {
        "code": "hu",
        "name": "Hungarian",
        "native_name": "Magyar",
        "flag": "🇭🇺",
        "patience": 1.5,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "Handles complex Hungarian grammar"
    },
    "is": {
        "code": "is",
        "name": "Icelandic",
        "native_name": "Íslenska",
        "flag": "🇮🇸",
        "patience": 1.6,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "Archaic Germanic grammar with complex declensions"
    },
    "id": {
        "code": "id",
        "name": "Indonesian",
        "native_name": "Bahasa Indonesia",
        "flag": "🇮🇩",
        "patience": 1.1,
        "length_penalty": 0.95,
        "beam_size": 5,
        "recommendation": "Works for Indonesian/Malay content"
    },
    "it": {
        "code": "it",
        "name": "Italian",
        "native_name": "Italiano",
        "flag": "🇮🇹",
        "patience": 1.5,
        "length_penalty": 0.85,
        "recommendation": "Handles expressive Italian dialogue well"
    },
    "ja": {
        "code": "ja",
        "name": "Japanese",
        "native_name": "日本語",
        "flag": "🇯🇵",
        "patience": 1.0,
        "length_penalty": 1.3,
        "recommendation": "Optimized for concise subtitles (anime, dramas)"
    },
    "kn": {
        "code": "kn",
        "name": "Kannada",
        "native_name": "ಕನ್ನಡ",
        "flag": "🇮🇳",
        "patience": 1.4,
        "length_penalty": 0.9,
        "beam_size": 5,
        "recommendation": "Dravidian language with unique script"
    },
    "kk": {
        "code": "kk",
        "name": "Kazakh",
        "native_name": "Қазақша",
        "flag": "🇰🇿",
        "patience": 1.5,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "Turkic language with agglutinative grammar"
    },
    "ko": {
        "code": "ko",
        "name": "Korean",
        "native_name": "한국어",
        "flag": "🇰🇷",
        "patience": 1.2,
        "length_penalty": 0.85,
        "recommendation": "Balanced for K-dramas and variety shows"
    },
    "lv": {
        "code": "lv",
        "name": "Latvian",
        "native_name": "Latviešu",
        "flag": "🇱🇻",
        "patience": 1.5,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "Baltic language with seven noun cases"
    },
    "lt": {
        "code": "lt",
        "name": "Lithuanian",
        "native_name": "Lietuvių",
        "flag": "🇱🇹",
        "patience": 1.5,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "Most archaic living Indo-European language"
    },
    "ms": {
        "code": "ms",
        "name": "Malay",
        "native_name": "Bahasa Melayu",
        "flag": "🇲🇾",
        "patience": 1.1,
        "length_penalty": 0.95,
        "beam_size": 5,
        "recommendation": "Malaysian Malay variant"
    },
    "mk": {
        "code": "mk",
        "name": "Macedonian",
        "native_name": "Македонски",
        "flag": "🇲🇰",
        "patience": 1.5,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "South Slavic with Cyrillic script"
    },
    "mi": {
        "code": "mi",
        "name": "Maori",
        "native_name": "Te Reo Māori",
        "flag": "🇳🇿",
        "patience": 1.3,
        "length_penalty": 0.9,
        "beam_size": 5,
        "recommendation": "Polynesian language with vowel-heavy phonology"
    },
    "mr": {
        "code": "mr",
        "name": "Marathi",
        "native_name": "मराठी",
        "flag": "🇮🇳",
        "patience": 1.4,
        "length_penalty": 0.9,
        "beam_size": 5,
        "recommendation": "Indo-Aryan language with Devanagari script"
    },
    "ne": {
        "code": "ne",
        "name": "Nepali",
        "native_name": "नेपाली",
        "flag": "🇳🇵",
        "patience": 1.4,
        "length_penalty": 0.9,
        "beam_size": 5,
        "recommendation": "Indo-Aryan language with Devanagari script"
    },
    "no": {
        "code": "no",
        "name": "Norwegian",
        "native_name": "Norsk",
        "flag": "🇳🇴",
        "patience": 1.4,
        "length_penalty": 0.9,
        "recommendation": "Works for both Bokmål and Nynorsk"
    },
    "fa": {
        "code": "fa",
        "name": "Persian",
        "native_name": "فارسی",
        "flag": "🇮🇷",
        "patience": 1.5,
        "length_penalty": 0.9,
        "beam_size": 5,
        "recommendation": "Handles Persian/Farsi grammar"
    },
    "pl": {
        "code": "pl",
        "name": "Polish",
        "native_name": "Polski",
        "flag": "🇵🇱",
        "patience": 1.6,
        "length_penalty": 0.85,
        "recommendation": "Optimized for Polish declensions and grammar"
    },
    "pt": {
        "code": "pt",
        "name": "Portuguese",
        "native_name": "Português",
        "flag": "🇵🇹",
        "patience": 1.6,
        "length_penalty": 0.9,
        "recommendation": "Optimized for Brazilian and European Portuguese"
    },
    "ro": {
        "code": "ro",
        "name": "Romanian",
        "native_name": "Română",
        "flag": "🇷🇴",
        "patience": 1.4,
        "length_penalty": 0.9,
        "beam_size": 5,
        "recommendation": "Romance language with Slavic influences"
    },
    "sr": {
        "code": "sr",
        "name": "Serbian",
        "native_name": "Српски",
        "flag": "🇷🇸",
        "patience": 1.5,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "South Slavic, uses both Cyrillic and Latin scripts"
    },
    "ru": {
        "code": "ru",
        "name": "Russian",
        "native_name": "Русский",
        "flag": "🇷🇺",
        "patience": 1.6,
        "length_penalty": 0.85,
        "recommendation": "Handles complex Russian grammar structures"
    },
    "es": {
        "code": "es",
        "name": "Spanish",
        "native_name": "Español",
        "flag": "🇪🇸",
        "patience": 1.6,
        "length_penalty": 0.9,
        "recommendation": "Works for both European and Latin American Spanish"
    },
    "sk": {
        "code": "sk",
        "name": "Slovak",
        "native_name": "Slovenčina",
        "flag": "🇸🇰",
        "patience": 1.5,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "West Slavic, closely related to Czech"
    },
    "sl": {
        "code": "sl",
        "name": "Slovenian",
        "native_name": "Slovenščina",
        "flag": "🇸🇮",
        "patience": 1.5,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "South Slavic with dual grammatical number"
    },
    "sv": {
        "code": "sv",
        "name": "Swedish",
        "native_name": "Svenska",
        "flag": "🇸🇪",
        "patience": 1.4,
        "length_penalty": 0.9,
        "recommendation": "Clean Swedish subtitle generation"
    },
    "sw": {
        "code": "sw",
        "name": "Swahili",
        "native_name": "Kiswahili",
        "flag": "🇰🇪",
        "patience": 1.2,
        "length_penalty": 0.9,
        "recommendation": "Bantu language with simple phonology"
    },
    "tl": {
        "code": "tl",
        "name": "Tagalog",
        "native_name": "Tagalog",
        "flag": "🇵🇭",
        "patience": 1.3,
        "length_penalty": 0.9,
        "beam_size": 5,
        "recommendation": "Austronesian language, basis for Filipino"
    },
    "ta": {
        "code": "ta",
        "name": "Tamil",
        "native_name": "தமிழ்",
        "flag": "🇮🇳",
        "patience": 1.5,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "Dravidian language with agglutinative grammar"
    },
    "th": {
        "code": "th",
        "name": "Thai",
        "native_name": "ไทย",
        "flag": "🇹🇭",
        "patience": 1.3,
        "length_penalty": 1.0,
        "beam_size": 5,
        "recommendation": "Optimized for Thai dramas and content"
    },
    "tr": {
        "code": "tr",
        "name": "Turkish",
        "native_name": "Türkçe",
        "flag": "🇹🇷",
        "patience": 1.3,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "Optimized for Turkish vowel harmony"
    },
    "uk": {
        "code": "uk",
        "name": "Ukrainian",
        "native_name": "Українська",
        "flag": "🇺🇦",
        "patience": 1.6,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "Similar to Russian with distinct features"
    },
    "ur": {
        "code": "ur",
        "name": "Urdu",
        "native_name": "اردو",
        "flag": "🇵🇰",
        "patience": 1.5,
        "length_penalty": 0.9,
        "beam_size": 5,
        "recommendation": "Indo-Aryan language with Nastaliq script, closely related to Hindi"
    },
    "vi": {
        "code": "vi",
        "name": "Vietnamese",
        "native_name": "Tiếng Việt",
        "flag": "🇻🇳",
        "patience": 1.2,
        "length_penalty": 0.95,
        "beam_size": 5,
        "recommendation": "Handles Vietnamese tonal marks"
    },
    "cy": {
        "code": "cy",
        "name": "Welsh",
        "native_name": "Cymraeg",
        "flag": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
        "patience": 1.5,
        "length_penalty": 0.85,
        "beam_size": 5,
        "recommendation": "Celtic language with initial consonant mutations"
    }
}

@router.get("/list", response_model=List[LanguageSettings])
async def list_languages():
    """
    Get list of all configured languages with their settings.
    Checks tuning._tuned_languages to determine optimization_status.
    """
    # Import here to avoid circular import at module level
    from .tuning import _tuned_languages

    languages = []
    for lang_data in DEFAULT_LANGUAGES.values():
        code = lang_data["code"]
        # Determine optimization status from tuning tracker
        if code in _tuned_languages:
            status = "tuned"
            is_opt = True
        else:
            status = "default"
            is_opt = False  # Not yet tuned by user — show as neutral

        settings_data = {
            **lang_data,
            "files_processed": 0,  # TODO: Track from database
            "last_used": None,     # TODO: Track from database
            "is_optimized": is_opt,
            "optimization_status": status,
        }
        if "beam_size" not in settings_data:
            settings_data["beam_size"] = 5

        languages.append(LanguageSettings(**settings_data))

    languages.sort(key=lambda x: x.name)
    return languages

@router.get("/{language_code}", response_model=LanguageSettings)
async def get_language(language_code: str):
    """
    Get settings for a specific language
    """
    from .tuning import _tuned_languages

    if language_code in DEFAULT_LANGUAGES:
        lang_data = DEFAULT_LANGUAGES[language_code]
        status = "tuned" if language_code in _tuned_languages else "default"
        return LanguageSettings(
            **lang_data,
            beam_size=lang_data.get("beam_size", 5),
            files_processed=0,
            last_used=None,
            is_optimized=(status == "tuned"),
            optimization_status=status,
        )
    else:
        return LanguageSettings(
            code=language_code,
            name=language_code.upper(),
            native_name=language_code.upper(),
            flag="🌐",
            patience=1.5,
            length_penalty=0.9,
            beam_size=5,
            files_processed=0,
            last_used=None,
            recommendation="Using default settings",
            is_optimized=False,
            optimization_status="default",
        )