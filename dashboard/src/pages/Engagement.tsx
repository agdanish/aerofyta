import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import CountUp from "@/components/shared/CountUp";
import { Sparkles, CheckCircle2, Youtube, TrendingUp, Eye, Heart, MessageCircle, Share2, Loader2 } from "lucide-react";
import { useFetch } from "@/hooks/useFetch";

/* ---------- API types ---------- */
interface ApiAttestation {
  id: string;
  version: string;
  viewer: string;
  creator: string;
  contentId: string;
  platform: string;
  engagement: {
    watchPercent: number;
    engagementScore: number;
    sessionDurationSec: number;
    rewatchCount: number;
  };
  tip: {
    amount: string;
    token: string;
    chainId: string;
    txHash: string;
    tipId: string;
  };
  proof: {
    payloadHash: string;
    signature: string;
    signingChain: string;
    signerAddress: string;
  };
  engagedAt: string;
  attestedAt: string;
  verified: boolean;
}

interface ApiPoeResponse {
  attestations: ApiAttestation[];
  stats: {
    totalAttestations: number;
    verifiedCount: number;
    uniqueViewers: number;
    uniqueCreators: number;
    totalEngagementMinutes: number;
    avgEngagementScore: number;
    totalTipVolume: number;
  };
}

interface ApiWave {
  id: string;
  originalTip: { from: string; to: string; amount: string; chain: string };
  amplifiedTips: { from: string; to: string; amount: string; chain: string }[];
}

interface ApiPropagationResponse {
  waves: ApiWave[];
  stats: {
    totalWaves: number;
    activeWaves: number;
    totalAmplified: number;
    totalParticipants: number;
    avgAmplification: number;
    activePools: number;
    poolBalance: number;
    viralCoefficient: number;
  };
}

/* ---------- Demo fallback ---------- */
const demoPoe: ApiPoeResponse = {
  attestations: [
    { id: "demo-1", version: "1.0", viewer: "0x74118B69ac22FB7e46081400BD5ef9d9a0AC9b62", creator: "demo-creator-001", contentId: "demo-video-001", platform: "rumble", engagement: { watchPercent: 92, engagementScore: 85, sessionDurationSec: 1800, rewatchCount: 2 }, tip: { amount: "0.003", token: "usdt", chainId: "ethereum-sepolia", txHash: "0xdemo", tipId: "demo-poe-tip" }, proof: { payloadHash: "54a5b1e1...", signature: "0x187b34a9...", signingChain: "ethereum-sepolia", signerAddress: "0x74118B69ac22FB7e46081400BD5ef9d9a0AC9b62" }, engagedAt: new Date().toISOString(), attestedAt: new Date().toISOString(), verified: true },
  ],
  stats: { totalAttestations: 1, verifiedCount: 1, uniqueViewers: 1, uniqueCreators: 1, totalEngagementMinutes: 30, avgEngagementScore: 85, totalTipVolume: 0.003 },
};

const demoPropagation: ApiPropagationResponse = {
  waves: [],
  stats: { totalWaves: 0, activeWaves: 0, totalAmplified: 0, totalParticipants: 0, avgAmplification: 1, activePools: 1, poolBalance: 1, viralCoefficient: 0 },
};

