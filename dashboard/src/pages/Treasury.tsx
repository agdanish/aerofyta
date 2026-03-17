import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import CountUp from "@/components/shared/CountUp";
import { useFetch } from "@/hooks/useFetch";
import { Landmark, TrendingUp, ShieldCheck, AlertTriangle } from "lucide-react";

/* ---- Real API shapes ---- */
interface RealTreasuryStatus {
  status: {
    totalBalance: number;
    tippingReserve: number;
    yieldDeployed: number;
    gasBuffer: number;
    idleFunds: number;
    lastRebalance: string;
  };
}

interface TreasuryHolding {
  token: string;
  amount: number;
  percent: number;
}

interface RealTreasuryAllocation {
  holdings: TreasuryHolding[];
  target: Record<string, number>;
  needsRebalance: boolean;
  lastRebalanceAt: string | null;
}

interface RealLendingRate {
  asset: string;
  chain: string;
  protocol: string;
  supplyApy: number;
  borrowApy: number;
  totalSupply: string;
}

/* ---- Demo fallbacks ---- */
const demoTreasury: RealTreasuryStatus = {
  status: { totalBalance: 12847.32, tippingReserve: 5395.87, yieldDeployed: 3597.25, gasBuffer: 2569.46, idleFunds: 1284.74, lastRebalance: new Date(Date.now() - 172800000).toISOString() },
};

const demoAllocation: RealTreasuryAllocation = {
  holdings: [
    { token: "USDT", amount: 85, percent: 85 },
    { token: "XAUt", amount: 5, percent: 5 },
    { token: "native", amount: 10, percent: 10 },
  ],
  target: { usdt: 70, xaut: 15, native: 15 },
  needsRebalance: false,
  lastRebalanceAt: null,
};

const demoRates: { rates: RealLendingRate[] } = {
  rates: [
    { asset: "USDT", chain: "Ethereum", protocol: "Aave V3", supplyApy: 1.82, borrowApy: 2.54, totalSupply: "1.6B" },
    { asset: "ETH", chain: "Ethereum", protocol: "Aave V3", supplyApy: 1.65, borrowApy: 2.31, totalSupply: "800M" },
  ],
};

const riskBadge = (r: string) => {
  if (r === "Low") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (r === "Medium") return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  return "bg-red-500/15 text-red-400 border-red-500/30";
};

