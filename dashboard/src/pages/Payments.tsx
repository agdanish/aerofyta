import { demoDCA, demoSubscriptions, demoStreaming, demoSplits, demoX402 } from "@/lib/demo-data";
import { useFetch, API_BASE } from "@/hooks/useFetch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pause, Play, X } from "lucide-react";
import { toast } from "sonner";

/* ---- real API shapes ---- */
interface RealDCA {
  id: string;
  recipient: string;
  totalAmount: number;
  executedAmount: number;
  remainingAmount: number;
  installments: number;
  completedInstallments: number;
  amountPerInstallment: number;
  intervalLabel: string;
  token: string;
  chainId: string;
  status: string;
  nextExecutionAt: string;
  createdAt: string;
}

interface RealSubscription {
  id: string;
  name: string;
  amount: number;
  token: string;
  chainId: string;
  intervalLabel: string;
  status: string;
  nextPaymentAt: string;
  totalPaid: number;
  paymentCount: number;
}

interface RealX402Stats {
  totalPaymentsReceived: number;
  totalRevenueUsdt: number;
  totalPaymentsMade: number;
  totalSpentUsdt: number;
  activeEndpoints: number;
  pendingPayments: number;
}

/* ---- helpers ---- */
const statusBadge = (s: string) => {
  if (s === "active") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (s === "paused") return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  return "bg-zinc-400/15 text-zinc-300 border-zinc-400/30";
};

const shortAddr = (a: string) => a.length > 16 ? `${a.slice(0, 8)}...${a.slice(-6)}` : a;
const relativeTime = (iso: string) => {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms < 0) return "overdue";
  const h = Math.floor(ms / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `In ${d}d`;
  if (h > 0) return `In ${h}h`;
  return `In ${Math.floor(ms / 60000)}m`;
};

