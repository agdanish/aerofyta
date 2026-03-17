import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import CountUp from "@/components/shared/CountUp";
import { useFetch } from "@/hooks/useFetch";
import { Vote, Plus, Check, X, Users, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

const API = import.meta.env.PROD ? "" : "http://localhost:3001";

/* ── Demo fallback ── */
const demoProposals = {
  proposals: [
    { id: "PROP-012", title: "Increase max tip to 25 USDT", status: "voting", votesFor: 2, votesAgainst: 1, deadline: "2h 15m", description: "Raise the per-transaction tip limit from 10 to 25 USDT.", proposer: "Agent A", createdAt: new Date().toISOString(), voters: [] as string[] },
    { id: "PROP-011", title: "Add Arbitrum chain support", status: "approved", votesFor: 3, votesAgainst: 0, deadline: "Closed", description: "Integrate Arbitrum One for low-cost L2 transactions.", proposer: "Agent B", createdAt: new Date().toISOString(), voters: [] as string[] },
    { id: "PROP-010", title: "Reduce rebalance interval to daily", status: "rejected", votesFor: 1, votesAgainst: 2, deadline: "Closed", description: "Switch treasury rebalance from weekly to daily.", proposer: "Agent C", createdAt: new Date().toISOString(), voters: [] as string[] },
    { id: "PROP-009", title: "Enable ZK proofs for reputation", status: "approved", votesFor: 3, votesAgainst: 0, deadline: "Closed", description: "Use zero-knowledge proofs for privacy-preserving reputation.", proposer: "Agent A", createdAt: new Date().toISOString(), voters: [] as string[] },
    { id: "PROP-008", title: "Whitelist Beefy yield vault", status: "voting", votesFor: 1, votesAgainst: 1, deadline: "5h 42m", description: "Add Beefy Finance vault to approved yield strategies.", proposer: "Agent B", createdAt: new Date().toISOString(), voters: [] as string[] },
  ],
};

const demoStats = {
  totalProposals: 12, activeProposals: 2, approvedProposals: 8,
  rejectedProposals: 2, totalVotes: 36, avgParticipation: 96,
  avgApprovalRate: 75, governingAgents: 5, avgDecisionTime: 0,
};

/* ── Helpers ── */
const statusBadge = (s: string) => {
  if (s === "voting") return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (s === "approved" || s === "executed") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  return "bg-red-500/15 text-red-400 border-red-500/30";
};

// Map API proposal shape to display shape
interface DisplayProposal {
  id: string;
  title: string;
  status: string;
  votesFor: number;
  votesAgainst: number;
  description: string;
  proposer: string;
}

function mapProposal(p: Record<string, unknown>): DisplayProposal {
  // Real API shape has: id, title, description, status, proposer, votes (array), votesFor, votesAgainst
  return {
    id: String(p.id ?? ""),
    title: String(p.title ?? ""),
    status: String(p.status ?? "pending"),
    votesFor: Number(p.votesFor ?? 0),
    votesAgainst: Number(p.votesAgainst ?? 0),
    description: String(p.description ?? ""),
    proposer: String(p.proposer ?? ""),
  };
}

export default function Governance() {
  const [voted, setVoted] = useState<Record<string, string>>({});
  const [newOpen, setNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const { data: proposalsData, isDemo } = useFetch("/api/advanced/governance/proposals", demoProposals);
  const { data: stats } = useFetch("/api/advanced/governance/stats", demoStats);

  const rawProposals = proposalsData.proposals ?? [];
  const proposals: DisplayProposal[] = rawProposals.map((p: Record<string, unknown>) => mapProposal(p as Record<string, unknown>));

  const vote = async (id: string, direction: string) => {
    try {
      await fetch(`${API}/api/advanced/governance/proposals/${id}/veto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: direction }),
      });
      setVoted((v) => ({ ...v, [id]: direction }));
      toast.success(`Vote recorded: ${direction}`);
    } catch {
      toast.error("Failed to record vote");
    }
  };

  const createProposal = async () => {
    if (!newTitle.trim()) { toast.error("Title is required"); return; }
    try {
      await fetch(`${API}/api/advanced/governance/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDesc }),
      });
      toast.success('Proposal created');
      setNewTitle("");
      setNewDesc("");
      setNewOpen(false);
    } catch {
      toast.error("Failed to create proposal");
    }
  };

  const activeVoting = proposals.filter((p) => p.status === "voting").length;

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Democratic Decision-Making</h1>
          <p className="text-sm text-muted-foreground mt-1">Multi-agent governance with proposal voting and consensus tracking.</p>
        </div>
        {isDemo && <Badge variant="outline" className="text-[9px] bg-yellow-500/15 text-yellow-400 border-yellow-500/30">DEMO</Badge>}
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Proposals", value: stats.totalProposals ?? proposals.length, icon: Vote },
          { label: "Approval Rate", value: Math.round(stats.avgApprovalRate ?? 0), suffix: "%", icon: ThumbsUp },
          { label: "Governing Agents", value: stats.governingAgents ?? 5, icon: Users },
          { label: "Active Votes", value: stats.activeProposals ?? activeVoting, icon: ThumbsDown },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-5">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            </div>
            <div className="text-2xl font-bold tabular-nums tracking-tight">
              <CountUp target={s.value} />{s.suffix}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Proposals */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Proposals ({proposals.length})</h3>
            <Dialog open={newOpen} onOpenChange={setNewOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Proposal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="prop-title">Title</Label>
                    <Input id="prop-title" placeholder="Proposal title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prop-desc">Description</Label>
                    <Textarea id="prop-desc" placeholder="Describe the proposal..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} />
                  </div>
                  <Button className="w-full" onClick={createProposal}>Submit Proposal</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <ScrollArea className="h-[380px]">
            <div className="divide-y divide-border/20">
              {proposals.map((p) => {
                const totalVotes = p.votesFor + p.votesAgainst;
                return (
                  <div key={p.id} className="px-5 py-3 hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-muted-foreground/60">{p.id}</span>
                      <Badge variant="outline" className={`text-[9px] ${statusBadge(p.status)}`}>{p.status}</Badge>
                      {p.proposer && <span className="text-[10px] text-muted-foreground ml-auto">by {p.proposer}</span>}
                    </div>
                    <p className="text-sm font-medium mb-1">{p.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">{p.description}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Progress value={totalVotes > 0 ? (p.votesFor / totalVotes) * 100 : 0} className="h-1.5 bg-secondary" />
                      </div>
                      <span className="text-[10px] tabular-nums text-muted-foreground">{p.votesFor}/{totalVotes}</span>
                      {p.status === "voting" && !voted[p.id] && (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => vote(p.id, "for")}>
                            <Check className="h-3 w-3" style={{ color: "#50AF95" }} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => vote(p.id, "against")}>
                            <X className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      )}
                      {voted[p.id] && <Badge variant="outline" className="text-[9px]">Voted</Badge>}
                    </div>
                  </div>
                );
              })}
              {proposals.length === 0 && <div className="px-5 py-8 text-center text-xs text-muted-foreground">No proposals yet</div>}
            </div>
          </ScrollArea>
        </div>

        {/* Governance Stats Detail */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="text-sm font-semibold">Governance Statistics</h3>
          </div>
          <div className="divide-y divide-border/20">
            {[
              { label: "Approved", value: stats.approvedProposals ?? 0, color: "text-emerald-400" },
              { label: "Rejected", value: stats.rejectedProposals ?? 0, color: "text-red-400" },
              { label: "Executed", value: (stats as Record<string, unknown>).executedProposals != null ? Number((stats as Record<string, unknown>).executedProposals) : 0, color: "text-blue-400" },
              { label: "Total Votes Cast", value: stats.totalVotes ?? 0, color: "text-foreground" },
              { label: "Avg Participation", value: `${Math.round(stats.avgParticipation ?? 0)}%`, color: "text-foreground" },
              { label: "Governing Agents", value: stats.governingAgents ?? 0, color: "text-foreground" },
            ].map((item) => (
              <div key={item.label} className="px-5 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className={`text-sm font-bold tabular-nums ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
