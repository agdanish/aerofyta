import { useState } from "react";
import CountUp from "@/components/shared/CountUp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import {
  Wallet, TrendingUp, TrendingDown, AlertTriangle, Zap,
  DollarSign, BarChart3, PieChart as PieIcon, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

// ── Realistic demo data ──────────────────────────────────────────────

const chainAllocations = [
  { chain: "Ethereum", symbol: "ETH", value: 18420, pct: 28.3, color: "#627EEA" },
  { chain: "Polygon", symbol: "MATIC", value: 12150, pct: 18.7, color: "#8247E5" },
  { chain: "TON", symbol: "TON", value: 9870, pct: 15.2, color: "#0098EA" },
  { chain: "Arbitrum", symbol: "ARB", value: 7340, pct: 11.3, color: "#28A0F0" },
  { chain: "Optimism", symbol: "OP", value: 5210, pct: 8.0, color: "#FF0420" },
  { chain: "Tron", symbol: "TRX", value: 4680, pct: 7.2, color: "#FF060A" },
  { chain: "Avalanche", symbol: "AVAX", value: 3120, pct: 4.8, color: "#E84142" },
  { chain: "BNB Chain", symbol: "BNB", value: 2540, pct: 3.9, color: "#F3BA2F" },
  { chain: "Base", symbol: "BASE", value: 1670, pct: 2.6, color: "#0052FF" },
];

const totalPortfolioValue = chainAllocations.reduce((s, c) => s + c.value, 0);

const portfolioHistory = [
  { day: "Mar 17", value: 61200 },
  { day: "Mar 18", value: 62450 },
  { day: "Mar 19", value: 60800 },
  { day: "Mar 20", value: 63100 },
  { day: "Mar 21", value: 64300 },
  { day: "Mar 22", value: 63750 },
  { day: "Mar 23", value: 65000 },
];

const riskMetrics = [
  { label: "Sharpe Ratio", value: "1.84", status: "good", description: "Risk-adjusted return above 1.5 is excellent" },
  { label: "Max Drawdown", value: "-4.2%", status: "good", description: "Peak-to-trough decline within safe range" },
  { label: "Volatility (7d)", value: "2.1%", status: "good", description: "Annualized: ~11.0% — moderate" },
  { label: "Beta vs USDT", value: "0.03", status: "good", description: "Near-zero correlation, stable allocation" },
  { label: "Value at Risk (95%)", value: "-$1,302", status: "warning", description: "Max daily loss at 95% confidence" },
  { label: "Sortino Ratio", value: "2.47", status: "good", description: "Downside risk-adjusted return is strong" },
];

const yieldSummary = [
  { protocol: "Aave v3 (Polygon)", asset: "USDT", apy: 4.2, deposited: 8400, earned: 29.4 },
  { protocol: "Aave v3 (Arbitrum)", asset: "USDT", apy: 3.8, deposited: 5200, earned: 16.5 },
  { protocol: "Aave v3 (Optimism)", asset: "USDT", apy: 5.1, deposited: 3100, earned: 13.2 },
];

const gasAnalysis = [
  { chain: "Polygon", totalGas: 0.42, txCount: 187, avgPerTx: 0.002 },
  { chain: "TON", totalGas: 0.0, txCount: 94, avgPerTx: 0.0 },
  { chain: "Arbitrum", totalGas: 1.84, txCount: 63, avgPerTx: 0.029 },
  { chain: "Optimism", totalGas: 1.12, txCount: 41, avgPerTx: 0.027 },
  { chain: "Ethereum", totalGas: 18.60, txCount: 12, avgPerTx: 1.55 },
  { chain: "BNB Chain", totalGas: 0.87, txCount: 38, avgPerTx: 0.023 },
  { chain: "Avalanche", totalGas: 0.95, txCount: 22, avgPerTx: 0.043 },
  { chain: "Tron", totalGas: 0.54, txCount: 45, avgPerTx: 0.012 },
  { chain: "Base", totalGas: 0.38, txCount: 29, avgPerTx: 0.013 },
];

