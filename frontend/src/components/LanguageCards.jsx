import { useState, useEffect, useMemo } from "react";
import {
  Globe,
  Sliders,
  Wand2,
  Wrench,
  Minus,
  ChevronDown,
  ChevronRight,
  Search,
  CheckCircle,
  Info,
} from "lucide-react";
import LanguageTuningWizard from "./LanguageTuningWizard";

// Convert language code to flag URL using flagcdn.com
const getFlagUrl = (langCode) => {
  const codeMap = {
    af: "za", ar: "sa", hy: "am", az: "az", be: "by",
    bn: "bd", bs: "ba", bg: "bg", ca: "es", zh: "cn",
    hr: "hr", cs: "cz", da: "dk", nl: "nl", en: "gb",
    et: "ee", fi: "fi", gl: "es", fr: "fr", de: "de",
    el: "gr", he: "il", hi: "in", hu: "hu", is: "is",
    id: "id", it: "it", ja: "jp", kn: "in", kk: "kz",
    ko: "kr", lv: "lv", lt: "lt", ms: "my", mk: "mk",
    mi: "nz", mr: "in", ne: "np", no: "no", fa: "ir",
    pl: "pl", pt: "pt", ro: "ro", sr: "rs", ru: "ru",
    sk: "sk", sl: "si", es: "es", sv: "se", sw: "ke",
    tl: "ph", ta: "in", th: "th", tr: "tr", uk: "ua",
    ur: "pk", vi: "vn", cy: "gb-wls",
  };
  const countryCode = (codeMap[langCode] || langCode).toLowerCase();
  return `https://flagcdn.com/w40/${countryCode}.png`;
};

// Language family groups — each language belongs to exactly one group
const LANGUAGE_GROUPS = [
  { id: "east-asian", label: "East Asian", codes: ["zh", "ja", "ko"] },
  {
    id: "south-se-asian",
    label: "South & SE Asian",
    codes: ["hi", "bn", "ta", "kn", "mr", "ne", "th", "vi", "ms", "id", "tl", "ur"],
  },
  { id: "germanic", label: "Germanic", codes: ["en", "de", "nl", "sv", "no", "da", "is"] },
  { id: "romance", label: "Romance", codes: ["fr", "es", "pt", "it", "ro", "ca", "gl"] },
  {
    id: "slavic",
    label: "Slavic",
    codes: ["ru", "pl", "cs", "sk", "uk", "bg", "sr", "hr", "bs", "sl", "mk", "be"],
  },
  { id: "other-european", label: "Other European", codes: ["el", "hu", "fi", "et", "lt", "lv", "cy"] },
  { id: "middle-eastern", label: "Middle Eastern", codes: ["ar", "he", "tr", "fa", "az", "kk"] },
  { id: "other", label: "Other", codes: ["sw", "af", "mi", "hy"] },
];

const StatusBadge = ({ status }) => {
  if (status === "tuned") {
    return <span className="text-xs text-green-500 font-medium">Tuned</span>;
  }
  if (status === "custom") {
    return (
      <span className="text-xs text-blue-400 flex items-center gap-0.5">
        <Wrench className="w-3 h-3" /> Custom
      </span>
    );
  }
  return (
    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
      <Minus className="w-3 h-3" /> Default
    </span>
  );
};

const getPatienceLabel = (p) => (p <= 1.0 ? "Quick" : p <= 1.5 ? "Balanced" : "Thorough");
const getLengthLabel = (l) => (l <= 0.8 ? "Verbose" : l <= 1.0 ? "Balanced" : "Concise");

