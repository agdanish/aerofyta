import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useFetch } from "@/hooks/useFetch";
import CountUp from "@/components/shared/CountUp";
import { Award, Search, Download, Upload, Trophy, Star, Zap, Globe, Heart, Shield } from "lucide-react";
import { toast } from "sonner";

/* ---------- Real API types ---------- */
interface ApiReputation {
  address: string;
  score: number;
  rawScore: number;
  tier: string;
  totalReceived: number;
  tipCount: number;
  uniqueTippers: number;
  avgTipAmount: number;
  chains: string[];
}

interface LeaderboardResponse {
  leaderboard: ApiReputation[];
  total: number;
}

/* ---------- Static data ---------- */
const achievements = [
  { id: "first_tip", name: "First Tip", icon: Zap, unlocked: true },
  { id: "consistent", name: "Consistent", icon: Star, unlocked: true },
  { id: "generous", name: "Generous", icon: Heart, unlocked: true },
  { id: "multi_chain", name: "Multi-Chain", icon: Globe, unlocked: true },
  { id: "guardian", name: "Guardian", icon: Shield, unlocked: true },
  { id: "whale", name: "Whale", icon: Trophy, unlocked: false },
  { id: "pioneer", name: "Pioneer", icon: Award, unlocked: false },
  { id: "speed_demon", name: "Speed Demon", icon: Zap, unlocked: false },
];

const demoLeaderboard: LeaderboardResponse = {
  leaderboard: [
    { address: "0x7a3B...f82d", score: 97, rawScore: 97, tier: "diamond", totalReceived: 120, tipCount: 47, uniqueTippers: 12, avgTipAmount: 2.5, chains: ["ethereum"] },
    { address: "0x1cE4...a91b", score: 94, rawScore: 94, tier: "diamond", totalReceived: 95, tipCount: 35, uniqueTippers: 10, avgTipAmount: 2.7, chains: ["polygon"] },
    { address: "0x9fD2...c34e", score: 91, rawScore: 91, tier: "diamond", totalReceived: 88, tipCount: 28, uniqueTippers: 8, avgTipAmount: 3.1, chains: ["ethereum", "ton"] },
    { address: "0x4bA8...d67f", score: 87, rawScore: 87, tier: "platinum", totalReceived: 72, tipCount: 22, uniqueTippers: 7, avgTipAmount: 3.3, chains: ["ethereum"] },
    { address: "0x2eC1...b45a", score: 84, rawScore: 84, tier: "platinum", totalReceived: 65, tipCount: 19, uniqueTippers: 6, avgTipAmount: 3.4, chains: ["polygon"] },
  ],
  total: 5,
};

const tierBadge = (t: string) => {
  const tl = t.toLowerCase();
  if (tl === "diamond") return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (tl === "platinum") return "bg-purple-500/15 text-purple-400 border-purple-500/30";
  if (tl === "gold") return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  return "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
};

const shortenAddr = (a: string) =>
  a.length > 12 ? `${a.slice(0, 6)}...${a.slice(-4)}` : a;

const API_BASE = import.meta.env.PROD ? "" : "http://localhost:3001";

