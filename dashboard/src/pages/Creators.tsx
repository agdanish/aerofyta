import { useState } from "react";
import { demoCreators } from "@/lib/demo-data";
import { useFetch } from "@/hooks/useFetch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

const tierColors: Record<string, string> = {
  Diamond: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  Platinum: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  Gold: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Silver: "bg-zinc-400/15 text-zinc-300 border-zinc-400/30",
  Bronze: "bg-orange-700/15 text-orange-400 border-orange-700/30",
};

/* Real API shape from /api/rumble/creators */
interface ApiCreator {
  id: string;
  name: string;
  channelUrl: string;
  walletAddress: string;
  categories: string[];
  totalTipsReceived: number;
  totalTipAmount: number;
  subscriberCount: number;
  registeredAt: string;
}

/* Normalised row used by the UI */
interface CreatorRow {
  id: string;
  name: string;
  platform: string;
  engagement: number;
  tips: number;
  tier: string;
  avatar: string;
  walletAddress: string;
  categories: string[];
}

function tierFromTips(tips: number): string {
  if (tips >= 40) return "Diamond";
  if (tips >= 25) return "Platinum";
  if (tips >= 15) return "Gold";
  if (tips >= 5) return "Silver";
  return "Bronze";
}

function normalise(raw: ApiCreator): CreatorRow {
  const engagement = Math.min(100, Math.round(raw.totalTipAmount * 100 + raw.totalTipsReceived * 3 + raw.subscriberCount * 0.01));
  return {
    id: raw.id,
    name: raw.name,
    platform: "Rumble",
    engagement,
    tips: raw.totalTipsReceived,
    tier: tierFromTips(raw.totalTipsReceived),
    avatar: raw.name.slice(0, 2).toUpperCase(),
    walletAddress: raw.walletAddress,
    categories: raw.categories,
  };
}

export default function Creators() {
  const { data: rawData, isDemo } = useFetch<{ creators: ApiCreator[] } | typeof demoCreators>(
    "/api/rumble/creators",
    demoCreators,
  );
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  /* Normalise: real API returns { creators: [...] }, demo is flat array */
  const creators: CreatorRow[] = Array.isArray(rawData)
    ? (rawData as typeof demoCreators).map((c) => ({
        id: String(c.id),
        name: c.name,
        platform: c.platform,
        engagement: c.engagement,
        tips: c.tips,
        tier: c.tier,
        avatar: c.avatar,
        walletAddress: "",
        categories: [],
      }))
    : ((rawData as { creators: ApiCreator[] }).creators ?? []).map(normalise);

  const filtered = creators.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.platform.toLowerCase().includes(search.toLowerCase()) ||
    c.categories.some((cat) => cat.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Creator Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track, discover, and tip creators across platforms.
            {isDemo && <Badge variant="outline" className="ml-2 text-[9px] bg-yellow-500/15 text-yellow-400 border-yellow-500/30">Demo</Badge>}
          </p>
        </div>
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90"
          onClick={() => toast.success("Discovered 12 new creators")}
        >
          <Sparkles className="h-3.5 w-3.5 mr-2" />
          Discover
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search creators..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border/50"
        />
      </div>

      {/* Mobile: card list. Desktop: table */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-[1fr_100px_140px_80px_90px] gap-4 px-5 py-3 border-b border-border/40 text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
              <span>Creator</span>
              <span>Platform</span>
              <span>Engagement</span>
              <span className="text-right">Tips</span>
              <span className="text-right">Tier</span>
            </div>
            <div className="divide-y divide-border/30">
              {filtered.map((c) => (
                <div key={c.id}>
                  <button
                    className="w-full grid grid-cols-[1fr_100px_140px_80px_90px] gap-4 px-5 py-3 text-sm hover:bg-accent/30 transition-colors items-center text-left"
                    onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground">
                        {c.avatar}
                      </div>
                      <span className="font-medium truncate">{c.name}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">{c.platform}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={c.engagement} className="h-1.5 flex-1 bg-secondary" />
                      <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">{c.engagement}%</span>
                    </div>
                    <span className="text-right tabular-nums">{c.tips}</span>
                    <div className="flex justify-end">
                      <Badge variant="outline" className={`text-[10px] ${tierColors[c.tier] || ""}`}>
                        {c.tier}
                      </Badge>
                    </div>
                  </button>
                  {expanded === c.id && (
                    <div className="px-5 py-4 bg-accent/20 border-t border-border/20 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div><span className="text-muted-foreground">Engagement Score:</span> <span className="font-medium">{c.engagement}%</span></div>
                        <div><span className="text-muted-foreground">Total Tips:</span> <span className="font-medium">{c.tips}</span></div>
                        <div><span className="text-muted-foreground">Reputation:</span> <span className="font-medium">{c.tier}</span></div>
                        {c.walletAddress && (
                          <div className="sm:col-span-3"><span className="text-muted-foreground">Wallet:</span> <span className="font-mono font-medium">{c.walletAddress}</span></div>
                        )}
                        {c.categories.length > 0 && (
                          <div className="sm:col-span-3">
                            <span className="text-muted-foreground">Categories:</span>{" "}
                            {c.categories.map((cat) => (
                              <Badge key={cat} variant="outline" className="text-[9px] ml-1">{cat}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">No creators found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
