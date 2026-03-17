import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import CountUp from "@/components/shared/CountUp";
import { useFetch } from "@/hooks/useFetch";
import { Network, Bot, Cpu, Shield, CheckCircle2, Clock } from "lucide-react";

/* ── Demo fallback ── */
const demoStats = {
  totalAgents: 5, activeAgents: 5, totalAlerts: 0,
  unacknowledgedAlerts: 0, criticalAlerts: 0,
  totalWatchRules: 0, activeWatchRules: 0,
  chainsMonitored: ["ethereum-sepolia", "ethereum", "tron-nile", "bitcoin", "solana-devnet", "solana"] as string[],
  addressesWatched: 0, eventsProcessedTotal: 0,
  dataSource: "demo", supportedChains: [] as string[],
};

const demoAgents = {
  agents: [
    { id: "swarm_1", name: "BalanceGuard-Alpha", type: "balance_monitor", status: "active", assignedChains: ["ethereum-sepolia", "ethereum"], alertCount: 0, metrics: { eventsProcessed: 0, alertsTriggered: 0, uptimeMs: 0, rpcCallCount: 0, rpcErrorCount: 0 } },
    { id: "swarm_2", name: "TxSentinel-Beta", type: "tx_watcher", status: "active", assignedChains: ["ethereum-sepolia", "tron-nile"], alertCount: 0, metrics: { eventsProcessed: 0, alertsTriggered: 0, uptimeMs: 0, rpcCallCount: 0, rpcErrorCount: 0 } },
    { id: "swarm_3", name: "WhaleEye-Gamma", type: "whale_tracker", status: "active", assignedChains: ["ethereum", "bitcoin"], alertCount: 0, metrics: { eventsProcessed: 0, alertsTriggered: 0, uptimeMs: 0, rpcCallCount: 0, rpcErrorCount: 0 } },
    { id: "swarm_4", name: "AnomalyHunter-Delta", type: "anomaly_detector", status: "active", assignedChains: ["ethereum", "solana-devnet"], alertCount: 0, metrics: { eventsProcessed: 0, alertsTriggered: 0, uptimeMs: 0, rpcCallCount: 0, rpcErrorCount: 0 } },
    { id: "swarm_5", name: "PriceWatch-Epsilon", type: "price_sentinel", status: "active", assignedChains: ["ethereum", "bitcoin", "solana"], alertCount: 0, metrics: { eventsProcessed: 0, alertsTriggered: 0, uptimeMs: 0, rpcCallCount: 0, rpcErrorCount: 0 } },
  ],
  stats: demoStats,
};

const demoRules = { rules: [] as Array<Record<string, unknown>> };

/* ── Helpers ── */
interface AgentDisplay {
  id: string;
  name: string;
  type: string;
  status: string;
  chains: string[];
  alertCount: number;
  uptimeHours: number;
  eventsProcessed: number;
  rpcCalls: number;
}

function mapAgent(a: Record<string, unknown>): AgentDisplay {
  const metrics = (a.metrics ?? {}) as Record<string, unknown>;
  return {
    id: String(a.id ?? ""),
    name: String(a.name ?? ""),
    type: String(a.type ?? ""),
    status: String(a.status ?? "idle"),
    chains: Array.isArray(a.assignedChains) ? a.assignedChains.map(String) : [],
    alertCount: Number(a.alertCount ?? 0),
    uptimeHours: Math.round(Number(metrics.uptimeMs ?? 0) / 3600000),
    eventsProcessed: Number(metrics.eventsProcessed ?? 0),
    rpcCalls: Number(metrics.rpcCallCount ?? 0),
  };
}

const typeBadge = (t: string) => {
  if (t.includes("balance")) return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (t.includes("tx") || t.includes("sentinel")) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (t.includes("whale")) return "bg-purple-500/15 text-purple-400 border-purple-500/30";
  if (t.includes("anomaly")) return "bg-red-500/15 text-red-400 border-red-500/30";
  if (t.includes("price")) return "bg-orange-500/15 text-orange-400 border-orange-500/30";
  return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
};

