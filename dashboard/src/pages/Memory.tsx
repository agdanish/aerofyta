import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCircuit, CheckCircle, XCircle, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.PROD ? "" : "http://localhost:3001";

/* ---------- types matching real /api/agent/memory ---------- */
interface CreatorPref {
  name: string;
  interactions: number;
  avgEngagement: number;
  tipCount: number;
  confidence: number;
}
interface ChainPerf {
  chain: string;
  transactions: number;
  avgFee: number;
  avgConfirmMs: number;
  successRate: number;
  successes: number;
}
interface PeakTime {
  day: string;
  hour: number;
  observations: number;
  avgEvents: number;
}
interface MemoryResponse {
  creatorPreferences: CreatorPref[];
  chainPerformance: ChainPerf[];
  peakActivityTimes: PeakTime[];
  tipEffectiveness: unknown[];
  totalMemories: number;
  contextSummary: string;
}

/* ---------- map API data to table rows ---------- */
interface MemoryEntry {
  key: string;
  value: string;
  confidence: number;
  importance: number;
  source: string;
  lastAccessed: string;
}

function mapApiToEntries(api: MemoryResponse): MemoryEntry[] {
  const entries: MemoryEntry[] = [];
  api.creatorPreferences.forEach((c) => {
    entries.push({
      key: `creator_${c.name}`,
      value: `${c.interactions} interactions, engagement ${(c.avgEngagement * 100).toFixed(0)}%, tipped ${c.tipCount}x`,
      confidence: c.confidence,
      importance: Math.min(100, Math.round(c.avgEngagement * 100)),
      source: "observed",
      lastAccessed: "live",
    });
  });
  api.chainPerformance.forEach((ch) => {
    entries.push({
      key: `chain_${ch.chain}`,
      value: `${ch.transactions} txs, avg fee $${ch.avgFee.toFixed(4)}, success ${(ch.successRate * 100).toFixed(0)}%`,
      confidence: Math.round(ch.successRate * 100),
      importance: Math.min(100, ch.transactions * 10 + 50),
      source: "observed",
      lastAccessed: "live",
    });
  });
  api.peakActivityTimes.slice(0, 4).forEach((p) => {
    entries.push({
      key: `peak_${p.day}_${p.hour}`,
      value: `${p.day} at ${p.hour}:00 — ${p.observations} observations, avg ${p.avgEvents.toFixed(1)} events`,
      confidence: Math.min(100, p.observations * 3),
      importance: Math.min(100, Math.round(p.avgEvents * 20)),
      source: "inferred",
      lastAccessed: "live",
    });
  });
  return entries;
}

/* ---------- extract learned facts from contextSummary ---------- */
interface LearnedFact {
  title: string;
  detail: string;
}

function extractLearned(api: MemoryResponse): LearnedFact[] {
  const facts: LearnedFact[] = [];
  if (api.creatorPreferences.length > 0) {
    const names = api.creatorPreferences.map((c) => `${c.name} (${(c.avgEngagement * 100).toFixed(0)}%)`).join(", ");
    facts.push({ title: "Known Creators", detail: names });
  }
  if (api.chainPerformance.length > 0) {
    const chains = api.chainPerformance.map((c) => `${c.chain}: ${c.transactions} txs, ${(c.successRate * 100).toFixed(0)}% success`).join(" | ");
    facts.push({ title: "Chain Performance", detail: chains });
  }
  if (api.peakActivityTimes.length > 0) {
    const peaks = api.peakActivityTimes.slice(0, 3).map((p) => `${p.day} ${p.hour}:00`).join(", ");
    facts.push({ title: "Peak Activity Times", detail: peaks });
  }
  facts.push({ title: "Total Memories", detail: `${api.totalMemories} stored memory entries` });
  return facts;
}

/* ---------- demo fallback ---------- */
const demoEntries: MemoryEntry[] = [
  { key: "trusted_creators", value: "sarah_creates, dev_marcus, music_maya", confidence: 94, importance: 92, source: "observed", lastAccessed: "2m ago" },
  { key: "eth_gas_threshold", value: "15 gwei (optimal)", confidence: 88, importance: 85, source: "inferred", lastAccessed: "5m ago" },
  { key: "best_tip_hours", value: "14:00-18:00 UTC", confidence: 82, importance: 78, source: "inferred", lastAccessed: "12m ago" },
  { key: "max_safe_tip", value: "10 USDT per tx", confidence: 96, importance: 95, source: "user", lastAccessed: "1h ago" },
  { key: "polygon_preferred", value: "true (lowest fees for tips)", confidence: 91, importance: 80, source: "observed", lastAccessed: "18m ago" },
];

