# AeroFyta — Lovable AI Prompt v2

## YOUR MISSION
Build the frontend for **AeroFyta** — an autonomous multi-chain payment agent that extends the Tether WDK ecosystem. This is a hackathon submission competing for "Best Overall Project" — the judges want something that "sets a standard others will want to build on."

The UI must feel like a **native extension of Tether's WDK platform** (https://docs.wdk.tether.io/) and **OpenClaw's agent framework** (https://openclaw.ai/). When judges click from those sites into AeroFyta, the transition should feel seamless — same visual DNA, same quality bar. NOT a separate app. An extension.

**YOU decide the layout, component placement, visual hierarchy, and UX flow.** I'm giving you the data, features, and design DNA — you decide how to arrange them for maximum impact. Surprise me. Don't use a generic dashboard template.

---

## DESIGN DNA — Match These Two Sites

### From docs.wdk.tether.io (Tether's developer portal):
- Near-black background `#0b0b0b` with warm dark surfaces `#141212`
- Warm brown-black tones (NOT cold gray)
- Orange accent `#ff4e00` for CTAs, green `#00c950` for success
- Warm text colors: `#fffefd` headings, `#c6b6b1` body
- Clean Inter font, weight 600-700 for headings
- Buttons: `border-radius: 9px`, compact, purposeful
- Sidebar navigation feel — structured, documentation-grade
- Overall: **warm, professional, developer-focused**

### From openclaw.ai (Tether's AI agent framework):
- Deep space background `#050810` with blue undertone
- Semi-transparent card surfaces: `rgba(10, 15, 26, 0.65)` + `border: 0.8px solid rgba(136, 146, 176, 0.15)`
- Coral accent `#ff4d4d` for energy/CTAs, cyan `#00e5cc` for active/success
- Logo gradient: white → coral → cyan (animated `background-size: 200%`)
- Star field / particle background (subtle)
- Section markers: coral `>` chevron before headings
- Typography: geometric display font for h1 (you can use Inter 800), clean sans for body
- Buttons: `border-radius: 12px`, gradient coral fills with glow `box-shadow: 0 4px 20px rgba(255,77,77,0.25)`
- Pill badges with translucent backgrounds
- Integration pills: `rgba(10,15,26,0.65)` bg, `0.8px` border, `border-radius: 20px`
- Overall: **deep, cinematic, AI-forward, premium**

### The Blend (YOUR creative decision):
Merge these two identities. AeroFyta sits between WDK (the infrastructure) and OpenClaw (the AI layer). The UI should feel like you're inside the Tether ecosystem — not visiting a random hackathon project. Use Tether teal `#009393` as your primary brand color (it's the official Tether brand color from tether.to).

---

## TECH STACK
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Lucide React icons (already installed)
- No shadcn, no MUI, no Chakra — pure Tailwind
- Fonts: Inter (Google Fonts) + JetBrains Mono (monospace)

---

## WHAT THE APP DOES (Features — you decide how to present them)

AeroFyta is an **autonomous AI agent** that manages crypto wallets across 9 blockchains and makes intelligent payment decisions. It has two audiences:

1. **End users** who want to tip Rumble creators with crypto (Simple Mode)
2. **Judges/developers** who want to see the full autonomous platform (Advanced Mode)

These two modes should be toggled somehow — your choice how (tabs, route, sidebar, toggle button, whatever feels most premium).

### SIMPLE MODE Features (the Rumble tipping experience):

**Wallet Portfolio**
- User has wallets on multiple chains: Ethereum, TON, TRON, Bitcoin, Solana (and more)
- Each wallet has a native currency balance and optionally a USDT balance
- Users need to see balances, copy addresses

**Rumble Creator Tipping**
- List of registered Rumble video creators
- Each creator: name, channel URL, wallet address, tip history
- Users can tip any creator with one click
- Tipping form: recipient, amount, token type (Native/USDT/XAUT/BTC), optional message
- AI agent automatically selects the cheapest chain to execute the tip

**Smart Tipping Features**
- Split tips across multiple creators
- Auto-tip rules: "tip 0.001 when I watch >70% of a video, max 5/day"
- Community tipping pools: fans collectively fund a creator
- Event-triggered tips: auto-tip when creator goes live, hits milestone, posts new video

**Leaderboard**
- Top tippers ranked by total tips and amount
- Medal badges (gold/silver/bronze)

**Agent Pipeline Visualization**
- The AI agent runs an 11-step decision pipeline: INTAKE → ANALYZE → REASON → CONSENSUS → EXECUTE → VERIFY
- When idle: show the pipeline steps
- When active: highlight current step, show reasoning text, progress bar

**Activity Feed**
- Real-time chronological feed of agent actions and tip events
- Success/failure indicators

**Key Metrics**
- Agent status (idle/running)
- Connected chains count (9)
- Tips today, total volume, budget used, success rate

### ADVANCED MODE Features (full autonomous platform):

Show all 43 services and 238 API endpoints organized into these categories:

**Intelligence**
- Multi-Agent Orchestration: 3 sub-agents (TipExecutor, Guardian, TreasuryOptimizer) that vote on decisions with consensus scoring
- Autonomous Intelligence: configurable autonomy levels, smart recommendations, policy management, decision audit log
- Predictive Intelligence: AI-generated predictions with confidence scores
- Risk Engine: 8-factor risk assessment, score 0-100, auto-execute threshold

