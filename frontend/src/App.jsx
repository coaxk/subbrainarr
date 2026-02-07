import { useState, useEffect } from "react";
import { Brain, Activity, Cpu, HardDrive } from "lucide-react";
import ConnectionScreen from "./components/ConnectionScreen";
import HardwareCard from "./components/HardwareCard";
import LogsViewer from "./components/LogsViewer";

function App() {
  const [connectedUrl, setConnectedUrl] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");
  const [apiData, setApiData] = useState(null);
  const [subgenInfo, setSubgenInfo] = useState(null);

  useEffect(() => {
    // Check backend connection
    fetch("/api/")
      .then((res) => res.json())
      .then((data) => {
        setApiData(data);
        setApiStatus("connected");
      })
      .catch((err) => {
        console.error("Backend connection failed:", err);
        setApiStatus("disconnected");
      });
  }, []);

  const handleConnected = (url) => {
    setConnectedUrl(url);
    // Store in localStorage for persistence
    localStorage.setItem("subgen_url", url);
  };

  // Fetch Subgen version info
  useEffect(() => {
    if (connectedUrl) {
      fetch("/api/connection/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: connectedUrl }),
      })
        .then((res) => res.json())
        .then((data) => setSubgenInfo(data))
        .catch((err) => console.error("Failed to get Subgen info:", err));
    }
  }, [connectedUrl]);

  // Load saved connection on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem("subgen_url");
    if (savedUrl) {
      setConnectedUrl(savedUrl);
    }
  }, []);

  // Show connection screen if not connected to Subgen
  if (!connectedUrl) {
    return <ConnectionScreen onConnected={handleConnected} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Subbrainarr</h1>
                <p className="text-sm text-muted-foreground">
                  Subgen, but with a brain
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">{connectedUrl}</span>
                </div>
                {subgenInfo && subgenInfo.version && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">
                      Subgen {subgenInfo.version}
                    </span>
                    {subgenInfo.is_outdated ? (
                      <span className="text-yellow-500 font-medium">
                        ⚠️ Update available
                      </span>
                    ) : (
                      <span className="text-green-500">✓ Online</span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setConnectedUrl(null)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Welcome Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">
              🎉 Connected to Subgen!
            </h2>
            <p className="text-muted-foreground mb-4">
              The brain is online and ready to optimize your subtitles.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Instance:</span>
              <span className="font-mono text-primary">{connectedUrl}</span>
            </div>
          </div>

          {/* Hardware Detection */}
          <HardwareCard />

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Queue Status</h3>
              </div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Files processing</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <HardDrive className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Languages</h3>
              </div>
              <p className="text-2xl font-bold">18</p>
              <p className="text-sm text-muted-foreground">
                Configured & ready
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🚀 Next Steps</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>✅ Backend is running</li>
              <li>✅ Frontend connected</li>
              <li>✅ Subgen instance detected</li>
              <li>✅ Hardware detection complete</li>
              <li>⏳ Language tuning wizard (coming soon)</li>
            </ul>
          </div>

          {/* Logs Viewer */}
          <LogsViewer subgenUrl={connectedUrl} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Made with 💜 by{" "}
            <a
              href="https://github.com/coaxk"
              className="text-primary hover:underline"
            >
              @coaxk
            </a>
          </p>
          <p className="mt-1">
            Powered by{" "}
            <a
              href="https://github.com/McCloudS/subgen"
              className="text-primary hover:underline"
            >
              McCloud/subgen
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