/* ---------- Helpers ---------- */
const metricIcons: Record<string, typeof Eye> = {
  views: Eye,
  likes: Heart,
  comments: MessageCircle,
  shares: Share2,
  watch_time: TrendingUp,
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/* ---------- Static data that doesn't come from API ---------- */
const platforms = [
  { name: "YouTube", status: "connected", events: 847, adapter: "Official API" },
  { name: "Rumble", status: "connected", events: 234, adapter: "RSS + Scraper" },
  { name: "Custom Webhook", status: "connected", events: 56, adapter: "HMAC Verified" },
  { name: "Twitch", status: "disconnected", events: 0, adapter: "Not configured" },
];

const autoTipRules = [
  { metric: "views", threshold: "> 10,000", action: "Auto-tip 1 USDT", enabled: true },
  { metric: "likes", threshold: "> 1,000", action: "Auto-tip 0.5 USDT", enabled: true },
  { metric: "comments", threshold: "> 500", action: "Auto-tip 0.25 USDT", enabled: true },
  { metric: "growth_rate", threshold: "> 20% week/week", action: "Bonus tip 2 USDT", enabled: false },
];

const recommendations = [
  { creator: "@tech_sam", score: 89, reason: "High engagement growth, 3 videos/week", platform: "YouTube" },
  { creator: "@gaming_alex", score: 82, reason: "Consistent viewership, active community", platform: "Rumble" },
  { creator: "@art_nina", score: 78, reason: "Niche audience, high comment ratio", platform: "YouTube" },
];

export default function Engagement() {
  const { data: poeData, loading: poeLoading, isDemo: poeDemo } = useFetch<ApiPoeResponse>("/api/poe", demoPoe);
  const { data: propData, loading: propLoading, isDemo: propDemo } = useFetch<ApiPropagationResponse>("/api/propagation/waves", demoPropagation);

  const isLoading = poeLoading || propLoading;
  const isDemo = poeDemo && propDemo;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = poeData.stats;
  const attestations = poeData.attestations;
  const waveStats = propData.stats;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proof of Engagement & Content</h1>
          <p className="text-sm text-muted-foreground mt-1">Verified engagement attestations, tip propagation, and content discovery.</p>
        </div>
        {isDemo && <Badge variant="outline" className="text-[9px] bg-yellow-500/15 text-yellow-400 border-yellow-500/30">Demo Data</Badge>}
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Attestations", value: stats.totalAttestations, icon: Sparkles },
          { label: "Verified", value: stats.totalAttestations > 0 ? Math.round((stats.verifiedCount / stats.totalAttestations) * 100) : 0, suffix: "%", icon: CheckCircle2 },
          { label: "Unique Creators", value: stats.uniqueCreators, icon: Youtube },
          { label: "Avg Engagement", value: Math.round(stats.avgEngagementScore), suffix: "/100", icon: TrendingUp },
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
        {/* Attestations from API */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="text-sm font-semibold">Engagement Attestations ({attestations.length})</h3>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="divide-y divide-border/20">
              {attestations.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">No attestations yet. Engage with creator content to generate proofs.</div>
              )}
              {attestations.map((a) => (
                <div key={a.id} className="px-5 py-3 flex items-center gap-3 hover:bg-accent/30 transition-colors">
                  <Eye className="h-4 w-4 shrink-0" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium">{a.creator}</span>
                      <Badge variant="outline" className="text-[9px]">{a.platform}</Badge>
                      {a.verified && <CheckCircle2 className="h-3 w-3" style={{ color: "#50AF95" }} />}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-muted-foreground">score: {a.engagement.engagementScore}</span>
                      <span className="text-[10px] text-muted-foreground">watch: {a.engagement.watchPercent}%</span>
                      <span className="text-xs font-medium tabular-nums">{a.tip.amount} {a.tip.token.toUpperCase()}</span>
                      <span className="text-[10px] text-muted-foreground/60 ml-auto">{timeAgo(a.attestedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Tip Propagation from API */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <h3 className="text-sm font-semibold mb-4">Tip Propagation Waves</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg bg-accent/20 p-3 text-center">
              <p className="text-lg font-bold tabular-nums">{waveStats.totalWaves}</p>
              <p className="text-[10px] text-muted-foreground">Total Waves</p>
            </div>
            <div className="rounded-lg bg-accent/20 p-3 text-center">
              <p className="text-lg font-bold tabular-nums">{waveStats.activeWaves}</p>
              <p className="text-[10px] text-muted-foreground">Active</p>
            </div>
            <div className="rounded-lg bg-accent/20 p-3 text-center">
              <p className="text-lg font-bold tabular-nums">{waveStats.activePools}</p>
              <p className="text-[10px] text-muted-foreground">Active Pools</p>
            </div>
            <div className="rounded-lg bg-accent/20 p-3 text-center">
              <p className="text-lg font-bold tabular-nums">{waveStats.viralCoefficient.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">Viral Coefficient</p>
            </div>
          </div>
          {propData.waves.length > 0 ? (
            <div className="space-y-3">
              {propData.waves.map((w) => (
                <div key={w.id} className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs font-medium">{w.originalTip.from}</span>
                    <span className="text-muted-foreground/40">&rarr;</span>
                    <span className="text-xs font-medium">{w.originalTip.to}</span>
                  </div>
                  <span className="text-xs tabular-nums">{w.originalTip.amount}</span>
                  <Badge variant="outline" className="text-[9px]">{w.originalTip.chain}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-accent/20 p-3">
              <p className="text-[10px] text-muted-foreground leading-relaxed">No propagation waves yet. Tips can propagate downstream when creators share revenue with collaborators. The agent tracks the full tip chain for transparency.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Platforms */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="text-sm font-semibold">Platform Adapters</h3>
          </div>
          <div className="divide-y divide-border/20">
            {platforms.map((p) => (
              <div key={p.name} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{p.name}</span>
                    <Badge variant="outline" className={`text-[9px] ${p.status === "connected" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>{p.status}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{p.adapter}</p>
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">{p.events}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-Tip Rules */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="text-sm font-semibold">Auto-Tip Rules</h3>
          </div>
          <div className="divide-y divide-border/20">
            {autoTipRules.map((r) => (
              <div key={r.metric} className="px-5 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium capitalize">{r.metric.replace("_", " ")}</span>
                  <Badge variant="outline" className={`text-[9px] ${r.enabled ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"}`}>{r.enabled ? "Active" : "Off"}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{r.threshold} &rarr; {r.action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="text-sm font-semibold">Recommended Creators</h3>
          </div>
          <div className="divide-y divide-border/20">
            {recommendations.map((r) => (
              <div key={r.creator} className="px-5 py-3 hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">{r.creator}</span>
                  <Badge variant="outline" className="text-[9px]">{r.platform}</Badge>
                  <span className="text-xs tabular-nums font-medium ml-auto" style={{ color: "#FF4E00" }}>{r.score}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{r.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
