import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import CountUp from "@/components/shared/CountUp";
import { useFetch } from "@/hooks/useFetch";
import { Calculator, Gauge, BarChart3, PieChart, Sliders, Target } from "lucide-react";

/* ---- Real API shapes ---- */
interface RealCreatorScore {
  creatorId: string;
  creatorName?: string;
  score: number;
  tier: string;
  breakdown: { viewScore: number; likeScore: number; commentScore: number; watchTimeScore: number; growthScore: number };
  tipMultiplier: number;
}

interface RealSplitConfig {
  creatorPercent: number;
  platformPercent: number;
  communityPercent: number;
}

interface RealSplitTotals {
  totalProcessed: number;
  totalCreator: number;
  totalPlatform: number;
  totalCommunity: number;
  tipCount: number;
}

interface RealYieldStatus {
  deposited: number;
  earnedYield: number;
  currentApy: number;
  chain: string;
  protocol: string;
}

interface RealGoal {
  id: string;
  creatorId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: string;
  contributions: { from: string; amount: number }[];
}

/* ---- Demo fallbacks ---- */
const demoScores: RealCreatorScore[] = [
  { creatorId: "demo", score: 87, tier: "high", breakdown: { viewScore: 87, likeScore: 92, commentScore: 78, watchTimeScore: 84, growthScore: 96 }, tipMultiplier: 1.5 },
];

const demoSplitConfig: RealSplitConfig = { creatorPercent: 85, platformPercent: 10, communityPercent: 5 };
const demoSplitTotals: RealSplitTotals = { totalProcessed: 0, totalCreator: 0, totalPlatform: 0, totalCommunity: 0, tipCount: 0 };
const demoYieldStatus: RealYieldStatus = { deposited: 0, earnedYield: 0, currentApy: 4.5, chain: "Ethereum Sepolia", protocol: "Aave V3" };
const demoGoals: RealGoal[] = [];

/* ---- static data (no API) ---- */
const gasComparison = [
  { chain: "Polygon", gas: "0.003 gwei", cost: "$0.001", recommended: true },
  { chain: "TON", gas: "0.05 TON", cost: "$0.002", recommended: true },
  { chain: "Solana", gas: "0.00025 SOL", cost: "$0.004", recommended: false },
  { chain: "Arbitrum", gas: "0.1 gwei", cost: "$0.008", recommended: false },
  { chain: "Tron", gas: "1 TRX", cost: "$0.012", recommended: false },
  { chain: "Ethereum", gas: "12 gwei", cost: "$0.85", recommended: false },
];

const tierBadge = (t: string) => {
  if (t === "high") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (t === "medium") return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  return "bg-zinc-400/15 text-zinc-300 border-zinc-400/30";
};

