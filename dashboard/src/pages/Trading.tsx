import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import CountUp from "@/components/shared/CountUp";
import { useFetch } from "@/hooks/useFetch";
import { CandlestickChart, TrendingUp, TrendingDown, Play, Pause, Check, X, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const API = import.meta.env.PROD ? "" : "http://localhost:3001";

/* ── Demo fallback data ── */
const demoStats = {
  totalTraders: 6, activeTraders: 4, totalTrades: 238, overallWinRate: 78,
  totalPnl: 189, totalCapital: 1000, dataSource: "demo",
  recentConsensus: null as null | Record<string, unknown>,
};

const demoTraders = {
  traders: [
    { id: "T-001", name: "Momentum-Alpha", strategy: "momentum", status: "active", totalTrades: 47, winRate: 82, pnl: 127.45, allocation: 20, riskLevel: "moderate" },
    { id: "T-002", name: "MeanRev-Beta", strategy: "mean_reversion", status: "active", totalTrades: 23, winRate: 91, pnl: 43.21, allocation: 15, riskLevel: "conservative" },
    { id: "T-003", name: "ArbBot-Gamma", strategy: "arbitrage", status: "active", totalTrades: 12, winRate: 75, pnl: 18.9, allocation: 25, riskLevel: "conservative" },
    { id: "T-004", name: "Scalper-Zeta", strategy: "scalping", status: "paused", totalTrades: 156, winRate: 64, pnl: -3.12, allocation: 10, riskLevel: "aggressive" },
  ],
};

const demoTrades = {
  trades: [
    { id: "t1", pair: "ETH/USDT", side: "sell", entryPrice: 3180, pnl: 6.5, status: "open", openedAt: new Date().toISOString(), chainId: "ethereum", traderName: "Momentum-Alpha" },
    { id: "t2", pair: "USDT/USDC", side: "buy", entryPrice: 1.0001, pnl: 0.02, status: "closed", openedAt: new Date().toISOString(), chainId: "polygon", traderName: "ArbBot-Gamma" },
    { id: "t3", pair: "SOL/USDT", side: "sell", entryPrice: 178, pnl: -3.0, status: "open", openedAt: new Date().toISOString(), chainId: "solana", traderName: "Scalper-Zeta" },
  ],
};

const demoDexVolumes = {
  volumes: { "Uniswap V3": 2100000000, "PancakeSwap": 890000000, "Curve DEX": 520000000, "1inch": 780000000, "SushiSwap": 340000000, "Others": 370000000 } as Record<string, number>,
};

const demoConsensus = {
  consensus: [] as Array<Record<string, unknown>>,
  latest: null as null | Record<string, unknown>,
};

/* ── Helpers ── */
const stratBadge = (t: string) => {
  if (t === "momentum") return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (t === "mean_reversion") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (t === "arbitrage") return "bg-purple-500/15 text-purple-400 border-purple-500/30";
  if (t === "market_making") return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
  if (t === "trend_following") return "bg-orange-500/15 text-orange-400 border-orange-500/30";
  return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
};

function fmtVol(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function fmtTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}

export default function Trading() {
  const { data: stats, isDemo: isDemoStats } = useFetch("/api/advanced/trading/stats", demoStats);
  const { data: tradersData } = useFetch("/api/advanced/trading/traders", demoTraders);
  const { data: tradesData } = useFetch("/api/advanced/trading/trades?limit=10", demoTrades);
  const { data: dexData } = useFetch("/api/advanced/trading/dex-volumes", demoDexVolumes);
  const { data: consensusData } = useFetch("/api/advanced/trading/consensus?limit=5", demoConsensus);

  const traders = tradersData.traders ?? [];
  const trades = (tradesData.trades ?? []).slice(0, 10);
  const consensus = (consensusData.consensus ?? []).slice(0, 5);

  // DEX volumes: convert object to sorted array
  const dexVolumes = Object.entries(dexData.volumes ?? {})
    .map(([name, vol]) => ({ name, volume: vol as number }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 8);
  const totalDexVol = dexVolumes.reduce((s, d) => s + d.volume, 0);

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">DeFi Strategies & Predictions</h1>
          <p className="text-sm text-muted-foreground mt-1">Active trading strategies, execution history, and AI-powered market predictions.</p>
        </div>
        {isDemoStats && <Badge variant="outline" className="text-[9px] bg-yellow-500/15 text-yellow-400 border-yellow-500/30">DEMO</Badge>}
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Traders", value: stats.activeTraders ?? 0, icon: CandlestickChart },
          { label: "Total Trades", value: stats.totalTrades ?? 0, icon: BarChart3 },
          { label: "Win Rate", value: Math.round(stats.overallWinRate ?? 0), suffix: "%", icon: TrendingUp },
          { label: "Total P&L", value: Math.round(stats.totalPnl ?? 0), prefix: stats.totalPnl >= 0 ? "+$" : "-$", icon: TrendingDown },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-5">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            </div>
            <div className="text-2xl font-bold tabular-nums tracking-tight">
              {s.prefix}<CountUp target={Math.abs(s.value)} />{s.suffix}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Traders */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="text-sm font-semibold">Traders ({traders.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-5 py-2 font-medium">Name</th>
                  <th className="text-left px-3 py-2 font-medium">Strategy</th>
                  <th className="text-center px-3 py-2 font-medium">Trades</th>
                  <th className="text-right px-3 py-2 font-medium">P&L</th>
                  <th className="text-right px-5 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {traders.map((t) => (
                  <tr key={t.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-2.5 text-xs font-medium">{t.name}</td>
                    <td className="px-3 py-2.5"><Badge variant="outline" className={`text-[9px] ${stratBadge(t.strategy)}`}>{t.strategy}</Badge></td>
                    <td className="px-3 py-2.5 text-center text-xs tabular-nums">{t.totalTrades}</td>
                    <td className={`px-3 py-2.5 text-right text-xs tabular-nums font-mono ${t.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {t.pnl >= 0 ? "+" : ""}{typeof t.pnl === "number" ? `$${t.pnl.toFixed(2)}` : "$0.00"}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={async () => {
                        try {
                          const action = t.status === 'active' ? 'pause' : 'resume';
                          await fetch(`${API}/api/advanced/trading/traders/${t.id}/${action}`, { method: 'POST' });
                          toast.success(`Trader ${action}d`);
                        } catch { toast.error("Failed to update trader"); }
                      }}>
                        {t.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DEX Volumes */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="text-sm font-semibold">DEX Volume (DeFi Llama)</h3>
          </div>
          <div className="divide-y divide-border/20">
            {dexVolumes.map((d) => (
              <div key={d.name} className="px-5 py-2.5 flex items-center gap-3 hover:bg-accent/30 transition-colors">
                <span className="text-xs font-medium flex-1">{d.name}</span>
                <span className="text-xs font-mono tabular-nums text-muted-foreground">{fmtVol(d.volume)}</span>
                <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${totalDexVol ? (d.volume / totalDexVol) * 100 : 0}%`, background: "#FF4E00" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Trade History */}
        <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="text-sm font-semibold">Recent Trades</h3>
          </div>
          <ScrollArea className="h-[220px]">
            <div className="divide-y divide-border/20">
              {trades.map((t) => (
                <div key={t.id} className="px-5 py-2.5 flex items-center gap-3 hover:bg-accent/30 transition-colors">
                  <span className="text-xs font-medium w-20">{t.pair}</span>
                  <Badge variant="outline" className={`text-[9px] ${t.side === "buy" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>{t.side}</Badge>
                  <span className="text-[10px] text-muted-foreground">${typeof t.entryPrice === "number" ? t.entryPrice.toFixed(2) : t.entryPrice}</span>
                  <span className="text-[10px] text-muted-foreground/60 bg-secondary/50 px-1.5 py-0.5 rounded">{t.chainId}</span>
                  <span className={`text-xs font-mono tabular-nums ml-auto ${(t.pnl ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {(t.pnl ?? 0) >= 0 ? "+" : ""}${(t.pnl ?? 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground/60">{fmtTime(t.openedAt)}</span>
                </div>
              ))}
              {trades.length === 0 && <div className="px-5 py-8 text-center text-xs text-muted-foreground">No trades yet</div>}
            </div>
          </ScrollArea>
        </div>

        {/* Consensus / Predictions */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="text-sm font-semibold">Swarm Consensus</h3>
          </div>
          <ScrollArea className="h-[220px]">
            <div className="divide-y divide-border/20">
              {consensus.map((c: Record<string, unknown>, i: number) => {
                const signal = String(c.signal ?? "neutral");
                const pair = String(c.pair ?? "");
                const conf = Number(c.confidenceScore ?? 0);
                const ts = String(c.timestamp ?? "");
                return (
                  <div key={String(c.id ?? i)} className="px-5 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-[9px] ${signal.includes("sell") ? "bg-red-500/15 text-red-400 border-red-500/30" : signal.includes("buy") ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"}`}>
                        {signal}
                      </Badge>
                      <span className="text-xs font-medium">{pair}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{fmtTime(ts)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] tabular-nums text-muted-foreground">Confidence: {conf}%</span>
                      <div className="flex gap-1 ml-auto">
                        <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => toast.success("Signal accepted")}>
                          <Check className="h-3 w-3" style={{ color: "#50AF95" }} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => toast.info("Signal dismissed")}>
                          <X className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {consensus.length === 0 && <div className="px-5 py-8 text-center text-xs text-muted-foreground">No consensus signals yet</div>}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
