import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CountUp from "@/components/shared/CountUp";
import { useFetch, API_BASE } from "@/hooks/useFetch";
import { KeyRound, Plus, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";

/* ── Demo fallback ── */
const demoWallets = {
  wallets: [
    { id: "w1", address: "0x7a3B...f82d", signers: ["Agent A", "Agent B", "Agent C"], threshold: 2, chain: "Ethereum" },
    { id: "w2", address: "0x4bA8...d67f", signers: ["Agent A", "Agent B", "Agent C"], threshold: 2, chain: "Polygon" },
    { id: "w3", address: "0x2eC1...b45a", signers: ["Agent A", "Agent B", "Agent C", "Agent D", "Agent E"], threshold: 3, chain: "Arbitrum" },
  ],
  stats: {
    totalWallets: 3, totalTransactions: 12, pendingTransactions: 3,
    approvedTransactions: 8, rejectedTransactions: 1, executedTransactions: 7,
    avgApprovalTime: 45, cryptographicApprovals: 15, unsignedApprovals: 0,
    onChainVerifications: 7,
  },
};

const demoTxs = {
  transactions: [
    { id: "TX-001", description: "Transfer 500 USDT to yield vault", status: "pending", approvals: [{ signer: "Agent A" }], threshold: 2, createdAt: new Date(Date.now() - 300000).toISOString(), walletId: "w1" },
    { id: "TX-002", description: "Approve Aave V3 spending", status: "pending", approvals: [{ signer: "Agent B" }], threshold: 2, createdAt: new Date(Date.now() - 720000).toISOString(), walletId: "w1" },
    { id: "TX-003", description: "Bridge 200 USDT to Polygon", status: "pending", approvals: [{ signer: "Agent A" }, { signer: "Agent C" }], threshold: 3, createdAt: new Date(Date.now() - 1500000).toISOString(), walletId: "w3" },
    { id: "TX-098", description: "Tip @sarah_creates 2.5 USDT", status: "executed", approvals: [{ signer: "Agent A" }, { signer: "Agent B" }], threshold: 2, createdAt: new Date(Date.now() - 3600000).toISOString(), walletId: "w1" },
    { id: "TX-096", description: "Withdraw 1000 USDT", status: "rejected", approvals: [{ signer: "Agent C" }], threshold: 2, createdAt: new Date(Date.now() - 10800000).toISOString(), walletId: "w2" },
  ],
};

/* ── Helpers ── */
interface WalletDisplay {
  id: string;
  address: string;
  signers: string[];
  threshold: number;
  chain: string;
}

interface TxDisplay {
  id: string;
  description: string;
  status: string;
  signerNames: string[];
  approvalCount: number;
  threshold: number;
  createdAt: string;
}

function mapWallet(w: Record<string, unknown>): WalletDisplay {
  const signers = Array.isArray(w.signers) ? w.signers.map(String) : [];
  return {
    id: String(w.id ?? w.address ?? ""),
    address: String(w.address ?? ""),
    signers,
    threshold: Number(w.threshold ?? 2),
    chain: String(w.chain ?? "Unknown"),
  };
}

function mapTx(tx: Record<string, unknown>): TxDisplay {
  const approvals = Array.isArray(tx.approvals) ? tx.approvals : [];
  const signerNames = approvals.map((a: Record<string, unknown>) => String(a.signer ?? a.agentId ?? ""));
  return {
    id: String(tx.id ?? ""),
    description: String(tx.description ?? tx.action ?? ""),
    status: String(tx.status ?? "pending"),
    signerNames,
    approvalCount: approvals.length,
    threshold: Number(tx.threshold ?? tx.requiredApprovals ?? 2),
    createdAt: String(tx.createdAt ?? ""),
  };
}

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  } catch { return ""; }
}

