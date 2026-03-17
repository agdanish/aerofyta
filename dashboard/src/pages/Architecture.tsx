import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, ArrowDown, Shield, MonitorPlay, Zap, Brain,
  Handshake, Settings, Link,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import CountUp from "@/components/shared/CountUp";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useFetch } from "@/hooks/useFetch";

interface ArchitectureData {
  framework: string;
  pattern: string;
  decorators: string[];
  totalServices: number;
  totalRoutes: number;
  totalTests: number;
  persistence: string[];
  authentication: string;
  documentation: string;
  deployment: string[];
  wdkIntegration: {
    packages: string[];
    chains: string[];
    features: string[];
  };
  aiCapabilities: {
    providers: string[];
    features: string[];
  };
}

const demoArchData: ArchitectureData = {
  framework: "Express 4 with NestJS-style Controllers",
  pattern: "Service Registry + Domain Routers + Decorator Controllers",
  decorators: [],
  totalServices: 93,
  totalRoutes: 150,
  totalTests: 1001,
  persistence: ["JSON", "SQLite", "PostgreSQL"],
  authentication: "API Key (optional)",
  documentation: "OpenAPI 3.0 + Swagger UI",
  deployment: ["Docker", "Railway", "Render", "npm run dev"],
  wdkIntegration: {
    packages: ["@tetherto/wdk", "@tetherto/wdk-wallet-evm", "@tetherto/wdk-wallet-ton"],
    chains: ["Ethereum", "TON", "Polygon", "Arbitrum", "Optimism"],
    features: ["Multi-chain wallets", "USDT transfers", "Cross-chain bridges", "Gasless transactions"],
  },
  aiCapabilities: {
    providers: ["OpenRouter (free)", "Groq", "Ollama"],
    features: ["NLP intent parsing", "Entity extraction", "Agentic tool-use", "ReAct reasoning"],
  },
};

const pipelineSteps: { label: string; sub: string; icon: LucideIcon }[] = [
  { label: "YouTube API", sub: "RSS + Webhooks", icon: MonitorPlay },
  { label: "Event Simulator", sub: "Real-time ingestion", icon: Zap },
  { label: "Agent Brain", sub: "ReAct executor", icon: Brain },
  { label: "Multi-Agent", sub: "3-agent consensus", icon: Handshake },
  { label: "WDK Execution", sub: "Tether SDK", icon: Settings },
  { label: "9 Chains", sub: "ETH, TON, BTC...", icon: Link },
];

const securityLayers = [
  { name: "Policy Engine", desc: "Rate limits, spending caps, allow/block lists", color: "text-primary" },
  { name: "Anomaly Detection", desc: "ML-based outlier detection on all transactions", color: "text-yellow-400" },
  { name: "Risk Scoring", desc: "Real-time risk assessment per transaction", color: "text-orange-400" },
  { name: "Multi-Agent Consensus", desc: "2/3 majority required for execution", color: "text-blue-400" },
  { name: "Guardian Veto", desc: "Final human-in-the-loop override capability", color: "text-red-400" },
  { name: "De-escalation Guard", desc: "Automatic cooldown after blocked events", color: "text-emerald-400" },
];

export default function Architecture() {
  const { data: arch } = useFetch<ArchitectureData>("/api/architecture", demoArchData);

  const stats = [
    { value: arch.totalRoutes, label: "API Routes" },
    { value: arch.totalServices, label: "Services", suffix: "+" },
    { value: 107, label: "CLI Commands" },
    { value: arch.totalTests, label: "Tests" },
  ];
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Architecture</h1>
        <p className="text-sm text-muted-foreground mt-1">End-to-end system diagram — from content ingestion to on-chain execution.</p>
      </div>

      {/* Stats */}
      <ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {stats.map((s) => (
            <Card key={s.label} className="border-border/50 bg-card/50">
              <CardContent className="p-4 text-center">
                <CountUp target={s.value} className="text-2xl font-bold tabular-nums" />
                {s.suffix && <span className="text-2xl font-bold">{s.suffix}</span>}
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollReveal>

      {/* Pipeline */}
      <div className="mb-10">
        <ScrollReveal>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Data Pipeline</h2>
        </ScrollReveal>
        <div className="flex flex-wrap items-center gap-2">
          {pipelineSteps.map((step, i) => (
            <ScrollReveal key={step.label} delay={i * 80}>
              <div className="flex items-center gap-2">
                <div className="rounded-xl border border-border/50 bg-card/50 px-4 py-3 min-w-[120px]">
                  <step.icon className="h-5 w-5 mb-1" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
                  <div className="text-sm font-medium">{step.label}</div>
                  <div className="text-[11px] text-muted-foreground">{step.sub}</div>
                </div>
                {i < pipelineSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0 hidden sm:block" />
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Security Layers */}
      <div>
        <ScrollReveal>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />6-Layer Security Stack
          </h2>
        </ScrollReveal>
        <div className="space-y-2 max-w-2xl">
          {securityLayers.map((layer, i) => (
            <ScrollReveal key={layer.name} delay={i * 100}>
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-lg border border-border/50 bg-card/50 flex items-center justify-center text-xs font-bold ${layer.color}`}>
                    {i + 1}
                  </div>
                  {i < securityLayers.length - 1 && (
                    <ArrowDown className="h-3 w-3 text-muted-foreground/30 my-0.5" />
                  )}
                </div>
                <div className="pt-1">
                  <div className="text-sm font-medium">{layer.name}</div>
                  <div className="text-xs text-muted-foreground">{layer.desc}</div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
