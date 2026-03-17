import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import CountUp from "@/components/shared/CountUp";
import ShimmerSkeleton from "@/components/shared/ShimmerSkeleton";
import { Target, CheckCircle2, Flame, Trophy, Zap, Star, Heart, Globe, Shield, Award, Loader2 } from "lucide-react";
import { API_BASE } from "@/hooks/useFetch";

/* ---------- API types ---------- */
interface GoalApi {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  token: string;
  deadline: string;
  createdAt: string;
  completed: boolean;
}

interface AchievementApi {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  unlockedAt?: string;
}

interface GoalsApiResponse {
  goals: GoalApi[];
}

interface AchievementsApiResponse {
  achievements: AchievementApi[];
}

/* ---------- display types ---------- */
interface ActiveGoal {
  id: string;
  title: string;
  progress: number;
  target: string;
  deadline: string;
}

interface CompletedGoal {
  id: string;
  title: string;
  completedAt: string;
}

interface AchievementDisplay {
  id: string;
  name: string;
  description: string;
  iconEmoji: string;
  date: string | null;
  unlocked: boolean;
  progress: number;
  target: number;
}

/* ---------- icon map for achievements ---------- */
const achievementIcons: Record<string, typeof Trophy> = {
  "first-tip": Target,
  "big-tipper": Heart,
  "multi-chain-master": Globe,
  "batch-boss": Award,
  "smart-sender": Zap,
  "time-traveler": Star,
  "fee-optimizer": Shield,
};

/* ---------- map API goals ---------- */
function mapGoals(goals: GoalApi[]): { active: ActiveGoal[]; completed: CompletedGoal[] } {
  const unique = new Map<string, GoalApi>();
  /* deduplicate by title, keep most recent */
  for (const g of goals) {
    const existing = unique.get(g.title);
    if (!existing || new Date(g.createdAt) > new Date(existing.createdAt)) {
      unique.set(g.title, g);
    }
  }

  const active: ActiveGoal[] = [];
  const completed: CompletedGoal[] = [];

  for (const g of unique.values()) {
    const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
    if (g.completed) {
      completed.push({
        id: g.id,
        title: g.title,
        completedAt: new Date(g.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    } else {
      const daysLeft = Math.max(0, Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000));
      active.push({
        id: g.id,
        title: g.title,
        progress: pct,
        target: `${g.targetAmount} ${g.token.toUpperCase()}`,
        deadline: daysLeft > 0 ? `${daysLeft} days left` : "Overdue",
      });
    }
  }
  return { active, completed };
}

/* ---------- map API achievements ---------- */
function mapAchievements(achs: AchievementApi[]): AchievementDisplay[] {
  return achs.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    iconEmoji: a.icon,
    date: a.unlockedAt ? new Date(a.unlockedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null,
    unlocked: !!a.unlockedAt,
    progress: a.progress,
    target: a.target,
  }));
}

/* ---------- demo fallback ---------- */
const demoActive: ActiveGoal[] = [
  { id: "1", title: "Tip 50 creators this month", progress: 68, target: "50 creators", deadline: "8 days left" },
  { id: "2", title: "Maintain 90%+ health score", progress: 94, target: "90% minimum", deadline: "Ongoing" },
  { id: "3", title: "Deploy on 3 new chains", progress: 33, target: "3 chains", deadline: "14 days left" },
];

const demoCompleted: CompletedGoal[] = [
  { id: "c1", title: "Process first 100 tips", completedAt: "Mar 15" },
  { id: "c2", title: "Achieve Diamond reputation tier", completedAt: "Mar 12" },
];

const demoAchievements: AchievementDisplay[] = [
  { id: "first_100", name: "Century Club", description: "Process 100 tips", iconEmoji: "", date: "Mar 15", unlocked: true, progress: 100, target: 100 },
  { id: "diamond", name: "Diamond Tier", description: "Reach Diamond reputation", iconEmoji: "", date: "Mar 12", unlocked: true, progress: 1, target: 1 },
  { id: "speed", name: "Speed Demon", description: "Tip 5 creators in a day", iconEmoji: "", date: null, unlocked: false, progress: 0, target: 5 },
];

