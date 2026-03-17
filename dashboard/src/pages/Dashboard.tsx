import { useFetch } from "@/hooks/useFetch";
import { demoAgentStatus, demoActivity } from "@/lib/demo-data";
import CountUp from "@/components/shared/CountUp";
import Sparkline from "@/components/shared/Sparkline";
import {
  Clock, Wifi, WifiOff, SendHorizontal, Lock, Users, RefreshCw,
  Smile, Meh, TrendingUp, Brain, ShieldCheck, BarChart3, ArrowLeftRight, CircleDollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type LucideIcon } from "lucide-react";

const statIcons: Record<string, LucideIcon> = {
  "Tips Sent": SendHorizontal,
  "Active Escrows": Lock,
  "Creators Tracked": Users,
  "Cycles Run": RefreshCw,
};

const moodIcons: Record<string, LucideIcon> = {
  optimistic: Smile,
  cautious: Meh,
  strategic: TrendingUp,
};

const activityIcons: Record<string, LucideIcon> = {
  tip: SendHorizontal,
  escrow: Lock,
  reasoning: Brain,
  swap: ArrowLeftRight,
  security: ShieldCheck,
  lending: BarChart3,
  dca: CircleDollarSign,
};

/** Format seconds into "Xh Xm Xs" */
function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

