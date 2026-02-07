import { useState, useEffect } from "react";
import { Cpu, Zap, HardDrive, RefreshCw } from "lucide-react";

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

        {/* Platform (update to show version) */}
        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
          <span className="text-sm text-muted-foreground">Platform</span>
          <div className="text-right">
            <div className="text-sm font-mono">{hardware.platform}</div>
            {hardware.platform_version && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {hardware.platform_version}
              </div>
            )}
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
