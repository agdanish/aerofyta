import { useState, useMemo } from "react";
import { demoTipHistory, demoWallets } from "@/lib/demo-data";
import { useFetch } from "@/hooks/useFetch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Send, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const API_BASE = import.meta.env.PROD ? "" : "http://localhost:3001";

/* ── chain display helpers ── */
const chainLabel: Record<string, string> = {
  "ethereum-sepolia": "Ethereum",
  "ton-testnet": "TON",
  "tron-nile": "Tron",
  "ethereum-sepolia-gasless": "ETH Gasless",
  "ton-testnet-gasless": "TON Gasless",
  "bitcoin-testnet": "Bitcoin",
  "solana-devnet": "Solana",
  "plasma": "Plasma",
  "stable": "Stable",
};

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  failed: "bg-red-500/15 text-red-400 border-red-500/30",
};

const chainColors: Record<string, string> = {
  Ethereum: "bg-[#627EEA]/15 text-[#627EEA] border-[#627EEA]/30",
  Polygon: "bg-[#8247E5]/15 text-[#8247E5] border-[#8247E5]/30",
  TON: "bg-[#0098EA]/15 text-[#0098EA] border-[#0098EA]/30",
  Solana: "bg-[#9945FF]/15 text-[#9945FF] border-[#9945FF]/30",
  Arbitrum: "bg-[#28A0F0]/15 text-[#28A0F0] border-[#28A0F0]/30",
  Tron: "bg-[#FF0013]/15 text-[#FF0013] border-[#FF0013]/30",
  Bitcoin: "bg-[#F7931A]/15 text-[#F7931A] border-[#F7931A]/30",
  "ETH Gasless": "bg-[#627EEA]/15 text-[#627EEA] border-[#627EEA]/30",
  "TON Gasless": "bg-[#0098EA]/15 text-[#0098EA] border-[#0098EA]/30",
  Plasma: "bg-[#8247E5]/15 text-[#8247E5] border-[#8247E5]/30",
  Stable: "bg-[#50AF95]/15 text-[#50AF95] border-[#50AF95]/30",
};

/* ── API response type ── */
interface ApiTip {
  id: string;
  recipient: string;
  amount: string;
  token: string;
  chainId: string;
  txHash: string;
  status: string;
  fee?: string;
  createdAt: string;
  reasoning?: string;
  memo?: string;
}

interface HistoryResponse {
  history: ApiTip[];
}

/* normalised row for the table */
interface TipRow {
  id: string;
  date: string;
  recipient: string;
  amount: string;
  chain: string;
  status: string;
  txHash: string;
}

export default function Tips() {
  const { data: raw, isDemo } = useFetch<HistoryResponse | typeof demoTipHistory>(
    "/api/agent/history",
    demoTipHistory,
  );

  const [search, setSearch] = useState("");
  const [chainFilter, setChainFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [tipForm, setTipForm] = useState({ address: "", amount: "", chain: "Ethereum" });

  /* map API response → TipRow[] */
  const tips: TipRow[] = useMemo(() => {
    if (isDemo || Array.isArray(raw)) {
      return demoTipHistory;
    }
    const resp = raw as HistoryResponse;
    if (!resp?.history) return demoTipHistory;

    return resp.history.map((t) => ({
      id: t.id,
      date: new Date(t.createdAt).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" }),
      recipient: t.memo?.replace("[Demo] ", "@") || t.recipient,
      amount: t.amount,
      chain: chainLabel[t.chainId] ?? t.chainId,
      status: t.status,
      txHash: t.txHash || "0x" + t.id.replace(/\D/g, "").padEnd(40, "0"),
    }));
  }, [raw, isDemo]);

  /* unique chains for filter dropdown */
  const uniqueChains = useMemo(() => [...new Set(tips.map((t) => t.chain))], [tips]);

  const filtered = tips.filter((t) => {
    if (chainFilter !== "all" && t.chain !== chainFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search && !t.recipient.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sendTip = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/wallet/tip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: tipForm.address,
          amount: parseFloat(tipForm.amount),
          chain: tipForm.chain,
        }),
      });
      const data = await res.json();
      if (data.txHash) {
        toast.success(`Tip sent! TX: ${data.txHash.slice(0, 10)}...`);
      } else {
        toast.error(data.error || "Tip failed");
      }
    } catch (err) {
      toast.error(`Tip failed: ${err instanceof Error ? err.message : "Network error"}`);
    }
    setOpen(false);
    setTipForm({ address: "", amount: "", chain: "Ethereum" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
          <p className="text-sm text-muted-foreground mt-1">Every tip, every chain, fully auditable.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Send className="h-3.5 w-3.5 mr-2" />Send Tip
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Send Tip</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-xs">Recipient Address</Label>
                <Input placeholder="0x... or creator handle" value={tipForm.address} onChange={(e) => setTipForm({ ...tipForm, address: e.target.value })} className="mt-1 bg-background" />
              </div>
              <div>
                <Label className="text-xs">Amount (USDT)</Label>
                <Input type="number" placeholder="2.50" value={tipForm.amount} onChange={(e) => setTipForm({ ...tipForm, amount: e.target.value })} className="mt-1 bg-background" />
              </div>
              <div>
                <Label className="text-xs">Chain</Label>
                <Select value={tipForm.chain} onValueChange={(v) => setTipForm({ ...tipForm, chain: v })}>
                  <SelectTrigger className="mt-1 bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {demoWallets.map((w) => <SelectItem key={w.chain} value={w.chain}>{w.chain}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={sendTip} className="w-full bg-primary hover:bg-primary/90" disabled={!tipForm.address || !tipForm.amount}>
                Send Tip
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search recipients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card border-border/50" />
        </div>
        <Select value={chainFilter} onValueChange={setChainFilter}>
          <SelectTrigger className="w-[140px] bg-card border-border/50"><SelectValue placeholder="Chain" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chains</SelectItem>
            {uniqueChains.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-card border-border/50"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[140px_1fr_80px_90px_80px_1fr] gap-3 px-5 py-3 border-b border-border/40 text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
              <span>Date</span><span>Recipient</span><span className="text-right">Amount</span><span>Chain</span><span>Status</span><span>TX Hash</span>
            </div>
            <div className="divide-y divide-border/30">
              {filtered.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">No tips found.</div>
              )}
              {filtered.map((tip) => (
                <div key={tip.id} className="grid grid-cols-[140px_1fr_80px_90px_80px_1fr] gap-3 px-5 py-3 text-sm items-center hover:bg-accent/30 transition-colors">
                  <span className="text-xs text-muted-foreground tabular-nums">{tip.date}</span>
                  <span className="font-medium truncate">{tip.recipient}</span>
                  <span className="text-right tabular-nums font-medium">{tip.amount}</span>
                  <Badge variant="outline" className={`text-[10px] w-fit ${chainColors[tip.chain] || ""}`}>{tip.chain}</Badge>
                  <Badge variant="outline" className={`text-[10px] w-fit ${statusColors[tip.status] || ""}`}>{tip.status}</Badge>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${tip.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors truncate"
                  >
                    <span className="font-mono truncate">{tip.txHash.slice(0, 10)}...{tip.txHash.slice(-6)}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
