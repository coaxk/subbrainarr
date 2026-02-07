import { useState, useEffect } from "react";
import { Settings, Save, RotateCcw, TestTube } from "lucide-react";

export default function SettingsPanel() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("model"); // model, performance, paths, skip, advanced

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings/current");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      setSettings(data);
      alert("Settings saved! Restart Subgen for changes to take effect.");
    } catch (error) {
      alert("Failed to save settings: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const testPathMapping = async () => {
    if (!settings.path_mapping) {
      alert("Please configure path mapping first");
      return;
    }

    try {
      const response = await fetch("/api/settings/test-path-mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings.path_mapping),
      });
      const result = await response.json();

      if (result.valid) {
        alert("✓ Path mapping is valid! Container can access the path.");
      } else {
        alert("✗ Path mapping failed: " + result.message);
      }
    } catch (error) {
      alert("Error testing path: " + error.message);
    }
  };

  if (loading || !settings) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center py-8 text-muted-foreground">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Settings</h3>
            <p className="text-sm text-muted-foreground">
              Configure Subgen behavior
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => fetchSettings()}
            className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-md text-sm transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
        {[
          { id: "model", label: "Model & Compute" },
          { id: "performance", label: "Performance" },
          { id: "paths", label: "Path Mapping" },
          { id: "skip", label: "Skip Conditions" },
          { id: "advanced", label: "Advanced" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* Model & Compute Tab */}
        {activeTab === "model" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">
                Whisper Model
              </label>
              <select
                value={settings.whisper_model}
                onChange={(e) =>
                  setSettings({ ...settings, whisper_model: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="tiny">Tiny (fastest, lowest quality)</option>
                <option value="small">Small (fast, decent quality)</option>
                <option value="medium">Medium (balanced)</option>
                <option value="large-v3">
                  Large-v3 (best quality, slowest)
                </option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Larger models produce better subtitles but take longer
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Compute Type
              </label>
              <select
                value={settings.compute_type}
                onChange={(e) =>
                  setSettings({ ...settings, compute_type: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="float32">
                  Float32 (highest quality, slowest)
                </option>
                <option value="float16">Float16 (recommended for GPU)</option>
                <option value="int8_float16">
                  Int8 Float16 (faster, slight quality loss)
                </option>
                <option value="int8">Int8 (fastest, lower quality)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Transcribe Device
              </label>
              <select
                value={settings.transcribe_device}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    transcribe_device: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="cuda">CUDA (NVIDIA GPU)</option>
                <option value="cpu">CPU</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Beam Size: {settings.beam_size}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={settings.beam_size}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    beam_size: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher = better quality but slower. Recommended: 5
              </p>
            </div>
          </>
        )}

        {/* Performance Tab */}
        {activeTab === "performance" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">
                Whisper Threads: {settings.whisper_threads}
              </label>
              <input
                type="range"
                min="1"
                max="32"
                value={settings.whisper_threads}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    whisper_threads: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                For CPU processing. Recommended: 80% of available threads
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Concurrent Transcriptions: {settings.concurrent_transcriptions}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={settings.concurrent_transcriptions}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    concurrent_transcriptions: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Process multiple files at once. Requires sufficient VRAM!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.clear_vram_on_complete}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    clear_vram_on_complete: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <label className="text-sm">Clear VRAM after each file</label>
            </div>
          </>
        )}

        {/* Path Mapping Tab */}
        {activeTab === "paths" && (
          <>
            <div className="bg-secondary/50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-2">📁 What is Path Mapping?</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Path mapping tells Subgen how to find your media files when
                running in Docker.
              </p>
              <p className="text-sm text-muted-foreground">
                Example: Your files at{" "}
                <code className="bg-background px-1 rounded">Z:\Media\TV</code>{" "}
                on Windows appear as{" "}
                <code className="bg-background px-1 rounded">
                  /media/library
                </code>{" "}
                inside the container.
              </p>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={settings.use_path_mapping}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    use_path_mapping: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Enable Path Mapping</label>
            </div>

            {settings.use_path_mapping && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Host Path (your system)
                  </label>
                  <input
                    type="text"
                    placeholder="Z:\Media\TV or /mnt/media/tv"
                    value={settings.path_mapping?.host_path || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        path_mapping: {
                          ...settings.path_mapping,
                          host_path: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Container Path
                  </label>
                  <input
                    type="text"
                    placeholder="/media/library"
                    value={settings.path_mapping?.container_path || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        path_mapping: {
                          ...settings.path_mapping,
                          container_path: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  onClick={testPathMapping}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm transition-colors"
                >
                  <TestTube className="w-4 h-4" />
                  Test Path Mapping
                </button>
              </>
            )}
          </>
        )}

        {/* Skip Conditions Tab */}
        {activeTab === "skip" && (
          <>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.skip_if_english_audio}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    skip_if_english_audio: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <label className="text-sm">Skip if audio is English</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.skip_if_english_subs_exist}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    skip_if_english_subs_exist: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <label className="text-sm">Skip if English subtitles exist</label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Skip files matching patterns
              </label>
              <input
                type="text"
                placeholder="subbed, korsub, dubbed (comma-separated)"
                value={settings.skip_files_patterns?.join(", ") || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    skip_files_patterns: e.target.value
                      .split(",")
                      .map((s) => s.trim()),
                  })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Files with these words in the filename will be skipped
              </p>
            </div>
          </>
        )}

        {/* Advanced Tab */}
        {activeTab === "advanced" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">
                Auto-Skip Threshold: {settings.auto_skip_threshold}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.auto_skip_threshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    auto_skip_threshold: parseFloat(e.target.value),
                  })
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Confidence threshold for auto-skipping files. Lower = more
                aggressive skipping
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.ssa_fix_encoding}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ssa_fix_encoding: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <label className="text-sm">Fix SSA encoding issues</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.ssa_fix_newlines}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ssa_fix_newlines: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <label className="text-sm">Fix SSA newline formatting</label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Custom Regroup Pattern (advanced)
              </label>
              <input
                type="text"
                placeholder="cm_sl=84_sl=42++++++1"
                value={settings.custom_regroup || ""}
                onChange={(e) =>
                  setSettings({ ...settings, custom_regroup: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Advanced subtitle regrouping pattern. Leave blank for defaults.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
