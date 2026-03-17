import { useState, useEffect, useMemo } from "react";
import { demoAgentStatus, demoTipsPerDay, demoChainDistribution, demoCreators, demoDecisionLog } from "@/lib/demo-data";
import CountUp from "@/components/shared/CountUp";
import ShimmerSkeleton from "@/components/shared/ShimmerSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis } from "recharts";
import { Download, Medal, AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { API_BASE } from "@/hooks/useFetch";

const decisionColors: Record<string, string> = {
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-800/25 text-red-400 border-red-700/40",
  veto: "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse",
  flip: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const statAccents = [
  { border: "#FF4E00", bg: "rgba(255,78,0,0.03)" },
  { border: "#50AF95", bg: "rgba(80,175,149,0.03)" },
  { border: "#3B82F6", bg: "rgba(59,130,246,0.03)" },
  { border: "#EF4444", bg: "rgba(239,68,68,0.03)" },
];

const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

const chainColors: Record<string, string> = {
  "ethereum-sepolia": "#627EEA",
  "ton-testnet": "#0098EA",
  "tron-nile": "#FF0013",
  "ethereum-sepolia-gasless": "#8B5CF6",
  "ton-testnet-gasless": "#06B6D4",
  "plasma": "#F59E0B",
  "stable": "#50AF95",
};

interface AnomalyTx {
  amount: number;
  timestamp: string;
  zScore: number;
  isAnomaly: boolean;
  severity: string;
  recipient: string;
  chainId: string;
}

interface AnomalyChart {
  transactions: AnomalyTx[];
  normalZone: { mean: number; upperBound: number; lowerBound: number };
  statistics: { mean: number; stdDev: number; sampleCount: number; min: number; max: number };
}

interface AgentStatus {
  status: string;
  loop: {
    running: boolean;
    currentCycle: number;
    totalCycles: number;
    tipsExecuted: number;
    tipsSkipped: number;
    tipsRefused: number;
    errors: number;
    uptime: number;
    financialPulse?: {
      liquidityScore: number;
      diversificationScore: number;
      velocityScore: number;
      healthScore: number;
      totalAvailableUsdt: number;
      activeChainsCount: number;
    };
    walletMood?: {
      mood: string;
      tipMultiplier: number;
      reason: string;
    };
    explorationStats?: {
      explorationRate: number;
      exploreTips: number;
      exploitTips: number;
    };
  };
  protocolStatus?: Record<string, { available: boolean; mode: string }>;
  uptime: number;
}

export default function Analytics() {
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [anomalyData, setAnomalyData] = useState<AnomalyChart | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      setPageLoading(true);
      try {
        const [statusRes, anomalyRes] = await Promise.all([
          fetch(`${API_BASE}/api/agent/status`, { signal: AbortSignal.timeout(5000) }),
          fetch(`${API_BASE}/api/analytics/anomaly-chart`, { signal: AbortSignal.timeout(5000) }),
        ]);
        if (!statusRes.ok || !anomalyRes.ok) throw new Error("API error");
        const [statusJson, anomalyJson] = await Promise.all([statusRes.json(), anomalyRes.json()]);
        if (!cancelled) {
          setAgentStatus(statusJson);
          setAnomalyData(anomalyJson);
          setIsDemo(false);
        }
      } catch {
        if (!cancelled) setIsDemo(true);
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    }
    fetchAll();
    return () => { cancelled = true; };
  }, []);

  // Derive stats from real data or fallback to demo
  const stats = useMemo(() => {
    if (agentStatus) {
      const loop = agentStatus.loop;
      return [
        { label: "Tips Executed", value: loop.tipsExecuted },
        { label: "Cycles Run", value: loop.totalCycles },
        { label: "Health Score", value: loop.financialPulse?.healthScore ?? 0, suffix: "%" },
        { label: "Errors", value: loop.errors },
      ];
    }
    return [
      { label: "Tips Sent", value: demoAgentStatus.stats.tipsSent.value },
      { label: "Total Managed", value: 12847, prefix: "$" },
      { label: "Health Score", value: demoAgentStatus.pulse.healthScore, suffix: "%" },
      { label: "Security Events", value: 6 },
    ];
  }, [agentStatus]);

  // Build anomaly chart data from real API
  const anomalyChartData = useMemo(() => {
    if (!anomalyData) return null;
    return anomalyData.transactions.map((tx) => ({
      date: new Date(tx.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      amount: tx.amount,
      zScore: tx.zScore,
      isAnomaly: tx.isAnomaly,
      chain: tx.chainId,
    }));
  }, [anomalyData]);

  // Derive chain distribution from anomaly data
  const chainDist = useMemo(() => {
    if (!anomalyData) return demoChainDistribution;
    const counts: Record<string, number> = {};
    for (const tx of anomalyData.transactions) {
      counts[tx.chainId] = (counts[tx.chainId] || 0) + 1;
    }
    const total = anomalyData.transactions.length;
    return Object.entries(counts)
      .map(([chain, count]) => ({
        chain: chain.replace("-testnet", "").replace("-nile", "").replace("-sepolia", " Sepolia"),
        value: Math.round((count / total) * 100),
        color: chainColors[chain] || "#666666",
      }))
      .sort((a, b) => b.value - a.value);
  }, [anomalyData]);

  // Derive tips-per-day from anomaly data
  const tipsPerDay = useMemo(() => {
    if (!anomalyData) return demoTipsPerDay;
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts: Record<string, number> = {};
    for (const tx of anomalyData.transactions) {
      const d = new Date(tx.timestamp);
      const day = dayNames[d.getDay()];
      counts[day] = (counts[day] || 0) + 1;
    }
    return dayNames.map((day) => ({ day, tips: counts[day] || 0 }));
  }, [anomalyData]);

  const maxTips = Math.max(...demoCreators.slice(0, 5).map((c) => c.tips));

  if (pageLoading) {
    return (
      <div className="p-6 space-y-6">
        <ShimmerSkeleton className="h-8 w-48" />
        <ShimmerSkeleton className="h-4 w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ShimmerSkeleton className="h-24" />
          <ShimmerSkeleton className="h-24" />
          <ShimmerSkeleton className="h-24" />
          <ShimmerSkeleton className="h-24" />
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <ShimmerSkeleton className="h-56" />
          <ShimmerSkeleton className="h-56" />
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <ShimmerSkeleton className="h-48" />
          <ShimmerSkeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Performance metrics, decision logs, and trends.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-[10px] ${isDemo ? "text-yellow-400 border-yellow-500/30" : "text-emerald-400 border-emerald-500/30"}`}>
            {isDemo ? <><WifiOff className="h-3 w-3 mr-1" />Demo</> : <><Wifi className="h-3 w-3 mr-1" />Live</>}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => {
            const exportData = { stats, chartData: { tipsPerDay, chainDist, anomalyChartData }, creators: demoCreators, decisions: demoDecisionLog, exportedAt: new Date() };
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'aerofyta-analytics.json'; a.click();
            URL.revokeObjectURL(url);
            toast.success('Analytics exported');
          }}>
            <Download className="h-3.5 w-3.5 mr-2" />Export
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-4 relative overflow-hidden"
            style={{
              borderTop: `2px solid ${statAccents[i].border}`,
              background: `linear-gradient(180deg, ${statAccents[i].bg} 0%, hsl(var(--card)) 60%)`,
            }}
          >
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className="text-2xl font-bold tabular-nums">
              {s.prefix}<CountUp target={s.value} />{s.suffix}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Transaction Amount Over Time (from anomaly data) or Tips per Day */}
        <div className="rounded-xl border border-border bg-card p-5 relative">
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{ boxShadow: "inset 0 0 40px rgba(255,78,0,0.03)" }}
          />
          <h3 className="text-sm font-semibold mb-4 relative z-10">
            {anomalyChartData ? "Transaction Amounts Over Time" : "Tips per Day"}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            {anomalyChartData ? (
              <LineChart data={anomalyChartData}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#FF4E00" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#FF8C42" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(240, 5%, 50%)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "hsl(240, 5%, 50%)" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v: number) => `${v} U`} />
                <RTooltip
                  contentStyle={{ background: "hsl(240, 5%, 9%)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number, _name: string, props: { payload: { chain: string; isAnomaly: boolean } }) => [`${value} USDT (${props.payload.chain})`, props.payload.isAnomaly ? "ANOMALY" : "Normal"]}
                />
                <Line type="monotone" dataKey="amount" stroke="url(#lineGrad)" strokeWidth={2} dot={(props: { cx: number; cy: number; payload: { isAnomaly: boolean } }) => {
                  const { cx, cy, payload } = props;
                  if (payload.isAnomaly) {
                    return <circle cx={cx} cy={cy} r={5} fill="#EF4444" stroke="#EF4444" strokeWidth={2} />;
                  }
                  return <circle cx={cx} cy={cy} r={2} fill="#FF4E00" />;
                }} />
              </LineChart>
            ) : (
              <BarChart data={tipsPerDay}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#FF4E00" />
                    <stop offset="100%" stopColor="#FF8C42" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(240, 5%, 50%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(240, 5%, 50%)" }} axisLine={false} tickLine={false} width={30} />
                <RTooltip
                  contentStyle={{ background: "hsl(240, 5%, 9%)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: "hsl(0, 0%, 95%)" }}
                />
                <Bar dataKey="tips" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 relative">
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{ boxShadow: "inset 0 0 40px rgba(255,78,0,0.03)" }}
          />
          <h3 className="text-sm font-semibold mb-4 relative z-10">Chain Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={chainDist} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" stroke="none">
                {chainDist.map((entry) => (
                  <Cell key={entry.chain} fill={entry.color} />
                ))}
              </Pie>
              <RTooltip
                contentStyle={{ background: "hsl(240, 5%, 9%)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: "hsl(0, 0%, 95%)" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center relative z-10">
            {chainDist.map((c) => (
              <div key={c.chain} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                {c.chain} ({c.value}%)
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Mood + Protocol Status (from real API) */}
      {agentStatus && (
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Agent Mood</h3>
            <p className="text-2xl font-bold capitalize">{agentStatus.loop.walletMood?.mood ?? agentStatus.status}</p>
            <p className="text-xs text-muted-foreground mt-1">{agentStatus.loop.walletMood?.reason ?? ""}</p>
            <p className="text-xs text-muted-foreground mt-2">Tip multiplier: {agentStatus.loop.walletMood?.tipMultiplier ?? 1}x</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Loop Stats</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Running</span><span>{agentStatus.loop.running ? "Yes" : "No"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Cycles</span><span>{agentStatus.loop.totalCycles}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tips Skipped</span><span>{agentStatus.loop.tipsSkipped}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tips Refused</span><span>{agentStatus.loop.tipsRefused}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Uptime</span><span>{Math.floor(agentStatus.uptime / 60)}m</span></div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Financial Pulse</h3>
            {agentStatus.loop.financialPulse && (
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Health</span><span>{agentStatus.loop.financialPulse.healthScore}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Liquidity</span><span>{agentStatus.loop.financialPulse.liquidityScore}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Diversification</span><span>{agentStatus.loop.financialPulse.diversificationScore}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Velocity</span><span>{agentStatus.loop.financialPulse.velocityScore}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Active Chains</span><span>{agentStatus.loop.financialPulse.activeChainsCount}</span></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Anomaly Statistics */}
      {anomalyData && (
        <div className="rounded-xl border border-border bg-card p-5 mb-6">
          <h3 className="text-sm font-semibold mb-3">Anomaly Detection Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
            <div><span className="text-muted-foreground block text-xs">Sample Count</span><span className="font-bold">{anomalyData.statistics.sampleCount}</span></div>
            <div><span className="text-muted-foreground block text-xs">Mean</span><span className="font-bold">{anomalyData.statistics.mean.toFixed(4)}</span></div>
            <div><span className="text-muted-foreground block text-xs">Std Dev</span><span className="font-bold">{anomalyData.statistics.stdDev.toFixed(4)}</span></div>
            <div><span className="text-muted-foreground block text-xs">Total Txns</span><span className="font-bold">{anomalyData.transactions.length}</span></div>
            <div><span className="text-muted-foreground block text-xs">Anomalies</span><span className="font-bold text-red-400">{anomalyData.transactions.filter(t => t.isAnomaly).length}</span></div>
          </div>
        </div>
      )}

      {/* Creator Leaderboard + Decision Log */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card">
          <div className="px-5 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Creator Leaderboard</h3>
          </div>
          <div className="divide-y divide-border">
            {demoCreators.slice(0, 5).map((c, i) => (
              <div key={c.id} className="px-5 py-2.5 flex items-center gap-3">
                {i < 3 ? (
                  <Medal className="h-4 w-4 shrink-0" strokeWidth={1.5} style={{ color: medalColors[i] }} />
                ) : (
                  <span className="text-xs text-muted-foreground w-4 tabular-nums text-center">{i + 1}</span>
                )}
                <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-medium">{c.avatar}</div>
                <span className="text-sm flex-1 truncate">{c.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,78,0,0.1)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(c.tips / maxTips) * 100}%`, background: "#FF4E00" }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground w-12 text-right">{c.tips} tips</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="px-5 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Decision Log</h3>
          </div>
          <div className="divide-y divide-border">
            {demoDecisionLog.map((d) => (
              <div key={d.id} className="px-5 py-2.5 flex items-center gap-3">
                <span className="text-[11px] text-muted-foreground font-mono tabular-nums w-10 shrink-0">{d.time}</span>
                <span className="text-sm flex-1 truncate min-w-0">{d.decision}</span>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${decisionColors[d.result] || ""}`}>{d.result}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
