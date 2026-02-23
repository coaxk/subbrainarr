import { useState, useEffect } from "react";
import { Cpu, Zap, HardDrive, RefreshCw, Monitor, Container } from "lucide-react";

// Inline SVG icons for OS platforms (lucide doesn't have OS logos)
const WindowsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M3 12V6.5l8-1.1V12H3zm0 .5h8v6.6l-8-1.1V12.5zM12.5 12V5.2l8.5-1.2v8h-8.5zm0 .5h8.5v8l-8.5-1.2v-6.8z" />
  </svg>
);

const LinuxIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12.5 2C10.3 2 9 4.3 9 7c0 1.5.4 2.8 1 3.8-.8.6-2.5 2.2-3.2 4.2-.3.8-.5 1.7-.5 2.5 0 .7.1 1.3.4 1.8.3.5.7.7 1.3.7.5 0 1-.2 1.5-.5.4-.3.9-.6 1.5-.6.5 0 1 .3 1.5.6.5.3 1 .5 1.5.5s1-.2 1.5-.5c.4-.3.9-.6 1.5-.6.5 0 1 .3 1.5.6.5.3 1 .5 1.5.5.6 0 1-.2 1.3-.7.3-.5.4-1.1.4-1.8 0-.8-.2-1.7-.5-2.5-.7-2-2.4-3.6-3.2-4.2.6-1 1-2.3 1-3.8 0-2.7-1.3-5-3.5-5z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const getPlatformIcon = (platformStr) => {
  if (!platformStr) return { icon: Monitor, label: "Unknown" };
  const p = platformStr.toLowerCase();
  if (p.includes("windows")) return { icon: WindowsIcon, label: "Windows" };
  if (p.includes("darwin") || p.includes("macos")) return { icon: AppleIcon, label: "macOS" };
  if (p.includes("linux")) return { icon: LinuxIcon, label: "Linux" };
  return { icon: Monitor, label: platformStr };
};

export default function HardwareCard() {
  const [hardware, setHardware] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHardware = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/hardware/detect");
      const data = await response.json();
      setHardware(data);
    } catch (error) {
      console.error("Failed to detect hardware:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHardware();
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Cpu className="w-6 h-6 text-primary animate-pulse" />
          <h3 className="text-lg font-semibold">Hardware Detection</h3>
        </div>
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Detecting hardware...</p>
        </div>
      </div>
    );
  }

  if (!hardware) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Cpu className="w-6 h-6 text-destructive" />
          <h3 className="text-lg font-semibold">Hardware Detection Failed</h3>
        </div>
        <button
          onClick={fetchHardware}
          className="text-sm text-primary hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  const getDeviceIcon = () => {
    if (hardware.device_type === "cuda") return "🎮";
    if (hardware.device_type === "cpu") return "🖥️";
    return "⚙️";
  };

  const getDeviceTypeLabel = () => {
    if (hardware.device_type === "cuda") return "NVIDIA GPU";
    if (hardware.device_type === "cpu") return "CPU Processing";
    if (hardware.device_type === "mps") return "Apple Silicon";
    return hardware.device_type.toUpperCase();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Cpu className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Hardware Profile</h3>
        </div>
        <button
          onClick={fetchHardware}
          className="p-2 hover:bg-secondary rounded-md transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Device Info */}
      <div className="space-y-4">
        {/* Device Type */}
        <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-md">
          <div className="text-2xl">{getDeviceIcon()}</div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-1">
              Device Type
            </div>
            <div className="font-semibold">{getDeviceTypeLabel()}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {hardware.device_name}
            </div>
          </div>
        </div>

        {/* VRAM (if GPU) */}
        {hardware.total_memory && (
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-md">
            <HardDrive className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">VRAM</div>
              <div className="font-semibold">
                {hardware.total_memory} GB Total
              </div>
              {hardware.available_memory && (
                <div className="text-sm text-green-500 mt-1">
                  {hardware.available_memory} GB Available
                </div>
              )}
            </div>
          </div>
        )}

        {/* CPU Threads (if CPU) */}
        {hardware.cpu_threads && (
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-md">
            <Zap className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">
                Processing Power
              </div>
              <div className="font-semibold">
                {hardware.cpu_threads} Threads
              </div>
              {hardware.cpu_cores &&
                hardware.cpu_cores !== hardware.cpu_threads && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {hardware.cpu_cores} Cores
                  </div>
                )}
            </div>
          </div>
        )}

        {/* RAM */}
        {hardware.ram_total && (
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-md">
            <HardDrive className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">
                System RAM
              </div>
              <div className="font-semibold">{hardware.ram_total} GB Total</div>
              {hardware.ram_available && (
                <div className="text-sm text-green-500 mt-1">
                  {hardware.ram_available} GB Available
                </div>
              )}
            </div>
          </div>
        )}

        {/* Storage */}
        {hardware.storage && (
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-md">
            <HardDrive className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">
                Storage {hardware.storage.type && `(${hardware.storage.type})`}
              </div>
              <div className="font-semibold">
                {hardware.storage.total} GB Total
              </div>
              <div className="text-sm mt-1">
                <span className="text-green-500">
                  {hardware.storage.free} GB Free
                </span>
                <span className="text-muted-foreground"> / </span>
                <span className="text-muted-foreground">
                  {hardware.storage.used} GB Used
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Platform Badges */}
        <div className="p-3 bg-secondary/50 rounded-md">
          <div className="text-sm text-muted-foreground mb-2">Platform</div>
          <div className="flex flex-wrap gap-2">
            {(() => {
              const { icon: PlatformIcon, label } = getPlatformIcon(hardware.platform);
              return (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-full text-sm">
                  <PlatformIcon />
                  <span className="font-medium">{label}</span>
                  {hardware.platform_version && (
                    <span className="text-muted-foreground text-xs">
                      {hardware.platform_version}
                    </span>
                  )}
                </div>
              );
            })()}
            {hardware.device_type === "cuda" && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-full text-sm">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="font-medium">CUDA</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-full text-sm">
              <Container className="w-4 h-4 text-blue-400" />
              <span className="font-medium">Docker</span>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        {hardware.recommendation && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-md">
            <div className="text-sm font-semibold mb-1 text-primary">
              💡 Recommendation
            </div>
            <div className="text-sm">{hardware.recommendation}</div>
          </div>
        )}
      </div>
    </div>
  );
}
