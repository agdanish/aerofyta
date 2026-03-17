# AeroFyta — Lovable AI Prompt v3

## YOUR CREATIVE BRIEF

You are designing and building the frontend for **AeroFyta** — an autonomous AI agent that manages crypto wallets across 9 blockchains and makes intelligent payment decisions. This is a hackathon submission competing for $18,000+ in prizes.

**You have FULL creative control.** I am NOT telling you what colors to use, how to lay things out, what cards should look like, or where buttons go. That's YOUR job. You are the designer. Surprise me.

The ONLY design constraint: **the UI must feel like it belongs on these two websites:**

1. **https://docs.wdk.tether.io/** — Tether's developer documentation portal
2. **https://openclaw.ai/** — Tether's AI agent framework site

Visit both. Study them. Absorb their visual DNA — colors, spacing, typography, card treatments, backgrounds, button styles, hover states, transitions, the *feeling* they create. Then design AeroFyta as if it were a new section of those sites. When a judge clicks from docs.wdk.tether.io into AeroFyta, the transition should be **seamless**. Not "inspired by." Not "similar to." **Part of the same product family.**

The brand color of Tether (tether.to) is teal `#009393`. Use it as primary.

---

## WHAT MAKES THIS WIN

The judges said the winning project should **"set a standard others will want to build on."** They evaluate on:

1. **Agent Intelligence** — how smart the AI decisions are
2. **WDK Wallet Integration** — how deeply it uses Tether's SDK
3. **Technical Execution** — code quality, architecture
4. **Agentic Payment Design** — creative autonomous payment flows
5. **Originality** — novel approaches
6. **Polish & Ship-ability** — does it feel like a real product?
7. **Presentation & Demo** — visual impact

Criteria 6 and 7 are where this UI matters. When judges open this app, their reaction should be: *"This isn't a hackathon project. This is production software. This belongs in the Tether ecosystem."*

Think: What would Stripe's dashboard look like if it were built by the OpenClaw team for the Tether ecosystem? That level of polish. That level of depth. Financial data density with cinematic visual quality.

---

## TECH STACK

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Lucide React icons (already installed)
- No shadcn, no MUI, no Chakra — pure Tailwind
- Fonts: Inter (Google Fonts) + JetBrains Mono (monospace for addresses/amounts/code)

---

## THE TWO AUDIENCES (Two Modes)

AeroFyta serves two audiences. How you present these two modes (tabs, toggle, routes, sidebar, progressive disclosure — whatever) is YOUR creative decision.

### Mode 1: Simple Mode (Default — what users see)

This is the **Rumble creator tipping experience**. A user opens the app and wants to:
- See their crypto wallet balances across multiple chains
- Browse registered Rumble video creators
- Tip a creator with one click (the AI agent picks the cheapest chain)
- Set up auto-tipping rules
- Watch the AI agent's decision pipeline in real-time
- See a feed of what's happening

#### Features to surface in Simple Mode:

**Wallet Portfolio**
- User has wallets on 9 chains: Ethereum, TON, TRON, Bitcoin, Solana, Liquid, Kaia, Plasma, Celo
- Each wallet: chain name, native currency balance, USDT balance, copyable address
- Show total portfolio value

**Rumble Creator Directory**
- List of registered Rumble video creators
- Each creator: name, channel URL, wallet address, tip count, total amount received
- One-click tip button per creator

**Tipping**
- Simple tip form: pick recipient, enter amount, choose token (Native/USDT/XAUT/BTC), optional message
- The AI agent automatically selects the optimal chain for lowest fees
- After sending: show result with tx hash, chain used, fee paid, agent's reasoning

**Smart Tipping Features**
- Split tips: divide a tip across multiple creators at once
- Auto-tip rules: "tip X amount when I watch >Y% of a video, max Z tips per day"
- Community pools: fans collectively fund a tip pool for a creator (show progress toward goal)
- Event triggers: auto-tip when a creator goes live, hits a milestone, posts a new video, or has an anniversary

**Leaderboard**
- Top tippers ranked by total tips given and total amount
- Medal badges for top 3 (gold, silver, bronze)

**Agent Pipeline Visualization**
- The AI agent runs an 11-step decision pipeline: INTAKE → ANALYZE → REASON → CONSENSUS → EXECUTE → VERIFY
- When idle: show the pipeline steps as a visual flow
- When active: highlight current step, show the agent's live reasoning text, show progress
- This is a KEY differentiator — make it visually impressive

**Activity Feed**
- Real-time chronological feed of agent actions and tip events
- Success/failure/info indicators per event
- Updates every 10 seconds