export default function Multisig() {
  const [signed, setSigned] = useState<Record<string, boolean>>({});
  const [rejected, setRejected] = useState<Record<string, boolean>>({});
  const [walletOpen, setWalletOpen] = useState(false);
  const [newSigners, setNewSigners] = useState("Agent A, Agent B, Agent C");
  const [newThreshold, setNewThreshold] = useState("2");
  const { data: walletsData, isDemo } = useFetch("/api/advanced/multisig/wallets", demoWallets);
  const { data: txsData } = useFetch("/api/advanced/multisig/transactions", demoTxs);

  const createWallet = async () => {
    const signers = newSigners.split(",").map((s) => s.trim()).filter(Boolean);
    const threshold = parseInt(newThreshold, 10);
    if (signers.length < 2) { toast.error("At least 2 signers required"); return; }
    if (threshold < 1 || threshold > signers.length) { toast.error("Invalid threshold"); return; }
    try {
      await fetch(`${API_BASE}/api/advanced/multisig/wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signers, threshold }),
      });
      toast.success('Multisig wallet created');
      setWalletOpen(false);
    } catch {
      toast.error("Failed to create wallet");
    }
  };

  const wallets: WalletDisplay[] = (walletsData.wallets ?? []).map((w: Record<string, unknown>) => mapWallet(w as Record<string, unknown>));
  const allTxs: TxDisplay[] = (txsData.transactions ?? []).map((t: Record<string, unknown>) => mapTx(t as Record<string, unknown>));

  const pendingTxs = allTxs.filter((t) => t.status === "pending" && !rejected[t.id]);
  const historyTxs = allTxs.filter((t) => t.status !== "pending" || rejected[t.id]);

  const stats = walletsData.stats ?? demoWallets.stats;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Multi-Signature Security</h1>
            <p className="text-sm text-muted-foreground mt-1">Multi-sig wallets with threshold signing and transaction approval.</p>
          </div>
          {isDemo && <Badge variant="outline" className="text-[9px] bg-yellow-500/15 text-yellow-400 border-yellow-500/30">DEMO</Badge>}
        </div>
        <Dialog open={walletOpen} onOpenChange={setWalletOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 text-xs">
              <Plus className="h-3 w-3 mr-1" />New Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Multisig Wallet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="ms-signers">Signers (comma-separated)</Label>
                <Input id="ms-signers" placeholder="Agent A, Agent B, Agent C" value={newSigners} onChange={(e) => setNewSigners(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ms-threshold">Threshold</Label>
                <Input id="ms-threshold" type="number" min={1} value={newThreshold} onChange={(e) => setNewThreshold(e.target.value)} />
              </div>
              <Button className="w-full" onClick={createWallet}>Create Wallet</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Row */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Wallets", value: stats.totalWallets ?? wallets.length },
          { label: "Total Transactions", value: stats.totalTransactions ?? allTxs.length },
          { label: "Pending", value: stats.pendingTransactions ?? pendingTxs.length },
          { label: "Executed", value: stats.executedTransactions ?? historyTxs.filter((t) => t.status === "executed").length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-5">
            <p className="text-xs text-muted-foreground font-medium mb-1">{s.label}</p>
            <div className="text-2xl font-bold tabular-nums tracking-tight"><CountUp target={s.value} /></div>
          </div>
        ))}
      </div>

      {/* Wallets */}
      {wallets.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {wallets.map((w) => (
            <div key={w.id} className="rounded-xl border border-border/50 bg-card/50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
                <span className="text-xs font-mono text-muted-foreground truncate">{w.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px]">{w.threshold}-of-{w.signers.length}</Badge>
                <Badge variant="outline" className="text-[9px]">{w.chain}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pending */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Pending Transactions</h3>
            <Badge className="text-[9px] bg-yellow-500/15 text-yellow-400 border-yellow-500/30" variant="outline">{pendingTxs.length}</Badge>
          </div>
          <ScrollArea className="h-[320px]">
            <div className="divide-y divide-border/20">
              {pendingTxs.map((tx) => (
                <div key={tx.id} className="px-5 py-4 hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-muted-foreground/60">{tx.id}</span>
                    <Clock className="h-3 w-3 text-muted-foreground/40" />
                    <span className="text-[10px] text-muted-foreground/60">{timeAgo(tx.createdAt)}</span>
                  </div>
                  <p className="text-sm font-medium mb-2">{tx.description}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <Progress value={(tx.approvalCount / tx.threshold) * 100} className="h-1.5 flex-1 bg-secondary" />
                    <span className="text-[10px] tabular-nums text-muted-foreground">{tx.approvalCount}/{tx.threshold}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {tx.signerNames.map((s) => <Badge key={s} variant="outline" className="text-[8px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{s}</Badge>)}
                    </div>
                    {!signed[tx.id] && (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setSigned((s) => ({ ...s, [tx.id]: true })); toast.success(`Signed ${tx.id}`); }}>
                          <Check className="h-3 w-3" style={{ color: "#50AF95" }} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setRejected((r) => ({ ...r, [tx.id]: true })); toast.success(`Rejected ${tx.id}`); }}>
                          <X className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    )}
                    {signed[tx.id] && <Badge variant="outline" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Signed</Badge>}
                  </div>
                </div>
              ))}
              {pendingTxs.length === 0 && <div className="px-5 py-8 text-center text-xs text-muted-foreground">No pending transactions</div>}
            </div>
          </ScrollArea>
        </div>

        {/* History */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="text-sm font-semibold">Transaction History</h3>
          </div>
          <ScrollArea className="h-[320px]">
            <div className="divide-y divide-border/20">
              {historyTxs.map((tx) => (
                <div key={tx.id} className="px-5 py-3 hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-muted-foreground/60">{tx.id}</span>
                    <Badge variant="outline" className={`text-[9px] ${tx.status === "executed" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>
                      {tx.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground/60 ml-auto">{timeAgo(tx.createdAt)}</span>
                  </div>
                  <p className="text-xs mb-1">{tx.description}</p>
                  <div className="flex gap-1">
                    {tx.signerNames.map((s) => <Badge key={s} variant="outline" className="text-[8px]">{s}</Badge>)}
                  </div>
                </div>
              ))}
              {historyTxs.length === 0 && <div className="px-5 py-8 text-center text-xs text-muted-foreground">No transaction history</div>}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