const demoLearned: LearnedFact[] = [
  { title: "Trusted Creators", detail: "Sarah Mitchell (94%), Marcus Rivera (87%), Maya Chen (82%)" },
  { title: "Gas Thresholds", detail: "ETH: <15 gwei optimal, Polygon: always cheap, TON: near-zero" },
  { title: "Best Tipping Hours", detail: "14:00-18:00 UTC yields 23% higher engagement" },
];

const demoContext = `{
  "wallet_state": { "total": "$12,847.32", "chains": 9 },
  "mood": "optimistic", "multiplier": 1.2,
  "top_creators": ["sarah_creates (94%)"],
  "memory_count": 8,
  "session_decisions": 20
}`;

const sourceBadge = (s: string) => {
  if (s === "user") return "bg-primary/15 text-primary border-primary/30";
  if (s === "observed") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  return "bg-blue-500/15 text-blue-400 border-blue-500/30";
};

export default function Memory() {
  const [memoryEntries, setMemoryEntries] = useState<MemoryEntry[]>(demoEntries);
  const [learned, setLearned] = useState<LearnedFact[]>(demoLearned);
  const [contextPreview, setContextPreview] = useState(demoContext);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/agent/memory`, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const api: MemoryResponse = await res.json();
        if (cancelled) return;
        setMemoryEntries(mapApiToEntries(api));
        setLearned(extractLearned(api));
        setContextPreview(api.contextSummary);
        setIsDemo(false);
      } catch {
        if (!cancelled) setIsDemo(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Memory & Learning</h1>
          <p className="text-sm text-muted-foreground mt-1">Persistent memory, learned patterns, and decision history.</p>
        </div>
        {isDemo && <Badge variant="outline" className="text-[9px] bg-amber-500/15 text-amber-400 border-amber-500/30">Demo Data</Badge>}
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Memory Entries */}
      <div className="rounded-xl border border-border/50 bg-card/50 mb-6">
        <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Memory Store</h3>
          <span className="text-[10px] text-muted-foreground tabular-nums">{memoryEntries.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30 text-[11px] text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-5 py-2 font-medium">Key</th>
                <th className="text-left px-3 py-2 font-medium">Value</th>
                <th className="text-center px-3 py-2 font-medium">Confidence</th>
                <th className="text-center px-3 py-2 font-medium">Importance</th>
                <th className="text-center px-3 py-2 font-medium">Source</th>
                <th className="text-right px-5 py-2 font-medium">Accessed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {memoryEntries.map((m) => (
                <tr key={m.key} className="hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-2.5 font-mono text-xs">{m.key}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[200px] truncate">{m.value}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5 justify-center">
                      <Progress value={m.confidence} className="h-1 w-12 bg-secondary" />
                      <span className="text-[10px] tabular-nums text-muted-foreground w-7 text-right">{m.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5 justify-center">
                      <Progress value={m.importance} className="h-1 w-12 bg-secondary" />
                      <span className="text-[10px] tabular-nums text-muted-foreground w-7 text-right">{m.importance}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <Badge variant="outline" className={`text-[9px] ${sourceBadge(m.source)}`}>{m.source}</Badge>
                  </td>
                  <td className="px-5 py-2.5 text-right text-[11px] text-muted-foreground">{m.lastAccessed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* What the Agent Learned */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
            What the Agent Has Learned
          </h3>
          <div className="space-y-3">
            {learned.map((item) => (
              <div key={item.title} className="rounded-lg bg-accent/30 p-3">
                <p className="text-xs font-medium mb-0.5">{item.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Context Builder Preview */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <h3 className="text-sm font-semibold mb-4">Context Summary</h3>
          <pre className="text-[11px] font-mono text-foreground/80 bg-secondary/30 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
            {contextPreview}
          </pre>
          <p className="text-[10px] text-muted-foreground mt-3">This context is assembled from memory + wallet state before every agent reasoning cycle.</p>
        </div>
      </div>
    </div>
  );
}
