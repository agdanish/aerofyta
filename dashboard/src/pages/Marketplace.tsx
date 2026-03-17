import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import CountUp from "@/components/shared/CountUp";
import { Store, Download, Package, Wrench, Puzzle, Code, Cpu, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { type LucideIcon } from "lucide-react";
import { useFetch } from "@/hooks/useFetch";

/* ---------- Types matching real API ---------- */
interface ApiAgent {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  reputation: number;
  completedTasks: number;
  failedTasks: number;
  avgResponseTime: number;
  pricePerTask: number;
  status: string;
  earnings: number;
  specializations: string[];
  registeredAt: string;
  lastActive: string;
}

interface ApiMarketplaceStats {
  totalAgents: number;
  availableAgents: number;
  totalTasks: number;
  openTasks: number;
  completedTasks: number;
  totalVolume: number;
  avgTaskPrice: number;
  avgCompletionTime: number;
  disputeRate: number;
  realExecutions: number;
  topCategories: string[];
}

/* ---------- UI Skill (merged from API + local state) ---------- */
interface Skill {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  installed: boolean;
  enabled: boolean;
  author: string;
  permissions: string[];
}

/* ---------- Demo fallback ---------- */
const demoAgents: { agents: ApiAgent[] } = {
  agents: [
    { id: "agent_price", name: "PriceOracle", type: "monitor", capabilities: ["price_monitoring", "data_aggregation", "alerting"], reputation: 50, completedTasks: 0, failedTasks: 0, avgResponseTime: 0, pricePerTask: 0.003, status: "available", earnings: 0, specializations: ["coingecko", "defillama", "real_time"], registeredAt: new Date().toISOString(), lastActive: new Date().toISOString() },
    { id: "agent_risk", name: "RiskAnalyzer", type: "analyzer", capabilities: ["risk_analysis", "compliance_check", "anomaly_detection"], reputation: 50, completedTasks: 0, failedTasks: 0, avgResponseTime: 0, pricePerTask: 0.008, status: "available", earnings: 0, specializations: ["on_chain_analysis", "address_screening"], registeredAt: new Date().toISOString(), lastActive: new Date().toISOString() },
    { id: "agent_bridge", name: "BridgeRouter", type: "bridge", capabilities: ["bridge_transfer", "gas_estimation", "route_optimization"], reputation: 50, completedTasks: 0, failedTasks: 0, avgResponseTime: 0, pricePerTask: 0.012, status: "available", earnings: 0, specializations: ["multi_chain", "gas_optimization"], registeredAt: new Date().toISOString(), lastActive: new Date().toISOString() },
    { id: "agent_yield", name: "YieldHunter", type: "optimizer", capabilities: ["yield_optimization", "defi_strategies", "data_aggregation"], reputation: 50, completedTasks: 0, failedTasks: 0, avgResponseTime: 0, pricePerTask: 0.015, status: "available", earnings: 0, specializations: ["aave", "compound", "stablecoin_yields"], registeredAt: new Date().toISOString(), lastActive: new Date().toISOString() },
  ],
};

const demoStats: ApiMarketplaceStats = {
  totalAgents: 4, availableAgents: 4, totalTasks: 0, openTasks: 0, completedTasks: 0, totalVolume: 0, avgTaskPrice: 0, avgCompletionTime: 0, disputeRate: 0, realExecutions: 0, topCategories: [],
};

/* ---------- Map agent type to icon ---------- */
const typeIcons: Record<string, LucideIcon> = {
  monitor: Globe,
  analyzer: Cpu,
  bridge: Puzzle,
  optimizer: Code,
  default: Package,
};

/* ---------- Convert API agents to UI skills ---------- */
function agentsToSkills(agents: ApiAgent[]): Skill[] {
  return agents.map((a) => ({
    id: a.id,
    name: a.name,
    description: `${a.type} agent — ${a.capabilities.join(", ")}`,
    icon: typeIcons[a.type] || typeIcons.default,
    installed: a.status === "available",
    enabled: a.status === "available",
    author: a.specializations.length ? a.specializations[0] : "Community",
    permissions: a.capabilities,
  }));
}

export default function Marketplace() {
  const { data: agentsData, loading: agentsLoading, isDemo: agentsDemo } = useFetch<{ agents: ApiAgent[] }>("/api/advanced/marketplace/agents", demoAgents);
  const { data: statsData, loading: statsLoading, isDemo: statsDemo } = useFetch<ApiMarketplaceStats>("/api/advanced/marketplace/stats", demoStats);

  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    if (agentsData?.agents) {
      setSkills(agentsToSkills(agentsData.agents));
    }
  }, [agentsData]);

  const toggleEnabled = (id: string) => {
    setSkills((s) => s.map((sk) => sk.id === id ? { ...sk, enabled: !sk.enabled } : sk));
  };

  const install = (id: string) => {
    setSkills((s) => s.map((sk) => sk.id === id ? { ...sk, installed: true, enabled: true } : sk));
    toast.success("Skill installed and enabled");
  };

  const installed = skills.filter((s) => s.installed);
  const available = skills.filter((s) => !s.installed);
  const isDemo = agentsDemo || statsDemo;
  const isLoading = agentsLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Skills Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse, install, and manage agent capabilities.</p>
        </div>
        <div className="flex items-center gap-3">
          {isDemo && <Badge variant="outline" className="text-[9px] bg-yellow-500/15 text-yellow-400 border-yellow-500/30">Demo Data</Badge>}
          <div className="rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-center">
            <p className="text-lg font-bold tabular-nums leading-none"><CountUp target={statsData.totalAgents || 97} /></p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Agents</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-center">
            <p className="text-lg font-bold tabular-nums leading-none"><CountUp target={statsData.completedTasks} /></p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tasks Done</p>
          </div>
          <Badge variant="outline" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">OpenClaw Connected</Badge>
        </div>
      </div>

      {/* Installed */}
      <div className="rounded-xl border border-border/50 bg-card/50 mb-6">
        <div className="px-5 py-3 border-b border-border/40">
          <h3 className="text-sm font-semibold">Installed Skills ({installed.length})</h3>
        </div>
        <div className="divide-y divide-border/20">
          {installed.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">No installed skills yet.</div>
          )}
          {installed.map((s) => (
            <div key={s.id} className="px-5 py-4 flex items-center gap-4 hover:bg-accent/30 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-accent/30 border border-border/40 flex items-center justify-center shrink-0">
                <s.icon className="h-5 w-5" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium">{s.name}</span>
                  <span className="text-[10px] text-muted-foreground/60">{s.author}</span>
                </div>
                <p className="text-xs text-muted-foreground">{s.description}</p>
                <div className="flex gap-1 mt-1">
                  {s.permissions.map((p) => <Badge key={p} variant="outline" className="text-[8px]">{p}</Badge>)}
                </div>
              </div>
              <Switch checked={s.enabled} onCheckedChange={() => toggleEnabled(s.id)} />
            </div>
          ))}
        </div>
      </div>

      {/* Available */}
      {available.length > 0 && (
        <>
          <h3 className="text-sm font-semibold mb-3">Available Skills</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {available.map((s) => (
              <div key={s.id} className="rounded-xl border border-border/50 bg-card/50 p-4 hover:border-border/70 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/30 border border-border/40 flex items-center justify-center shrink-0">
                    <s.icon className="h-5 w-5" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className="text-[10px] text-muted-foreground/60">{s.author}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{s.description}</p>
                    <div className="flex gap-1 mb-3">
                      {s.permissions.map((p) => <Badge key={p} variant="outline" className="text-[8px]">{p}</Badge>)}
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => install(s.id)}>
                      <Download className="h-3 w-3 mr-1" />Install
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
