import { useState } from "react";
import { Zap, ArrowRight, ArrowLeft, Activity } from "lucide-react";

export default function SmartScan({ subgenUrl }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const triggerScan = async (scanType) => {
    setScanning(true);
    setResult(null);

    try {
      const response = await fetch(`/api/scanning/${scanType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subgen_url: subgenUrl }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        status: "error",
        message: "Failed to trigger scan: " + error.message,
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Activity className="w-6 h-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Library Scanning</h3>
          <p className="text-sm text-muted-foreground">
            Intelligent orchestration of Subgen scans
          </p>
        </div>
      </div>

      <div className="bg-secondary/50 rounded-lg p-3 mb-4">
        <p className="text-sm text-muted-foreground">
          🧠 <strong>What this does:</strong> SubBrainArr analyzes your library
          and tells Subgen what to scan. Forward scan = new content first.
          Reverse scan = fill gaps in existing library.
        </p>
      </div>

      {result && (
        <div
          className={`mb-4 rounded-lg p-4 ${
            result.status === "success"
              ? "bg-green-500/10 border border-green-500/20"
              : "bg-red-500/10 border border-red-500/20"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              result.status === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {result.status === "success" ? "✓ " : "✗ "}
            {result.message}
          </p>
          {result.reason && (
            <p className="text-xs text-muted-foreground mt-1">
              {result.reason}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => triggerScan("smart-scan")}
          disabled={scanning}
          className="flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors disabled:opacity-50"
        >
          <Zap className="w-5 h-5" />
          {scanning ? "Scanning..." : "Smart Scan"}
        </button>

        <button
          onClick={() => triggerScan("forward-scan")}
          disabled={scanning}
          className="flex items-center justify-center gap-2 py-3 bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50"
        >
          <ArrowRight className="w-5 h-5" />
          Forward Scan
        </button>

        <button
          onClick={() => triggerScan("reverse-scan")}
          disabled={scanning}
          className="flex items-center justify-center gap-2 py-3 bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
          Reverse Scan
        </button>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        <p>
          <strong>Smart Scan:</strong> Analyzes library and chooses best scan
          type
        </p>
        <p>
          <strong>Forward:</strong> New content first (recent additions)
        </p>
        <p>
          <strong>Reverse:</strong> Oldest first (fill library gaps)
        </p>
      </div>
    </div>
  );
}