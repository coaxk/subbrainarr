import { useState, useEffect } from "react";
import { Brain, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

export default function ConnectionScreen({ onConnected }) {
  const [scanning, setScanning] = useState(false);
  const [instances, setInstances] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  const autoDetect = async () => {
    setScanning(true);
    try {
      const response = await fetch("/api/connection/auto-detect");
      const data = await response.json();
      setInstances(data.tested || []);

      // Auto-select first successful instance
      if (data.found && data.found.length > 0) {
        setSelectedUrl(data.found[0].url);
      }
    } catch (error) {
      console.error("Auto-detect failed:", error);
    } finally {
      setScanning(false);
    }
  };

  const testCustomUrl = async () => {
    if (!customUrl) return;

    setScanning(true);
    try {
      const response = await fetch("/api/connection/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: customUrl }),
      });
      const result = await response.json();

      if (result.success) {
        setSelectedUrl(customUrl);
        setInstances([...instances, result]);
      } else {
        alert(`Connection failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setScanning(false);
    }
  };

  const connect = () => {
    if (selectedUrl) {
      onConnected(selectedUrl);
    }
  };

  useEffect(() => {
    // Auto-detect on mount
    autoDetect();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Connect to Subgen</h1>
          <p className="text-muted-foreground">
            Let's find your Subgen instance
          </p>
        </div>

        {/* Auto-detect Results */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Auto-Detection</h2>
            <button
              onClick={autoDetect}
              disabled={scanning}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-md text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`}
              />
              Scan Again
            </button>
          </div>

          {scanning && instances.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">
                Scanning network...
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {instances.map((instance, idx) => (
                <div
                  key={idx}
                  onClick={() =>
                    instance.success && setSelectedUrl(instance.url)
                  }
                  className={`flex items-center justify-between p-3 rounded-md border transition-all cursor-pointer ${
                    instance.success
                      ? selectedUrl === instance.url
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                      : "border-border opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {instance.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <div className="font-mono text-sm">{instance.url}</div>
                      {instance.success && instance.version && (
                        <div className="flex items-center gap-2 text-xs mt-1">
                          <span className="text-muted-foreground">
                            v{instance.version}
                          </span>
                          {instance.is_outdated && (
                            <span className="text-yellow-500">
                              ⚠️ Update available
                            </span>
                          )}
                          {!instance.is_outdated &&
                            instance.version !== "Unknown" && (
                              <span className="text-green-500">
                                ✓ Up to date
                              </span>
                            )}
                        </div>
                      )}
                      {instance.error && (
                        <div className="text-xs text-muted-foreground">
                          {instance.error}
                        </div>
                      )}
                    </div>
                  </div>
                  {instance.success && selectedUrl === instance.url && (
                    <div className="text-xs text-primary font-medium">
                      Selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual Entry */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Manual Entry</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="http://localhost:9000"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && testCustomUrl()}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={testCustomUrl}
              disabled={!customUrl || scanning}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50"
            >
              Test
            </button>
          </div>
        </div>

        {/* Connect Button */}
        <button
          onClick={connect}
          disabled={!selectedUrl}
          className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selectedUrl
            ? `Connect to ${selectedUrl}`
            : "Select an instance above"}
        </button>
      </div>
    </div>
  );
}
