import { useState, useEffect, useRef } from "react";
import { Terminal, RefreshCw, Download, Trash2 } from "lucide-react";

export default function LogsViewer({ subgenUrl }) {
  const [logs, setLogs] = useState("");
  const [logType, setLogType] = useState("subgen"); // 'subgen' or 'local'
  const [autoScroll, setAutoScroll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const logsEndRef = useRef(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const endpoint =
        logType === "subgen"
          ? `/api/logs/subgen?subgen_url=${encodeURIComponent(subgenUrl)}&lines=200`
          : `/api/logs/local?lines=200`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success) {
        setLogs(data.logs || "No logs available");
      } else {
        setLogs(`Error: ${data.error}`);
      }
    } catch (error) {
      setLogs(`Failed to fetch logs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [logType, subgenUrl]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const downloadLogs = () => {
    const blob = new Blob([logs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${logType}-logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    setLogs("");
  };

  const filteredLogs = searchTerm
    ? logs
        .split("\n")
        .filter((line) => line.toLowerCase().includes(searchTerm.toLowerCase()))
        .join("\n")
    : logs;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Logs</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Log Type Selector */}
          <div className="flex gap-1 bg-secondary rounded-md p-1">
            <button
              onClick={() => setLogType("subgen")}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                logType === "subgen"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary-foreground/10"
              }`}
            >
              Subgen
            </button>
            <button
              onClick={() => setLogType("local")}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                logType === "local"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary-foreground/10"
              }`}
            >
              Subbrainarr
            </button>
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 hover:bg-secondary rounded-md transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={downloadLogs}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
            title="Download logs"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={clearLogs}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
            title="Clear display"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Controls */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="w-4 h-4"
          />
          Auto-scroll
        </label>
      </div>

      {/* Logs Display */}
      <div className="bg-black/50 border border-border rounded-md p-4 h-96 overflow-y-auto font-mono text-xs">
        <pre className="text-green-400 whitespace-pre-wrap break-words">
          {filteredLogs || "No logs to display"}
          <div ref={logsEndRef} />
        </pre>
      </div>

      {/* Footer Info */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {logs.split("\n").length} lines
          {searchTerm && ` (${filteredLogs.split("\n").length} filtered)`}
        </span>
        <span>Auto-refresh: 5s</span>
      </div>
    </div>
  );
}