const relativeTimeAgo = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d} day${d > 1 ? "s" : ""} ago`;
  if (h > 0) return `${h} hour${h > 1 ? "s" : ""} ago`;
  return `${Math.floor(ms / 60000)} min ago`;
};

const riskLevel = (apy: number) => apy > 5 ? "High" : apy > 2.5 ? "Medium" : "Low";

export default function Treasury() {
  const { data: treasuryData, isDemo: isTreasuryDemo } = useFetch<RealTreasuryStatus>("/api/treasury/status", demoTreasury);
  const { data: allocData, isDemo: isAllocDemo } = useFetch<RealTreasuryAllocation>("/api/economics/treasury/allocation", demoAllocation);
  const { data: ratesData, isDemo: isRatesDemo } = useFetch<{ rates: RealLendingRate[] }>("/api/lending/rates", demoRates);

  const ts = treasuryData.status;
  const totalValue = ts.totalBalance;
  const sustainPct = totalValue > 0 ? Math.min(100, Math.round(((ts.tippingReserve + ts.gasBuffer) / totalValue) * 100)) : 0;

  /* Map holdings to allocation display */
  const allocationColors: Record<string, string> = { USDT: "bg-primary", XAUt: "bg-yellow-500", native: "bg-blue-500", ETH: "bg-blue-500" };
  const allocation = allocData.holdings.map((h) => ({
    name: h.token,
    pct: h.percent,
    amount: `${h.amount.toFixed(2)}`,
    color: allocationColors[h.token] || "bg-zinc-500",
  }));

  /* Rates for yield table — only top entries with nonzero APY */
  const yields = (ratesData.rates || [])
    .filter((r) => r.supplyApy > 0)
    .slice(0, 8)
    .map((r) => ({
      protocol: r.protocol,
      chain: r.chain,
      apy: r.supplyApy,
      risk: riskLevel(r.supplyApy),
      deployed: r.totalSupply,
      earned: `${r.supplyApy.toFixed(2)}%`,
    }));

  const isLive = !isTreasuryDemo;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Treasury Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fund allocation, yield strategies, and sustainability metrics.
          {isLive && <Badge variant="outline" className="ml-2 text-[8px] py-0 px-1 border-emerald-500/40 text-emerald-400">LIVE</Badge>}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Balance", value: Math.round(totalValue * 1000), divisor: 1000, prefix: "$", icon: Landmark },
          { label: "Tipping Reserve", value: Math.round(ts.tippingReserve * 1000), divisor: 1000, prefix: "$", icon: TrendingUp },
          { label: "Sustainability", value: sustainPct, suffix: "%", icon: ShieldCheck },
          { label: "Gas Buffer", value: Math.round(ts.gasBuffer * 10000), divisor: 10000, prefix: "$", icon: AlertTriangle },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-5">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            </div>
            <div className="text-2xl font-bold tabular-nums tracking-tight">
              {s.prefix}<CountUp target={s.value} />{s.divisor ? <span className="text-base text-muted-foreground/40"> /{s.divisor}</span> : null}{s.suffix}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Allocation */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Fund Allocation</h3>
            {allocData.needsRebalance && <Badge variant="outline" className="text-[9px] bg-yellow-500/15 text-yellow-400 border-yellow-500/30">Rebalance Needed</Badge>}
          </div>
          <div className="flex h-4 rounded-full overflow-hidden mb-4">
            {allocation.map((a) => (
              <div key={a.name} className={`${a.color}`} style={{ width: `${a.pct}%` }} />
            ))}
          </div>
          <div className="space-y-2.5">
            {allocation.map((a) => (
              <div key={a.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${a.color}`} />
                  <span className="text-xs">{a.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{a.amount}</span>
                  <span className="text-[10px] tabular-nums text-muted-foreground/60 w-8 text-right">{a.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy */}
        <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card/50 p-5">
          <h3 className="text-sm font-semibold mb-4">Active Strategy</h3>
          <div className="rounded-lg bg-accent/30 p-4 mb-4">
            <p className="text-sm font-medium mb-1">Conservative Growth</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Maintain 60% in stable assets, allocate 28% to low-risk yield protocols, keep 12% liquid for operational needs.
              Auto-rebalance when allocation drifts &gt;5% from target. Maximum single-protocol exposure: 40%.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Rebalance Interval", value: "Weekly" },
              { label: "Last Rebalance", value: ts.lastRebalance ? relativeTimeAgo(ts.lastRebalance) : "Never" },
              { label: "Idle Funds", value: `$${ts.idleFunds.toFixed(4)}` },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Yield Opportunities */}
      <div className="rounded-xl border border-border/50 bg-card/50">
        <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Yield Opportunities</h3>
          {!isRatesDemo && <Badge variant="outline" className="text-[8px] py-0 px-1 border-emerald-500/40 text-emerald-400">LIVE RATES</Badge>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30 text-[11px] text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-5 py-2 font-medium">Protocol</th>
                <th className="text-left px-3 py-2 font-medium">Chain</th>
                <th className="text-center px-3 py-2 font-medium">APY</th>
                <th className="text-center px-3 py-2 font-medium">Risk</th>
                <th className="text-right px-3 py-2 font-medium">Total Supply</th>
                <th className="text-right px-5 py-2 font-medium">Borrow APY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {yields.map((y, i) => (
                <tr key={i} className="hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-2.5 font-medium text-xs">{y.protocol}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{y.chain}</td>
                  <td className="px-3 py-2.5 text-center text-xs font-mono tabular-nums">{y.apy.toFixed(2)}%</td>
                  <td className="px-3 py-2.5 text-center">
                    <Badge variant="outline" className={`text-[9px] ${riskBadge(y.risk)}`}>{y.risk}</Badge>
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs text-muted-foreground">{y.deployed}</td>
                  <td className="px-5 py-2.5 text-right text-xs font-medium" style={{ color: "#50AF95" }}>{y.earned}</td>
                </tr>
              ))}
              {yields.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-6 text-center text-xs text-muted-foreground">No yield data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
