import { useState } from "react";
import { demoLendingPosition, demoContracts } from "@/lib/demo-data";
import { useFetch, API_BASE } from "@/hooks/useFetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import CopyButton from "@/components/shared/CopyButton";
import { ExternalLink, ArrowRightLeft, Landmark, FileCheck, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

/* ---- Real API shapes ---- */
interface RealPosition {
  protocol: string;
  chain: string;
  supplied: number;
  borrowed: number;
  apy: number;
  healthFactor: number;
  lastUpdated: string;
}

interface RealLendingData {
  positions: RealPosition[];
  lendingAvailable: boolean;
  currentPosition?: {
    asset: string;
    chain: string;
    supplied: string;
    earned: string;
    apy: number;
    principal: number;
    currentAPY: number;
    accruedInterest: number;
  };
}

interface RealYieldSummary {
  summary: {
    position: { principal: number; accruedInterest: number; currentAPY: number; totalValue: number };
    projections: { days7: number; days30: number; days90: number; days365: number };
  };
}

interface RealProofBundle {
  generatedAt: string;
  walletAddress: string;
  network: string;
  steps: { step: string; status: string; txHash?: string; etherscanUrl?: string; error?: string }[];
  summary: { total: number; succeeded: number; failed: number };
}

const demoYield: RealYieldSummary = {
  summary: {
    position: { principal: 500, accruedInterest: 3.42, currentAPY: 4.2, totalValue: 503.42 },
    projections: { days7: 0.40, days30: 1.72, days90: 5.16, days365: 21.0 },
  },
};

const demoProof: RealProofBundle | null = null;

export default function DeFi() {
  const { data: lendingData, loading: lendingLoading, isDemo: isLendingDemo } = useFetch<RealLendingData>("/api/strategies/lending/positions", {
    positions: [], lendingAvailable: false,
  });
  const { data: yieldData, loading: yieldLoading, isDemo: isYieldDemo } = useFetch<RealYieldSummary>("/api/lending/yield-summary", demoYield);
  const { data: proofData, loading: proofLoading, isDemo: isProofDemo, refetch: refetchProof } = useFetch<RealProofBundle | null>("/api/proof/bundle", demoProof);
  const pageLoading = lendingLoading || yieldLoading;

  const [swapFrom, setSwapFrom] = useState("USDT");
  const [swapTo, setSwapTo] = useState("ETH");
  const [swapAmount, setSwapAmount] = useState("100");

  /* Derive display values */
  const pos = !isLendingDemo && lendingData.currentPosition;
  const supplied = pos ? `${parseFloat(pos.supplied).toFixed(2)} ${pos.asset}` : demoLendingPosition.supplied;
  const apy = pos ? `${pos.currentAPY.toFixed(2)}%` : demoLendingPosition.apy;
  const earned = pos ? `${pos.accruedInterest.toFixed(6)} ${pos.asset}` : demoLendingPosition.earned;

  const proj = !isYieldDemo ? yieldData.summary.projections : null;
  const projections = proj
    ? { "7d": `$${proj.days7.toFixed(4)}`, "30d": `$${proj.days30.toFixed(4)}`, "90d": `$${proj.days90.toFixed(4)}`, "365d": `$${proj.days365.toFixed(4)}` }
    : demoLendingPosition.projections;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">DeFi Integration</h1>
        <p className="text-sm text-muted-foreground mt-1">Aave lending, cross-chain swaps, and verified proofs.</p>
      </div>

      {pageLoading && (
        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          {[1, 2].map((n) => (
            <div key={n} className="rounded-xl border border-border/50 bg-card/50 p-5 animate-pulse">
              <div className="h-4 w-1/3 bg-muted rounded mb-4" />
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><div className="h-2.5 w-16 bg-muted/60 rounded mb-2" /><div className="h-6 w-24 bg-muted rounded" /></div>
                <div><div className="h-2.5 w-12 bg-muted/60 rounded mb-2" /><div className="h-6 w-16 bg-muted rounded" /></div>
              </div>
              <div className="h-3 w-full bg-muted/40 rounded mt-4" />
            </div>
          ))}
        </div>
      )}
      {!pageLoading && <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Aave Card */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Landmark className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Aave V3 Position</h3>
            {!isLendingDemo && <Badge variant="outline" className="text-[8px] py-0 px-1 border-emerald-500/40 text-emerald-400">LIVE</Badge>}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Supplied</p>
              <p className="text-lg font-bold">{supplied}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">APY</p>
              <p className="text-lg font-bold text-success">{apy}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Earned</p>
              <p className="text-sm font-medium text-success">{earned}</p>
            </div>
          </div>

          {/* All positions table (live only) */}
          {!isLendingDemo && lendingData.positions.length > 1 && (
            <div className="border-t border-border/30 pt-3 mb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">All Positions</p>
              <div className="space-y-1.5">
                {lendingData.positions.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-secondary/30 rounded-md px-2.5 py-1.5">
                    <span>{p.protocol} ({p.chain})</span>
                    <span className="font-mono">{p.supplied} supplied · {p.apy.toFixed(2)}% APY</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border/30 pt-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Yield Projections</p>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(projections).map(([period, value]) => (
                <div key={period} className="text-center bg-secondary/30 rounded-md py-2">
                  <p className="text-xs font-medium">{value}</p>
                  <p className="text-[10px] text-muted-foreground">{period}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Swap Card */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <ArrowRightLeft className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Swap</h3>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">From</Label>
                <Select value={swapFrom} onValueChange={setSwapFrom}>
                  <SelectTrigger className="mt-1 bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">To</Label>
                <Select value={swapTo} onValueChange={setSwapTo}>
                  <SelectTrigger className="mt-1 bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="SOL">SOL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Amount</Label>
              <Input value={swapAmount} onChange={(e) => setSwapAmount(e.target.value)} type="number" className="mt-1 bg-background" />
            </div>
            <div className="bg-secondary/30 rounded-md p-2.5 text-xs text-muted-foreground">
              Quote: {swapAmount} {swapFrom} ≈ {(Number(swapAmount) * 0.00054).toFixed(4)} {swapTo}
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={async () => {
              try {
                const res = await fetch(`${API_BASE}/api/swap/quote`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ from: swapFrom, to: swapTo, amount: swapAmount })
                });
                const data = await res.json();
                toast.success(`Swap quote: ${JSON.stringify(data).slice(0, 100)}`);
              } catch (err) {
                toast.error(`Swap failed: ${err instanceof Error ? err.message : "Unknown error"}`);
              }
            }}>
              Execute Swap
            </Button>
          </div>
        </div>
      </div>}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Contracts */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="text-sm font-semibold">Contracts</h3>
          </div>
          <div className="divide-y divide-border/30">
            {demoContracts.map((c) => (
              <div key={c.name} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <span className="text-sm">{c.name}</span>
                  <p className="text-xs text-muted-foreground font-mono">{c.address.slice(0, 10)}...{c.address.slice(-6)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <CopyButton text={c.address} />
                  <a href={`https://sepolia.etherscan.io/address/${c.address}`} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-accent rounded-md transition-colors">
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proof Bundle */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileCheck className="h-5 w-5 text-success" />
            <h3 className="text-sm font-semibold">Proof Verification</h3>
            {!isProofDemo && proofData && <Badge variant="outline" className="text-[8px] py-0 px-1 border-emerald-500/40 text-emerald-400">LIVE</Badge>}
          </div>

          {!isProofDemo && proofData ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                <span>Network: {proofData.network}</span>
                <span>{proofData.summary.succeeded}/{proofData.summary.total} passed</span>
              </div>
              <div className="space-y-2">
                {proofData.steps.map((step) => (
                  <div key={step.step} className="flex items-start gap-2 text-xs bg-secondary/30 rounded-md px-3 py-2">
                    {step.status === "success" ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <span className="font-medium">{step.step}</span>
                      {step.txHash && (
                        <a
                          href={step.etherscanUrl || `https://sepolia.etherscan.io/tx/${step.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-[10px] font-mono text-primary truncate hover:underline"
                        >
                          {step.txHash.slice(0, 16)}...{step.txHash.slice(-8)}
                        </a>
                      )}
                      {step.error && <p className="text-[10px] text-red-400/70 truncate">{step.error.slice(0, 80)}...</p>}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/60 font-mono">Wallet: {proofData.walletAddress}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-4">
              <p className="text-xs text-muted-foreground mb-4">Verify DeFi transactions on-chain</p>
              <Button variant="outline" size="sm" onClick={async () => {
                try {
                  const res = await fetch(`${API_BASE}/api/proof/generate-all`, { method: 'POST' });
                  const data = await res.json();
                  toast.success(`Proof generated: ${data.steps?.length || 0} steps`);
                  refetchProof();
                } catch (err) {
                  toast.error(`Proof generation failed: ${err instanceof Error ? err.message : "Unknown error"}`);
                }
              }}>
                Verify Proof Bundle
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