export default function Goals() {
  const [activeGoals, setActiveGoals] = useState<ActiveGoal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<CompletedGoal[]>([]);
  const [achievements, setAchievements] = useState<AchievementDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      let gotReal = false;
      try {
        const [goalsRes, achRes] = await Promise.all([
          fetch(`${API_BASE}/api/goals`, { signal: AbortSignal.timeout(5000) }),
          fetch(`${API_BASE}/api/achievements`, { signal: AbortSignal.timeout(5000) }),
        ]);

        if (goalsRes.ok) {
          const goalsJson: GoalsApiResponse = await goalsRes.json();
          if (!cancelled && goalsJson.goals) {
            const { active, completed } = mapGoals(goalsJson.goals);
            if (active.length > 0 || completed.length > 0) {
              setActiveGoals(active);
              setCompletedGoals(completed);
              gotReal = true;
            }
          }
        }

        if (achRes.ok) {
          const achJson: AchievementsApiResponse = await achRes.json();
          if (!cancelled && achJson.achievements && achJson.achievements.length > 0) {
            setAchievements(mapAchievements(achJson.achievements));
            gotReal = true;
          }
        }

        if (!cancelled) {
          if (!gotReal) {
            setActiveGoals(demoActive);
            setCompletedGoals(demoCompleted);
            setAchievements(demoAchievements);
          }
          setIsDemo(!gotReal);
        }
      } catch {
        if (!cancelled) {
          setActiveGoals(demoActive);
          setCompletedGoals(demoCompleted);
          setAchievements(demoAchievements);
          setIsDemo(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <ShimmerSkeleton className="h-8 w-48" />
        <ShimmerSkeleton className="h-4 w-72" />
        <div className="grid lg:grid-cols-2 gap-4">
          <ShimmerSkeleton className="h-48" />
          <ShimmerSkeleton className="h-48" />
        </div>
        <ShimmerSkeleton className="h-40" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals & Achievements</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track progress, earn badges, and maintain your streak.
            {isDemo && <Badge variant="outline" className="ml-2 text-[9px] bg-amber-500/15 text-amber-400 border-amber-500/30">Demo Data</Badge>}
            {loading && <Loader2 className="inline ml-2 h-3 w-3 animate-spin text-muted-foreground" />}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 py-2">
          <Flame className="h-5 w-5" strokeWidth={1.5} style={{ color: "#FF4E00" }} />
          <div>
            <p className="text-lg font-bold tabular-nums leading-none"><CountUp target={unlockedCount} /></p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Unlocked</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Active Goals */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <h3 className="text-sm font-semibold mb-4">Active Goals ({activeGoals.length})</h3>
          <div className="space-y-4">
            {activeGoals.length === 0 && (
              <p className="text-xs text-muted-foreground">No active goals.</p>
            )}
            {activeGoals.map((g) => (
              <div key={g.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium">{g.title}</span>
                  <span className="text-[10px] text-muted-foreground">{g.deadline}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={g.progress} className="h-2 flex-1 bg-secondary" />
                  <span className="text-xs font-mono tabular-nums w-10 text-right">{g.progress}%</span>
                </div>
                <span className="text-[10px] text-muted-foreground/60">Target: {g.target}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Goals */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <h3 className="text-sm font-semibold mb-4">Completed ({completedGoals.length})</h3>
          <div className="space-y-3">
            {completedGoals.length === 0 && (
              <p className="text-xs text-muted-foreground">No completed goals yet.</p>
            )}
            {completedGoals.map((g) => (
              <div key={g.id} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.5} style={{ color: "#50AF95" }} />
                <span className="text-xs flex-1">{g.title}</span>
                <span className="text-[10px] text-muted-foreground">{g.completedAt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-5">
        <h3 className="text-sm font-semibold mb-4">Achievements ({unlockedCount}/{achievements.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {achievements.map((a) => {
            const IconComp = achievementIcons[a.id] || Trophy;
            return (
              <div key={a.id} className={`flex flex-col items-center rounded-lg border p-3 text-center transition-colors ${a.unlocked ? "border-border/50 bg-accent/20" : "border-border/20 bg-card/20 opacity-40"}`}>
                {a.iconEmoji ? (
                  <span className="text-2xl mb-1">{a.iconEmoji}</span>
                ) : (
                  <IconComp className="h-6 w-6 mb-1.5" strokeWidth={1.5} style={{ color: a.unlocked ? "#FF4E00" : "#C6B6B1" }} />
                )}
                <span className="text-[10px] font-medium">{a.name}</span>
                {a.date && <span className="text-[9px] text-muted-foreground/60 mt-0.5">{a.date}</span>}
                {!a.unlocked && a.target > 0 && (
                  <span className="text-[9px] text-muted-foreground/60 mt-0.5">{a.progress}/{a.target}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
