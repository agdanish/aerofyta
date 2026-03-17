import { useState, useRef, useCallback } from "react";
import { demoSteps } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JsonViewer from "@/components/shared/JsonViewer";
import {
  Play, CheckCircle2, Loader2, Wallet, LockKeyhole, Unlock,
  Bot, CalendarClock, Heart, Award, Activity, BarChart3, Wifi, WifiOff,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

const API_BASE = import.meta.env.PROD ? "" : "http://localhost:3001";

interface DemoStepResult {
  id: number;
  name: string;
  result: string;
  liveData?: unknown;
}

const stepPreviews: { id: number; name: string; icon: LucideIcon }[] = [
  { id: 1, name: "Wallet Info", icon: Wallet },
  { id: 2, name: "Create Escrow", icon: LockKeyhole },
  { id: 3, name: "Claim Escrow", icon: Unlock },
  { id: 4, name: "Autonomous Cycle", icon: Bot },
  { id: 5, name: "DCA Plan", icon: CalendarClock },
  { id: 6, name: "Engagement", icon: Heart },
  { id: 7, name: "YouTube Data", icon: Play },
  { id: 8, name: "Reputation", icon: Award },
  { id: 9, name: "Mood / Pulse", icon: Activity },
  { id: 10, name: "Full Stats", icon: BarChart3 },
];

export default function Demo() {
  const [mode, setMode] = useState("full");
  const [fullResults, setFullResults] = useState<DemoStepResult[]>([]);
  const [fullRunning, setFullRunning] = useState(false);
  const [fullProgress, setFullProgress] = useState(0);
  const [stepResults, setStepResults] = useState<Record<number, { result: string; liveData?: unknown }>>({});
  const [stepLoading, setStepLoading] = useState<number | null>(null);
  const [isLive, setIsLive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const totalSteps = demoSteps.length;

  /** Run full demo via SSE POST /api/demo/run-full, fallback to demo data */
  const runFull = useCallback(async () => {
    setFullRunning(true);
    setFullResults([]);
    setFullProgress(0);

    try {
      const res = await fetch(`${API_BASE}/api/demo/run-full`, {
        method: "POST",
        headers: { Accept: "text/event-stream" },
        signal: AbortSignal.timeout(60000),
      });

      if (!res.ok || !res.body) throw new Error("SSE not available");

      setIsLive(true);
      const reader = res.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = "";
      let stepCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);

            // The SSE sends { step, total, title, result, status }
            stepCount++;
            const stepResult: DemoStepResult = {
              id: data.step ?? stepCount,
              name: data.title ?? `Step ${stepCount}`,
              result: typeof data.result === "string" ? data.result : JSON.stringify(data.result),
              liveData: data.result,
            };

            setFullResults((prev) => [...prev, stepResult]);
            setFullProgress(((data.step ?? stepCount) / (data.total ?? totalSteps)) * 100);

            if (data.status === "complete" || data.step === data.total) {
              setFullRunning(false);
              reader.cancel();
              readerRef.current = null;
              return;
            }
          } catch {
            // Non-JSON SSE line, skip
          }
        }
      }

      setFullRunning(false);
      readerRef.current = null;
    } catch {
      // Fallback to demo data
      setIsLive(false);
      fallbackFullDemo();
    }
  }, [totalSteps]);

  const fallbackFullDemo = () => {
    setFullResults([]);
    setFullProgress(0);
    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i >= demoSteps.length) {
        clearInterval(intervalRef.current);
        setFullRunning(false);
        return;
      }
      const step = demoSteps[i];
      setFullResults((prev) => [...prev, { id: step.id, name: step.name, result: step.result }]);
      setFullProgress(((i + 1) / demoSteps.length) * 100);
      i++;
    }, 800);
  };

  /** Run a single step via POST /api/demo/step */
  const runStep = async (step: typeof demoSteps[0]) => {
    setStepLoading(step.id);

    try {
      const res = await fetch(`${API_BASE}/api/demo/step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: step.id }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Real API returns { step, total, title, result, status }
      const resultStr = typeof data.result === "string" ? data.result : JSON.stringify(data.result);
      setStepResults((prev) => ({
        ...prev,
        [step.id]: { result: data.title ? `${data.title}: ${resultStr}` : resultStr, liveData: data.result },
      }));
      setIsLive(true);
    } catch {
      // Fallback to demo data
      await new Promise((r) => setTimeout(r, 400));
      setStepResults((prev) => ({ ...prev, [step.id]: { result: step.result } }));
    } finally {
      setStepLoading(null);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interactive Demo</h1>
          <p className="text-sm text-muted-foreground mt-1">Experience every capability. No terminal required.</p>
        </div>
        <Badge variant="outline" className={`text-[10px] ${isLive ? "text-emerald-400 border-emerald-500/30" : "text-yellow-400 border-yellow-500/30"}`}>
          {isLive ? <><Wifi className="h-3 w-3 mr-1" />Live</> : <><WifiOff className="h-3 w-3 mr-1" />Demo</>}
        </Badge>
      </div>

      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="bg-secondary/50 mb-6">
          <TabsTrigger value="full">Full Demo</TabsTrigger>
          <TabsTrigger value="step">Step-by-Step</TabsTrigger>
        </TabsList>

        <TabsContent value="full">
          <div className="rounded-xl border border-border/50 bg-card/50 p-6">
            {!fullRunning && fullResults.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Run all 10 demo steps in sequence</p>
                <Button onClick={runFull} className="bg-primary hover:bg-primary/90 h-12 px-8 mb-8">
                  <Play className="h-4 w-4 mr-2" />Run Full Demo
                </Button>

                {/* Step preview cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-2xl mx-auto">
                  {stepPreviews.map((s) => (
                    <div key={s.id} className="rounded-lg border border-border/40 bg-card/30 px-3 py-2.5 text-center">
                      <s.icon className="h-5 w-5 mx-auto mb-1" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
                      <div className="text-[10px] font-mono text-muted-foreground/60 mb-0.5">{s.id}</div>
                      <div className="text-[11px] font-medium text-foreground/80">{s.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(fullRunning || fullResults.length > 0) && (
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-mono tabular-nums">{fullResults.length}/{totalSteps}</span>
                  </div>
                  <Progress value={fullProgress} className="h-2 bg-secondary" />
                </div>
                <div className="space-y-2">
                  {fullResults.map((step) => (
                    <div key={step.id} className="p-3 rounded-lg bg-accent/20 animate-fade-in">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.5} style={{ color: "#50AF95" }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{step.name}</span>
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Done</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 break-all">{step.result}</p>
                        </div>
                      </div>
                      {/* Show live data as expandable JSON if available */}
                      {step.liveData && typeof step.liveData === "object" && (
                        <div className="mt-2 ml-7">
                          <details className="text-xs">
                            <summary className="text-muted-foreground cursor-pointer hover:text-foreground">View raw response</summary>
                            <div className="mt-1">
                              <JsonViewer data={step.liveData} />
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  ))}
                  {fullRunning && (
                    <div className="flex items-center gap-2 px-3 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Running next step...</span>
                    </div>
                  )}
                </div>
                {!fullRunning && fullResults.length >= totalSteps && (
                  <div className="mt-6 text-center">
                    <Button variant="outline" onClick={() => { setFullResults([]); setFullProgress(0); }}>Reset Demo</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="step">
          <div className="grid sm:grid-cols-2 gap-3">
            {demoSteps.map((step) => (
              <div key={step.id} className="rounded-xl border border-border/50 bg-card/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono text-muted-foreground w-5">{String(step.id).padStart(2, "0")}</span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3 ml-8">{step.description}</p>
                {stepResults[step.id] ? (
                  <div className="ml-8">
                    <div className="p-2.5 rounded-md bg-emerald-500/8 border border-emerald-500/20 text-xs text-emerald-400 animate-fade-in break-all">
                      {stepResults[step.id].result}
                    </div>
                    {/* Show live data as expandable JSON */}
                    {stepResults[step.id].liveData && typeof stepResults[step.id].liveData === "object" && (
                      <details className="text-xs mt-2">
                        <summary className="text-muted-foreground cursor-pointer hover:text-foreground">View raw response</summary>
                        <div className="mt-1">
                          <JsonViewer data={stepResults[step.id].liveData} />
                        </div>
                      </details>
                    )}
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-8 h-7 text-xs"
                    disabled={stepLoading !== null}
                    onClick={() => runStep(step)}
                  >
                    {stepLoading === step.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                    Run
                  </Button>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