export default function Payments() {
  const { data: rawDca, isDemo: isDcaDemo } = useFetch<RealDCA[] | typeof demoDCA>("/api/dca", demoDCA);
  const { data: rawSubs, isDemo: isSubsDemo } = useFetch<RealSubscription[] | typeof demoSubscriptions>("/api/subscriptions", demoSubscriptions);
  const { data: x402Stats, isDemo: isX402Demo } = useFetch<RealX402Stats>("/api/x402/stats", {
    totalPaymentsReceived: 1336, totalRevenueUsdt: 16.92,
    totalPaymentsMade: 0, totalSpentUsdt: 0,
    activeEndpoints: 2, pendingPayments: 0,
  });

  /* Normalize DCA data */
  const dcaItems = isDcaDemo
    ? (rawDca as typeof demoDCA)
    : (rawDca as RealDCA[]).slice(0, 10).map((d) => ({
        id: d.id,
        asset: d.token.toUpperCase(),
        amount: `${d.amountPerInstallment.toFixed(4)} ${d.token.toUpperCase()}`,
        frequency: d.intervalLabel,
        next: relativeTime(d.nextExecutionAt),
        status: d.status,
        totalInvested: `${d.executedAmount.toFixed(2)} done / ${d.totalAmount} total`,
        recipient: shortAddr(d.recipient),
      }));

  /* Normalize subscriptions */
  const subsItems = isSubsDemo
    ? (rawSubs as typeof demoSubscriptions)
    : (rawSubs as RealSubscription[]).map((s) => ({
        id: s.id,
        name: s.name || `Subscription ${s.id.slice(0, 8)}`,
        amount: `${s.amount} ${s.token}/${s.intervalLabel}`,
        chain: s.chainId,
        status: s.status,
        nextPayment: s.status === "cancelled" ? "---" : relativeTime(s.nextPaymentAt),
      }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Programmable Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">DCA, subscriptions, streaming, splits, and x402.</p>
      </div>

      <Tabs defaultValue="dca">
        <div className="overflow-x-auto -mx-6 px-6 mb-6">
          <TabsList className="bg-secondary/50 w-max">
            <TabsTrigger value="dca">DCA {!isDcaDemo && <Badge variant="outline" className="ml-1 text-[8px] py-0 px-1 border-emerald-500/40 text-emerald-400">LIVE</Badge>}</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions {!isSubsDemo && <Badge variant="outline" className="ml-1 text-[8px] py-0 px-1 border-emerald-500/40 text-emerald-400">LIVE</Badge>}</TabsTrigger>
            <TabsTrigger value="streaming">Streaming</TabsTrigger>
            <TabsTrigger value="splits">Splits</TabsTrigger>
            <TabsTrigger value="x402">x402 {!isX402Demo && <Badge variant="outline" className="ml-1 text-[8px] py-0 px-1 border-emerald-500/40 text-emerald-400">LIVE</Badge>}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dca">
          <div className="space-y-3">
            {(Array.isArray(dcaItems) ? dcaItems : []).map((d) => (
              <div key={d.id} className="rounded-xl border border-border/50 bg-card/50 p-4 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div>
                  <span className="text-sm font-medium">{d.amount} → {d.asset}</span>
                  <p className="text-xs text-muted-foreground">{d.frequency} · Next: {d.next}</p>
                  {"recipient" in d && <p className="text-[10px] text-muted-foreground/60 font-mono">{d.recipient}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{"totalInvested" in d ? d.totalInvested : ""}</span>
                  <Badge variant="outline" className={`text-[10px] ${statusBadge(d.status)}`}>{d.status}</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => {
                    const action = d.status === 'active' ? 'pause' : 'resume';
                    try {
                      await fetch(`${API_BASE}/api/dca/${d.id}/${action}`, { method: 'POST' });
                      toast.success(`DCA ${action}d`);
                    } catch (err) {
                      toast.error(`DCA ${action} failed: ${err instanceof Error ? err.message : "Unknown error"}`);
                    }
                  }}>
                    {d.status === "active" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions">
          <div className="space-y-3">
            {(Array.isArray(subsItems) ? subsItems : []).map((s) => (
              <div key={s.id} className="rounded-xl border border-border/50 bg-card/50 p-4 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div className="min-w-0">
                  <span className="text-sm font-medium truncate block">{s.name}</span>
                  <p className="text-xs text-muted-foreground">{s.amount} · {s.chain} · Next: {s.nextPayment}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${statusBadge(s.status)}`}>{s.status}</Badge>
                  {s.status === "active" && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => {
                      try {
                        await fetch(`${API_BASE}/api/subscriptions/${s.id}/cancel`, { method: 'POST' });
                        toast.success('Subscription cancelled');
                      } catch (err) {
                        toast.error(`Cancel failed: ${err instanceof Error ? err.message : "Unknown error"}`);
                      }
                    }}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="streaming">
          <div className="space-y-3">
            {demoStreaming.map((s) => (
              <div key={s.id} className="rounded-xl border border-border/50 bg-card/50 p-4 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div>
                  <span className="text-sm font-medium">→ {s.recipient}</span>
                  <p className="text-xs text-muted-foreground">{s.rate} · Streamed: {s.streamed} · {s.chain}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${statusBadge(s.status)}`}>{s.status}</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => {
                    try {
                      await fetch(`${API_BASE}/api/streaming/${s.id}/stop`, { method: 'POST' });
                      toast.success('Stream stopped');
                    } catch (err) {
                      toast.error(`Stream stop failed: ${err instanceof Error ? err.message : "Unknown error"}`);
                    }
                  }}>
                    {s.status === "active" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="splits">
          <div className="space-y-3">
            {demoSplits.map((s) => (
              <div key={s.id} className="rounded-xl border border-border/50 bg-card/50 p-4 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div>
                  <span className="text-sm font-medium">{s.name}</span>
                  <p className="text-xs text-muted-foreground">{s.recipients} recipients · {s.total} · {s.chain}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] ${statusBadge(s.status)}`}>{s.status}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="x402">
          {!isX402Demo ? (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Active Endpoints", value: (x402Stats as RealX402Stats).activeEndpoints },
                  { label: "Revenue", value: `${(x402Stats as RealX402Stats).totalRevenueUsdt.toFixed(2)} USDT` },
                  { label: "Payments Received", value: (x402Stats as RealX402Stats).totalPaymentsReceived },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-4 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="text-lg font-bold">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: "Total Spent", value: `${(x402Stats as RealX402Stats).totalSpentUsdt.toFixed(2)} USDT` },
                  { label: "Pending Payments", value: (x402Stats as RealX402Stats).pendingPayments },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-4 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="text-lg font-bold">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {demoX402.map((x) => (
                <div key={x.id} className="rounded-xl border border-border/50 bg-card/50 p-4 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                  <div className="min-w-0">
                    <code className="text-sm font-mono text-primary break-all">{x.endpoint}</code>
                    <p className="text-xs text-muted-foreground">{x.price} · {x.requests} requests · Revenue: {x.revenue}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${statusBadge(x.status)}`}>{x.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
