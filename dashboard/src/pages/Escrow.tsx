import { useState, useEffect, useMemo } from "react";
import { demoEscrows, demoEscrowStats } from "@/lib/demo-data";
import { useFetch } from "@/hooks/useFetch";
import CountUp from "@/components/shared/CountUp";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lock, Plus, Key, RotateCcw } from "lucide-react";
import { toast } from "sonner";

function Countdown({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [remaining]);
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return <span className="font-mono tabular-nums">{h}h {m}m {s}s</span>;
}

const statusStyle: Record<string, string> = {
  locked: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  claimed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  released: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  refunded: "bg-zinc-400/15 text-zinc-300 border-zinc-400/30",
  expired: "bg-red-500/15 text-red-400 border-red-500/30",
};

/* ── chain label helper ── */
const chainLabel: Record<string, string> = {
  "ethereum-sepolia": "Ethereum",
  "ton-testnet": "TON",
  "tron-nile": "Tron",
  "solana-devnet": "Solana",
  "bitcoin-testnet": "Bitcoin",
  "plasma": "Plasma",
  "stable": "Stable",
};

/* ── API response type ── */
interface ApiEscrow {
  id: string;
  sender: string;
  recipient: string;
  amount: string;
  token: string;
  chainId: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  releaseCondition?: string;
  autoReleaseHours?: number;
  hashLock?: string;
  timelock?: number;
  htlcStatus?: string;
  releasedAt?: string;
  txHash?: string;
  memo?: string;
}

/* normalised escrow row */
interface EscrowRow {
  id: string;
  recipient: string;
  amount: string;
  chain: string;
  status: string;
  timeLeft: number;
  createdAt: string;
}

export default function Escrow() {
  const { data: raw, isDemo } = useFetch<ApiEscrow[] | typeof demoEscrows>(
    "/api/escrow",
    demoEscrows,
  );
  const [createOpen, setCreateOpen] = useState(false);

  /* map API → EscrowRow[] */
  const escrows: EscrowRow[] = useMemo(() => {
    if (isDemo || !Array.isArray(raw) || raw.length === 0) return demoEscrows;

    // Check if first item has API shape (has chainId) vs demo shape (has chain)
    const first = raw[0] as Record<string, unknown>;
    if (!first.chainId) return raw as unknown as typeof demoEscrows;

    return (raw as ApiEscrow[]).map((e) => {
      const truncAddr = e.recipient.length > 14
        ? `${e.recipient.slice(0, 6)}...${e.recipient.slice(-4)}`
        : e.recipient;

      const expiresAt = new Date(e.expiresAt).getTime();
      const now = Date.now();
      const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));

      // Map API status: "released" → "claimed" for display
      let displayStatus = e.status;
      if (displayStatus === "released") displayStatus = "claimed";

      const createdDate = new Date(e.createdAt);
      const diffMs = now - createdDate.getTime();
      const diffH = Math.floor(diffMs / 3600000);
      const createdLabel = diffH < 1 ? "< 1h ago" : `${diffH}h ago`;

      return {
        id: e.id,
        recipient: truncAddr,
        amount: e.amount,
        chain: chainLabel[e.chainId] ?? e.chainId,
        status: displayStatus,
        timeLeft: displayStatus === "locked" ? secondsLeft : 0,
        createdAt: createdLabel,
      };
    });
  }, [raw, isDemo]);

  /* compute stats from real data */
  const stats = useMemo(() => {
    if (isDemo || escrows === demoEscrows) return demoEscrowStats;
    return {
      created: escrows.length,
      claimed: escrows.filter((e) => e.status === "claimed").length,
      refunded: escrows.filter((e) => e.status === "refunded").length,
      locked: escrows.filter((e) => e.status === "locked").length,
    };
  }, [escrows, isDemo]);

  const statCards = [
    { label: "Created", value: stats.created },
    { label: "Claimed", value: stats.claimed },
    { label: "Refunded", value: stats.refunded },
    { label: "Locked", value: stats.locked },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Smart Escrow</h1>
          <p className="text-sm text-muted-foreground mt-1">Hash-locked. Time-bound. Trustless.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90"><Plus className="h-3.5 w-3.5 mr-2" />Create Escrow</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Create HTLC Escrow</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label className="text-xs">Recipient</Label><Input placeholder="0x..." className="mt-1 bg-background" /></div>
              <div><Label className="text-xs">Amount (USDT)</Label><Input type="number" placeholder="50.00" className="mt-1 bg-background" /></div>
              <div>
                <Label className="text-xs">Timelock</Label>
                <Select defaultValue="7200">
                  <SelectTrigger className="mt-1 bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3600">1 hour</SelectItem>
                    <SelectItem value="7200">2 hours</SelectItem>
                    <SelectItem value="14400">4 hours</SelectItem>
                    <SelectItem value="86400">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => { toast.success("Escrow created — secret copied to clipboard"); setCreateOpen(false); }}>
                Create Escrow
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-4 text-center">
            <CountUp target={s.value} className="text-2xl font-bold tabular-nums" />
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Escrow Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {escrows.map((esc) => (
          <div key={esc.id} className="rounded-xl border border-border/50 bg-card/50 p-5 hover:border-border transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{esc.id}</span>
              </div>
              <Badge variant="outline" className={`text-[10px] ${statusStyle[esc.status] || ""}`}>{esc.status}</Badge>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground mb-4">
              <div className="flex justify-between"><span>Recipient</span><code className="font-mono">{esc.recipient}</code></div>
              <div className="flex justify-between"><span>Amount</span><span className="font-medium text-foreground">{esc.amount} USDT</span></div>
              <div className="flex justify-between"><span>Chain</span><span>{esc.chain}</span></div>
              {esc.status === "locked" && (
                <div className="flex justify-between items-center">
                  <span>Time Left</span>
                  <span className="text-yellow-400 text-xs"><Countdown seconds={esc.timeLeft} /></span>
                </div>
              )}
            </div>
            {esc.status === "locked" && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => toast.success(`Escrow ${esc.id} claimed`)}>
                  <Key className="h-3 w-3 mr-1" />Claim
                </Button>
                <Button size="sm" variant="outline" className="flex-1 h-8 text-xs text-muted-foreground" onClick={() => toast.info(`Escrow ${esc.id} refunded`)}>
                  <RotateCcw className="h-3 w-3 mr-1" />Refund
                </Button>
              </div>
            )}
          </div>
        ))}
        {escrows.length === 0 && (
          <div className="col-span-full text-center py-12 text-sm text-muted-foreground">No escrows found.</div>
        )}
      </div>
    </div>
  );
}
