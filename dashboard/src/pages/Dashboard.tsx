import { useUptime } from "@/hooks/useUptime";
import { useFetch } from "@/hooks/useFetch";
import { demoAgentStatus, demoWallets } from "@/lib/demo-data";
import CountUp from "@/components/shared/CountUp";
import CopyButton from "@/components/shared/CopyButton";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from "recharts";
import {
  SendHorizontal, Lock, Smile, Meh, TrendingUp, Brain,
  Package, Globe, CheckCircle, Terminal, Wrench, LayoutDashboard,
  Play, Eye, Pause, Square, RotateCcw, Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type LucideIcon } from "lucide-react";

/* ── Decision feed data ── */
const decisionFeed = [
  { time: "14:32", icon: "✅", text: "APPROVED tip 2.5 USDT → @sarah_creates (87% confidence)", color: "#50AF95" },
  { time: "14:31", icon: "🛡️", text: "GUARDIAN VETO: unknown recipient, 0 history", color: "#EF4444" },
  { time: "14:30", icon: "🔄", text: "FLIP: TreasuryOptimizer changed reject→approve", color: "#627EEA" },
  { time: "14:29", icon: "⏭️", text: "SKIPPED: engagement 0.45 < threshold 0.55", color: "#666" },
  { time: "14:27", icon: "✅", text: "APPROVED tip 5.0 USDT → @dev_marcus (91% confidence)", color: "#50AF95" },
  { time: "14:25", icon: "✅", text: "APPROVED swap 100 USDT → 0.054 ETH", color: "#50AF95" },
  { time: "14:22", icon: "🛡️", text: "GUARDIAN VETO: amount 50 USDT exceeds single-tx limit", color: "#EF4444" },
  { time: "14:20", icon: "⏭️", text: "SKIPPED: creator @new_user has no reputation score", color: "#666" },
];

/* ── Chain balances for portfolio bar ── */
const chainSegments = [
  { chain: "ETH", color: "#627EEA", pct: 25, bal: "0.065" },
  { chain: "TON", color: "#0098EA", pct: 15, bal: "342.5" },
  { chain: "TRX", color: "#FF0013", pct: 17, bal: "18,420" },
  { chain: "BTC", color: "#F7931A", pct: 12, bal: "0.023" },
  { chain: "SOL", color: "#9945FF", pct: 8, bal: "6.82" },
  { chain: "MATIC", color: "#8247E5", pct: 11, bal: "2,140" },
  { chain: "ARB", color: "#28A0F0", pct: 7, bal: "0.421" },
  { chain: "AVAX", color: "#E84142", pct: 3, bal: "15.3" },
  { chain: "CELO", color: "#35D07F", pct: 2, bal: "450" },
];

const moodColors: Record<string, string> = { optimistic: "#FF4E00", cautious: "#627EEA", strategic: "#50AF95" };
const moodIcons: Record<string, LucideIcon> = { optimistic: Smile, cautious: Meh, strategic: TrendingUp };

const innovationCards = [
  { icon: Package, value: 12, label: "WDK Packages" },
  { icon: Globe, value: 9, label: "Blockchains" },
  { icon: CheckCircle, value: 1052, label: "Tests" },
  { icon: Terminal, value: 107, label: "CLI Commands" },
  { icon: Wrench, value: 97, label: "MCP Tools" },
  { icon: LayoutDashboard, value: 42, label: "Dashboard Pages" },
];

