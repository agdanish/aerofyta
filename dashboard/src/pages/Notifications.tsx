import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, SendHorizontal, Lock, ShieldCheck, Monitor, CheckCheck, X, Loader2 } from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { API_BASE } from "@/hooks/useFetch";

/* ---------- types ---------- */
interface Notification {
  id: string;
  type: "tip" | "escrow" | "security" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface Decision {
  cycleNumber: number;
  creatorName: string;
  actionTaken: string;
  outcome: string;
  tipAmount: number;
  chain: string;
  engagementScore: number;
  timestamp: string;
  id: string;
}

interface NotificationsApiResponse {
  notifications: Notification[];
  total: number;
  unread: number;
}

interface DecisionsApiResponse {
  decisions: Decision[];
  total: number;
}

/* ---------- map decisions to notifications ---------- */
function decisionsToNotifications(decisions: Decision[]): Notification[] {
  return decisions.slice(0, 20).map((d) => {
    const isRefused = d.outcome === "refused";
    const isTipped = d.outcome === "tipped" || d.outcome === "success";
    const type: Notification["type"] = isRefused ? "security" : isTipped ? "tip" : "system";
    const title = isRefused
      ? `Tip Blocked (Cycle #${d.cycleNumber})`
      : isTipped
        ? `Tip Sent (Cycle #${d.cycleNumber})`
        : `Decision (Cycle #${d.cycleNumber})`;
    const amount = d.tipAmount > 0 ? `${d.tipAmount.toFixed(4)} USDT` : "";
    const message = isRefused
      ? `Refused ${amount} to @${d.creatorName} on ${d.chain} — engagement ${(d.engagementScore * 100).toFixed(0)}%`
      : `${amount} to @${d.creatorName} on ${d.chain} — engagement ${(d.engagementScore * 100).toFixed(0)}%`;

    const age = Date.now() - new Date(d.timestamp).getTime();
    const mins = Math.floor(age / 60000);
    const time = mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ago`;

    return { id: d.id, type, title, message, time, read: mins > 30 };
  });
}

/* ---------- demo fallback ---------- */
const demoNotifications: Notification[] = [
  { id: "1", type: "tip", title: "Tip Sent", message: "2.5 USDT tipped to @sarah_creates on Ethereum", time: "2m ago", read: false },
  { id: "2", type: "security", title: "Threat Blocked", message: "Anomaly score 0.92 on tx from 0xdead...beef", time: "5m ago", read: false },
  { id: "3", type: "escrow", title: "Escrow Created", message: "Escrow E-0048: 50 USDT with 2h timelock", time: "12m ago", read: false },
  { id: "4", type: "system", title: "Rebalance Complete", message: "Portfolio rebalanced: diversification now 85%", time: "18m ago", read: true },
  { id: "5", type: "tip", title: "Tip Sent", message: "1.0 USDT tipped to @dev_marcus on Polygon", time: "25m ago", read: true },
  { id: "6", type: "security", title: "Guardian Review", message: "Guardian approved tip to @crypto_claire", time: "32m ago", read: true },
  { id: "7", type: "system", title: "DCA Executed", message: "25 USDT converted to 0.0077 ETH", time: "1h ago", read: true },
  { id: "8", type: "system", title: "Cycle Complete", message: "Agent cycle #1834 completed in 2.3s", time: "2h ago", read: true },
];

const typeIcons: Record<string, LucideIcon> = {
  tip: SendHorizontal,
  escrow: Lock,
  security: ShieldCheck,
  system: Monitor,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        /* Try /api/notifications first */
        const res = await fetch(`${API_BASE}/api/notifications`, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: NotificationsApiResponse = await res.json();

        if (json.notifications && json.notifications.length > 0) {
          if (!cancelled) {
            setNotifications(json.notifications);
            setIsDemo(false);
          }
        } else {
          /* Fallback: build notifications from /api/agent/decisions */
          const dRes = await fetch(`${API_BASE}/api/agent/decisions`, { signal: AbortSignal.timeout(5000) });
          if (!dRes.ok) throw new Error(`HTTP ${dRes.status}`);
          const dJson: DecisionsApiResponse = await dRes.json();
          if (!cancelled) {
            const mapped = decisionsToNotifications(dJson.decisions);
            setNotifications(mapped.length > 0 ? mapped : demoNotifications);
            setIsDemo(mapped.length === 0);
          }
        }
      } catch {
        if (!cancelled) setIsDemo(true);
      } finally {
        if (!cancelled) { setLoading(false); setInitialLoading(false); }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (initialLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-white/5 rounded-lg h-8 w-64" />
        <div className="animate-pulse bg-white/5 rounded-lg h-10 w-80" />
        <div className="animate-pulse bg-white/5 rounded-lg h-32" />
        <div className="animate-pulse bg-white/5 rounded-lg h-32" />
      </div>
    );
  }

  const filtered = tab === "all" ? notifications : notifications.filter((n) => n.type === tab);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  const dismiss = (id: string) => setNotifications((ns) => ns.filter((n) => n.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alert Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time notifications from agent activity.
            {isDemo && <Badge variant="outline" className="ml-2 text-[9px] bg-amber-500/15 text-amber-400 border-amber-500/30">Demo Data</Badge>}
            {loading && <Loader2 className="inline ml-2 h-3 w-3 animate-spin text-muted-foreground" />}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={markAllRead}>
            <CheckCheck className="h-3.5 w-3.5 mr-1.5" />Mark all read
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary/50 mb-6">
          <TabsTrigger value="all">All {unreadCount > 0 && <Badge className="ml-1.5 h-4 min-w-4 px-1 text-[9px] bg-primary text-primary-foreground">{unreadCount}</Badge>}</TabsTrigger>
          <TabsTrigger value="tip">Tips</TabsTrigger>
          <TabsTrigger value="escrow">Escrow</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          <div className="rounded-xl border border-border/50 bg-card/50">
            <ScrollArea className="h-[520px]">
              <div className="divide-y divide-border/20">
                {filtered.length === 0 && (
                  <div className="p-12 text-center text-sm text-muted-foreground">No notifications in this category.</div>
                )}
                {filtered.map((n) => {
                  const Icon = typeIcons[n.type] || Bell;
                  return (
                    <div key={n.id} className={`px-5 py-4 flex items-start gap-3 hover:bg-accent/30 transition-colors ${!n.read ? "bg-accent/10" : ""}`}>
                      <Icon className="h-5 w-5 mt-0.5 shrink-0" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                          <span className="text-sm font-medium">{n.title}</span>
                          <Badge variant="outline" className="text-[9px]">{n.type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{n.message}</p>
                        <span className="text-[10px] text-muted-foreground/60 mt-0.5 block">{n.time}</span>
                      </div>
                      <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => dismiss(n.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
