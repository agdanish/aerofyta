import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileCheck, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const API = import.meta.env.PROD ? "" : "http://localhost:3001";

// --- Demo fallbacks ---
const demoTaxEvents = [
  { id: 1, date: "2025-03-22", type: "tip", amount: "2.50 USDT", recipient: "@sarah_creates", chain: "Ethereum", taxLot: "TL-0247" },
  { id: 2, date: "2025-03-22", type: "escrow", amount: "50.00 USDT", recipient: "0x742d...bD28", chain: "Polygon", taxLot: "TL-0246" },
  { id: 3, date: "2025-03-22", type: "yield", amount: "3.42 USDT", recipient: "Aave V3", chain: "Ethereum", taxLot: "TL-0245" },
  { id: 4, date: "2025-03-22", type: "tip", amount: "5.00 USDT", recipient: "@dev_marcus", chain: "Polygon", taxLot: "TL-0244" },
  { id: 5, date: "2025-03-21", type: "swap", amount: "100.00 USDT", recipient: "DEX (ETH)", chain: "Ethereum", taxLot: "TL-0243" },
];

const demoAuditTrail = [
  { id: "demo-1", action: "tip_sent", time: "14:32:15", detail: "2.5 USDT -> @sarah_creates on Ethereum. TX: 0xabc...def" },
  { id: "demo-2", action: "escrow_created", time: "14:28:00", detail: "E-0047: 50 USDT, 2h timelock, SHA-256 hash lock" },
  { id: "demo-3", action: "consensus_vote", time: "14:27:55", detail: "Agent A: TIP (0.87), Agent B: TIP (0.91), Agent C: HOLD (0.62)" },
  { id: "demo-4", action: "guardian_review", time: "14:27:50", detail: "Guardian review: APPROVED" },
  { id: "demo-5", action: "policy_check", time: "14:27:48", detail: "Policy check: amount 2.5 USDT < 100 USDT limit -- PASS" },
];

interface AuditEntry {
  id: string;
  timestamp: string;
  eventType: string;
  details: string;
  status: "success" | "failure" | "warning";
}

const typeBadge = (t: string) => {
  if (t === "tip" || t === "tip_sent") return "bg-primary/15 text-primary border-primary/30";
  if (t === "escrow" || t === "escrow_created") return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (t === "yield" || t === "yield_harvest") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (t === "swap" || t === "dca") return "bg-purple-500/15 text-purple-400 border-purple-500/30";
  if (t === "tip_failed" || t === "failure") return "bg-red-500/15 text-red-400 border-red-500/30";
  if (t === "limit_exceeded" || t === "warning") return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  if (t === "settings_changed") return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
  return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
};

const statusBadge = (s: string) => {
  if (s === "success") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (s === "failure") return "bg-red-500/15 text-red-400 border-red-500/30";
  return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
};

export default function Compliance() {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/audit?limit=50`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.entries && Array.isArray(data.entries)) {
        setAuditEntries(data.entries);
        setIsDemo(false);
      } else {
        throw new Error("bad format");
      }
    } catch {
      setAuditEntries([]);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  // Compute stats from real audit entries
  const totalEntries = auditEntries.length;
  const successCount = auditEntries.filter((e) => e.status === "success").length;
  const failureCount = auditEntries.filter((e) => e.status === "failure").length;
  const warningCount = auditEntries.filter((e) => e.status === "warning").length;

  // Group by eventType for the "tax events" table
  const tipEvents = auditEntries.filter((e) => e.eventType === "tip_sent" || e.eventType === "tip_failed");

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tax & Audit Compliance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isDemo ? "Demo data — backend not reachable" : `Live audit trail — ${totalEntries} entries from backend`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAudit} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Tax Settings / Summary */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <FileCheck className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
            Audit Summary
          </h3>
          <div className="space-y-3">
            <div className="rounded-lg bg-accent/30 p-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Entries</span>
              <span className="text-xs font-medium tabular-nums">{isDemo ? 10 : totalEntries}</span>
            </div>
            <div className="rounded-lg bg-accent/30 p-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Successful</span>
              <span className="text-xs font-medium tabular-nums text-emerald-400">{isDemo ? 7 : successCount}</span>
            </div>
            <div className="rounded-lg bg-accent/30 p-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Failures</span>
              <span className="text-xs font-medium tabular-nums text-red-400">{isDemo ? 1 : failureCount}</span>
            </div>
            <div className="rounded-lg bg-accent/30 p-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Warnings</span>
              <span className="text-xs font-medium tabular-nums text-yellow-400">{isDemo ? 2 : warningCount}</span>
            </div>
          </div>
        </div>

        {/* Tax Events Table (from audit or demo) */}
        <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Transaction Events</h3>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.success("Export triggered")}>
              <Download className="h-3 w-3 mr-1" />Export CSV
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-5 py-2 font-medium">Date</th>
                  <th className="text-center px-3 py-2 font-medium">Type</th>
                  <th className="text-center px-3 py-2 font-medium">Status</th>
                  <th className="text-left px-3 py-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {!isDemo && auditEntries.length > 0 ? (
                  auditEntries.slice(0, 15).map((e) => (
                    <tr key={e.id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-5 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(e.timestamp).toLocaleDateString()}{" "}
                        <span className="text-muted-foreground/60">{new Date(e.timestamp).toLocaleTimeString()}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge variant="outline" className={`text-[9px] ${typeBadge(e.eventType)}`}>{e.eventType}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge variant="outline" className={`text-[9px] ${statusBadge(e.status)}`}>{e.status}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-xs truncate" title={e.details}>
                        {e.details}
                      </td>
                    </tr>
                  ))
                ) : (
                  demoTaxEvents.map((e) => (
                    <tr key={e.id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-5 py-2.5 text-xs text-muted-foreground">{e.date}</td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge variant="outline" className={`text-[9px] ${typeBadge(e.type)}`}>{e.type}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge variant="outline" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">success</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {e.amount} to {e.recipient} on {e.chain}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="rounded-xl border border-border/50 bg-card/50">
        <div className="px-5 py-3 border-b border-border/40">
          <h3 className="text-sm font-semibold">Full Audit Trail</h3>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="divide-y divide-border/20">
            {!isDemo && auditEntries.length > 0 ? (
              auditEntries.map((a) => (
                <div key={a.id} className="px-5 py-2.5 flex items-start gap-3 hover:bg-accent/30 transition-colors">
                  <span className="text-[10px] font-mono text-muted-foreground/60 mt-0.5 w-20 shrink-0">
                    {new Date(a.timestamp).toLocaleTimeString()}
                  </span>
                  <Badge variant="outline" className={`text-[9px] shrink-0 ${typeBadge(a.eventType)}`}>{a.eventType}</Badge>
                  <Badge variant="outline" className={`text-[9px] shrink-0 ${statusBadge(a.status)}`}>{a.status}</Badge>
                  <span className="text-xs text-muted-foreground">{a.details}</span>
                </div>
              ))
            ) : (
              demoAuditTrail.map((a) => (
                <div key={a.id} className="px-5 py-2.5 flex items-start gap-3 hover:bg-accent/30 transition-colors">
                  <span className="text-[10px] font-mono text-muted-foreground/60 mt-0.5 w-16 shrink-0">{a.time}</span>
                  <Badge variant="outline" className="text-[9px] shrink-0">{a.action}</Badge>
                  <span className="text-xs text-muted-foreground">{a.detail}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