/* ── Blinking cursor component ── */
function BlinkingCursor() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);
  return <span className={visible ? "opacity-100" : "opacity-0"}>█</span>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const uptime = useUptime();
  const { data: agent, isDemo } = useFetch("/api/agent/status", demoAgentStatus);

  const MoodIcon = moodIcons[agent.mood.moodType] || Smile;
  const moodGlow = moodColors[agent.mood.moodType] || "#FF4E00";

  const radarData = [
    { axis: "Liquidity", value: agent.pulse.liquidity },
    { axis: "Diversification", value: agent.pulse.diversification },
    { axis: "Velocity", value: agent.pulse.velocity },
    { axis: "Health", value: agent.pulse.healthScore },
  ];

  return (
    <div className="relative space-y-8">
      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monitor, control, and interact with your autonomous agent</p>
        </div>
        {isDemo && (
          <Badge variant="outline" className="text-[10px] border-yellow-500/40 text-yellow-500 uppercase tracking-wider">
            Demo Mode
          </Badge>
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          ROW 1: AGENT STATUS ORB + PORTFOLIO (40/60)
         ═══════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-12 gap-4">
        {/* LEFT: Agent Status Orb */}
        <div className="lg:col-span-5 rounded-xl bg-card border border-border p-6 flex flex-col items-center text-center">
          {/* Breathing orb */}
          <div className="relative mb-5">
            <div
              className="h-20 w-20 rounded-full"
              style={{
                background: `radial-gradient(circle, ${agent.online ? "#50AF9544" : "#66666644"} 0%, transparent 70%)`,
                boxShadow: `0 0 40px ${agent.online ? "#50AF9522" : "#66666622"}, 0 0 80px ${agent.online ? "#50AF9511" : "#66666611"}`,
                animation: agent.online ? "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite" : "none",
              }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className="h-10 w-10 rounded-full"
                style={{ background: agent.online ? "#50AF95" : "#666", boxShadow: `0 0 20px ${agent.online ? "#50AF9566" : "#66666666"}` }}
              />
            </div>
          </div>

          <h3 className="text-base font-bold">AeroFyta Agent</h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            {agent.online ? `Running — Cycle #${agent.stats.cyclesRun.value}` : "Stopped"}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="font-mono tabular-nums">{uptime}</span>
            <span className="w-px h-3 bg-border" />
            <span className="tabular-nums">{agent.stats.tipsSent.value} tips</span>
            <span className="w-px h-3 bg-border" />
            <Badge variant="outline" className="text-[10px] px-2 py-0" style={{ borderColor: `${moodGlow}66`, color: moodGlow }}>
              {agent.mood.name}
            </Badge>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-5">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground">
              <Pause className="h-3 w-3" /> Pause
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 text-emerald-400 border-emerald-500/30">
              <RotateCcw className="h-3 w-3" /> Resume
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 text-red-400 border-red-500/30">
              <Square className="h-3 w-3" /> Stop
            </Button>
          </div>
        </div>

        {/* RIGHT: Portfolio Overview */}
        <div className="lg:col-span-7 rounded-xl bg-card border border-border p-6">
          {/* Balance header */}
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-3xl font-bold tabular-nums tracking-tight">{agent.balance}</span>
            <Badge className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/25">
              +2.3% 24h
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-5">Total portfolio across 9 chains</p>

          {/* Chain balance bar */}
          <div className="flex h-3 rounded-full overflow-hidden mb-4">
            {chainSegments.map((seg) => (
              <div
                key={seg.chain}
                className="h-full transition-all duration-500"
                style={{ width: `${seg.pct}%`, background: seg.color }}
                title={`${seg.chain}: ${seg.pct}%`}
              />
            ))}
          </div>

          {/* Chain chips */}
          <div className="flex flex-wrap gap-2">
            {chainSegments.map((seg) => (
              <div
                key={seg.chain}
                className="flex items-center gap-1.5 bg-secondary/50 rounded-lg px-2.5 py-1.5 text-xs"
              >
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: seg.color }} />
                <span className="font-medium">{seg.chain}</span>
                <span className="text-muted-foreground font-mono tabular-nums text-[11px]">{seg.bal}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          ROW 2: BRAIN | DECISIONS | ACTIONS
         ═══════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-12 gap-4">
        {/* LEFT: Wallet-as-Brain™ */}
        <div
          className="lg:col-span-4 rounded-xl bg-card border border-border p-5"
          style={{ borderStyle: "dashed", borderColor: "hsl(var(--border))" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Brain className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold">Wallet-as-Brain™</h3>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">Financial state → agent behavior</p>

          {/* Radar chart */}
          <div className="h-48 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid stroke="hsl(240 4% 16%)" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: "hsl(240 5% 50%)", fontSize: 10 }}
                />
                <Radar
                  dataKey="value"
                  stroke="#FF4E00"
                  fill="#FF4E00"
                  fillOpacity={0.2}
                  strokeWidth={1.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Mood badge */}
          <div className="flex items-center justify-center gap-2 mt-2 mb-3">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center"
              style={{ background: `${moodGlow}22` }}
            >
              <MoodIcon className="h-4 w-4" style={{ color: moodGlow }} />
            </div>
            <span className="text-sm font-semibold">{agent.mood.name}</span>
            <Badge variant="outline" className="text-[10px]" style={{ borderColor: `${moodGlow}44`, color: moodGlow }}>
              ×{agent.mood.multiplier}
            </Badge>
          </div>

          <p className="text-[10px] text-center text-muted-foreground mb-2">Driving 8 behaviors</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {["Chain: ethereum", "Explore: 10%", "Batch: 3"].map((tag) => (
              <span key={tag} className="text-[10px] font-mono bg-secondary text-muted-foreground px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* CENTER: Live Decision Stream */}
        <div className="lg:col-span-4 rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between" style={{ background: "#0d0d0d" }}>
            <div className="flex items-center gap-2">
              <span className="flex gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
              </span>
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                Agent Decision Log (Live)
              </span>
            </div>
          </div>
          <div
            className="p-4 font-mono text-xs space-y-2 overflow-y-auto"
            style={{ background: "#0d0d0d", height: 280 }}
          >
            {decisionFeed.map((d, i) => (
              <div key={i} className="flex gap-2 leading-relaxed">
                <span className="text-muted-foreground/50 shrink-0 tabular-nums">{d.time}</span>
                <span className="shrink-0">{d.icon}</span>
                <span style={{ color: d.color }}>{d.text}</span>
              </div>
            ))}
            <div className="text-muted-foreground/40 mt-2">
              <span className="text-muted-foreground/50">{">"}</span>{" "}
              <BlinkingCursor />
            </div>
          </div>
        </div>

        {/* RIGHT: Quick Actions */}
        <div className="lg:col-span-4 rounded-xl bg-card border border-border p-5 space-y-4">
          <h3 className="text-sm font-semibold">Command Panel</h3>

          <div className="grid grid-cols-2 gap-2.5">
            {([
              { route: "/tips", icon: SendHorizontal, accent: "#FF4E00", title: "Send Tip", desc: "Tip a creator across 9 chains" },
              { route: "/escrow", icon: Lock, accent: "#50AF95", title: "Create Escrow", desc: "SHA-256 hash-locked with timelock" },
              { route: "/reasoning", icon: Brain, accent: "#9945FF", title: "Watch Agent Think", desc: "Live ReAct reasoning stream" },
              { route: "/demo", icon: Play, accent: "#627EEA", title: "Run Full Demo", desc: "10-step guided walkthrough" },
            ] as const).map((card) => {
              const CardIcon = card.icon;
              return (
                <button
                  key={card.route}
                  onClick={() => navigate(card.route)}
                  className="group text-left rounded-xl p-3.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = `${card.accent}44`;
                    e.currentTarget.style.boxShadow = `0 0 20px ${card.accent}11`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${card.accent}18` }}
                    >
                      <CardIcon className="h-4 w-4" style={{ color: card.accent }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold mb-0.5">{card.title}</p>
                      <p className="text-[10px] text-muted-foreground leading-snug">{card.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Terminal code blocks */}
          <div className="space-y-2 pt-1">
            <div
              className="relative rounded-lg p-3 font-mono text-xs"
              style={{ background: "#0d0d0d", borderLeft: "2px solid #50AF95" }}
            >
              <code>
                <span className="text-muted-foreground/50">$ </span>
                <span style={{ color: "#50AF95" }}>npm install @xzashr/aerofyta</span>
              </code>
              <div className="absolute top-2 right-2">
                <CopyButton text="npm install @xzashr/aerofyta" />
              </div>
            </div>
            <div
              className="relative rounded-lg p-3 font-mono text-xs"
              style={{ background: "#0d0d0d", borderLeft: "2px solid #50AF95" }}
            >
              <code>
                <span className="text-muted-foreground/50">$ </span>
                <span style={{ color: "#50AF95" }}>npx @xzashr/aerofyta demo</span>
              </code>
              <div className="absolute top-2 right-2">
                <CopyButton text="npx @xzashr/aerofyta demo" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          ROW 3: INNOVATION STRIP
         ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {innovationCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group rounded-xl bg-card border border-border p-4 text-center transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
            >
              <Icon className="h-5 w-5 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
              <div className="text-lg font-bold tabular-nums">
                <CountUp target={card.value} />
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