const totalGasSpent = gasAnalysis.reduce((s, g) => s + g.totalGas, 0);
const cheapestChain = gasAnalysis.filter(g => g.txCount > 0).sort((a, b) => a.avgPerTx - b.avgPerTx)[0];

const rebalancingRecs = [
  { chain: "Ethereum", current: 28.3, target: 20.0, action: "Reduce", delta: -8.3, severity: "high" as const },
  { chain: "TON", current: 15.2, target: 20.0, action: "Increase", delta: +4.8, severity: "medium" as const },
  { chain: "Base", current: 2.6, target: 8.0, action: "Increase", delta: +5.4, severity: "medium" as const },
  { chain: "Avalanche", current: 4.8, target: 8.0, action: "Increase", delta: +3.2, severity: "low" as const },
  { chain: "Polygon", current: 18.7, target: 15.0, action: "Reduce", delta: -3.7, severity: "low" as const },
];

// ── Component ────────────────────────────────────────────────────────

export default function PortfolioAnalytics() {
  const [optimizing, setOptimizing] = useState(false);

  const handleOptimize = () => {
    setOptimizing(true);
    toast.info("Running portfolio optimization across 9 chains...");
    setTimeout(() => {
      setOptimizing(false);
      toast.success("Portfolio rebalancing plan generated. 3 cross-chain swaps recommended.");
    }, 2500);
  };

  const totalYieldEarned = yieldSummary.reduce((s, y) => s + y.earned, 0);
  const weekChange = portfolioHistory[portfolioHistory.length - 1].value - portfolioHistory[0].value;
  const weekChangePct = ((weekChange / portfolioHistory[0].value) * 100).toFixed(1);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cross-chain allocation, risk metrics, yield tracking, and optimization.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleOptimize}
          disabled={optimizing}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${optimizing ? "animate-spin" : ""}`} />
          {optimizing ? "Optimizing..." : "Optimize Portfolio"}
        </Button>
      </div>

      {/* Big number + top stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          className="rounded-xl border border-border bg-card p-5 relative overflow-hidden sm:col-span-2 lg:col-span-1"
          style={{ borderTop: "2px solid #FF4E00", background: "linear-gradient(180deg, rgba(255,78,0,0.04) 0%, hsl(var(--card)) 60%)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4" strokeWidth={1.5} style={{ color: "#FF4E00" }} />
            <p className="text-xs text-muted-foreground font-medium">Total Portfolio Value</p>
          </div>
          <div className="text-3xl font-bold tabular-nums tracking-tight">
            $<CountUp target={totalPortfolioValue} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Across 9 chains</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-1">
            {weekChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" strokeWidth={1.5} />
            )}
            <p className="text-xs text-muted-foreground font-medium">7-Day Change</p>
          </div>
          <div className={`text-2xl font-bold tabular-nums ${weekChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {weekChange >= 0 ? "+" : ""}${Math.abs(weekChange).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{weekChange >= 0 ? "+" : ""}{weekChangePct}% this week</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-yellow-400" strokeWidth={1.5} />
            <p className="text-xs text-muted-foreground font-medium">Yield Income (7d)</p>
          </div>
          <div className="text-2xl font-bold tabular-nums text-emerald-400">
            +$<CountUp target={Math.round(totalYieldEarned * 100) / 100} decimals={2} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">From {yieldSummary.length} Aave positions</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-blue-400" strokeWidth={1.5} />
            <p className="text-xs text-muted-foreground font-medium">Total Gas Spent</p>
          </div>
          <div className="text-2xl font-bold tabular-nums">
            $<CountUp target={Math.round(totalGasSpent * 100) / 100} decimals={2} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Cheapest: {cheapestChain.chain} (${cheapestChain.avgPerTx.toFixed(3)}/tx)
          </p>
        </div>
      </div>

      {/* Charts row: Pie + Line */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Chain Allocation Pie */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
            <h3 className="text-sm font-semibold">Chain Allocation</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chainAllocations}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {chainAllocations.map((entry) => (
                      <Cell key={entry.chain} fill={entry.color} />
                    ))}
                  </Pie>
                  <RTooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number, _name: string, props: { payload: typeof chainAllocations[number] }) => [
                      `$${value.toLocaleString()} (${props.payload.pct}%)`,
                      props.payload.chain,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5 text-xs">
              {chainAllocations.map((c) => (
                <div key={c.chain} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-muted-foreground flex-1">{c.chain}</span>
                  <span className="font-mono tabular-nums">{c.pct}%</span>
                  <span className="font-mono tabular-nums text-muted-foreground w-16 text-right">${c.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7-day Performance Line */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
            <h3 className="text-sm font-semibold">7-Day Portfolio Performance</h3>
            <Badge variant="outline" className="ml-auto text-[10px] text-emerald-400 border-emerald-500/30">
              +{weekChangePct}%
            </Badge>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={portfolioHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  domain={["dataMin - 1000", "dataMax + 1000"]}
                />
                <RTooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Portfolio Value"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#FF4E00"
                  strokeWidth={2.5}
                  dot={{ fill: "#FF4E00", r: 3.5, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#FF4E00" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
          <h3 className="text-sm font-semibold">Risk Metrics</h3>
          <Badge variant="outline" className="ml-auto text-[10px]">Updated live</Badge>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {riskMetrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-border/30 bg-background/50 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{m.label}</span>
                <div className={`h-2 w-2 rounded-full ${m.status === "good" ? "bg-emerald-400" : "bg-yellow-400"}`} />
              </div>
              <div className="text-lg font-bold tabular-nums">{m.value}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Yield + Gas side by side */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Yield Income */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-yellow-400" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold">Yield Income (Aave)</h3>
            <Badge variant="outline" className="ml-auto text-[10px] text-emerald-400 border-emerald-500/30">
              +${totalYieldEarned.toFixed(2)} earned
            </Badge>
          </div>
          <div className="space-y-3">
            {yieldSummary.map((y) => (
              <div key={y.protocol} className="rounded-lg border border-border/30 bg-background/50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{y.protocol}</span>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">{y.apy}% APY</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Deposited: ${y.deposited.toLocaleString()} {y.asset}</span>
                  <span className="text-emerald-400 font-mono">+${y.earned.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gas Cost Analysis */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
            <h3 className="text-sm font-semibold">Gas Cost Analysis</h3>
          </div>
          <div className="h-48 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gasAnalysis.sort((a, b) => b.totalGas - a.totalGas)}>
                <XAxis dataKey="chain" tick={{ fontSize: 9, fill: "#888" }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <RTooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Total Gas"]}
                />
                <Bar dataKey="totalGas" fill="#FF4E00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Total gas: <span className="font-mono text-foreground">${totalGasSpent.toFixed(2)}</span> across {gasAnalysis.reduce((s, g) => s + g.txCount, 0)} transactions</p>
            <p>Cheapest chain: <span className="text-emerald-400 font-medium">{cheapestChain.chain}</span> at ${cheapestChain.avgPerTx.toFixed(3)}/tx avg</p>
          </div>
        </div>
      </div>

      {/* Rebalancing Recommendations */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
          <h3 className="text-sm font-semibold">Rebalancing Recommendations</h3>
          <Badge variant="outline" className="ml-auto text-[10px]">{rebalancingRecs.length} actions suggested</Badge>
        </div>
        <div className="space-y-2">
          {rebalancingRecs.map((r) => (
            <div
              key={r.chain}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                r.severity === "high"
                  ? "border-red-500/30 bg-red-500/5"
                  : r.severity === "medium"
                  ? "border-yellow-500/30 bg-yellow-500/5"
                  : "border-border/30 bg-background/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={`text-[9px] ${
                    r.action === "Reduce" ? "text-red-400 border-red-500/30" : "text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  {r.action}
                </Badge>
                <span className="text-sm font-medium">{r.chain}</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-muted-foreground">
                  Current: <span className="font-mono">{r.current}%</span>
                </span>
                <span className="text-muted-foreground">
                  Target: <span className="font-mono">{r.target}%</span>
                </span>
                <span className={`font-mono font-medium ${r.delta > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {r.delta > 0 ? "+" : ""}{r.delta.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">
          Recommendations based on equal-weight target with risk-adjusted chain scoring. Agent auto-rebalances when deviation exceeds 10%.
        </p>
      </div>
    </div>
  );
}