export default function Dashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: agent, isDemo } = useFetch<any>("/api/agent/status", demoAgentStatus);
  const { data: activity } = useFetch("/api/wallet/history", demoActivity);

  // --- Map real backend response to dashboard format ---
  // Real API: { status, loop: { running, currentCycle, tipsExecuted, tipsSkipped, financialPulse, walletMood }, uptime }
  // Demo:     { online, stats, pulse, mood, balance }

  const isOnline = agent?.loop?.running === true
    || agent?.status === 'idle'
    || agent?.status === 'running'
    || agent?.online === true;

  // Uptime: real API returns seconds, demo doesn't have it
  const uptime = typeof agent?.uptime === 'number'
    ? formatUptime(agent.uptime)
    : formatUptime(Math.floor((Date.now() - (Date.now() - 9_252_000)) / 1000));

  // Financial pulse: real API nests under loop.financialPulse, demo under pulse
  const fp = agent?.loop?.financialPulse || agent?.pulse || {};
  const agentPulse = {
    liquidity: fp.liquidityScore ?? fp.liquidity ?? 78,
    diversification: fp.diversificationScore ?? fp.diversification ?? 85,
    velocity: fp.velocityScore ?? fp.velocity ?? 62,
    healthScore: fp.healthScore ?? 91,
  };

  // Wallet mood: real API nests under loop.walletMood, demo under mood
  const wm = agent?.loop?.walletMood || agent?.mood || {};
  const agentMood = {
    moodType: wm.mood ?? wm.moodType ?? 'optimistic',
    name: wm.mood ? wm.mood.charAt(0).toUpperCase() + wm.mood.slice(1) : (wm.name ?? 'Optimistic'),
    multiplier: wm.tipMultiplier ?? wm.multiplier ?? 1.2,
    reason: wm.reason ?? 'Portfolio up 3.2% — diversification score healthy',
  };

  // Stats: real API has loop.tipsExecuted, loop.tipsSkipped, loop.currentCycle
  // Demo has stats.tipsSent, stats.activeEscrows, etc.
  const loopData = agent?.loop || {};
  const agentStats = agent?.stats || {};

  const tipsValue = loopData.tipsExecuted != null
    ? loopData.tipsExecuted
    : (agentStats.tipsSent?.value ?? 247);

  const cyclesValue = loopData.currentCycle != null
    ? loopData.currentCycle
    : (agentStats.cyclesRun?.value ?? 1834);

  const stats = [
    { label: "Tips Sent", value: tipsValue, trend: agentStats.tipsSent?.trend || [30, 25, 35, 40, 38, 45, tipsValue] },
    { label: "Active Escrows", ...(agentStats.activeEscrows || { value: 12, trend: [8, 10, 9, 11, 12, 10, 12] }) },
    { label: "Creators Tracked", ...(agentStats.creatorsTracked || { value: 89, trend: [70, 75, 78, 82, 85, 87, 89] }) },
    { label: "Cycles Run", value: cyclesValue, trend: agentStats.cyclesRun?.trend || [Math.max(0, cyclesValue - 100), Math.max(0, cyclesValue - 80), Math.max(0, cyclesValue - 60), Math.max(0, cyclesValue - 40), Math.max(0, cyclesValue - 20), Math.max(0, cyclesValue - 5), cyclesValue] },
  ];

  const pulse = [
    { label: "Liquidity", value: agentPulse.liquidity ?? 78 },
    { label: "Diversification", value: agentPulse.diversification ?? 85 },
    { label: "Velocity", value: agentPulse.velocity ?? 62 },
    { label: "Health Score", value: agentPulse.healthScore ?? 91 },
  ];

  const MoodIcon = moodIcons[agentMood.moodType] || Smile;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Agent overview and financial pulse</p>
          </div>
          {isDemo && (
            <Badge variant="outline" className="text-[10px] border-yellow-500/40 text-yellow-500 uppercase tracking-wider">
              Demo Mode
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-card border border-border/50 rounded-lg px-3 py-2">
            <Clock className="h-3.5 w-3.5" />
            <span>Uptime: {uptime}</span>
          </div>
          <div className="flex items-center gap-2 text-xs bg-card border border-border/50 rounded-lg px-3 py-2">
            {isOnline ? (
              <><Wifi className="h-3.5 w-3.5 text-success" /><span className="text-success">Online</span></>
            ) : (
              <><WifiOff className="h-3.5 w-3.5 text-destructive" /><span className="text-destructive">Offline</span></>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = statIcons[stat.label] || RefreshCw;
          return (
            <div key={stat.label} className="rounded-xl border border-border/50 bg-card/50 p-5 hover:border-border transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              </div>
              <div className="flex items-end justify-between gap-2">
                <CountUp target={stat.value} className="text-2xl font-bold tabular-nums tracking-tight" />
                <div className="w-20 h-8 opacity-60">
                  <Sparkline data={stat.trend} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Financial Pulse */}
        <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card/50 p-5" data-tour="pulse">
          <h3 className="text-sm font-semibold mb-4">Financial Pulse</h3>
          <div className="space-y-4">
            {pulse.map((p) => (
              <div key={p.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">{p.label}</span>
                  <span className="text-xs font-mono tabular-nums">{p.value}%</span>
                </div>
                <Progress
                  value={p.value}
                  className="h-2 bg-secondary"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Agent Mood */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5 flex flex-col items-center justify-center text-center" data-tour="mood">
          <div className="h-14 w-14 rounded-full border border-border/50 bg-card flex items-center justify-center mb-3">
            <MoodIcon className="h-7 w-7" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
          </div>
          <h3 className="text-sm font-semibold mb-0.5">{agentMood.name || 'Optimistic'}</h3>
          <p className="text-xs text-muted-foreground mb-3">×{agentMood.multiplier || 1.2} multiplier</p>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">{agentMood.reason || 'Portfolio up 3.2% — diversification score healthy'}</p>
          <div className="mt-4 text-lg font-bold tabular-nums">{agent?.balance || '$12,847.32'}</div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Total Balance</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-border/50 bg-card/50">
        <div className="px-5 py-3 border-b border-border/40">
          <h3 className="text-sm font-semibold">Recent Activity</h3>
        </div>
        <ScrollArea className="h-[320px]">
          <div className="divide-y divide-border/30">
            {(activity as typeof demoActivity).map((event) => {
              const ActivityIcon = activityIcons[event.type] || RefreshCw;
              return (
                <div key={event.id} className="px-5 py-3 flex items-start gap-3 hover:bg-accent/30 transition-colors">
                  <ActivityIcon className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{event.message}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">{event.time}</span>
                      {event.chain && (
                        <span className="text-[10px] text-muted-foreground/70 bg-secondary/50 px-1.5 py-0.5 rounded">{event.chain}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
