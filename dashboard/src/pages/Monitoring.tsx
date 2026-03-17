import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Square, MonitorCheck, AlertTriangle, Info, AlertCircle, RefreshCw } from "lucide-react";
import CountUp from "@/components/shared/CountUp";
import { API_BASE } from "@/hooks/useFetch";

interface LoopData {
  running: boolean;
  paused: boolean;
  currentCycle: number;
  totalCycles: number;
  lastCycleAt: string;
  nextCycleAt: string;
  intervalMs: number;
  tipsExecuted: number;
  tipsSkipped: number;
  tipsRefused: number;
  errors: number;
  startedAt: string;
  uptime: number;
  avgCycleDurationMs: number;
  walletMood?: { mood: string; tipMultiplier: number; reason: string };
  financialPulse?: { healthScore: number; liquidityScore: number; diversificationScore: number; velocityScore: number };
  explorationStats?: { explorationRate: number; exploreTips: number; exploitTips: number };
  dataSource?: string;
}

interface AgentStatus {
  status: string;
  loop: LoopData;
  protocolStatus?: Record<string, { available: boolean; mode: string; reason: string }>;
  uptime: number;
  timestamp: string;
}

// Demo fallback alerts
const demoAlerts = [
  { id: 1, severity: "critical", message: "Anomaly score 0.92 on tx from 0xdead...beef — blocked", time: "2m ago", ack: false },
  { id: 2, severity: "warning", message: "ETH gas spike: 45 gwei — pausing non-urgent tips", time: "8m ago", ack: false },
  { id: 3, severity: "info", message: "DCA strategy executed: 25 USDT -> ETH", time: "15m ago", ack: true },
  { id: 4, severity: "warning", message: "Creator @risky_account flagged by anomaly detector", time: "22m ago", ack: true },
  { id: 5, severity: "info", message: "Portfolio rebalanced: diversification now 85%", time: "35m ago", ack: true },
];

const severityBadge = (s: string) => {
  if (s === "critical") return "bg-red-500/15 text-red-400 border-red-500/30";
  if (s === "warning") return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  return "bg-blue-500/15 text-blue-400 border-blue-500/30";
};

