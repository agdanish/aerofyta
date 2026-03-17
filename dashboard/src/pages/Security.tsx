import { useState, useEffect } from "react";
import { demoAdversarialTests, demoPolicies } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Shield, ShieldCheck, Play, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API = import.meta.env.PROD ? "" : "http://localhost:3001";

interface Scenario {
  id: string;
  name: string;
  description: string;
}

interface TestResult {
  scenario: string;
  attack: string;
  blocked: boolean;
  blockedBy: string;
  reasoning: string;
}

interface RunAllResponse {
  summary: { total: number; blocked: number; passed: number };
  results: TestResult[];
}

interface DemoTest {
  name: string;
  blocked: boolean;
  blockedBy: string;
  reason: string;
}

interface Policy {
  id: number | string;
  name: string;
  value: string;
  active?: boolean;
}

export default function Security() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [testResults, setTestResults] = useState<(DemoTest & { description?: string })[]>([]);
  const [testsRun, setTestsRun] = useState(false);
  const [running, setRunning] = useState(false);
  const [visibleTests, setVisibleTests] = useState<number[]>([]);
  const [allRevealed, setAllRevealed] = useState(false);
  const [summary, setSummary] = useState<{ total: number; blocked: number; passed: number } | null>(null);
  const [policies, setPolicies] = useState<Policy[]>(demoPolicies);
  const [addPolicyOpen, setAddPolicyOpen] = useState(false);
  const [newPolicyType, setNewPolicyType] = useState("max_amount");
  const [newPolicyValue, setNewPolicyValue] = useState("");
  const [creditAddr, setCreditAddr] = useState("0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28");
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [creditLoading, setCreditLoading] = useState(false);
  const [creditFactors, setCreditFactors] = useState<{ name: string; value: number; impact: string }[]>([]);

  // Load scenarios on mount
  useEffect(() => {
    fetch(`${API}/api/demo/adversarial`, { signal: AbortSignal.timeout(5000) })
      .then((r) => r.json())
      .then((data: { scenarios: Scenario[] }) => {
        setScenarios(data.scenarios);
        // Pre-populate test cards from scenarios (not yet run)
        setTestResults(
          data.scenarios.map((s) => ({
            name: s.name,
            blocked: true,
            blockedBy: "",
            reason: s.description,
            description: s.description,
          }))
        );
      })
      .catch(() => {
        // Fallback to demo data
        setTestResults(demoAdversarialTests.map((t) => ({ ...t, description: t.reason })));
      });
  }, []);

  const runTests = async () => {
    setRunning(true);
    setTestsRun(true);
    setVisibleTests([]);
    setAllRevealed(false);
    setSummary(null);

    try {
      const res = await fetch(`${API}/api/demo/adversarial/run-all`, {
        method: "POST",
        signal: AbortSignal.timeout(15000),
      });
      const data: RunAllResponse = await res.json();

      // Map API results to display format
      const mapped = data.results.map((r) => ({
        name: r.scenario,
        blocked: r.blocked,
        blockedBy: r.blockedBy.replace(/_/g, " "),
        reason: r.reasoning.length > 120 ? r.reasoning.slice(0, 120) + "..." : r.reasoning,
        description: r.attack,
      }));
      setTestResults(mapped);
      setSummary(data.summary);

      // Animate reveal
      mapped.forEach((_, i) => {
        setTimeout(() => {
          setVisibleTests((prev) => [...prev, i]);
          if (i === mapped.length - 1) setAllRevealed(true);
        }, (i + 1) * 300);
      });
    } catch {
      // Fallback: animate demo data
      const demo = demoAdversarialTests.map((t) => ({ ...t, description: t.reason }));
      setTestResults(demo);
      demo.forEach((_, i) => {
        setTimeout(() => {
          setVisibleTests((prev) => [...prev, i]);
          if (i === demo.length - 1) setAllRevealed(true);
        }, (i + 1) * 300);
      });
    } finally {
      setRunning(false);
    }
  };

  const getCreditScore = async () => {
    setCreditLoading(true);
    setCreditScore(null);
    setCreditFactors([]);
    try {
      const res = await fetch(`${API}/api/credit/${creditAddr}`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error("not found");
      const data = await res.json();
      setCreditScore(data.score ?? 500);
      setCreditFactors(data.factors ?? []);
    } catch {
      // Fallback
      setCreditScore(782);
    } finally {
      setCreditLoading(false);
    }
  };

  const scoreColor = (s: number) => s >= 750 ? "text-success" : s >= 600 ? "text-yellow-400" : "text-destructive";
  const scoreLabel = (s: number) => s >= 750 ? "Excellent" : s >= 600 ? "Good" : s >= 400 ? "Fair" : "Poor";

  const gaugeArc = (score: number) => {
    const min = 300, max = 850;
    const pct = Math.max(0, Math.min(1, (score - min) / (max - min)));
    const startAngle = -135;
    const endAngle = startAngle + pct * 270;
    const r = 50;
    const cx = 60, cy = 60;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const largeArc = pct * 270 > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const blockedCount = testResults.filter((t) => t.blocked).length;
  const passedCount = testResults.filter((t) => !t.blocked).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Security Architecture</h1>
        <p className="text-sm text-muted-foreground mt-1">Six layers of defense. Adversarial-tested against the real backend.</p>
      </div>

      {/* Adversarial Tests */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Button onClick={runTests} disabled={running} className="bg-primary hover:bg-primary/90" size="sm">
            {running ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Play className="h-3.5 w-3.5 mr-2" />}
            {running ? "Running..." : allRevealed ? "Re-run Tests" : "Run Adversarial Tests"}
          </Button>
          {allRevealed && summary && (
            <div className="flex items-center gap-2 animate-fade-in">
              <ShieldCheck className="h-5 w-5 text-success" style={{ animation: "pulse-glow 2s ease-in-out infinite" }} />
              <span className="text-sm text-success font-medium">
                {summary.blocked}/{summary.total} Attacks Blocked
              </span>
              {summary.passed > 0 && (
                <span className="text-sm text-yellow-400">({summary.passed} passed through)</span>
              )}
            </div>
          )}
          {allRevealed && !summary && (
            <div className="flex items-center gap-2 animate-fade-in">
              <ShieldCheck className="h-5 w-5 text-success" style={{ animation: "pulse-glow 2s ease-in-out infinite" }} />
              <span className="text-sm text-success font-medium">All Attacks Blocked (demo)</span>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {testResults.map((test, i) => (
            <div
              key={test.name}
              className={`rounded-xl border border-border/50 bg-card/50 p-4 transition-all duration-500 ${
                visibleTests.includes(i) ? "opacity-100 translate-y-0" : testsRun ? "opacity-0 translate-y-3" : "opacity-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{test.name}</span>
                {visibleTests.includes(i) && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] animate-scale-in ${
                      test.blocked
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                    }`}
                  >
                    {test.blocked ? "Blocked" : "Passed"}
                  </Badge>
                )}
              </div>
              {!testsRun && test.description && (
                <p className="text-xs text-muted-foreground">{test.description}</p>
              )}
              {visibleTests.includes(i) && (
                <div className="animate-fade-in">
                  {test.blockedBy && (
                    <p className="text-xs text-muted-foreground mb-1">
                      {test.blocked ? "Blocked by" : "Allowed by"}: <span className="text-foreground">{test.blockedBy}</span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{test.reason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Policies */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Security Policies</h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAddPolicyOpen(true)}>
              <Plus className="h-3 w-3 mr-1" />Add
            </Button>
          </div>
          <div className="divide-y divide-border/30">
            {policies.map((p) => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-sm">{p.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{p.value}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => setPolicies(policies.filter(x => x.id !== p.id))}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Add Policy Dialog */}
        <Dialog open={addPolicyOpen} onOpenChange={setAddPolicyOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Security Policy</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-xs">Policy Type</Label>
                <Select value={newPolicyType} onValueChange={setNewPolicyType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="max_amount">Max Amount</SelectItem>
                    <SelectItem value="daily_cap">Daily Cap</SelectItem>
                    <SelectItem value="recipient_blacklist">Recipient Blacklist</SelectItem>
                    <SelectItem value="frequency_limit">Frequency Limit</SelectItem>
                    <SelectItem value="chain_restriction">Chain Restriction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Value</Label>
                <Input className="mt-1" placeholder="e.g. 1000 or 0x..." value={newPolicyValue} onChange={(e) => setNewPolicyValue(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setAddPolicyOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={async () => {
                try {
                  const res = await fetch(`${API}/api/policies/rules`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: newPolicyType, value: newPolicyValue, enabled: true }),
                  });
                  const data = await res.json();
                  toast.success("Policy added");
                  setPolicies((prev) => [...prev, { id: data.id ?? Date.now(), name: newPolicyType.replace(/_/g, ' '), value: newPolicyValue, active: true }]);
                  setNewPolicyValue("");
                  setAddPolicyOpen(false);
                } catch (err) {
                  toast.error(`Failed to add policy: ${err instanceof Error ? err.message : "Unknown error"}`);
                }
              }}>Add Policy</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Credit Score */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <h3 className="text-sm font-semibold mb-4">Credit Score</h3>
          <div className="flex gap-3 mb-4 flex-wrap sm:flex-nowrap">
            <Input value={creditAddr} onChange={(e) => setCreditAddr(e.target.value)} placeholder="Wallet address" className="bg-background text-xs font-mono" />
            <Button size="sm" variant="outline" onClick={getCreditScore} disabled={creditLoading} className="shrink-0">
              {creditLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Check"}
            </Button>
          </div>
          {creditScore !== null && (
            <div className="flex flex-col items-center animate-fade-in">
              <svg width="140" height="100" viewBox="0 0 120 100">
                <path d={gaugeArc(850)} fill="none" stroke="hsl(240, 4%, 16%)" strokeWidth="8" strokeLinecap="round" />
                <path d={gaugeArc(creditScore)} fill="none" stroke="hsl(161, 37%, 50%)" strokeWidth="8" strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <span className={`text-3xl font-bold tabular-nums -mt-2 ${scoreColor(creditScore)}`}>{creditScore}</span>
              <span className={`text-xs mt-1 ${scoreColor(creditScore)}`}>{scoreLabel(creditScore)}</span>
              {creditFactors.length > 0 && (
                <div className="mt-3 w-full space-y-1">
                  {creditFactors.map((f) => (
                    <div key={f.name} className="flex items-center justify-between text-xs px-2">
                      <span className="text-muted-foreground">{f.name}</span>
                      <span className={f.impact === "positive" ? "text-success" : f.impact === "negative" ? "text-destructive" : "text-muted-foreground"}>
                        {f.value}/100
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
