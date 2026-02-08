import { useState, useEffect } from "react";
import { Settings, Save, RotateCcw, TestTube, Copy, Check, X, HelpCircle, Zap } from "lucide-react";

export default function SettingsPanel() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("model");
  const [composeSnippet, setComposeSnippet] = useState(null);
  const [copied, setCopied] = useState(false);
  const [pathTestResult, setPathTestResult] = useState(null);
  const [copiedExample, setCopiedExample] = useState(null);
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [autoDetectResult, setAutoDetectResult] = useState(null);

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

      // Fetch the compose snippet
      const snippetResponse = await fetch("/api/settings/compose-snippet");
      const snippetData = await snippetResponse.json();
      setComposeSnippet(snippetData.snippet);

      // Show success but don't alert - snippet will appear
    } catch (error) {
      alert("Failed to save settings: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const copySnippet = () => {
    if (composeSnippet) {
      navigator.clipboard.writeText(composeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyPathExample = (exampleName, hostPath, containerPath) => {
    const text = `Host: ${hostPath}\nContainer: ${containerPath}`;
    navigator.clipboard.writeText(text);
    setCopiedExample(exampleName);
    setTimeout(() => setCopiedExample(null), 2000);
  };

  const validateHostPath = (path) => {
    if (!path || path.trim() === "") return "empty";
    // Windows paths: should contain :\ or \\
    const isWindows = path.includes(":\\") || path.startsWith("\\\\");
    // Unix/Linux paths: should start with /
    const isUnix = path.startsWith("/");
    return isWindows || isUnix ? "valid" : "invalid";
  };

  const validateContainerPath = (path) => {
    if (!path || path.trim() === "") return "empty";
    // Container paths should always start with /
    return path.startsWith("/") ? "valid" : "invalid";
  };

  const getValidationIcon = (validationResult) => {
    if (validationResult === "valid") {
      return <Check className="w-4 h-4 text-green-500" />;
    } else if (validationResult === "invalid") {
      return <X className="w-4 h-4 text-red-500" />;
    } else {
      return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const autoDetectPaths = async () => {
    setAutoDetecting(true);
    setAutoDetectResult(null);

    try {
      const response = await fetch("/api/docker/volumes");
      const data = await response.json();

      if (data.suggested_mapping && data.suggested_mapping.host_path) {
        // Populate the fields
        setSettings({
          ...settings,
          path_mapping: {
            ...settings.path_mapping,
            host_path: data.suggested_mapping.host_path,
            container_path: data.suggested_mapping.container_path,
          },
        });

        setAutoDetectResult({
          success: true,
          message: `Found ${data.subgen_volumes.length} volume(s) from Subgen container`,
        });

        // Clear message after 3 seconds
        setTimeout(() => setAutoDetectResult(null), 3000);
      } else {
        setAutoDetectResult({
          success: false,
          message: "Could not detect volumes - please enter paths manually",
        });
      }
    } catch (error) {
      setAutoDetectResult({
        success: false,
        message: "Failed to detect volumes: " + error.message,
      });
    } finally {
      setAutoDetecting(false);
    }
  };

  const testPathMapping = async () => {
    if (!settings.path_mapping) {
      setPathTestResult({
        valid: false,
        message: "Please configure path mapping first",
        paths: null,
      });
      return;
    }

    setPathTestResult(null); // Clear previous result

    try {
      const response = await fetch("/api/settings/test-path-mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings.path_mapping),
      });
      const result = await response.json();

      setPathTestResult({
        valid: result.valid,
        message: result.message,
        paths: settings.path_mapping,
      });
    } catch (error) {
      setPathTestResult({
        valid: false,
        message: "Error testing path: " + error.message,
        paths: settings.path_mapping,
      });
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
            onClick={() => {
              fetchSettings();
              setComposeSnippet(null);
            }}
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
            {saving ? "Saving..." : "Save & Generate"}
          </button>
        </div>
      </div>

      {composeSnippet && (
        <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold text-green-500">
                ✓ Settings Saved!
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Copy this to your docker-compose.yaml and restart Subgen.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Already have a custom config? Take what you need from here and
                merge it with your existing setup. We're not your dad - do what
                works for you.
              </p>
            </div>
            <button
              onClick={copySnippet}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-md text-sm transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="bg-black/50 p-4 rounded-md overflow-x-auto text-xs font-mono text-green-400">
            {composeSnippet}
          </pre>
        </div>
      )}

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

      <div className="space-y-4">
        {activeTab === "model" && (
          <>
            <div className="bg-secondary/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-muted-foreground">
                💡 <strong>What happens:</strong> These settings tell Subgen
                which AI model to use and how to run it. Bigger models = better
                quality but slower. Think of it like photo quality - you can
                shoot in RAW or JPEG.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Example:</strong> Got a beefy GPU (12GB+)? Use large-v3
                + float16. Potato GPU (6GB)? Stick with medium + int8.
              </p>
            </div>

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
        {activeTab === "performance" && (
          <>
            <div className="bg-secondary/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-muted-foreground">
                ⚡ <strong>What this controls:</strong> How Subgen uses your
                hardware resources. More threads = faster processing. Concurrent
                files = risky but efficient if you have VRAM to spare.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Example:</strong> Got 16GB+ VRAM? Try 2-3 concurrent
                files. Only 8GB? Stick to 1 at a time or you'll crash
                mid-processing.
              </p>
            </div>

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

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-3 text-blue-400">📋 Common Path Mapping Examples</h4>

              <div className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Windows + WSL + Docker:</p>
                    <div className="mt-1 font-mono text-xs bg-background/50 p-2 rounded">
                      <div>Host: <span className="text-primary">Z:\Media\TV</span></div>
                      <div>Container: <span className="text-primary">/media/tv</span></div>
                    </div>
                  </div>
                  <button
                    onClick={() => copyPathExample('windows', 'Z:\\Media\\TV', '/media/tv')}
                    className="mt-6 p-1.5 hover:bg-background/50 rounded transition-colors"
                    title="Copy paths"
                  >
                    {copiedExample === 'windows' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Unraid:</p>
                    <div className="mt-1 font-mono text-xs bg-background/50 p-2 rounded">
                      <div>Host: <span className="text-primary">/mnt/user/media/tv</span></div>
                      <div>Container: <span className="text-primary">/media/tv</span></div>
                    </div>
                  </div>
                  <button
                    onClick={() => copyPathExample('unraid', '/mnt/user/media/tv', '/media/tv')}
                    className="mt-6 p-1.5 hover:bg-background/50 rounded transition-colors"
                    title="Copy paths"
                  >
                    {copiedExample === 'unraid' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Synology NAS:</p>
                    <div className="mt-1 font-mono text-xs bg-background/50 p-2 rounded">
                      <div>Host: <span className="text-primary">/volume1/media/tv</span></div>
                      <div>Container: <span className="text-primary">/media/tv</span></div>
                    </div>
                  </div>
                  <button
                    onClick={() => copyPathExample('synology', '/volume1/media/tv', '/media/tv')}
                    className="mt-6 p-1.5 hover:bg-background/50 rounded transition-colors"
                    title="Copy paths"
                  >
                    {copiedExample === 'synology' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Linux (Native Docker):</p>
                    <div className="mt-1 font-mono text-xs bg-background/50 p-2 rounded">
                      <div>Host: <span className="text-primary">/home/user/media/tv</span></div>
                      <div>Container: <span className="text-primary">/media/tv</span></div>
                    </div>
                  </div>
                  <button
                    onClick={() => copyPathExample('linux', '/home/user/media/tv', '/media/tv')}
                    className="mt-6 p-1.5 hover:bg-background/50 rounded transition-colors"
                    title="Copy paths"
                  >
                    {copiedExample === 'linux' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                💡 The container path should match what's in your Subgen docker-compose volumes
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
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3 text-xs text-muted-foreground">
                  <p className="mb-1">
                    <span className="text-blue-400 font-medium">ℹ️ Docker Socket Required:</span>
                  </p>
                  <p>
                    Auto-Detect requires SubBrainArr to access the Docker socket.
                    If not working, ensure your docker run includes:
                  </p>
                  <code className="block mt-1 bg-background/50 px-2 py-1 rounded text-xs">
                    -v /var/run/docker.sock:/var/run/docker.sock
                  </code>
                </div>

                <button
                  onClick={autoDetectPaths}
                  disabled={autoDetecting}
                  className="flex items-center gap-2 px-4 py-2 mb-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm transition-colors disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  {autoDetecting ? "Detecting..." : "Auto-Detect from Subgen"}
                </button>

                {autoDetectResult && (
                  <div
                    className={`mb-4 rounded-lg p-3 text-sm ${
                      autoDetectResult.success
                        ? "bg-green-500/10 border border-green-500/20 text-green-500"
                        : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500"
                    }`}
                  >
                    {autoDetectResult.success ? "✓ " : "⚠ "}
                    {autoDetectResult.message}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Host Path (your system)
                  </label>
                  <div className="relative">
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
                      className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {getValidationIcon(validateHostPath(settings.path_mapping?.host_path || ""))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Container Path
                  </label>
                  <div className="relative">
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
                      className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {getValidationIcon(validateContainerPath(settings.path_mapping?.container_path || ""))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={testPathMapping}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm transition-colors"
                >
                  <TestTube className="w-4 h-4" />
                  Test Path Mapping
                </button>

                {pathTestResult && (
                  <div
                    className={`rounded-lg p-4 ${
                      pathTestResult.valid
                        ? "bg-green-500/10 border border-green-500/20"
                        : pathTestResult.message && pathTestResult.message.toLowerCase().includes("path not found")
                        ? "bg-blue-500/10 border border-blue-500/20"
                        : "bg-red-500/10 border border-red-500/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`text-xl ${
                          pathTestResult.valid
                            ? "text-green-500"
                            : pathTestResult.message && pathTestResult.message.toLowerCase().includes("path not found")
                            ? "text-blue-400"
                            : "text-red-500"
                        }`}
                      >
                        {pathTestResult.valid
                          ? "✓"
                          : pathTestResult.message && pathTestResult.message.toLowerCase().includes("path not found")
                          ? "ℹ"
                          : "✗"}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-medium mb-1 ${
                            pathTestResult.valid
                              ? "text-green-500"
                              : pathTestResult.message && pathTestResult.message.toLowerCase().includes("path not found")
                              ? "text-blue-400"
                              : "text-red-500"
                          }`}
                        >
                          {pathTestResult.valid
                            ? "Path mapping is valid!"
                            : pathTestResult.message && pathTestResult.message.toLowerCase().includes("path not found")
                            ? "Path test info"
                            : "Path mapping failed"}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {pathTestResult.message && pathTestResult.message.toLowerCase().includes("path not found") ? (
                            <>
                              Path not found in SubBrainArr container (this is normal).
                              <br />
                              These paths are for Subgen - verify they exist on your host system.
                            </>
                          ) : (
                            pathTestResult.message
                          )}
                        </p>
                        {pathTestResult.paths && (
                          <div className="bg-background/50 rounded p-2 text-xs font-mono">
                            <div>
                              Host: <span className="text-primary">{pathTestResult.paths.host_path}</span>
                            </div>
                            <div>
                              Container: <span className="text-primary">{pathTestResult.paths.container_path}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === "skip" && (
          <>
            <div className="bg-secondary/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-muted-foreground">
                🚫 <strong>Skip logic:</strong> Save time and resources by
                automatically skipping files you don't need processed.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Example:</strong> Already have English audio? Skip it.
                Files with "subbed" in the name? Skip those too.
              </p>
            </div>

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

        {activeTab === "advanced" && (
          <>
            <div className="bg-secondary/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-muted-foreground">
                🔧 <strong>Advanced options:</strong> For power users who know
                what they're doing. If you don't know what these do, leave them
                as default.
              </p>
            </div>

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

            <div className="border-t border-border pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium">
                    Custom Environment Variables
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add your own variables to include in the generated
                    docker-compose snippet
                  </p>
                </div>
                <button
                  onClick={() => {
                    const key = prompt("Variable name (e.g., MY_CUSTOM_VAR):");
                    if (!key) return;
                    const value = prompt("Variable value:");
                    if (value === null) return;
                    setSettings({
                      ...settings,
                      custom_env_vars: {
                        ...settings.custom_env_vars,
                        [key]: value,
                      },
                    });
                  }}
                  className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm transition-colors"
                >
                  + Add Variable
                </button>
              </div>

              {settings.custom_env_vars &&
              Object.keys(settings.custom_env_vars).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(settings.custom_env_vars).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center gap-2 bg-secondary/50 rounded-md p-2"
                      >
                        <code className="flex-1 text-sm font-mono">
                          {key}={value}
                        </code>
                        <button
                          onClick={() => {
                            const newVars = { ...settings.custom_env_vars };
                            delete newVars[key];
                            setSettings({
                              ...settings,
                              custom_env_vars: newVars,
                            });
                          }}
                          className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded text-xs transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No custom variables added yet. Click "+ Add Variable" to add
                  one.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