const SeverityIcon = ({ severity }: { severity: string }) => {
  if (severity === "critical") return <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.5} style={{ color: "#ef4444" }} />;
  if (severity === "warning") return <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} style={{ color: "#eab308" }} />;
  return <Info className="h-3.5 w-3.5" strokeWidth={1.5} style={{ color: "#3b82f6" }} />;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatMs(ms: number): string {
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

export default function Monitoring() {
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/agent/status`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AgentStatus = await res.json();
      setAgentStatus(data);
      setIsDemo(false);
    } catch {
      setIsDemo(true);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStatus();
    setRefreshing(false);
  };

  const loop = agentStatus?.loop;
  const loopStatus: "running" | "paused" | "stopped" = loop
    ? loop.paused ? "paused" : loop.running ? "running" : "stopped"
    : "stopped";

  const handleLoopAction = async (action: "start" | "stop" | "pause" | "resume") => {
    try {
      await fetch(`${API_BASE}/api/agent/loop/${action}`, { method: "POST", signal: AbortSignal.timeout(5000) });
      // Refresh status after action
      setTimeout(fetchStatus, 500);
    } catch {
      // Ignore errors for loop control
    }
  };

  const statusColor = loopStatus === "running" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
    : loopStatus === "paused" ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
    : "bg-red-500/15 text-red-400 border-red-500/30";

  // Build protocol events from agentStatus
  const protocolEvents: { time: string; event: string; detail: string }[] = [];
  if (agentStatus?.protocolStatus) {
    for (const [name, info] of Object.entries(agentStatus.protocolStatus)) {
      protocolEvents.push({
        time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        event: `${name}_status`,
        detail: `${info.available ? "Available" : "Unavailable"} (${info.mode}) — ${info.reason}`,
      });
    }
  }
  // Add loop events
  if (loop) {
    if (loop.lastCycleAt) {
      protocolEvents.unshift({
        time: new Date(loop.lastCycleAt).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        event: "cycle_complete",
        detail: `Cycle #${loop.currentCycle} completed in ${formatMs(loop.avgCycleDurationMs)}`,
      });
    }
    if (loop.walletMood) {
      protocolEvents.push({
        time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        event: "mood",
        detail: `${loop.walletMood.mood} — ${loop.walletMood.reason}`,
      });
    }
    if (loop.dataSource) {
      protocolEvents.push({
        time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        event: "data_source",
        detail: `Data source: ${loop.dataSource}`,
      });
    }
  }

  if (initialLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-white/5 rounded-lg h-8 w-64" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="animate-pulse bg-white/5 rounded-lg h-32" />
          <div className="animate-pulse bg-white/5 rounded-lg h-32" />
          <div className="animate-pulse bg-white/5 rounded-lg h-32" />
          <div className="animate-pulse bg-white/5 rounded-lg h-32" />
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="animate-pulse bg-white/5 rounded-lg h-32" />
          <div className="animate-pulse bg-white/5 rounded-lg h-32" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Observability</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isDemo ? "Demo data — backend not reachable" : "Live data from backend"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Loop Status + Controls */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-1">
            <MonitorCheck className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
            <p className="text-xs text-muted-foreground font-medium">Loop Status</p>
          </div>
          <Badge variant="outline" className={`text-xs mt-1 ${statusColor}`}>
            {loopStatus.toUpperCase()}
          </Badge>
          {loop?.startedAt && (
            <p className="text-[10px] text-muted-foreground mt-2">Started {timeAgo(loop.startedAt)}</p>
          )}
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <p className="text-xs text-muted-foreground font-medium mb-1">Cycles Run</p>
          <CountUp target={loop?.totalCycles ?? 0} className="text-2xl font-bold tabular-nums tracking-tight" />
          {loop && (
            <p className="text-[10px] text-muted-foreground mt-1">
              {loop.tipsExecuted} tips sent, {loop.tipsRefused} refused
            </p>
          )}
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <p className="text-xs text-muted-foreground font-medium mb-1">Avg Cycle</p>
          <p className="text-2xl font-bold tabular-nums tracking-tight">
            {loop ? (loop.avgCycleDurationMs / 1000).toFixed(1) : "0.0"}
            <span className="text-sm text-muted-foreground font-normal">s</span>
          </p>
          {loop?.lastCycleAt && (
            <p className="text-[10px] text-muted-foreground mt-1">Last: {timeAgo(loop.lastCycleAt)}</p>
          )}
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-5 flex items-center gap-2">
          <Button
            size="sm"
            variant={loopStatus === "running" ? "default" : "outline"}
            onClick={() => handleLoopAction(loopStatus === "paused" ? "resume" : "start")}
            className="h-8 text-xs flex-1"
          >
            <Play className="h-3 w-3 mr-1" />{loopStatus === "paused" ? "Resume" : "Start"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleLoopAction("pause")} className="h-8 text-xs flex-1">
            <Pause className="h-3 w-3 mr-1" />Pause
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleLoopAction("stop")} className="h-8 text-xs flex-1">
            <Square className="h-3 w-3 mr-1" />Stop
          </Button>
        </div>
      </div>

      {/* Mood + Financial Pulse */}
      {loop && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {loop.walletMood && (
            <div className="rounded-xl border border-border/50 bg-card/50 p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Wallet Mood</p>
              <p className="text-lg font-bold capitalize">{loop.walletMood.mood}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{loop.walletMood.reason}</p>
            </div>
          )}
          {loop.financialPulse && (
            <>
              <div className="rounded-xl border border-border/50 bg-card/50 p-4 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Health Score</p>
                <CountUp target={loop.financialPulse.healthScore} className="text-xl font-bold tabular-nums" />
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/50 p-4 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Liquidity</p>
                <CountUp target={loop.financialPulse.liquidityScore} className="text-xl font-bold tabular-nums" />
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/50 p-4 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Velocity</p>
                <CountUp target={loop.financialPulse.velocityScore} className="text-xl font-bold tabular-nums" />
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Alerts (demo for now) */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Alerts</h3>
            <div className="flex items-center gap-2">
              {loop && loop.errors > 0 && (
                <Badge variant="outline" className="text-[9px] bg-red-500/15 text-red-400 border-red-500/30">
                  {loop.errors} errors
                </Badge>
              )}
              {loop && (
                <Badge variant="outline" className="text-[9px] bg-yellow-500/15 text-yellow-400 border-yellow-500/30">
                  {loop.tipsSkipped} skipped
                </Badge>
              )}
            </div>
          </div>
          <ScrollArea className="h-[320px]">
            <div className="divide-y divide-border/20">
              {demoAlerts.map((a) => (
                <div key={a.id} className="px-5 py-3 flex items-start gap-3 hover:bg-accent/30 transition-colors">
                  <SeverityIcon severity={a.severity} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant="outline" className={`text-[9px] ${severityBadge(a.severity)}`}>{a.severity}</Badge>
                      {!a.ack && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </div>
                    <p className="text-xs">{a.message}</p>
                    <span className="text-[10px] text-muted-foreground/60">{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Protocol Status / Event Log */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="text-sm font-semibold">Protocol Status & Events</h3>
          </div>
          <ScrollArea className="h-[320px]">
            <div className="divide-y divide-border/20">
              {protocolEvents.length > 0 ? protocolEvents.map((e, i) => (
                <div key={i} className="px-5 py-2.5 flex items-start gap-3 hover:bg-accent/30 transition-colors">
                  <span className="text-[10px] font-mono text-muted-foreground/60 mt-0.5 w-16 shrink-0">{e.time}</span>
                  <Badge variant="outline" className="text-[9px] shrink-0">{e.event}</Badge>
                  <span className="text-xs text-muted-foreground">{e.detail}</span>
                </div>
              )) : (
                <div className="px-5 py-8 text-center text-xs text-muted-foreground">No events yet</div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Tips Executed", value: loop?.tipsExecuted ?? 0 },
          { label: "Tips Refused", value: loop?.tipsRefused ?? 0 },
          { label: "Tips Skipped", value: loop?.tipsSkipped ?? 0 },
          { label: "Errors", value: loop?.errors ?? 0 },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
            <CountUp target={s.value} className="text-xl font-bold tabular-nums" />
          </div>
        ))}
      </div>
    </div>
  );
}