**Innovation**
- Creator Discovery: find new creators by trend/category
- Tip Propagation: viral tipping waves
- Proof of Engagement: on-chain attestations
- Creator Analytics: performance metrics and patterns

**Execution**
- Streaming Tips: continuous payment streams (start/pause/stop)
- Escrow Manager: conditional tip releases
- DCA Plans: dollar-cost averaging for regular tipping
- Fee Optimizer: compare fees across all 9 chains
- Fee Arbitrage: exploit cross-chain fee differences
- Agent Memory: searchable memory of past decisions

**DeFi**
- Treasury: balance overview, allocation strategy, yield generation
- Bridge: cross-chain transfers via USDT0 protocol
- Lending: Aave V3 supply/withdraw with position tracking
- Spending Limits: daily and per-transaction caps
- System Health: chain status, RPC health, uptime

**Analytics**
- Stats: KPIs (total tips, volume, fees, avg size)
- Economics: fee structures, revenue smoothing
- Chain comparison: per-chain usage, costs, speed

---

## API SPEC (Connect to these real endpoints)

Base URL: `http://localhost:3001/api`

Every API call MUST use a safe wrapper that returns sensible defaults when backend is offline:

```typescript
const API = 'http://localhost:3001/api';

async function api<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API}${path}`, init);
    if (!res.ok) return fallback;
    return await res.json();
  } catch {
    return fallback;
  }
}
```

### Core Endpoints:

```
GET  /wallet/balances          → { balances: [{ chainId, address, nativeBalance, nativeCurrency, usdtBalance }] }
GET  /rumble/creators          → { creators: [{ id, name, channelUrl, walletAddress, totalTips, totalAmount }] }
GET  /activity                 → { activity: [{ id, type, message, timestamp, detail? }] }
GET  /agent/stats              → { totalTips, totalFees, chainUsage, successRate, uptime }
GET  /agent/events             → SSE stream: { type, status, currentStep?, reasoning?, progress? }
GET  /rumble/leaderboard       → { leaderboard: [{ address, totalTips, totalAmount, rank }] }
GET  /rumble/pools             → { pools: [{ id, creatorId, title, goalAmount, currentAmount, contributors }] }
GET  /rumble/auto-tip/rules/:userId → { rules: [{ minWatchPercent, tipAmount, maxTipsPerDay }] }
POST /tip                      → body: { recipient, amount, token, message? } → { status, txHash, amount, recipient, chainId, reasoning? }
POST /tip/split                → body: { recipients[], totalAmount, token } → { results[] }
POST /rumble/auto-tip/rules    → body: { userId, rules[] }
POST /rumble/pools             → body: { creatorId, title, goalAmount }
POST /rumble/events/triggers   → body: { creatorId, event, tipAmount }
```

### Advanced Endpoints:

```
GET  /meta                     → { services, endpoints, innovations }
GET  /orchestrator/stats       → { totalDecisions, consensusRate, agents[] }
GET  /orchestrator/history     → decisions[]
POST /orchestrator/propose     → { decision }
GET  /autonomy/profile         → autonomy profile
GET  /autonomy/recommendations → recommendations[]
GET  /autonomy/policies        → policies[]
GET  /autonomy/decisions       → decisions[]
POST /autonomy/evaluate        → evaluation result
GET  /predictions              → predictions[]
GET  /predictions/stats        → stats
POST /predictions/generate     → predictions[]
GET  /treasury/status          → { totalBalance, allocation, yields }
GET  /treasury/analytics       → analytics
GET  /bridge/routes            → routes[]
POST /bridge/quote             → { fee, estimatedTime, route }
POST /bridge/execute           → result
GET  /lending/rates            → { apy, tvl, rates }
GET  /lending/position         → { supplied, earned, healthFactor }
POST /lending/supply           → result
GET  /stream/active            → streams[]
POST /stream/start             → stream
GET  /escrow                   → escrows[]
POST /escrow                   → escrow
GET  /dca                      → plans[]
POST /dca                      → plan
GET  /safety/status            → safety status
POST /safety/kill-switch       → { activated }
GET  /fees/compare             → { recommendation, comparisons[] }
GET  /fees/current             → fees[]
GET  /memory                   → memories[]
GET  /memory/stats             → memory stats
GET  /strategies/status        → strategy status
GET  /strategies/summary       → { tipping, lending, defi, walletManagement }
GET  /strategies/decisions     → decisions[]
GET  /network/health           → { chains: [{ chainId, status, latencyMs }] }
GET  /advanced/services        → { totalServices, services[] }
```

---

## CRITICAL RULES

1. **Zero crashes when backend is offline** — every section shows graceful empty states
2. Guard all `.toFixed()`: `(value ?? 0).toFixed(2)`
3. Guard all `.slice()`: `(str ?? '').slice(0, 8)`
4. Advanced Mode: lazy-load with `React.lazy` + `Suspense`
5. SSE for agent state with reconnect on failure
6. 10-second polling for activity feed
7. Copy-to-clipboard on wallet addresses
8. `font-variant-numeric: tabular-nums` on all financial amounts
9. Mobile responsive (single column < 640px)

---

## THE STANDARD

The winning criterion says: "set a standard others will want to build on."

This UI should make judges think: "This isn't a hackathon project. This is what the next version of docs.wdk.tether.io should integrate. This is an OpenClaw module."

Don't make a dashboard. Make a **platform interface**. The difference is in the depth, the attention to detail, and the feeling that this tool has real users.
