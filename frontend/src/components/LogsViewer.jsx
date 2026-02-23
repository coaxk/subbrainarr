import { useState, useEffect, useRef, useCallback } from "react";
import {
  Terminal,
  RefreshCw,
  Download,
  Trash2,
  ArrowDownToLine,
} from "lucide-react";

// Parse a log line and extract its level for color-coding
const getLogLevel = (line) => {
  const upper = line.toUpperCase();
  if (upper.includes("ERROR") || upper.includes("CRITICAL") || upper.includes("FATAL"))
    return "error";
  if (upper.includes("WARN"))
    return "warn";
  if (upper.includes("DEBUG") || upper.includes("TRACE"))
    return "debug";
  if (upper.includes("INFO"))
    return "info";
  return null;
};

const levelColors = {
  error: "text-red-400",
  warn: "text-amber-400",
  info: "text-blue-400",
  debug: "text-gray-500",
};

const levelBadges = {
  error: "bg-red-500/20 text-red-400",
  warn: "bg-amber-500/20 text-amber-400",
  info: "bg-blue-500/20 text-blue-400",
  debug: "bg-gray-500/20 text-gray-400",
};

function LogLine({ line }) {
  const level = getLogLevel(line);
  const colorClass = level ? levelColors[level] : "text-green-400";
  const badgeClass = level ? levelBadges[level] : null;

  return (
    <div className="flex gap-2 leading-relaxed">
      {badgeClass && (
        <span
          className={`inline-block px-1 py-0 rounded text-[10px] font-bold flex-shrink-0 mt-0.5 ${badgeClass}`}
        >
          {level.toUpperCase()}
        </span>
      )}
      <span className={colorClass}>{line}</span>
    </div>
  );
}

export default function LogsViewer({ subgenUrl }) {
  const [logs, setLogs] = useState("");
  const [logType, setLogType] = useState("subgen");
  const [following, setFollowing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const logsEndRef = useRef(null);
  const containerRef = useRef(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const levelParam = levelFilter !== "all" ? `&level=${levelFilter}` : "";
      const endpoint =
        logType === "subgen"
          ? `/api/logs/subgen?subgen_url=${encodeURIComponent(subgenUrl)}&lines=500${levelParam}`
          : `/api/logs/local?lines=500${levelParam}`;

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
  }, [logType, subgenUrl, levelFilter]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  useEffect(() => {
    if (following && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, following]);

  // Detect manual scroll-up to pause follow mode
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;
    if (!atBottom && following) setFollowing(false);
  };

  const downloadLogs = () => {
    const blob = new Blob([logs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${logType}-logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = searchTerm
    ? logs
        .split("\n")
        .filter((line) =>
          line.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .join("\n")
    : logs;

  const logLines = filteredLogs.split("\n");

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Logs</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Log Source Selector */}
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
              SubBrainArr
            </button>
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 hover:bg-secondary rounded-md transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
          </button>

          <button
            onClick={downloadLogs}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
            title="Download logs"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setLogs("")}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
            title="Clear display"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search, Level Filter & Follow */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Levels</option>
          <option value="INFO">INFO</option>
          <option value="WARNING">WARN</option>
          <option value="ERROR">ERROR</option>
        </select>

        <button
          onClick={() => {
            setFollowing(true);
            if (logsEndRef.current) {
              logsEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
            following
              ? "bg-primary/20 text-primary border border-primary/30"
              : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
          }`}
          title="Follow log output (auto-scroll to bottom)"
        >
          <ArrowDownToLine className="w-3.5 h-3.5" />
          Follow
        </button>
      </div>

      {/* Logs Display */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="bg-black/50 border border-border rounded-md p-4 h-96 overflow-y-auto font-mono text-xs"
      >
        <div className="space-y-0">
          {logLines.map((line, i) => (
            <LogLine key={i} line={line} />
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {logLines.length} lines
          {searchTerm && ` (filtered)`}
        </span>
        <span>
          Auto-refresh: 5s
          {following && " | Following"}
        </span>
      </div>
    </div>
  );
}