export default function Economics() {
  const { data: scores, isDemo: isScoresDemo } = useFetch<RealCreatorScore[]>("/api/economics/creators/scores", demoScores);
  const { data: splitConfig, isDemo: isSplitDemo } = useFetch<RealSplitConfig>("/api/economics/split/config", demoSplitConfig);
  const { data: splitTotals } = useFetch<RealSplitTotals>("/api/economics/split/totals", demoSplitTotals);
  const { data: yieldStatus } = useFetch<RealYieldStatus>("/api/economics/yield/status", demoYieldStatus);
  const { data: goals, isDemo: isGoalsDemo } = useFetch<RealGoal[]>("/api/economics/goals", demoGoals);

  /* Compute averages from live scores */
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : 87;

  /* Derive scoring factors from the first (or best) creator */
  const topCreator = scores.length > 0 ? [...scores].sort((a, b) => b.score - a.score)[0] : demoScores[0];
  const scoringFactors = [
    { name: "View Count", weight: 30, score: Math.round(topCreator.breakdown.viewScore) },
    { name: "Likes / Reactions", weight: 25, score: Math.round(topCreator.breakdown.likeScore) },
    { name: "Comments", weight: 20, score: Math.round(topCreator.breakdown.commentScore) },
    { name: "Watch Time", weight: 15, score: Math.round(topCreator.breakdown.watchTimeScore) },
    { name: "Growth Rate", weight: 10, score: Math.round(topCreator.breakdown.growthScore) },
  ];

  const isLive = !isScoresDemo;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Economic Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Creator scoring, fee optimization, revenue smoothing, and sustainability.
          {isLive && <Badge variant="outline" className="ml-2 text-[8px] py-0 px-1 border-emerald-500/40 text-emerald-400">LIVE</Badge>}
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Avg Creator Score", value: avgScore, suffix: "/100", icon: Calculator },
          { label: "Yield APY", value: Math.round(yieldStatus.currentApy * 10), divisor: 10, suffix: "%", icon: Gauge },
          { label: "Tips Processed", value: splitTotals.tipCount, icon: BarChart3 },
          { label: "Total Processed", value: Math.round(splitTotals.totalProcessed * 100), divisor: 100, prefix: "$", icon: PieChart },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-5">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            </div>
            <div className="text-2xl font-bold tabular-nums tracking-tight">
              {s.prefix}<CountUp target={s.value} />{s.divisor ? <span className="text-base text-muted-foreground/40">/{s.divisor}</span> : null}{s.suffix}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Creator Scoring */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
            <h3 className="text-sm font-semibold">
              Creator Scoring Breakdown
              {topCreator.creatorName && <span className="text-muted-foreground font-normal ml-1">({topCreator.creatorName})</span>}
            </h3>
          </div>
          <div className="space-y-4">
            {scoringFactors.map((f) => (
              <div key={f.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs">{f.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] tabular-nums">{f.weight}% weight</Badge>
                    <span className="text-xs font-mono tabular-nums w-8 text-right">{f.score}</span>
                  </div>
                </div>
                <Progress value={f.score} className="h-2 bg-secondary" />
              </div>
            ))}
          </div>

          {/* Creator scores list (live only) */}
          {isLive && scores.length > 1 && (
            <div className="mt-4 border-t border-border/30 pt-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">All Creators ({scores.length})</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {scores.map((s) => (
                  <div key={s.creatorId} className="flex items-center justify-between text-xs bg-secondary/30 rounded-md px-2.5 py-1.5">
                    <span className="font-medium">{s.creatorName || s.creatorId.slice(0, 12)}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{s.score}</span>
                      <Badge variant="outline" className={`text-[8px] ${tierBadge(s.tier)}`}>{s.tier}</Badge>
                      <span className="text-muted-foreground">x{s.tipMultiplier}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fee Optimization */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="text-sm font-semibold">Fee Optimization by Chain</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-5 py-2 font-medium">Chain</th>
                  <th className="text-left px-3 py-2 font-medium">Gas</th>
                  <th className="text-right px-3 py-2 font-medium">Cost</th>
                  <th className="text-center px-5 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {gasComparison.map((g) => (
                  <tr key={g.chain} className="hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-2.5 text-xs font-medium">{g.chain}</td>
                    <td className="px-3 py-2.5 text-xs font-mono text-muted-foreground">{g.gas}</td>
                    <td className="px-3 py-2.5 text-right text-xs tabular-nums">{g.cost}</td>
                    <td className="px-5 py-2.5 text-center">
                      {g.recommended && <Badge variant="outline" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Recommended</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Goals (live) or Revenue Smoothing (demo) */}
        <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Funding Goals</h3>
            {!isGoalsDemo && goals.length > 0 && <Badge variant="outline" className="text-[8px] py-0 px-1 border-emerald-500/40 text-emerald-400">LIVE</Badge>}
          </div>
          {goals.length > 0 ? (
            <div className="divide-y divide-border/20">
              {goals.slice(0, 5).map((g) => {
                const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
                return (
                  <div key={g.id} className="px-5 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{g.title}</span>
                      <span className="text-[10px] text-muted-foreground">${g.currentAmount} / ${g.targetAmount}</span>
                    </div>
                    <Progress value={pct} className="h-1.5 bg-secondary mb-1" />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{g.contributions.length} contributors</span>
                      <Badge variant="outline" className={`text-[8px] ${g.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-500/15 text-zinc-400"}`}>{g.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-xs text-muted-foreground">No funding goals yet</div>
          )}
        </div>

        {/* Split Config */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Revenue Split</h3>
            {!isSplitDemo && <Badge variant="outline" className="text-[8px] py-0 px-1 border-emerald-500/40 text-emerald-400">LIVE</Badge>}
          </div>
          <div className="space-y-3">
            {[
              { label: "Creator", pct: splitConfig.creatorPercent, color: "bg-primary" },
              { label: "Platform", pct: splitConfig.platformPercent, color: "bg-blue-500" },
              { label: "Community", pct: splitConfig.communityPercent, color: "bg-emerald-500" },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                    <span className="text-xs">{s.label}</span>
                  </div>
                  <span className="text-xs font-mono tabular-nums">{s.pct}%</span>
                </div>
                <Progress value={s.pct} className="h-1.5 bg-secondary" />
              </div>
            ))}
          </div>

          {/* Split totals */}
          {splitTotals.tipCount > 0 && (
            <div className="mt-4 border-t border-border/30 pt-3 space-y-1.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Totals</p>
              {[
                { label: "Creator Earnings", value: `$${splitTotals.totalCreator.toFixed(2)}` },
                { label: "Platform Revenue", value: `$${splitTotals.totalPlatform.toFixed(2)}` },
                { label: "Community Pool", value: `$${splitTotals.totalCommunity.toFixed(2)}` },
              ].map((t) => (
                <div key={t.label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t.label}</span>
                  <span className="font-mono tabular-nums">{t.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
