import { useState, useEffect } from "react";
import { Globe, Sliders, TrendingUp, Clock, Wand2 } from "lucide-react";
import LanguageTuningWizard from "./LanguageTuningWizard";

// Convert language code to flag URL using flagcdn.com
const getFlagUrl = (langCode) => {
  const codeMap = {
    'ar': 'sa', 'bn': 'bd', 'zh': 'cn', 'cs': 'cz', 'da': 'dk',
    'nl': 'nl', 'en': 'gb', 'fi': 'fi', 'fr': 'fr', 'de': 'de',
    'el': 'gr', 'he': 'il', 'hi': 'in', 'hu': 'hu', 'id': 'id',
    'it': 'it', 'ja': 'jp', 'ko': 'kr', 'ms': 'my', 'no': 'no',
    'fa': 'ir', 'pl': 'pl', 'pt': 'pt', 'ro': 'ro', 'ru': 'ru',
    'es': 'es', 'sv': 'se', 'th': 'th', 'tr': 'tr', 'uk': 'ua',
    'vi': 'vn'
  };

  const countryCode = (codeMap[langCode] || langCode).toLowerCase();
  return `https://flagcdn.com/w40/${countryCode}.png`;
};

export default function LanguageCards() {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    const handleLanguageUpdate = (e) => {
      console.log("🔔 Language update event received:", e.detail);
      console.log("🔄 Calling fetchLanguages...");
      fetchLanguages();
    };

    window.addEventListener('languageUpdated', handleLanguageUpdate);

    return () => {
      window.removeEventListener('languageUpdated', handleLanguageUpdate);
    };
  }, []);

  const fetchLanguages = async () => {
    console.log("📡 Fetching languages from API...");
    setLoading(true);
    try {
      const response = await fetch("/api/languages/list");
      const data = await response.json();
      setLanguages(data);
    } catch (error) {
      console.error("Failed to fetch languages:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPatienceLabel = (patience) => {
    if (patience <= 1.0) return "Quick";
    if (patience <= 1.5) return "Balanced";
    return "Thorough";
  };

  const getLengthLabel = (length) => {
    if (length <= 0.8) return "Verbose";
    if (length <= 1.0) return "Balanced";
    return "Concise";
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Language Configurations</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          Loading languages...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Language Configurations</h3>
            <p className="text-sm text-muted-foreground">
              {languages.length} languages optimized and ready
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
        >
          <Wand2 className="w-4 h-4" />
          Tune Language
        </button>
      </div>

      {/* Language Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {languages.map((lang) => (
          <div
            key={lang.code}
            className="border border-border rounded-lg p-4 hover:border-primary/50 transition-all"
          >
            {/* Language Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <img
                  src={getFlagUrl(lang.code)}
                  alt={`${lang.name} flag`}
                  className="w-8 h-8 rounded"
                />
                <div>
                  <div className="font-semibold">{lang.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {lang.code}
                  </div>
                </div>
              </div>
              {lang.is_optimized && (
                <div className="text-xs text-green-500">✓ Optimized</div>
              )}
            </div>

            {/* Settings */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Patience:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{lang.patience}</span>
                  <span className="text-xs text-muted-foreground">
                    ({getPatienceLabel(lang.patience)})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Length:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{lang.length_penalty}</span>
                  <span className="text-xs text-muted-foreground">
                    ({getLengthLabel(lang.length_penalty)})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Beam size:</span>
                <span className="font-mono">{lang.beam_size}</span>
              </div>
            </div>

            {/* Recommendation */}
            {lang.recommendation && (
              <div className="text-xs text-muted-foreground bg-secondary/50 rounded p-2 mb-3">
                💡 {lang.recommendation}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{lang.files_processed} files</span>
              </div>
              {lang.last_used && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{lang.last_used}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <button
              className="w-full py-1.5 px-3 bg-secondary hover:bg-secondary/80 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
              onClick={() => alert(`Tuning wizard for ${lang.name} coming in v1.1!`)}
            >
              <Sliders className="w-4 h-4" />
              Tune Settings
            </button>
          </div>
        ))}
      </div>

      {/* Language Tuning Wizard */}
      {showWizard && (
        <LanguageTuningWizard onClose={() => setShowWizard(false)} />
      )}
    </div>
  );
}
