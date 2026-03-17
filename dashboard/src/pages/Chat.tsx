import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizontal, Bot, User, Sparkles, Cpu } from "lucide-react";

const API_BASE = import.meta.env.PROD ? "" : "http://localhost:3001";

interface Message {
  id: number;
  role: "user" | "agent";
  text: string;
  intent?: string;
  confidence?: number;
}

/* ---------- types from /api/ai/capabilities ---------- */
interface IntentDef {
  name: string;
  description: string;
}
interface CapabilitiesResponse {
  engine: string;
  version: string;
  provider: string;
  intents: IntentDef[];
  currentProvider: string;
  llmAvailable: boolean;
}

/* ---------- types from /api/chat ---------- */
interface ChatApiResponse {
  message: {
    id: string;
    role: string;
    content: string;
    timestamp: string;
  };
}

/* ---------- demo data ---------- */
const demoCapabilities: CapabilitiesResponse = {
  engine: "AeroFyta Rule-Based Intelligence Engine",
  version: "2.0.0",
  provider: "rule-based",
  intents: [
    { name: "tip", description: "Send a tip" },
    { name: "check_balance", description: "Check wallet balances" },
    { name: "view_history", description: "View tip history" },
    { name: "find_creator", description: "Find a creator" },
    { name: "set_policy", description: "Set agent policies" },
    { name: "check_status", description: "Check agent status" },
    { name: "help", description: "Get help" },
    { name: "analytics", description: "View analytics" },
    { name: "bridge", description: "Bridge tokens" },
    { name: "swap", description: "Swap tokens" },
    { name: "lend", description: "Lending operations" },
    { name: "fees", description: "Check fees" },
    { name: "address", description: "Show wallet addresses" },
  ],
  currentProvider: "rule-based",
  llmAvailable: false,
};

const demoMessages: Message[] = [
  { id: 1, role: "user", text: "Who should I tip today?" },
  {
    id: 2, role: "agent",
    text: "Based on engagement analysis, I recommend tipping @sarah_creates (Diamond tier, 94% engagement spike in last 2h) and @dev_marcus (Platinum, new video with 12k views). Both are on Polygon for lowest fees.",
    intent: "find_creator", confidence: 91,
  },
];

const suggestions = ["help", "check my balance", "show fees", "tip 1 USDT to @creator", "show my address", "analytics"];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(demoMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [capabilities, setCapabilities] = useState<CapabilitiesResponse>(demoCapabilities);
  const [capsDemo, setCapsDemo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* load capabilities from real API */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/ai/capabilities`, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: CapabilitiesResponse = await res.json();
        if (!cancelled) {
          setCapabilities(json);
          setCapsDemo(false);
        }
      } catch {
        if (!cancelled) setCapsDemo(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  /* scroll to bottom on new messages */
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    const query = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ChatApiResponse = await res.json();
      const agentMsg: Message = {
        id: Date.now() + 1,
        role: "agent",
        text: json.message.content,
      };
      setMessages((m) => [...m, agentMsg]);
    } catch {
      /* fallback: show error as agent message */
      const agentMsg: Message = {
        id: Date.now() + 1,
        role: "agent",
        text: `Sorry, I couldn't reach the backend. Make sure the agent is running on localhost:3001. Your message was: "${query}"`,
      };
      setMessages((m) => [...m, agentMsg]);
    } finally {
      setLoading(false);
    }
  };

  const providerLabel = capabilities.llmAvailable
    ? capabilities.currentProvider
    : `${capabilities.currentProvider} (no LLM key)`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Talk to the Agent</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Natural language interface to AeroFyta's 97+ MCP tools.
          {capsDemo && <Badge variant="outline" className="ml-2 text-[9px] bg-amber-500/15 text-amber-400 border-amber-500/30">Capabilities: Demo</Badge>}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        {/* Chat */}
        <div className="rounded-xl border border-border/50 bg-card/50 flex flex-col h-[560px]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-3 ${m.role === "user" ? "bg-primary/10 border border-primary/20" : "bg-accent/40 border border-border/40"}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      {m.role === "agent" ? <Bot className="h-3.5 w-3.5" strokeWidth={1.5} style={{ color: "#C6B6B1" }} /> : <User className="h-3.5 w-3.5" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />}
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.role === "user" ? "You" : "AeroFyta"}</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    {m.intent && (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-[9px]">{m.intent}</Badge>
                        {m.confidence != null && <span className="text-[10px] text-muted-foreground tabular-nums">{m.confidence}% confidence</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-1.5 px-4">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "200ms" }} />
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "400ms" }} />
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Suggestions */}
          <div className="px-4 py-2 border-t border-border/30 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button key={s} onClick={() => { setInput(s); }} className="text-[10px] px-2.5 py-1 rounded-full border border-border/40 bg-card/30 hover:bg-accent/40 transition-colors text-muted-foreground">
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border/40 flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask the agent anything..." className="bg-card border-border/50" disabled={loading} />
            <Button onClick={send} disabled={loading || !input.trim()} size="icon" className="bg-primary hover:bg-primary/90 shrink-0">
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Capabilities Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
              <h3 className="text-sm font-semibold">AI Engine</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${capabilities.llmAvailable ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className="text-xs">{providerLabel}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">v{capabilities.version}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
              <h3 className="text-sm font-semibold">Supported Intents ({capabilities.intents.length})</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {capabilities.intents.map((c) => (
                <Badge key={c.name} variant="outline" className="text-[9px]" title={c.description}>{c.name}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