function LanguageRow({ lang, expanded, onToggle, onTune }) {
  return (
    <div className="border-b border-border last:border-b-0">
      {/* Compact row — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/30 transition-colors text-left"
      >
        <img
          src={getFlagUrl(lang.code)}
          alt={`${lang.name} flag`}
          className="w-6 h-5 rounded-sm object-cover flex-shrink-0"
        />
        <span className="font-medium flex-1 text-sm">{lang.name}</span>
        <span className="text-xs text-muted-foreground mr-2">{lang.native_name}</span>
        <StatusBadge status={lang.optimization_status} />
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {/* Expanded detail — compact single-line layout */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 bg-secondary/20">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-muted-foreground">Patience:</span>
            <span className="font-mono">{lang.patience}</span>
            <span className="text-xs text-muted-foreground">({getPatienceLabel(lang.patience)})</span>
            <span className="text-muted-foreground mx-1">|</span>
            <span className="text-muted-foreground">Length:</span>
            <span className="font-mono">{lang.length_penalty}</span>
            <span className="text-xs text-muted-foreground">({getLengthLabel(lang.length_penalty)})</span>
            <span className="text-muted-foreground mx-1">|</span>
            <span className="text-muted-foreground">Beam:</span>
            <span className="font-mono">{lang.beam_size}</span>
            <span className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground italic">
                {lang.optimization_status === "tuned" ? "Your settings" : "SubBrainArr preset"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTune();
                }}
                className="py-1 px-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded text-xs transition-colors flex items-center gap-1.5"
              >
                <Sliders className="w-3 h-3" />
                Tune
              </button>
            </span>
          </div>

          {lang.recommendation && (
            <div className="text-xs text-muted-foreground bg-secondary/50 rounded p-2 mt-2">
              {lang.recommendation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LanguageCards() {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardLanguage, setWizardLanguage] = useState(null);
  const [expandedLang, setExpandedLang] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [applyingDefaults, setApplyingDefaults] = useState(false);
  const [showDefaultsConfirm, setShowDefaultsConfirm] = useState(false);
  const [defaultsBanner, setDefaultsBanner] = useState(false);

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    const handleLanguageUpdate = () => fetchLanguages();
    window.addEventListener("languageUpdated", handleLanguageUpdate);
    return () => window.removeEventListener("languageUpdated", handleLanguageUpdate);
  }, []);

  const fetchLanguages = async () => {
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

  const applyDefaults = async () => {
    setApplyingDefaults(true);
    try {
      const response = await fetch("/api/tuning/apply-defaults", { method: "POST" });
      const data = await response.json();
      if (data.success) {
        await fetchLanguages();
        setShowDefaultsConfirm(false);
        setDefaultsBanner(true);
        setTimeout(() => setDefaultsBanner(false), 5000);
      }
    } catch (error) {
      console.error("Failed to apply defaults:", error);
    } finally {
      setApplyingDefaults(false);
    }
  };

  // Build a lookup map for fast grouping
  const langByCode = useMemo(() => {
    const map = {};
    for (const lang of languages) {
      map[lang.code] = lang;
    }
    return map;
  }, [languages]);

  // Filter languages by search query
  const filteredCodes = useMemo(() => {
    if (!searchQuery.trim()) return null; // null = no filter active
    const q = searchQuery.toLowerCase();
    return new Set(
      languages
        .filter(
          (l) =>
            l.name.toLowerCase().includes(q) ||
            l.native_name.toLowerCase().includes(q) ||
            l.code.toLowerCase().includes(q)
        )
        .map((l) => l.code)
    );
  }, [languages, searchQuery]);

  // Auto-expand groups that have search matches
  const visibleGroups = useMemo(() => {
    return LANGUAGE_GROUPS.map((group) => {
      const groupLangs = group.codes
        .filter((code) => langByCode[code])
        .filter((code) => !filteredCodes || filteredCodes.has(code))
        .map((code) => langByCode[code]);

      const tunedCount = groupLangs.filter(
        (l) => l.optimization_status === "tuned"
      ).length;

      return { ...group, langs: groupLangs, tunedCount };
    }).filter((g) => g.langs.length > 0);
  }, [langByCode, filteredCodes]);

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // When searching, auto-expand all groups; when not, respect manual toggle
  const isGroupExpanded = (groupId) => {
    if (filteredCodes) return true; // Always expand during search
    return expandedGroups.has(groupId);
  };

  const tunedTotal = languages.filter(
    (l) => l.optimization_status === "tuned"
  ).length;

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Language Configurations</h3>
            <p className="text-sm text-muted-foreground">
              {tunedTotal} of {languages.length} languages tuned
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowDefaultsConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          Apply Recommended Defaults
        </button>
      </div>

      {/* Defaults confirmation banner */}
      {defaultsBanner && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-500 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          All languages tuned with recommended defaults.
        </div>
      )}

      {/* Guidance */}
      <div className="mb-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg text-sm text-muted-foreground flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <span>
          Each language has pre-tuned defaults for subtitle quality. Use "Tune" on any
          language to customize for your content, or "Apply Recommended Defaults" to accept
          SubBrainArr's presets for all languages. Values shown are SubBrainArr's presets
          unless you've tuned them.
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search languages..."
          className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Accordion Groups */}
      <div className="border border-border rounded-lg overflow-hidden">
        {visibleGroups.map((group) => (
          <div key={group.id} className="border-b border-border last:border-b-0">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center justify-between px-4 py-3 bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isGroupExpanded(group.id) ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="font-medium text-sm">{group.label}</span>
                <span className="text-xs text-muted-foreground">
                  ({group.langs.length})
                </span>
              </div>
              {group.tunedCount > 0 && (
                <span className="text-xs text-green-500">
                  {group.tunedCount} tuned
                </span>
              )}
            </button>

            {/* Group Languages */}
            {isGroupExpanded(group.id) && (
              <div>
                {group.langs.map((lang) => (
                  <LanguageRow
                    key={lang.code}
                    lang={lang}
                    expanded={expandedLang === lang.code}
                    onToggle={() =>
                      setExpandedLang(
                        expandedLang === lang.code ? null : lang.code
                      )
                    }
                    onTune={() => {
                      setWizardLanguage(lang.name);
                      setShowWizard(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredCodes && filteredCodes.size === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          No languages match "{searchQuery}"
        </div>
      )}

      {/* Language Tuning Wizard */}
      {showWizard && (
        <LanguageTuningWizard
          defaultLanguage={wizardLanguage}
          onClose={() => {
            setShowWizard(false);
            setWizardLanguage(null);
          }}
        />
      )}

      {/* Apply Defaults Confirmation Dialog */}
      {showDefaultsConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-3">Apply Recommended Defaults?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This marks all {languages.length} languages as tuned using SubBrainArr's
              optimized presets. The values are already set — this confirms you're happy
              with the defaults.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDefaultsConfirm(false)}
                className="flex-1 py-2 bg-secondary hover:bg-secondary/80 rounded-md transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={applyDefaults}
                disabled={applyingDefaults}
                className="flex-1 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors text-sm disabled:opacity-50"
              >
                {applyingDefaults ? "Applying..." : "Apply Defaults"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
