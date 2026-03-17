import { Badge } from "@/components/ui/badge";
import CountUp from "@/components/shared/CountUp";
import { Leaf, Zap, Award, TrendingDown, BarChart3, Loader2 } from "lucide-react";
import { useFetch } from "@/hooks/useFetch";

/* ---------- API types ---------- */
interface ApiGasPrice {
  chainId: string;
  chainName: string;
  gasPriceGwei: number;
  gasPriceUsd: number;
  nativeTokenPrice: number;
  fetchedAt: string;
  baseFeeGwei?: number;
  priorityFeeGwei?: number;
}

interface ApiOptimization {
  id: string;
  category: string;
  currentCost: number;
  optimizedCost: number;
  savingsPercent: number;
  recommendation: string;
  applied: boolean;
  realData: boolean;
}

interface ApiSustainabilityReport {
  id: string;
  period: string;
  generatedAt: string;
  metrics: {
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
    profitMargin: number;
    burnRate: number;
    runwayHours: number;
    revenuePerHour: number;
    costPerHour: number;
    selfSustaining: boolean;
    sustainabilityScore: number;
    breakEvenDate: string | null;
    apiCallsMade: number;
    rpcCallsMade: number;
    gasCostsTracked: number;
  };
  revenueBreakdown: Record<string, number>;
  costBreakdown: Record<string, number>;
  optimizations: ApiOptimization[];
  projections: {
    next24h: { revenue: number; costs: number; net: number };
    next7d: { revenue: number; costs: number; net: number };
    next30d: { revenue: number; costs: number; net: number };
  };
  gasPrices: ApiGasPrice[];
  cheapestChain: string;
}

interface ApiMetrics {
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
  burnRate: number;
  runwayHours: number;
  revenuePerHour: number;
  costPerHour: number;
  selfSustaining: boolean;
  sustainabilityScore: number;
  breakEvenDate: string | null;
  apiCallsMade: number;
  rpcCallsMade: number;
  gasCostsTracked: number;
}

/* ---------- Demo data ---------- */
const demoReport: ApiSustainabilityReport = {
  id: "demo",
  period: "lifetime",
  generatedAt: new Date().toISOString(),
  metrics: { totalRevenue: 0, totalCosts: 0, netProfit: 0, profitMargin: 0, burnRate: 0, runwayHours: 99999, revenuePerHour: 0, costPerHour: 0, selfSustaining: true, sustainabilityScore: 100, breakEvenDate: null, apiCallsMade: 0, rpcCallsMade: 0, gasCostsTracked: 0 },
  revenueBreakdown: {},
  costBreakdown: {},
  optimizations: [],
  projections: { next24h: { revenue: 0, costs: 0, net: 0 }, next7d: { revenue: 0, costs: 0, net: 0 }, next30d: { revenue: 0, costs: 0, net: 0 } },
  gasPrices: [],
  cheapestChain: "Unknown",
};

const demoMetrics: ApiMetrics = {
  totalRevenue: 0, totalCosts: 0, netProfit: 0, profitMargin: 0, burnRate: 0, runwayHours: 99999, revenuePerHour: 0, costPerHour: 0, selfSustaining: true, sustainabilityScore: 100, breakEvenDate: null, apiCallsMade: 0, rpcCallsMade: 0, gasCostsTracked: 0,
};

/* ---------- Helpers ---------- */
const gradeBadge = (g: string) => {
  if (g.startsWith("A")) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (g === "B") return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (g === "C") return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  return "bg-red-500/15 text-red-400 border-red-500/30";
};

function scoreToGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  return "D";
}

function formatGwei(gwei: number): string {
  if (gwei === 0) return "0";
  if (gwei < 0.01) return gwei.toFixed(4);
  if (gwei < 1) return gwei.toFixed(3);
  return gwei.toFixed(1);
}

