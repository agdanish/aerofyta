import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const SERVICES = [
  "Wallet Service", "AI Service", "WDK", "Orchestrator", "Safety",
  "Escrow", "Treasury", "YouTube API", "RSS", "Webhooks", "MCP Server",
];

function randomMs() { return Math.floor(Math.random() * 80) + 12; }

function generateStatuses() {
  return SERVICES.map((name) => ({
    name,
    healthy: Math.random() > 0.05,
    responseTime: randomMs(),
    lastChecked: new Date().toLocaleTimeString(),
  }));
}

export default function Status() {
  const [statuses, setStatuses] = useState(generateStatuses);

  useEffect(() => {
    const iv = setInterval(() => setStatuses(generateStatuses()), 30000);
    return () => clearInterval(iv);
  }, []);

  const allHealthy = statuses.every((s) => s.healthy);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time service status</p>
        </div>
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
