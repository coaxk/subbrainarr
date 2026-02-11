import { useState, useEffect } from "react";
import { Brain, Activity, Cpu, HardDrive } from "lucide-react";
import ConnectionScreen from "./components/ConnectionScreen";
import HardwareCard from "./components/HardwareCard";
import LogsViewer from "./components/LogsViewer";
import LanguageCards from "./components/LanguageCards";
import SettingsPanel from "./components/SettingsPanel";
import RecommendationsCard from "./components/RecommendationsCard";
import SmartScan from "./components/SmartScan";
import Footer from "./components/Footer";
import CommunityCard from "./components/CommunityCard";

function App() {
  const [connectedUrl, setConnectedUrl] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");
  const [apiData, setApiData] = useState(null);
  const [subgenInfo, setSubgenInfo] = useState(null);
  const [languageCount, setLanguageCount] = useState(null);

  useEffect(() => {
    fetch("/api/languages/list")
      .then((res) => res.json())
      .then((data) => setLanguageCount(data.length))
      .catch(() => {});
  }, []);

  useEffect(() => {
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
    localStorage.setItem("subgen_url", url);
  };

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

  useEffect(() => {
    const savedUrl = localStorage.getItem("subgen_url");
    if (savedUrl) {
      setConnectedUrl(savedUrl);
    }
  }, []);

  if (!connectedUrl) {
    return <ConnectionScreen onConnected={handleConnected} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">SubBrainArr</h1>
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

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
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

          <RecommendationsCard />
          <CommunityCard />
          <HardwareCard />

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
              <p className="text-2xl font-bold">{languageCount ?? "..."}</p>
              <p className="text-sm text-muted-foreground">
                Configured & ready
              </p>
            </div>
          </div>

          <SmartScan subgenUrl={connectedUrl} />

          <LanguageCards />
          <SettingsPanel />
          <LogsViewer subgenUrl={connectedUrl} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
