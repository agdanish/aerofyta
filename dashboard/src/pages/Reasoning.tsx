import { useState, useRef, useEffect, useCallback } from "react";
import { demoReasoningSteps } from "@/lib/demo-data";
import ConfidenceMeter from "@/components/shared/ConfidenceMeter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Brain, Zap, Eye, MessageCircle, CheckCircle, Wifi, WifiOff } from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { API_BASE } from "@/hooks/useFetch";

interface ReasoningCard {
  type: string;
  label: string;
  content: string;
  confidence: number;
  source: string;
}

const typeIcons: Record<string, LucideIcon> = {
  thought: Brain,
  action: Zap,
  observation: Eye,
  reflection: MessageCircle,
  decision: CheckCircle,
};

const prefilledTrace: ReasoningCard[] = [
  { type: "thought", label: "Thought", content: "Analyzing top creator engagement scores across Rumble and YouTube...", confidence: 22, source: "Engagement Scanner" },
  { type: "action", label: "Action", content: "Calling price_check tool for ETH/USDT pair on CoinGecko oracle.", confidence: 40, source: "Tool Executor" },
  { type: "observation", label: "Observation", content: "ETH price: $3,245. Gas: 12 gwei. Fee ratio: 2.3% for a 0.01 USDT tip.", confidence: 58, source: "Price Oracle" },
  { type: "reflection", label: "Reflection", content: "Fee ratio is 2.3% -- acceptable for this tip amount. Creator @sarah_creates has Diamond tier with 94% engagement.", confidence: 74, source: "Risk Engine" },
  { type: "decision", label: "Decision", content: "Approve tip of 0.01 USDT to 0xABC...def on ethereum-sepolia. Confidence: 87%. Guardian review: PASS.", confidence: 87, source: "Consensus Engine" },
];

export default function Reasoning() {
  const [prompt, setPrompt] = useState("Analyze portfolio and recommend next action");
  const [cards, setCards] = useState<ReasoningCard[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const [totalSteps, setTotalSteps] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [cards, scrollToBottom]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
      clearInterval(intervalRef.current);
    };
  }, []);

  const startReasoning = () => {
    setIsStreaming(true);
    setCards([]);
    setConfidence(0);
    setHasRun(true);
    setTotalSteps(0);

    // Try real SSE first
    const url = `${API_BASE}/api/reasoning/stream?prompt=${encodeURIComponent(prompt)}`;

    try {
      const es = new EventSource(url);
      eventSourceRef.current = es;
      let stepCount = 0;
      let gotData = false;

      es.onmessage = (event) => {
        gotData = true;
        setIsLive(true);
        try {
          const data = JSON.parse(event.data);

          // Map SSE data to our ReasoningCard format
          const card: ReasoningCard = {
            type: data.type || "thought",
            label: (data.type || "thought").charAt(0).toUpperCase() + (data.type || "thought").slice(1),
            content: data.content || "",
            confidence: data.confidence ?? Math.min(95, (stepCount + 1) * 10),
            source: data.source || "Agent",
          };

          stepCount++;
          setCards((prev) => [...prev, card]);
          setConfidence(card.confidence);
          setTotalSteps(stepCount);

          // Check for completion signals
          if (data.type === "decision" || data.type === "complete" || data.done) {
            es.close();
            eventSourceRef.current = null;
            setIsStreaming(false);
          }
        } catch {
          // Non-JSON event, ignore
        }
      };

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;

        if (!gotData) {
          // SSE failed before getting any data -- fall back to demo
          setIsLive(false);
          fallbackToDemo();
        } else {
          // Had data but connection closed (normal SSE end)
          setIsStreaming(false);
        }
      };
    } catch {
      // EventSource constructor failed -- fall back to demo
      setIsLive(false);
      fallbackToDemo();
    }
  };

  const fallbackToDemo = () => {
    setCards([]);
    setConfidence(0);
    setTotalSteps(demoReasoningSteps.length);
    let i = 0;

    intervalRef.current = setInterval(() => {
      if (i >= demoReasoningSteps.length) {
        clearInterval(intervalRef.current);
        setIsStreaming(false);
        return;
      }
      const step = demoReasoningSteps[i];
      setCards((prev) => [...prev, step]);
      setConfidence(step.confidence);
      i++;
    }, 1400);
  };

  const stopReasoning = () => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    clearInterval(intervalRef.current);
    setIsStreaming(false);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Agent Reasoning</h1>
          <p className="text-sm text-muted-foreground mt-1">Watch the agent think in real time.</p>
        </div>
        <Badge variant="outline" className={`text-[10px] ${isLive ? "text-emerald-400 border-emerald-500/30" : "text-yellow-400 border-yellow-500/30"}`}>
          {isLive ? <><Wifi className="h-3 w-3 mr-1" />Live SSE</> : <><WifiOff className="h-3 w-3 mr-1" />Demo</>}
        </Badge>
      </div>

      {/* Input */}
      <div className="flex gap-3 mb-6 flex-wrap sm:flex-nowrap">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt for the agent..."
          className="bg-card border-border/50"
          disabled={isStreaming}
        />
        {isStreaming ? (
          <Button onClick={stopReasoning} variant="outline" className="shrink-0">
            <Square className="h-4 w-4 mr-2" />Stop
          </Button>
        ) : (
          <Button onClick={startReasoning} className="bg-primary hover:bg-primary/90 shrink-0">
            <Play className="h-4 w-4 mr-2" />Start
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_160px] gap-6">
        {/* Reasoning Stream */}
        <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
          <div ref={scrollRef} className="h-[500px] overflow-y-auto">
            <div className="p-4 space-y-3">
              {cards.length === 0 && !isStreaming && (
                <p className="text-sm text-muted-foreground text-center py-16">
                  Enter a prompt and click Start to begin reasoning.
                </p>
              )}
              {cards.map((card, i) => {
                const Icon = typeIcons[card.type] || Brain;
                return (
                  <div
                    key={i}
                    className="rounded-lg border border-border/40 bg-card/50 p-4 animate-fade-in"
                  >
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Icon className="h-5 w-5" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground/60 bg-secondary/50 px-1.5 py-0.5 rounded">{card.source}</span>
                    </div>
                    <p className="text-sm leading-relaxed mb-3">{card.content}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={card.confidence} className="h-1 flex-1 bg-secondary" />
                      <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">{card.confidence}%</span>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isStreaming && (
                <div className="flex items-center gap-1.5 px-4 py-3">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "200ms" }} />
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "400ms" }} />
                  <span className="text-xs text-muted-foreground ml-2">Agent thinking...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="flex flex-row lg:flex-col items-center lg:items-center gap-4">
          <div className="rounded-xl border border-border/50 bg-card/50 p-5 flex flex-col items-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 font-medium">Confidence</p>
            <ConfidenceMeter value={confidence} size={110} />
          </div>
          <div className="rounded-xl border border-border/50 bg-card/50 p-4 w-full text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Steps</p>
            <p className="text-lg font-bold tabular-nums">{cards.length}<span className="text-muted-foreground text-sm font-normal">/{totalSteps || "?"}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