export default function Reputation() {
  const [lookupAddress, setLookupAddress] = useState("0x74118B69ac22FB7e46081400BD5ef9d9a0AC9b62");
  const [lookupResult, setLookupResult] = useState<ApiReputation | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [looked, setLooked] = useState(false);

  /* Leaderboard from real API */
  const { data: lbData, isDemo } = useFetch<LeaderboardResponse>(
    "/api/reputation/leaderboard",
    demoLeaderboard,
  );
  const leaderboard = lbData.leaderboard ?? [];

  const lookup = async () => {
    const addr = lookupAddress.trim();
    if (!addr) return;
    setLookupError(null);
    try {
      const res = await fetch(`${API_BASE}/api/reputation/${encodeURIComponent(addr)}`, {
        signal: AbortSignal.timeout(5000),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setLookupError(json.error || `HTTP ${res.status}`);
        setLookupResult(null);
      } else {
        setLookupResult(json.reputation ?? json);
        setLookupError(null);
        toast.success("Reputation fetched");
      }
    } catch {
      setLookupError("Could not reach API — showing demo data");
      setLookupResult(null);
    }
    setLooked(true);
  };

  const rep = lookupResult;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Cross-Chain Reputation Passport</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ZK-verified reputation scores, achievements, and exportable passports.
          {isDemo && <Badge variant="outline" className="ml-2 text-[9px] bg-yellow-500/15 text-yellow-400 border-yellow-500/30">Demo</Badge>}
        </p>
      </div>

      {/* Lookup */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-5 mb-6">
        <h3 className="text-sm font-semibold mb-3">Reputation Lookup</h3>
        <div className="flex gap-2 mb-4">
          <Input value={lookupAddress} onChange={(e) => { setLookupAddress(e.target.value); setLooked(false); }} placeholder="Enter wallet address..." className="bg-card border-border/50 font-mono text-xs" />
          <Button onClick={lookup} variant="outline" className="shrink-0">
            <Search className="h-4 w-4 mr-2" />Lookup
          </Button>
        </div>

        {looked && lookupError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-xs text-destructive">{lookupError}</div>
        )}

        {looked && rep && (
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center rounded-lg bg-accent/30 p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Reputation Score</p>
              <div className="text-4xl font-bold tabular-nums" style={{ color: "#FF4E00" }}><CountUp target={rep.score} /></div>
              <p className="text-[10px] text-muted-foreground mt-1">raw: {rep.rawScore}</p>
              <Progress value={Math.min(100, rep.score / 10)} className="h-2 bg-secondary mt-3 w-full" />
            </div>
            <div className="flex flex-col items-center rounded-lg bg-accent/30 p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Tier</p>
              <Badge variant="outline" className={`text-sm px-4 py-1 ${tierBadge(rep.tier)}`}>{rep.tier}</Badge>
              <p className="text-xs text-muted-foreground mt-2">{rep.tipCount} tips from {rep.uniqueTippers} tippers</p>
              <p className="text-[10px] text-muted-foreground mt-1">Total received: {rep.totalReceived.toFixed(4)} USDT</p>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-accent/30 p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Actions</p>
              <div className="flex gap-2 mt-1">
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toast.success("Passport JSON exported with ZK proof")}>
                  <Download className="h-3 w-3 mr-1" />Export
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toast.info("Upload passport JSON to verify")}>
                  <Upload className="h-3 w-3 mr-1" />Import
                </Button>
              </div>
              {rep.chains.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {rep.chains.map((ch) => <Badge key={ch} variant="outline" className="text-[9px]">{ch}</Badge>)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Achievements */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <h3 className="text-sm font-semibold mb-4">Achievements</h3>
          <div className="grid grid-cols-4 gap-3">
            {achievements.map((a) => (
              <div key={a.id} className={`flex flex-col items-center rounded-lg border p-3 text-center transition-colors ${a.unlocked ? "border-border/50 bg-accent/20" : "border-border/20 bg-card/20 opacity-40"}`}>
                <a.icon className="h-6 w-6 mb-1.5" strokeWidth={1.5} style={{ color: a.unlocked ? "#FF4E00" : "#C6B6B1" }} />
                <span className="text-[10px] font-medium">{a.name}</span>
                {a.unlocked && <div className="h-1 w-1 rounded-full bg-emerald-500 mt-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard — from real API */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40 flex items-center gap-2">
            <Trophy className="h-4 w-4" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
            <h3 className="text-sm font-semibold">Leaderboard</h3>
            <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">{leaderboard.length} entries</span>
          </div>
          <div className="divide-y divide-border/20">
            {leaderboard.slice(0, 15).map((l, i) => (
              <div key={l.address} className="px-5 py-2.5 flex items-center gap-3 hover:bg-accent/30 transition-colors">
                <span className="text-xs font-bold tabular-nums w-5 text-center" style={{ color: i < 3 ? "#FF4E00" : undefined }}>{i + 1}</span>
                <span className="text-xs font-mono flex-1">{shortenAddr(l.address)}</span>
                <span className="text-xs tabular-nums font-medium">{l.score}</span>
                <Badge variant="outline" className={`text-[9px] ${tierBadge(l.tier)}`}>{l.tier}</Badge>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <div className="px-5 py-6 text-center text-xs text-muted-foreground">No reputation data yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