export default function Swarm() {
  const { data: agentsData, isDemo } = useFetch("/api/advanced/swarm/agents", demoAgents);
  const { data: rulesData } = useFetch("/api/advanced/swarm/rules", demoRules);

  const rawStats = agentsData.stats ?? demoStats;
  const agents: AgentDisplay[] = (agentsData.agents ?? []).map((a: Record<string, unknown>) => mapAgent(a as Record<string, unknown>));
  const rules = rulesData.rules ?? [];

  const chainsMonitored = rawStats.chainsMonitored ?? [];

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Multi-Agent Swarm Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">Coordinated multi-agent decision-making with consensus protocols.</p>
        </div>
        {isDemo && <Badge variant="outline" className="text-[9px] bg-yellow-500/15 text-yellow-400 border-yellow-500/30">DEMO</Badge>}
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Agents", value: rawStats.activeAgents ?? 0, icon: Bot },
          { label: "Chains Monitored", value: chainsMonitored.length, isText: false, icon: Network },
          { label: "Total Alerts", value: rawStats.totalAlerts ?? 0, icon: Cpu },
          { label: "Critical Alerts", value: rawStats.criticalAlerts ?? 0, icon: Shield },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-5">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            </div>
            <div className="text-2xl font-bold tabular-nums tracking-tight"><CountUp target={s.value} /></div>
          </div>
        ))}
      </div>

      {/* Agent Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {agents.map((a) => (
          <div key={a.id} className="rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="h-5 w-5" strokeWidth={1.5} style={{ color: a.type.includes("anomaly") ? "#FF4E00" : "#C6B6B1" }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{a.name}</p>
                <Badge variant="outline" className={`text-[8px] ${typeBadge(a.type)}`}>{a.type.replace(/_/g, " ")}</Badge>
              </div>
              <Badge variant="outline" className={`text-[9px] ${a.status === "active" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"}`}>{a.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {a.chains.map((c) => (
                <span key={c} className="text-[9px] bg-secondary/50 px-1.5 py-0.5 rounded text-muted-foreground">{c}</span>
              ))}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span>Alerts: {a.alertCount}</span>
              <span>Uptime: {a.uptimeHours}h</span>
              <span>RPC: {a.rpcCalls}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Watch Rules */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="text-sm font-semibold">Watch Rules ({rules.length})</h3>
          </div>
          {rules.length > 0 ? (
            <ScrollArea className="h-[260px]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30 text-[11px] text-muted-foreground uppercase tracking-wider">
                      <th className="text-left px-5 py-2 font-medium">Name</th>
                      <th className="text-left px-3 py-2 font-medium">Condition</th>
                      <th className="text-center px-5 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {rules.map((r: Record<string, unknown>, i: number) => (
                      <tr key={String(r.id ?? i)} className="hover:bg-accent/30 transition-colors">
                        <td className="px-5 py-2.5 text-xs font-medium">{String(r.name ?? r.type ?? "Rule")}</td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{String(r.condition ?? r.description ?? "")}</td>
                        <td className="px-5 py-2.5 text-center">
                          <Badge variant="outline" className={`text-[9px] ${r.active ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"}`}>
                            {r.active ? "active" : "inactive"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          ) : (
            <div className="px-5 py-8 text-center text-xs text-muted-foreground">No watch rules configured yet. Use the API to add rules.</div>
          )}
        </div>

        {/* Chain Health */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="text-sm font-semibold">Monitored Chains</h3>
          </div>
          <ScrollArea className="h-[260px]">
            <div className="divide-y divide-border/20">
              {chainsMonitored.map((chain: string) => (
                <div key={chain} className="px-5 py-3 flex items-center gap-3 hover:bg-accent/30 transition-colors">
                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#50AF95" }} />
                  <span className="text-xs font-medium flex-1">{chain}</span>
                  <Badge variant="outline" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">monitored</Badge>
                </div>
              ))}
              {chainsMonitored.length === 0 && (
                <div className="px-5 py-3 flex items-center gap-3">
                  <Clock className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">No chains currently monitored</span>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Data Source */}
      <div className="text-center text-[10px] text-muted-foreground/60 mt-2">
        Data source: {rawStats.dataSource ?? "unknown"}
      </div>
    </div>
  );
}
