import { Badge } from "@/components/ui/badge";

const releases = [
  {
    version: "1.1.0",
    date: "March 22, 2026",
    changes: [
      "107 CLI commands fully operational",
      "npm package published: @xzashr/aerofyta",
      "SDK with 5 presets for rapid integration",
      "Full dashboard with 39 pages of agent capabilities",
    ],
  },
  {
    version: "1.0.0",
    date: "March 22, 2026",
    changes: [
      "Initial stable release: 60+ services",
      "12 WDK packages integrated",
      "9 blockchain networks supported",
      "603 API endpoints available",
    ],
  },
  {
    version: "0.9.0",
    date: "March 21, 2026",
    changes: [
      "Multi-agent consensus with 3-agent voting",
      "HTLC escrow with SHA-256 hash-locks",
      "Pay-per-engagement tipping engine",
      "Proof of Engagement attestations",
    ],
  },
  {
    version: "0.5.0",
    date: "March 20, 2026",
    changes: [
      "Core agent intelligence with ReAct executor",
      "Financial Pulse — wallet-driven behavior",
      "Treasury management with yield strategies",
      "Zero-knowledge proof capabilities",
    ],
  },
  {
    version: "0.1.0",
    date: "March 19, 2026",
    changes: [
      "Project kickoff",
      "Tether WDK integration",
      "Basic tipping on Ethereum and TON",
      "Agent loop with reasoning traces",
    ],
  },
];

export default function Changelog() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Changelog</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Version history and release notes</p>
      </div>

      <div className="relative pl-8">
        {/* Vertical line */}
        <div
          className="absolute left-3 top-2 bottom-2 w-px"
          style={{ background: "rgba(255,78,0,0.15)" }}
        />

        <div className="space-y-10">
          {releases.map((r, i) => (
            <div key={r.version} className="relative animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              {/* Dot */}
              <div
                className="absolute -left-5 top-1 h-3 w-3 rounded-full border-2"
                style={{
                  borderColor: "#FF4E00",
                  background: i === 0 ? "#FF4E00" : "hsl(var(--background))",
                }}
              />
              <div className="flex items-center gap-3 mb-2">
                <Badge
                  variant="outline"
                  className="font-mono text-xs"
                  style={{ borderColor: "rgba(255,78,0,0.3)", color: "#FF4E00" }}
                >
                  v{r.version}
                </Badge>
                <span className="text-xs text-muted-foreground">{r.date}</span>
              </div>
              <ul className="space-y-1.5">
                {r.changes.map((c) => (
                  <li key={c} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1.5 shrink-0">•</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
