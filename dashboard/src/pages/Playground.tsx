import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Send, Lock, Brain, Play, Check, Loader2, MessageSquare } from "lucide-react";
import ConfidenceMeter from "@/components/shared/ConfidenceMeter";

export default function Playground() {
  // Tip state
  const [tipSent, setTipSent] = useState(false);
  const [tipLoading, setTipLoading] = useState(false);

  // Escrow state
  const [escrowPhase, setEscrowPhase] = useState<"idle" | "created" | "claimed">("idle");
  const [escrowLoading, setEscrowLoading] = useState(false);
  const escrowSecret = "a3f8c2e1d4b7...9f0e";

  // Chat state
  const [chatInput, setChatInput] = useState("What's the best chain for micro-tips under $5?");
  const [chatResponse, setChatResponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Reasoning state
  const [reasoningActive, setReasoningActive] = useState(false);
  const [reasoningStep, setReasoningStep] = useState(0);
  const [reasoningConfidence, setReasoningConfidence] = useState(0);

  const reasoningSteps = [
    { text: "Analyzing wallet state across 9 chains...", confidence: 18 },
    { text: "Evaluating creator engagement: @sarah_creates +12%", confidence: 42 },
    { text: "Multi-agent vote: 2/3 approve tip action", confidence: 68 },
    { text: "Guardian review: APPROVED — no anomalies", confidence: 85 },
    { text: "Executing tip: 2.5 USDT → @sarah_creates on Ethereum", confidence: 97 },
  ];

  const handleTip = () => {
    setTipLoading(true);
    setTimeout(() => { setTipLoading(false); setTipSent(true); }, 1800);
  };

  const handleCreateEscrow = () => {
    setEscrowLoading(true);
    setTimeout(() => { setEscrowLoading(false); setEscrowPhase("created"); }, 1500);
  };

  const handleClaimEscrow = () => {
    setEscrowLoading(true);
    setTimeout(() => { setEscrowLoading(false); setEscrowPhase("claimed"); }, 1200);
  };

  const handleChat = async () => {
    setChatLoading(true);
    setChatResponse("");
    try {
      const res = await fetch((import.meta.env.PROD ? "" : "http://localhost:3001") + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput }),
        signal: AbortSignal.timeout(10000),
      });
      const json = await res.json();
      const response = json.message?.content ?? json.response ?? "No response from agent.";
      let i = 0;
      const interval = setInterval(() => {
        if (i >= response.length) { clearInterval(interval); setChatLoading(false); return; }
        setChatResponse(response.slice(0, i + 1));
        i++;
      }, 12);
    } catch {
      const fallback = "For micro-tips under $5, I recommend Polygon or Tron. Both have sub-cent gas fees, fast finality (<3s), and full USDT support via Tether WDK.";
      setChatResponse(fallback);
      setChatLoading(false);
    }
  };

  const handleReasoning = () => {
    setReasoningActive(true);
    setReasoningStep(0);
    setReasoningConfidence(0);
    let step = 0;
    const interval = setInterval(() => {
      if (step >= reasoningSteps.length) { clearInterval(interval); setReasoningActive(false); return; }
      setReasoningStep(step + 1);
      setReasoningConfidence(reasoningSteps[step].confidence);
      step++;
    }, 1400);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Playground</h1>
        <p className="text-sm text-muted-foreground mt-1">Interactive sandbox — click any card to see AeroFyta in action.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Try a Tip */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Send className="h-4 w-4 text-primary" />Try a Tip</CardTitle>
            <CardDescription>Send a tip to a creator on Ethereum</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Recipient</label>
                <Input value="@sarah_creates" readOnly className="bg-secondary/30 border-border/40 mt-1 text-sm h-9" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Amount</label>
                <Input value="2.50 USDT" readOnly className="bg-secondary/30 border-border/40 mt-1 text-sm h-9" />
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground">Chain: Ethereum · Gas: ~0.0012 ETH</div>
            {tipSent ? (
              <div className="flex items-center gap-2 text-sm text-success">
                <Check className="h-4 w-4" />
                <span>Tip sent! TX: 0xabc...def</span>
              </div>
            ) : (
              <Button onClick={handleTip} disabled={tipLoading} className="w-full" size="sm">
                {tipLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : "Send Tip →"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Try an Escrow */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4 text-primary" />Try an Escrow</CardTitle>
            <CardDescription>Create & claim a trustless HTLC escrow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Amount</label>
                <Input value="50 USDT" readOnly className="bg-secondary/30 border-border/40 mt-1 text-sm h-9" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Timelock</label>
                <Input value="2 hours" readOnly className="bg-secondary/30 border-border/40 mt-1 text-sm h-9" />
              </div>
            </div>
            {escrowPhase === "idle" && (
              <Button onClick={handleCreateEscrow} disabled={escrowLoading} className="w-full" size="sm">
                {escrowLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : "Create Escrow →"}
              </Button>
            )}
            {escrowPhase === "created" && (
              <div className="space-y-2">
                <div className="rounded-lg bg-secondary/30 p-2 text-xs font-mono break-all">
                  <span className="text-muted-foreground">Secret: </span>{escrowSecret}
                </div>
                <Button onClick={handleClaimEscrow} disabled={escrowLoading} variant="outline" className="w-full" size="sm">
                  {escrowLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Claiming...</> : "Claim with Secret →"}
                </Button>
              </div>
            )}
            {escrowPhase === "claimed" && (
              <div className="flex items-center gap-2 text-sm text-success">
                <Check className="h-4 w-4" />
                <span>Escrow claimed! 50 USDT released.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ask the Agent */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" />Ask the Agent</CardTitle>
            <CardDescription>Chat with the AeroFyta agent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="bg-secondary/30 border-border/40 text-sm h-9"
            />
            <Button onClick={handleChat} disabled={chatLoading} className="w-full" size="sm">
              {chatLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Thinking...</> : "Ask →"}
            </Button>
            {chatResponse && (
              <div className="rounded-lg bg-secondary/30 p-3 text-sm leading-relaxed animate-fade-in">
                {chatResponse}
                {chatLoading && <span className="inline-block w-1.5 h-4 bg-primary/60 ml-0.5 animate-pulse" />}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Run Reasoning */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" />Run Reasoning</CardTitle>
            <CardDescription>Watch multi-agent consensus in real time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value="Analyze portfolio and recommend next tip" readOnly className="bg-secondary/30 border-border/40 text-sm h-9" />
            <Button onClick={handleReasoning} disabled={reasoningActive} className="w-full" size="sm">
              {reasoningActive ? <><Loader2 className="h-4 w-4 animate-spin" />Running...</> : <><Play className="h-4 w-4" />Start Reasoning</>}
            </Button>
            {reasoningStep > 0 && (
              <div className="space-y-2 animate-fade-in">
                {reasoningSteps.slice(0, reasoningStep).map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-success mt-0.5">✓</span>
                    <span className="text-foreground/80">{s.text}</span>
                  </div>
                ))}
                {reasoningActive && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "200ms" }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "400ms" }} />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Progress value={reasoningConfidence} className="h-1.5 flex-1 bg-secondary" />
                  <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">{reasoningConfidence}%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