**Key Metrics**
- Agent status (idle/processing/executing)
- Number of connected chains (9)
- Tips sent today
- Total tip volume
- Budget remaining
- Success rate percentage

### Mode 2: Advanced Mode (Full platform — for judges/developers)

This mode reveals the FULL autonomous platform: 43 services, 238 API endpoints, 12 innovations. It should feel like opening the hood of a supercar.

Organize these capabilities into logical groups (YOUR choice how):

**Intelligence Layer**
- Multi-Agent Orchestration: 3 sub-agents (TipExecutor, Guardian, TreasuryOptimizer) that vote on every decision. Show their consensus scores, individual votes, reasoning chains. "Test Vote" capability.
- Autonomous Intelligence: configurable autonomy levels, smart recommendations the agent generates, policy management (rules the agent follows), full decision audit log
- Predictive Intelligence: AI-generated predictions with confidence percentages. "Generate Predictions" action.
- Risk Engine: 8-factor risk assessment, score 0-100, verdict (LOW/MEDIUM/HIGH/CRITICAL), individual factor breakdown

**Innovation Layer**
- Creator Discovery: find new creators by trend/category/rising
- Tip Propagation: viral tipping — tips that cascade through a network
- Proof of Engagement: on-chain attestations proving real engagement
- Creator Analytics: deep performance metrics, tipping patterns, growth trends

**Execution Layer**
- Streaming Tips: continuous payment streams (start/pause/stop). Show active streams.
- Escrow Manager: conditional tips — hold funds until conditions are met (release/refund/dispute)
- DCA Plans: dollar-cost averaging for regular automated tipping (create/pause/cancel)
- Fee Optimizer: compare fees across all 9 chains, show cheapest route
- Fee Arbitrage: exploit cross-chain fee differences for savings
- Agent Memory: searchable memory of past decisions and learnings, with stats

**DeFi Layer**
- Treasury: total balance, allocation strategy across assets, yield generation
- Bridge: cross-chain transfers via USDT0 protocol (routes, quotes, execution)
- Lending: Aave V3 supply/withdraw with position tracking, APY rates, health factor
- Spending Limits: daily and per-transaction caps
- System Health: per-chain status, RPC latency, uptime

**Analytics Layer**
- KPIs: total tips, volume, total fees, average tip size
- Economics: fee structures, revenue smoothing analysis
- Chain comparison: per-chain breakdown of usage, costs, speed

---

## API SPECIFICATION

Base URL: `http://localhost:3001/api`

**CRITICAL**: Every API call MUST be wrapped in error handling that returns sensible defaults when the backend is offline. The app must NEVER crash or show errors when the backend isn't running — just empty states and fallback data.

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

### Simple Mode Endpoints

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

### Advanced Mode Endpoints

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
GET  /risk/assess              → { score, verdict, factors[] }
POST /risk/evaluate            → risk evaluation
GET  /creator-discovery/trending → trending creators
GET  /creator-discovery/search → search results
GET  /tip-propagation/waves    → propagation waves
POST /tip-propagation/create   → new wave
GET  /proof-of-engagement/attestations → attestations[]
POST /proof-of-engagement/attest → new attestation
GET  /creator-analytics/stats  → creator performance data
GET  /economics/overview       → economic metrics
GET  /revenue-smoothing/status → smoothing status
```

---

## HARD REQUIREMENTS (Non-negotiable)

1. **Zero crashes when backend is offline** — every section shows graceful empty states with helpful messages
2. Guard all `.toFixed()` calls: `(value ?? 0).toFixed(2)`
3. Guard all `.slice()` calls: `(str ?? '').slice(0, 8)`
4. Advanced Mode: lazy-load with `React.lazy` + `Suspense`
5. SSE connection for real-time agent state with auto-reconnect on failure
6. 10-second polling interval for activity feed
7. Copy-to-clipboard on all wallet addresses
8. `font-variant-numeric: tabular-nums` on all financial amounts
9. Mobile responsive — single column below 640px
10. All interactive elements must have hover/active/focus states

---

## WHAT I DON'T WANT

- A generic dashboard template with sidebar + cards grid
- Bootstrap/Material Design aesthetic
- Bright white backgrounds or light theme defaults
- Placeholder "Lorem ipsum" content
- Fake data that doesn't match the API response shapes
- Over-designed animations that hurt performance
- A design that looks like every other crypto dashboard

---

## THE STANDARD

Make something that, when a hackathon judge opens it, they pause. They lean forward. They start clicking around not because they have to evaluate it, but because they WANT to explore it. They think: *"This doesn't look like a hackathon project. This looks like the next feature drop from Tether."*

That's the bar. Meet it.
