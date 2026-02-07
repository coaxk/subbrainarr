import { useState, useEffect } from "react";
import { Brain, Activity, Cpu, HardDrive } from "lucide-react";

function App() {
  const [apiStatus, setApiStatus] = useState("checking");
  const [apiData, setApiData] = useState(null);

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
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  apiStatus === "connected"
                    ? "bg-green-500"
                    : apiStatus === "checking"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              />
              <span className="text-sm text-muted-foreground">
                {apiStatus === "connected"
                  ? "Connected"
                  : apiStatus === "checking"
                    ? "Connecting..."
                    : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {apiStatus === "connected" ? (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">
                🎉 The Brain is Online!
              </h2>
              <p className="text-muted-foreground mb-4">
                {apiData?.message || "Subbrainarr backend is running"}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Version:</span>
                <span className="font-mono text-primary">
                  {apiData?.version || "1.0.0"}
                </span>
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Cpu className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Hardware</h3>
                </div>
                <p className="text-2xl font-bold">Detecting...</p>
                <p className="text-sm text-muted-foreground">GPU/CPU info</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <HardDrive className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">VRAM</h3>
                </div>
                <p className="text-2xl font-bold">--</p>
                <p className="text-sm text-muted-foreground">Memory usage</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🚀 Next Steps</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>✅ Backend is running</li>
                <li>✅ Frontend connected</li>
                <li>⏳ Connect to Subgen instance</li>
                <li>⏳ Scan your library</li>
                <li>⏳ Configure languages</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              Connecting to Backend...
            </h2>
            <p className="text-muted-foreground mb-4">
              {apiStatus === "checking"
                ? "Checking backend connection..."
                : "Unable to connect to Subbrainarr backend"}
            </p>
            {apiStatus === "disconnected" && (
              <div className="text-sm text-left max-w-md mx-auto bg-secondary/50 rounded p-4">
                <p className="font-semibold mb-2">Troubleshooting:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Is the backend running? (Check Docker)</li>
                  <li>Backend should be on port 9001</li>
                  <li>Check browser console for errors</li>
                </ul>
              </div>
            )}
          </div>
        )}
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
