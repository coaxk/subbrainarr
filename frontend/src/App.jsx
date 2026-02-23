import { useState, useEffect } from "react";
import {
  Brain,
  Activity,
  HardDrive,
  Home,
  Globe,
  ScanLine,
  Settings,
} from "lucide-react";
import ConnectionScreen from "./components/ConnectionScreen";
import HardwareCard from "./components/HardwareCard";
import LogsViewer from "./components/LogsViewer";
import LanguageCards from "./components/LanguageCards";
import SettingsPanel from "./components/SettingsPanel";
import RecommendationsCard from "./components/RecommendationsCard";
import SmartScan from "./components/SmartScan";
import Footer from "./components/Footer";
import CommunityCard from "./components/CommunityCard";
import NextStepCard from "./components/NextStepCard";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "languages", label: "Languages", icon: Globe },
  { id: "scanning", label: "Scanning", icon: ScanLine },
  { id: "settings", label: "Settings", icon: Settings },
];

function App() {
  const [connectedUrl, setConnectedUrl] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");
  const [apiData, setApiData] = useState(null);
  const [subgenInfo, setSubgenInfo] = useState(null);
  const [languageCount, setLanguageCount] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pendingSubTab, setPendingSubTab] = useState(null);

  // Cross-tab navigation — components call this to switch tabs and
  // optionally deep-link into a sub-tab (e.g. Settings > Performance)
  const handleNavigate = ({ tab, subTab }) => {
    setActiveTab(tab);
    if (subTab) {
      setPendingSubTab(subTab);
    }
  };

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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">SubBrainArr</h1>
                <p className="text-xs text-muted-foreground">
                  Subgen, but with a brain
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div className="relative w-2.5 h-2.5 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {connectedUrl}
                </span>
              </div>
              {/* Version Badge */}
              {subgenInfo && subgenInfo.version && (
                <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground flex-shrink-0">
                  Subgen {subgenInfo.version}
                  {subgenInfo.is_outdated && (
                    <span className="text-yellow-500 ml-1">update</span>
                  )}
                </span>
              )}
              {/* Change Button */}
              <button
                onClick={() => setConnectedUrl(null)}
                className="px-3 py-1 text-xs border border-border rounded-md text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors flex-shrink-0"
              >
                Change Instance
              </button>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="container mx-auto px-4">
          <nav className="flex gap-1 -mb-px">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Tab Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-1">
                Connected to Subgen
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                The brain is online and ready to optimize your subtitles.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Instance:</span>
                <button
                  onClick={() => setConnectedUrl(null)}
                  className="font-mono text-primary hover:underline cursor-pointer text-sm"
                >
                  {connectedUrl}
                </button>
              </div>
            </div>

            <RecommendationsCard onNavigate={handleNavigate} />
            <HardwareCard />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Queue Status</h3>
                </div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">
                  Files processing
                </p>
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

            <CommunityCard />

            {/* Trail head → Languages */}
            <NextStepCard
              icon={Globe}
              title="Configure Your Languages"
              description="Your hardware is detected. Now tell SubBrainArr which languages matter to you."
              buttonLabel="Go to Languages"
              onClick={() => setActiveTab("languages")}
            />
          </div>
        )}

        {activeTab === "languages" && (
          <div className="space-y-6">
            <LanguageCards />

            {/* Trail head → Scanning */}
            <NextStepCard
              icon={ScanLine}
              title="Set Up Scanning"
              description="Languages configured? Scan your library to start generating subtitles."
              buttonLabel="Go to Scanning"
              onClick={() => setActiveTab("scanning")}
            />
          </div>
        )}

        {activeTab === "scanning" && (
          <div className="space-y-6">
            {/* Section heading to anchor the eye above SmartScan */}
            <div>
              <h2 className="text-lg font-semibold mb-1">Library Scanning</h2>
              <p className="text-sm text-muted-foreground">
                Trigger scans to generate subtitles for your media library.
              </p>
            </div>
            <SmartScan subgenUrl={connectedUrl} />
            <LogsViewer subgenUrl={connectedUrl} />

            {/* Trail head → Settings */}
            <NextStepCard
              icon={Settings}
              title="Fine-Tune Settings"
              description="Scans running? Dial in performance and export your compose config."
              buttonLabel="Go to Settings"
              onClick={() => setActiveTab("settings")}
            />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <SettingsPanel
              pendingSubTab={pendingSubTab}
              onSubTabConsumed={() => setPendingSubTab(null)}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
