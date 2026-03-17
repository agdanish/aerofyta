import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_BASE } from "@/hooks/useFetch";

interface ServiceStatus {
  name: string;
  healthy: boolean;
  responseTime: number;
  lastChecked: string;
}

interface HealthResponse {
  status: string;
  uptime: number;
  timestamp: string;
  version: string;
}

interface SystemInfoResponse {
  uptime: number;
  nodeVersion: string;
  wdkVersion: string;
  apiEndpoints: number;
  startTime: string;
  memoryUsage: { heapUsed: number; heapTotal: number };
  platform: string;
  environment: string;
}

interface ArchResponse {
  totalServices: number;
  totalRoutes: number;
  totalTests: number;
  wdkIntegration?: { chains: string[]; packages: string[] };
  aiCapabilities?: { providers: string[] };
}

async function checkEndpoint(url: string): Promise<{ ok: boolean; ms: number }> {
  const start = performance.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return { ok: res.ok, ms: Math.round(performance.now() - start) };
  } catch {
    return { ok: false, ms: Math.round(performance.now() - start) };
  }
}

export default function Status() {
  const [statuses, setStatuses] = useState<ServiceStatus[]>([]);
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAllServices = useCallback(async () => {
    const now = new Date().toLocaleTimeString();

    // Check multiple real endpoints in parallel
    const checks = await Promise.all([
      checkEndpoint(`${API_BASE}/api/health`),
      checkEndpoint(`${API_BASE}/api/system/info`),
      checkEndpoint(`${API_BASE}/api/architecture`),
      checkEndpoint(`${API_BASE}/api/auth/status`),
      checkEndpoint(`${API_BASE}/api/chat`),
      checkEndpoint(`${API_BASE}/api/wallet/info`),
      checkEndpoint(`${API_BASE}/api/tips/history`),
      checkEndpoint(`${API_BASE}/api/escrow/list`),
      checkEndpoint(`${API_BASE}/api/treasury/status`),
      checkEndpoint(`${API_BASE}/api/creators`),
      checkEndpoint(`${API_BASE}/api/autonomy/status`),
    ]);

    const serviceNames = [
      "Core Health",
      "System Info",
      "Architecture",
      "Auth Service",
      "Chat / AI",
      "Wallet Service",
      "Tip Engine",
      "Escrow Service",
      "Treasury",
      "Creator Discovery",
      "Autonomy Engine",
    ];

    const results: ServiceStatus[] = serviceNames.map((name, i) => ({
      name,
      healthy: checks[i].ok,
      responseTime: checks[i].ms,
      lastChecked: now,
    }));

    setStatuses(results);

    // Parse health data
    try {
      const healthRes = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(3000) });
      if (healthRes.ok) setHealthData(await healthRes.json());
    } catch { /* ignore */ }

    setLoading(false);
  }, []);

  useEffect(() => {
    checkAllServices();
    const iv = setInterval(checkAllServices, 30000);
    return () => clearInterval(iv);
  }, [checkAllServices]);

  const allHealthy = statuses.length > 0 && statuses.every((s) => s.healthy);
  const healthyCount = statuses.filter((s) => s.healthy).length;

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Checking services...</p>
          </div>
          <Badge variant="outline" className="border-yellow-500/40 text-yellow-500">Checking...</Badge>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-border/40 text-xs text-muted-foreground font-medium">
            <span>Service</span><span>Status</span><span>Response</span><span>Checked</span>
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3 border-b border-border/20 last:border-0 animate-pulse">
              <div className="h-4 w-28 bg-muted/40 rounded" />
              <div className="h-4 w-16 bg-muted/40 rounded" />
              <div className="h-4 w-12 bg-muted/40 rounded" />
              <div className="h-4 w-14 bg-muted/40 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {`${healthyCount}/${statuses.length} services checked against localhost:3001`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {healthData && (
            <span className="text-xs text-muted-foreground font-mono">
              v{healthData.version} | up {Math.floor(healthData.uptime / 60)}m
            </span>
          )}
          <Badge
            variant="outline"
            className={
              allHealthy
                ? "border-green-500/40 text-green-500"
                : "border-yellow-500/40 text-yellow-500"
            }
          >
            {allHealthy ? "All Systems Operational" : "Partial Outage"}
          </Badge>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-border/40 text-xs text-muted-foreground font-medium">
          <span>Service</span>
          <span>Status</span>
          <span>Response</span>
          <span>Checked</span>
        </div>
        <ScrollArea className="max-h-[500px]">
          {statuses.map((s) => (
            <div
              key={s.name}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3 border-b border-border/20 last:border-0"
            >
              <span className="text-sm font-medium">{s.name}</span>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    background: s.healthy ? "hsl(var(--success))" : "hsl(var(--destructive))",
                    animation: s.healthy ? "status-pulse 2s ease-in-out infinite" : undefined,
                  }}
                />
                <span className={`text-xs ${s.healthy ? "text-green-500" : "text-red-500"}`}>
                  {s.healthy ? "Healthy" : "Down"}
                </span>
              </div>
              <span className="text-xs font-mono tabular-nums text-muted-foreground">{s.responseTime}ms</span>
              <span className="text-xs text-muted-foreground">{s.lastChecked}</span>
            </div>
          ))}
        </ScrollArea>
      </div>

      <p className="text-[11px] text-muted-foreground mt-4">Auto-refreshes every 30 seconds</p>
    </div>
  );
}
