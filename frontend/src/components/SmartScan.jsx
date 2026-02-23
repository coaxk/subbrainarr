import { useState } from "react";
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  Activity,
  FolderSearch,
  Info,
} from "lucide-react";

export default function SmartScan({ subgenUrl }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [folderScanning, setFolderScanning] = useState(false);

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

  const triggerFolderScan = async () => {
    if (!folderName.trim()) return;
    setFolderScanning(true);
    setResult(null);

    try {
      const response = await fetch("/api/scanning/folder-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subgen_url: subgenUrl,
          folder_name: folderName.trim(),
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        status: "error",
        message: "Folder scan failed: " + error.message,
      });
    } finally {
      setFolderScanning(false);
    }
  };

  const isAnyScanning = scanning || folderScanning;

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

      {/* Result Banner */}
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
            {result.status === "success" ? "Scan triggered" : "Scan failed"}
            {result.message && ` — ${result.message}`}
          </p>
          {result.reason && (
            <p className="text-xs text-muted-foreground mt-1">
              {result.reason}
            </p>
          )}
        </div>
      )}

      {/* Library Scan Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <button
          onClick={() => triggerScan("smart-scan")}
          disabled={isAnyScanning}
          className="flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors disabled:opacity-50"
        >
          <Zap className="w-5 h-5" />
          {scanning ? "Scanning..." : "Smart Scan"}
        </button>

        <button
          onClick={() => triggerScan("forward-scan")}
          disabled={isAnyScanning}
          className="flex items-center justify-center gap-2 py-3 bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50"
        >
          <ArrowRight className="w-5 h-5" />
          Forward Scan
        </button>

        <button
          onClick={() => triggerScan("reverse-scan")}
          disabled={isAnyScanning}
          className="flex items-center justify-center gap-2 py-3 bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
          Reverse Scan
        </button>
      </div>

      {/* Folder Scan */}
      <div className="border border-border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FolderSearch className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Scan Specific Folder</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Process a single show or movie folder — great for testing or priority processing.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isAnyScanning) triggerFolderScan();
            }}
            placeholder='Enter folder name (e.g. Breaking Bad)'
            className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isAnyScanning}
          />
          <button
            onClick={triggerFolderScan}
            disabled={isAnyScanning || !folderName.trim()}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors disabled:opacity-50 text-sm flex items-center gap-1.5"
          >
            <FolderSearch className="w-4 h-4" />
            {folderScanning ? "Scanning..." : "Scan"}
          </button>
        </div>
      </div>

      {/* Scan Type Guidance */}
      <div className="bg-secondary/30 rounded-lg p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Scan Types Explained
          </span>
        </div>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <p>
            <strong className="text-foreground">Smart Scan:</strong> Analyzes
            your library and queues all media for processing
          </p>
          <p>
            <strong className="text-foreground">Forward (A→Z):</strong> New
            content tends to sort to the front — catch recent additions first
          </p>
          <p>
            <strong className="text-foreground">Reverse (Z→A):</strong> Fills
            gaps in your existing library from the back
          </p>
          <p>
            <strong className="text-foreground">Folder Scan:</strong> Process a
            single show/movie folder — use for testing or priority processing.
            Handles special characters in folder names (parentheses,
            apostrophes, etc.) automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
