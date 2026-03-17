import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizontal, Bot, User, Sparkles, Cpu } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "agent";
  text: string;
  intent?: string;
  confidence?: number;
  actions?: string[];
}

const capabilities = [
  "check_balance", "send_tip", "create_escrow", "claim_escrow",
  "swap_tokens", "check_gas", "analyze_creator", "get_reputation",
  "dca_setup", "yield_check", "portfolio_report", "security_scan", "explain_reasoning",
];

const demoMessages: Message[] = [
  { id: 1, role: "user", text: "Who should I tip today?" },
  {
    id: 2, role: "agent", text: "Based on engagement analysis, I recommend tipping @sarah_creates (Diamond tier, 94% engagement spike in last 2h) and @dev_marcus (Platinum, new video with 12k views). Both are on Polygon for lowest fees.",
    intent: "analyze_creator", confidence: 91,
    actions: ["Tip @sarah_creates 2.5 USDT", "Tip @dev_marcus 1.0 USDT", "View creator profiles"],
  },
];

const suggestions = ["Who should I tip?", "Check my balance", "Analyze gas fees", "Show portfolio health"];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(demoMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const agentResponses: Record<string, Omit<Message, "id" | "role">> = {
    "check my balance": { text: "Your total balance is $12,847.32 across 5 chains. ETH: $8,234 | USDT: $3,597 | SOL: $645 | TRX: $215 | MATIC: $156. Liquidity ratio: 78%.", intent: "check_balance", confidence: 98, actions: ["View wallets", "Transfer funds"] },
    "analyze gas fees": { text: "Current gas: ETH 12 gwei (low), Polygon 0.003 gwei (very low), Solana 0.00025 SOL. Recommendation: use Polygon for tips under $5, Ethereum for amounts over $10. Optimal window: next 2 hours.", intent: "check_gas", confidence: 94, actions: ["Set gas alert", "Switch to Polygon"] },
    "show portfolio health": { text: "Health Score: 87/100. Diversification: 85% (good). Risk: 23/100 (low). Yield: 4.2% avg APY. Suggestion: consider rebalancing 5% from stables to ETH staking for better yield.", intent: "portfolio_report", confidence: 89, actions: ["Rebalance now", "View yield options"] },
  };

  const send = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    const q = input.toLowerCase().trim();
    setInput("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
    const match = agentResponses[q];
    const agentMsg: Message = {
      id: Date.now() + 1, role: "agent",
      text: match?.text || `I've analyzed your request: "${q}". Based on current wallet state and market conditions, I'd recommend reviewing your active positions. Would you like me to run a detailed analysis?`,
      intent: match?.intent || "explain_reasoning",
      confidence: match?.confidence || 72,
      actions: match?.actions || ["Run analysis", "View dashboard"],
    };
    setMessages((m) => [...m, agentMsg]);
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Talk to the Agent</h1>
        <p className="text-sm text-muted-foreground mt-1">Natural language interface to AeroFyta's 97+ MCP tools.</p>
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
                    <p className="text-sm leading-relaxed">{m.text}</p>
                    {m.intent && (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-[9px]">{m.intent}</Badge>
                        <span className="text-[10px] text-muted-foreground tabular-nums">{m.confidence}% confidence</span>
                      </div>
                    )}
                    {m.actions && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {m.actions.map((a) => (
                          <button key={a} className="text-[10px] px-2 py-1 rounded-md border border-border/50 bg-card/50 hover:bg-accent/50 transition-colors">{a}</button>
                        ))}
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
              <h3 className="text-sm font-semibold">AI Provider</h3>
            </div>
            <div className="space-y-2">
              {["Groq (Llama 3)", "Gemini 2.0 Flash", "Rule-Based Fallback"].map((p, i) => (
                <div key={p} className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${i === 0 ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                  <span className="text-xs">{p}</span>
                  {i === 0 && <Badge variant="outline" className="text-[9px] ml-auto bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Active</Badge>}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
              <h3 className="text-sm font-semibold">Supported Intents</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {capabilities.map((c) => (
                <Badge key={c} variant="outline" className="text-[9px]">{c}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
