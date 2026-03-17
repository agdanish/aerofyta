import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import CountUp from "@/components/shared/CountUp";
import { Sparkles, CheckCircle2, Youtube, Radio, Webhook, Eye, Heart, MessageCircle, Share2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const attestations = [
  { creator: "@sarah_creates", platform: "YouTube", metric: "views", value: "45.2K", timestamp: "2m ago", verified: true },
  { creator: "@sarah_creates", platform: "YouTube", metric: "likes", value: "3.8K", timestamp: "2m ago", verified: true },
  { creator: "@dev_marcus", platform: "YouTube", metric: "views", value: "12.1K", timestamp: "5h ago", verified: true },
  { creator: "@music_maya", platform: "Rumble", metric: "views", value: "8.7K", timestamp: "8h ago", verified: true },
  { creator: "@crypto_claire", platform: "YouTube", metric: "comments", value: "847", timestamp: "12h ago", verified: true },
  { creator: "@dev_marcus", platform: "YouTube", metric: "watch_time", value: "4,200h", timestamp: "1d ago", verified: false },
];

const metricIcons: Record<string, typeof Eye> = {
  views: Eye,
  likes: Heart,
  comments: MessageCircle,
  shares: Share2,
  watch_time: TrendingUp,
};

const propagation = [
  { from: "Agent", to: "@sarah_creates", amount: "2.5 USDT", chain: "Ethereum" },
  { from: "@sarah_creates", to: "@collab_friend", amount: "0.5 USDT", chain: "Polygon" },
  { from: "@sarah_creates", to: "@editor_joe", amount: "0.3 USDT", chain: "Polygon" },
];

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
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Proof of Engagement & Content</h1>
        <p className="text-sm text-muted-foreground mt-1">Verified engagement attestations, tip propagation, and content discovery.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Attestations", value: 2847, icon: Sparkles },
          { label: "Verified", value: 98, suffix: "%", icon: CheckCircle2 },
          { label: "Platforms", value: 3, icon: Youtube },
          { label: "Auto-Tips Triggered", value: 156, icon: TrendingUp },
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
        {/* Attestations */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="text-sm font-semibold">Engagement Attestations</h3>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="divide-y divide-border/20">
              {attestations.map((a, i) => {
                const MetricIcon = metricIcons[a.metric] || Eye;
                return (
                  <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-accent/30 transition-colors">
                    <MetricIcon className="h-4 w-4 shrink-0" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium">{a.creator}</span>
                        <Badge variant="outline" className="text-[9px]">{a.platform}</Badge>
                        {a.verified && <CheckCircle2 className="h-3 w-3" style={{ color: "#50AF95" }} />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{a.metric}</span>
                        <span className="text-xs font-medium tabular-nums">{a.value}</span>
                        <span className="text-[10px] text-muted-foreground/60 ml-auto">{a.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Tip Propagation */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <h3 className="text-sm font-semibold mb-4">Tip Propagation Wave</h3>
          <div className="space-y-3">
            {propagation.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs font-medium">{p.from}</span>
                  <span className="text-muted-foreground/40">&rarr;</span>
                  <span className="text-xs font-medium">{p.to}</span>
                </div>
                <span className="text-xs tabular-nums">{p.amount}</span>
                <Badge variant="outline" className="text-[9px]">{p.chain}</Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-accent/20 p-3">
            <p className="text-[10px] text-muted-foreground leading-relaxed">Tips can propagate downstream when creators share revenue with collaborators. The agent tracks the full tip chain for transparency.</p>
          </div>
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
