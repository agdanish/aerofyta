# Lovable Prompt — AeroFyta Dashboard

Copy everything below the --- line into Lovable as ONE prompt:

---

Build a production-grade dashboard for "AeroFyta" — an autonomous multi-chain payment agent built on Tether WDK and OpenClaw. Design it like a real enterprise product (Linear, Stripe, Vercel level quality), not a hackathon demo.

## DESIGN

Reference: docs.wdk.tether.io (dark theme, orange #FF4E00 accent, Inter font). Design an enterprise blockchain dashboard that feels like an official Tether WDK product.

- Brand accent: #FF4E00 (WDK orange — buttons, active states)
- Success color: #50AF95 (Tether green — positive states)
- Font: Inter
- Dark theme, near-black background
- YOU choose all other colors, shadows, borders, spacing for maximum visual impact
- Enterprise quality: think Linear App meets Stripe Dashboard
- Subtle micro-animations: fade-in pages, hover scale on cards, smooth transitions, count-up numbers on stats
- Generous whitespace, card-based layouts, left sidebar navigation

## BACKEND

API at http://localhost:3001. fetch() for all data. If unreachable → show "Demo Mode" with realistic hardcoded sample data. Skeleton loaders. Toast notifications.

## PAGES

### 1. LANDING (/) — First impression. Must be cinematic.

Hero:
- Heading: "AeroFyta" (large, bold)
- One line: "Autonomous payments for the agentic economy."
- Two buttons: "Open Dashboard" (#FF4E00) · "npm install @xzashr/aerofyta" (code style, outlined)

Metrics ribbon (animated count-up):
1,001 tests · 12 WDK packages · 9 chains · 107 CLI commands · 603 API endpoints

Three-column section — "Built Different":
- Column 1: "Wallet-as-Brain" — "Your wallet's financial state drives agent behavior. Not rules. Not scripts. Financial intelligence."
- Column 2: "Multi-Agent Consensus" — "Three agents vote. They deliberate. They flip decisions on evidence. A Guardian holds veto power."
- Column 3: "Trustless Payments" — "HTLC atomic swaps across chains. No bridges. No smart contracts. Pure cryptographic trust."

How it works (horizontal flow, animated connecting line):
📡 Watch → 🧠 Decide → ⚡ Execute → 📈 Learn
Each step: icon, one-word title, one short sentence description.

Platform section — "Built to Extend":
"AeroFyta is an SDK-first platform. Install it. Import it. Build on it."
Three code blocks side by side:
```
npm install @xzashr/aerofyta
```
```
npx @xzashr/aerofyta demo
```
```
import { createAeroFytaAgent } from '@xzashr/aerofyta'
```

Capabilities grid (6 small cards, icon + title + one sentence):
- 🔐 HTLC Escrow — "SHA-256 hash-locked with timelock enforcement"
- 💸 Pay-per-Engagement — "Tips triggered by views, likes, comments, shares"
- 🔄 Cross-Chain Swaps — "Trustless exchange via HTLC protocol"
- 🛡️ 6-Layer Security — "Policy, anomaly detection, risk engine, consensus, veto, de-escalation guard"
- 📊 97+ MCP Tools — "Full Model Context Protocol integration for AI orchestration"
- 🌐 9 Blockchains — "Ethereum, TON, Tron, Bitcoin, Solana, Polygon, Arbitrum + more"

Final CTA: "Open Dashboard →" button. Store in localStorage to skip on return.

### 2. DASHBOARD (/dashboard)
- Top bar: "AeroFyta" logo, status dot (green=online), mood emoji + name, total balance
- 4 stat cards (animated count-up): Tips Sent, Active Escrows, Creators Tracked, Cycles Run
- "Financial Pulse" — 4 progress bars: Liquidity, Diversification, Velocity, Health Score
- "Agent Mood" card: large emoji, mood name, multiplier, one-line reason
- "Recent Activity" — scrollable feed, last 15 events
- API: GET /api/agent/status, GET /api/wallet/balances

### 3. WALLETS (/wallets)
- Heading: "Multi-Chain Wallets" · "One seed. Nine chains. Non-custodial."
- Grid of 9 chain cards: icon, name, address (copy button), USDT + native balance, status dot
- Buttons: Fund (faucet links), Gasless Test, Export JSON
- API: GET /api/wallet/addresses, GET /api/wallet/balances

### 4. CREATORS (/creators)
- Heading: "Creator Intelligence"
- Searchable table: Name, Platform, Engagement (progress bar), Tips Received, Reputation Tier (badge)
- Row click → expand details
- "Discover" button → GET /api/creators/discover
- API: GET /api/rumble/creators

### 5. TIPS (/tips)
- Heading: "Payment History"
- Table: Date, Recipient, Amount, Chain badge, Status badge, TX Hash (Etherscan link)
- Filters: chain, status, search
- "Send Tip" button → modal (address, amount, chain)
- API: GET /api/wallet/history, POST /api/wallet/tip

### 6. ESCROW (/escrow)
- Heading: "Smart Escrow" · "Hash-locked. Time-bound. Trustless."
- Stats: Created / Claimed / Refunded / Locked
- Escrow cards: ID, recipient, amount, status, countdown
- Create modal: recipient, amount, timelock → returns ID + secret
- Claim/Refund action buttons
- API: GET /api/escrow, POST /api/escrow, POST /api/escrow/:id/claim, POST /api/escrow/:id/refund

### 7. REASONING (/reasoning)
- Heading: "Live Agent Reasoning"
- Text input + "Start" button (pulse animation while active)
- SSE stream: cards with type icons (🧠💡⚡👁💭✅), content, confidence bar, source label
- Auto-scroll
- API: GET /api/reasoning/stream?prompt=...

### 8. DEMO (/demo)
- Heading: "Interactive Demo" · "Experience every capability. No terminal required."
- Toggle: Full Demo | Step-by-Step
- Full: big button → SSE of 10 steps, progress bar, expandable results
- Step: 10 numbered buttons
- API: POST /api/demo/run-full (SSE), POST /api/demo/step

### 9. SECURITY (/security)
- Heading: "Security Architecture"
- "Run Adversarial Tests" → 6 cards: attack name, ✅ Blocked / ❌ Failed, blocked by, reason
- Policies table (add/delete)
- Anomaly stats
- Credit score input → visual gauge (300-850)
- API: POST /api/demo/adversarial/run-all, GET /api/policies/rules, GET /api/analytics/credit-score/:addr

### 10. PAYMENTS (/payments)
- Heading: "Programmable Payments"
- Tabs: DCA | Subscriptions | Streaming | Splits | x402
- Each: list + create + actions (pause/resume/cancel)
- API: GET /api/payments/dca, GET /api/payments/subscriptions, GET /api/x402/stats

### 11. DEFI (/defi)
- Heading: "DeFi Integration"
- Aave card: supply, APY, yield projections (7/30/90/365d)
- Swap card: from/to/amount → quote → execute
- Contracts card: addresses + Etherscan links
- Proof button → verified tx hashes
- API: GET /api/lending/positions, GET /api/lending/projected-yield, GET /api/proof/bundle

### 12. ANALYTICS (/analytics)
- Heading: "Agent Analytics"
- 4 stat cards, tips-per-day bar chart, chain pie chart, creator leaderboard, decision log with badges (approved/rejected/veto/flip)
- Export button
- API: GET /api/agent/status, GET /api/analytics/anomaly-chart

### 13. API EXPLORER (/explorer)
- Heading: "603 API Endpoints"
- Custom-built (NOT iframe, NOT Scalar)
- Fetches from GET /api/docs (OpenAPI spec)
- Left: grouped endpoints by tag, collapsible, search
- Right: method badge, path, description, auto-generated form from schema, "Send" button, formatted JSON response with status + timing
- API: GET /api/docs

## SIDEBAR
- Fixed left, collapsible on mobile
- Logo: "AeroFyta" + #50AF95 dot
- Icons (Lucide): 🏠 Dashboard, 💰 Wallets, 👥 Creators, 💸 Tips, 🔒 Escrow, 🧠 Reasoning, 🎯 Demo, 🛡️ Security, 💳 Payments, 📊 DeFi, 📈 Analytics, 🔌 Explorer
- Active: #FF4E00 text + warm bg
- Bottom: `@xzashr/aerofyta` · v1.1.0

## TECHNICAL
- React Router for pages
- Lucide React icons
- Recharts for charts
- react-hot-toast or sonner for toasts
- All fetch: try/catch with demo fallback data
- Responsive (hamburger on mobile)
- Page fade-in transitions
- Skeleton loaders
- Copy-to-clipboard on addresses/hashes
- Etherscan links: https://sepolia.etherscan.io/tx/{hash}
- Dark scrollbars
- Stat card count-up animation