export default function Sustainability() {
  const { data: report, loading: reportLoading, isDemo: reportDemo } = useFetch<ApiSustainabilityReport>("/api/advanced/sustainability/report", demoReport);
  const { data: metrics, loading: metricsLoading, isDemo: metricsDemo } = useFetch<ApiMetrics>("/api/advanced/sustainability/metrics", demoMetrics);

  const isLoading = reportLoading || metricsLoading;
  const isDemo = reportDemo && metricsDemo;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const m = report.metrics;
  const score = m.sustainabilityScore;
  const grade = scoreToGrade(score);

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ESG & Sustainability Report</h1>
          <p className="text-sm text-muted-foreground mt-1">Cost sustainability, gas optimization, and operational efficiency.</p>
        </div>
        {isDemo && <Badge variant="outline" className="text-[9px] bg-yellow-500/15 text-yellow-400 border-yellow-500/30">Demo Data</Badge>}
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Sustainability Score", value: score, suffix: "/100", icon: Leaf },
          { label: "RPC Calls Made", value: metrics.rpcCallsMade, suffix: "", icon: Zap },
          { label: "API Calls Made", value: metrics.apiCallsMade, suffix: "", icon: Award },
          { label: "Self-Sustaining", value: m.selfSustaining ? 1 : 0, suffix: m.selfSustaining ? " Yes" : " No", icon: TrendingDown },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-5">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            </div>
            <div className="text-2xl font-bold tabular-nums tracking-tight">
              <CountUp target={s.value} />{s.suffix}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Score Gauge */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5 flex flex-col items-center justify-center text-center">
          <Leaf className="h-10 w-10 mb-3" strokeWidth={1.5} style={{ color: "#50AF95" }} />
          <p className="text-4xl font-bold tabular-nums" style={{ color: "#50AF95" }}>{score}</p>
          <Badge variant="outline" className={`mt-2 text-sm px-3 py-0.5 ${gradeBadge(grade)}`}>Grade {grade}</Badge>
          <p className="text-xs text-muted-foreground mt-3 max-w-[200px]">
            {m.selfSustaining
              ? "Agent is self-sustaining with positive operational efficiency."
              : "Agent is not yet self-sustaining. Optimize costs to improve score."}
          </p>
        </div>

        {/* Optimizations from API */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <h3 className="text-sm font-semibold mb-4">Cost Optimizations</h3>
          {report.optimizations.length > 0 ? (
            <div className="space-y-3">
              {report.optimizations.map((opt) => (
                <div key={opt.id} className="rounded-lg bg-accent/30 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{opt.category}</p>
                    <Badge variant="outline" className="text-[9px]">-{opt.savingsPercent}%</Badge>
                    {opt.realData && <Badge variant="outline" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Real</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{opt.recommendation}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-accent/30 p-4">
              <p className="text-sm font-medium mb-1">No optimizations needed</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Agent is already operating at optimal efficiency.</p>
            </div>
          )}
        </div>

        {/* Financial Report from API */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
            <h3 className="text-sm font-semibold">Financial Report</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Total Revenue", value: `$${m.totalRevenue.toFixed(6)}` },
              { label: "Total Costs", value: `$${m.totalCosts.toFixed(6)}` },
              { label: "Net Profit", value: `$${m.netProfit.toFixed(6)}` },
              { label: "Burn Rate", value: `$${m.burnRate.toFixed(6)}/hr` },
              { label: "Runway", value: m.runwayHours > 9000 ? "Infinite" : `${m.runwayHours.toFixed(0)}h` },
              { label: "Cheapest Chain", value: report.cheapestChain },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{r.label}</span>
                <span className="text-xs font-medium tabular-nums">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gas Prices from API */}
      {report.gasPrices.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="text-sm font-semibold">Live Gas Prices by Chain</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-5 py-2 font-medium">Chain</th>
                  <th className="text-center px-3 py-2 font-medium">Gas (Gwei)</th>
                  <th className="text-center px-3 py-2 font-medium">Base Fee</th>
                  <th className="text-center px-3 py-2 font-medium">Priority</th>
                  <th className="text-center px-5 py-2 font-medium">Cost Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {report.gasPrices
                  .sort((a, b) => a.gasPriceGwei - b.gasPriceGwei)
                  .map((g) => {
                    const costGrade = g.gasPriceGwei === 0 ? "A+" : g.gasPriceGwei < 0.01 ? "A" : g.gasPriceGwei < 0.05 ? "B" : "C";
                    return (
                      <tr key={g.chainId} className="hover:bg-accent/30 transition-colors">
                        <td className="px-5 py-2.5 text-xs font-medium">{g.chainName}</td>
                        <td className="px-3 py-2.5 text-center text-xs font-mono tabular-nums text-muted-foreground">{formatGwei(g.gasPriceGwei)}</td>
                        <td className="px-3 py-2.5 text-center text-xs font-mono tabular-nums text-muted-foreground">{g.baseFeeGwei !== undefined ? formatGwei(g.baseFeeGwei) : "-"}</td>
                        <td className="px-3 py-2.5 text-center text-xs font-mono tabular-nums text-muted-foreground">{g.priorityFeeGwei !== undefined ? formatGwei(g.priorityFeeGwei) : "-"}</td>
                        <td className="px-5 py-2.5 text-center">
                          <Badge variant="outline" className={`text-[9px] ${gradeBadge(costGrade)}`}>{costGrade}</Badge>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
