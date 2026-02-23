import { useState, useEffect } from "react";
import { Wand2, ArrowRight, CheckCircle, X } from "lucide-react";

export default function LanguageTuningWizard({ onClose, defaultLanguage }) {
  const [step, setStep] = useState(defaultLanguage ? 0 : 1);
  const [language, setLanguage] = useState(defaultLanguage || "Japanese");
  const [languages, setLanguages] = useState([]);
  const [issues, setIssues] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPatience, setCurrentPatience] = useState(1.0);
  const [currentLengthPenalty, setCurrentLengthPenalty] = useState(1.0);
  const [currentBeamSize, setCurrentBeamSize] = useState(5);

  useEffect(() => {
    fetch("/api/languages/list")
      .then((r) => r.json())
      .then(async (data) => {
        const langList = data.map((l) => ({ name: l.name, native_name: l.native_name })).sort((a, b) => a.name.localeCompare(b.name));
        setLanguages(langList);
        if (langList.length > 0 && !language) {
          setLanguage(langList[0].name);
        }
        // Auto-skip Step 1 when a language was pre-selected from the row
        if (defaultLanguage && langList.some((l) => l.name === defaultLanguage)) {
          await fetchCurrentSettings();
          setStep(2);
        }
      })
      .catch((err) => console.error("Failed to fetch languages:", err));
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      const response = await fetch("/api/languages/list");
      const langs = await response.json();
      const current = langs.find((l) => l.name === language);

      if (current) {
        setCurrentPatience(current.patience);
        setCurrentLengthPenalty(current.length_penalty);
        setCurrentBeamSize(current.beam_size || 5);
      }
    } catch (err) {
      console.error("Failed to fetch current settings:", err);
    }
  };

  const issueOptions = [
    {
      id: "too_fast",
      label: "Too Fast",
      desc: "Subtitles disappear before I can read them",
    },
    {
      id: "too_slow",
      label: "Too Slow",
      desc: "Subtitles linger too long on screen",
    },
    {
      id: "lines_short",
      label: "Lines Too Short",
      desc: "Awkward breaks in sentences",
    },
    {
      id: "lines_long",
      label: "Lines Too Long",
      desc: "Hard to read, too much text",
    },
    {
      id: "optimize",
      label: "Just Optimize",
      desc: "Give me the best balanced settings",
    },
  ];

  const getTuning = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tuning/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          issues,
          current_patience: currentPatience,
          current_length_penalty: currentLengthPenalty,
          current_beam_size: currentBeamSize,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data);
      setStep(3);
    } catch (error) {
      console.error("Tuning failed:", error);
      alert("Failed to get recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applySettings = async () => {
    try {
      await fetch("/api/tuning/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          patience: recommendations.recommended_patience,
          length_penalty: recommendations.recommended_length_penalty,
          beam_size: recommendations.recommended_beam_size,
        }),
      });
      setStep(4);
      // Dispatch refresh event so LanguageCards picks up the new tuning
      window.dispatchEvent(
        new CustomEvent("languageUpdated", { detail: { language } })
      );
      // Don't call onClose() here — let Step 4 render so the user
      // sees the success screen and can choose "Done" or "Tune Another"
    } catch (error) {
      console.error("Apply failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-primary/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wand2 className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-lg font-bold">Language Tuning Wizard</h2>
              <p className="text-sm text-muted-foreground">
                Optimize subtitle settings in 3 easy steps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    s <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {s < step ? "✓" : s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-12 h-1 mx-2 ${s < step ? "bg-primary" : "bg-secondary"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Language */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Which language are you tuning?
              </h3>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary mb-6"
              >
                {languages.map((lang) => (
                  <option key={lang.name} value={lang.name}>
                    {lang.name} ({lang.native_name})
                  </option>
                ))}
              </select>
              <button
                onClick={async () => {
                  await fetchCurrentSettings();
                  setStep(2);
                }}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors flex items-center justify-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Issue */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                What's the problem with {language} subtitles?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select one or more issues (you can select multiple)
              </p>
              <div className="space-y-3 mb-6">
                {issueOptions.map((iss) => (
                  <button
                    key={iss.id}
                    onClick={() => {
                      if (iss.id === "optimize") {
                        setIssues(["optimize"]);
                      } else {
                        const filtered = issues.filter(i => i !== "optimize" && i !== iss.id);
                        if (issues.includes(iss.id)) {
                          setIssues(filtered);
                        } else {
                          setIssues([...filtered, iss.id]);
                        }
                      }
                    }}
                    className={`w-full p-4 rounded-md text-left transition-all flex items-start gap-3 ${
                      issues.includes(iss.id)
                        ? "bg-primary/20 border-2 border-primary"
                        : "bg-secondary border-2 border-transparent hover:border-primary/50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        issues.includes(iss.id)
                          ? "bg-primary border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {issues.includes(iss.id) && (
                        <CheckCircle className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">{iss.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {iss.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={getTuning}
                  disabled={issues.length === 0 || loading}
                  className="flex-1 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Analyzing..." : "Get Recommendations"}{" "}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Recommendations */}
          {step === 3 && recommendations && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Recommended Settings for {language}
              </h3>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <p className="text-sm">{recommendations.explanation}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Before</p>
                  <div className="space-y-1 text-sm">
                    <div>
                      Patience:{" "}
                      <span className="font-mono">
                        {recommendations.before_settings.patience}
                      </span>
                    </div>
                    <div>
                      Length:{" "}
                      <span className="font-mono">
                        {recommendations.before_settings.length_penalty}
                      </span>
                    </div>
                    <div>
                      Beam Size:{" "}
                      <span className="font-mono">
                        {recommendations.before_settings.beam_size}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-primary mb-2">After</p>
                  <div className="space-y-1 text-sm font-semibold">
                    <div>
                      Patience:{" "}
                      <span className="font-mono text-primary">
                        {recommendations.after_settings.patience}
                      </span>
                    </div>
                    <div>
                      Length:{" "}
                      <span className="font-mono text-primary">
                        {recommendations.after_settings.length_penalty}
                      </span>
                    </div>
                    <div>
                      Beam Size:{" "}
                      <span className="font-mono text-primary">
                        {recommendations.after_settings.beam_size}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What will happen — transparency preview */}
              <div className="bg-secondary/30 border border-border rounded-lg p-4 mb-6">
                <p className="text-sm font-medium mb-2">What will happen:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Update {language} patience from {recommendations.before_settings.patience} → {recommendations.after_settings.patience}</li>
                  <li>Update length penalty from {recommendations.before_settings.length_penalty} → {recommendations.after_settings.length_penalty}</li>
                  <li>Update beam size from {recommendations.before_settings.beam_size} → {recommendations.after_settings.beam_size}</li>
                  <li>Changes are saved in SubBrainArr and reflected in your compose snippet</li>
                  <li>Restart Subgen for changes to take effect</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={applySettings}
                  className="flex-1 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Apply Settings
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-lg font-bold mb-2">Settings Applied!</h3>
              <p className="text-muted-foreground mb-6">
                {language} is now optimized. Restart Subgen for changes to take
                effect.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep(1);
                    setIssues([]);
                    setRecommendations(null);
                  }}
                  className="flex-1 py-3 bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                >
                  Tune Another Language
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
