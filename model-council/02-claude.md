# TipFlow: 72-hour battle plan to win the Hackathon Galactica

**TipFlow has a massive codebase but a critical vulnerability: it's a rule-based automation tool masquerading as an autonomous agent.** With 3 days remaining before the March 22 deadline, the path to winning both the Overall ($6,000) and Tipping Bot ($3,000) prizes requires a surgical pivot from button-click tipping to genuine LLM-driven autonomous decision-making. The hackathon explicitly evaluates **correctness, autonomy, and real-world viability** — not engagement or popularity. TipFlow's 43 services and 238 endpoints are impressive infrastructure, but judges will look through the scale to ask one question: "Does this agent actually think?" Right now, the honest answer is no. This report lays out exactly how to fix that in 72 hours.

The competitive landscape is thin — only **8 BUIDLs** have been submitted among 313 registered hackers, and the Tipping Bot track likely has just 2-3 direct competitors. This is a winnable hackathon. But "Tip Agent" by mimpowo represents a serious threat with genuine LLM integration (Gemini), DeFi yield generation (Aave V3), and clean autonomous triggers (GitHub PR merges). The strategy below prioritizes the highest-impact changes that transform TipFlow from impressive plumbing into a genuine autonomous economic agent.

---

## The competitive field is small but the bar for autonomy is real

### What we know about the 8 submissions

The DoraHacks platform renders submission pages via client-side JavaScript, making automated scraping impossible. Of the 8 confirmed BUIDLs, only one was indexable by search engines:

**clawOS (BUIDL #39023)** — A solo project by piercekearns building an AI-centric Nostr client where each AI agent gets its own identity and wallet. Strong conceptual alignment with WDK's "wallets for machines" vision, but built on the niche Nostr protocol. Has 4 Loom demo videos. **Threat level for Overall: Medium.** Innovative concept but narrow ecosystem appeal.

The remaining 6-7 submissions could not be verified externally. Based on the hackathon tags (AI, Clawbot, Agents, OpenClaw, WDK), expect submissions in categories like: agentic commerce bots, OpenClaw skill integrations, multi-agent payment orchestrators, and DeFi automation tools.

### Tip Agent: your primary threat, dissected

Based on the user's intelligence, Tip Agent by mimpowo is the most dangerous competitor in the Tipping Bot track. Its architecture has three key strengths TipFlow currently lacks:

- **Genuine LLM reasoning**: Uses Google Gemini to evaluate open-source contributions — the agent actually reads PR descriptions and code changes to decide tip worthiness and amounts. This isn't rule-based; it's contextual judgment.
- **Yield-generating reserves**: Idle tip funds are deposited into Aave V3 to earn yield, meaning tips come partially from earned interest. This demonstrates sophisticated "agentic payment design" — capital working autonomously.
- **Clean autonomous triggers**: GitHub webhook fires when a PR merges → Gemini evaluates contribution quality → WDK executes USDT tip. No human clicks any buttons. End-to-end autonomy.

**Tip Agent's likely weaknesses**: Single-platform (GitHub only), single use case (OSS contributions), likely limited multi-chain support, and potentially narrow appeal compared to content creator tipping. TipFlow's Rumble focus and broader feature set could win on originality and real-world viability — but only if the autonomy gap is closed.

### Threat assessment summary

| Prize | Competition Level | TipFlow's Current Position | After Pivot |
|-------|------------------|---------------------------|-------------|
| Tipping Bot Track ($3,000) | 2-3 competitors | **At risk** — Tip Agent's autonomy is stronger | Favored if LLM reasoning is added |
| Overall Best ($6,000) | 8 competitors | **Unlikely** — rule-based approach won't score well on Agent Intelligence | Competitive if demo shows genuine autonomy |

---

## WDK integration is your moat — but you're not using the advanced features

TipFlow already supports multi-chain wallets across ETH Sepolia, TON, TRON, BTC, and Solana. This is good table-stakes. But WDK's most judge-impressing features remain untapped. Here's what differentiates "adequate" from "exceptional" WDK integration:

### The three features that would blow judges away

**Gasless transactions across all chains.** WDK provides three distinct gasless mechanisms: ERC-4337 account abstraction on EVM chains (via `@tetherto/wdk-wallet-evm-erc-4337` with Safe Smart Accounts and Candide Paymaster), TON gasless transfers (via `@tetherto/wdk-wallet-ton-gasless`), and TRON gas-free transfers (via `@tetherto/wdk-wallet-tron-gasfree`). Plus, Spark (Lightning) transactions have **zero fees by design**. If TipFlow tips arrive with zero gas cost to both sender and receiver, that's a UX breakthrough worth demonstrating. Users pay gas in USDT, not native tokens — this is the core UX innovation Tether built with Candide.

**Cross-chain USDT0 bridging.** The `wdk-protocol-bridge-usdt0-evm` and `wdk-protocol-bridge-usdt0-ton` packages enable autonomous cross-chain movement of funds via LayerZero OFT. Combined with `findBestChainForPayment(amount)`, the agent could automatically select the cheapest chain for each tip. This demonstrates capital efficiency — a key signal for the "Agentic Payment Design" judging category.

**MCP Toolkit + Agent Skills (dual integration).** WDK's documentation explicitly states: "Use both for maximum coverage." The MCP Toolkit (`@tetherto/wdk-mcp-toolkit`) exposes wallet operations as structured tools for LLM agents. Agent Skills (`@tetherto/wdk-agent-skills`) provide SKILL.md files that teach agents the full WDK API surface. Using both shows you understand the WDK ecosystem at a native level. The MCP server you already have with 35 tools is a strong foundation — ensure the LLM agent actually calls these tools dynamically rather than through hardcoded paths.

### WDK module inventory for reference

The complete WDK ecosystem includes wallet modules (BTC, EVM, EVM-ERC-4337, Solana, Spark/Lightning, TON, TON-gasless, TRON, TRON-gasfree), protocol modules (Velora and ParaSwap swaps on EVM, StonFi swaps on TON, USDT0 bridges on EVM and TON, Aave V3 lending, MoonPay fiat on/off-ramps), and tools (Indexer API for real-time balance/transaction data, Secret Manager for encrypted key storage, Price Rates for token pricing, and Create WDK Module CLI for custom modules).

**What judges want to see**: Not just "we use WDK for wallets" but "our agent autonomously selects the optimal chain, bridges funds if needed, uses gasless transactions to minimize friction, and manages its own capital reserves — all through WDK's self-custodial infrastructure." Every word of that sentence maps to a real WDK capability.

---

## OpenClaw is the hackathon's preferred agent runtime

OpenClaw (formerly Clawdbot) is the **247,000-star open-source agent runtime** created by Peter Steinberger. It's explicitly tagged in the hackathon and integrated into WDK's documentation. Using OpenClaw isn't just smart — it signals alignment with the hackathon organizers' vision.

OpenClaw's architecture is a single Node.js Gateway process that connects to 25+ messaging platforms (including Twitch, Discord, Telegram, and IRC) and routes messages to AI agents. Each agent runs a **turn cycle**: assemble context → send to LLM → receive response → execute tool calls → return results. It supports Groq, Gemini, OpenRouter, and 25+ other LLM providers natively.

**For TipFlow, the integration path is clear**: Install WDK Agent Skills via `npx skills add tetherto/wdk-agent-skills` and select OpenClaw. This gives the agent full wallet operation capabilities — create wallets, send tokens, swap, bridge — all through natural language reasoning. The agent loads SKILL.md files that teach it WDK's complete API surface, then uses its LLM to reason about when and how to execute wallet operations.

**The key insight**: OpenClaw's tool approval system has three tiers — "ask" (prompt user), "record" (log but allow), and "ignore" (auto-allow). For demo purposes, configure tip amounts below a threshold as "record" (agent tips autonomously, logs it) and amounts above a threshold as "ask" (requires human approval). This demonstrates **budget-bounded autonomy with safety guardrails** — exactly what judges want from a financial agent.

Whether or not you fully integrate OpenClaw as your runtime, reference it prominently in your README and architecture diagram. Use the WDK Agent Skills format. Show you understand the ecosystem.

---

## The agent autonomy pivot: from rule-based to genuinely intelligent

This is the single most important section. The 11-step pipeline and button-click tipping must be replaced with a genuine reasoning loop. Here's the architecture:

### The ReAct-powered autonomous tipping loop

The ReAct (Reasoning + Acting) pattern is the industry standard for agentic systems. It interleaves reasoning traces with tool-calling actions:

```
EVENT → OBSERVE → THINK → DECIDE → ACT → REFLECT → LEARN
```

**Concrete implementation for TipFlow:**

1. **EVENT LISTENER** (event-driven, not polling): WebSocket connection to Rumble chat/stream events. When a new message, viewer milestone, or engagement spike occurs, an event fires.

2. **OBSERVE**: The agent receives structured context — message text, sender profile, viewer count trend, chat sentiment over last 5 minutes, current tip budget remaining.

3. **THINK** (LLM call): The agent reasons in natural language: "This creator just hit 500 concurrent viewers for the first time. Chat sentiment is 87% positive. The creator has been streaming for 2 hours and hasn't been tipped today. Budget allows up to $5 for milestone events. Recommendation: tip $3 USDT as a milestone celebration."

4. **DECIDE**: Based on reasoning, agent outputs structured action: `{action: "tip", amount: 3.00, token: "USDT", chain: "TON", reason: "500-viewer milestone", confidence: 0.85}`.

5. **ACT**: Agent calls WDK MCP tools to execute the tip — check balance, select optimal chain (gasless if available), send transaction.

6. **REFLECT**: After transaction confirms, agent logs the decision and outcome. Was the chain selection optimal? Did the tip arrive within expected timeframe?

7. **LEARN**: Agent updates its context memory — this creator was tipped, recent budget spent, pattern data for future decisions.

### Free LLM options for the reasoning engine

| Provider | Model | Free Tier | Best For |
|----------|-------|-----------|----------|
| **Groq** | Llama 3.3 70B | 14,400 req/day, 300+ tok/sec | Live demo speed — responses in <1 second |
| **Google Gemini** | Gemini 2.5 Flash | 1,000 RPD (Flash-Lite), 1M token context | Volume processing, multimodal analysis |
| **OpenRouter** | 30+ free models | 50 req/day | Fallback, model experimentation |
| **Mistral** | Various | 1B tokens/month | High-volume background processing |

**Recommendation**: Use **Groq** as the primary reasoning engine for the demo (sub-second response times are visually stunning) with **Gemini** as the fallback for production scenarios. Both support OpenAI-compatible API formats — switching requires changing 2 lines of code.

### The critical difference judges will evaluate

**What TipFlow has now (rule-based)**:
- "If watch time > 30 min AND user clicks button → tip $1"
- "If event = community_pool AND threshold_met → distribute"
- The 11-step pipeline follows a fixed flowchart regardless of context

**What TipFlow needs (agent intelligence)**:
- Agent reads chat in real-time, detects a creator explaining a complex topic well
- Agent reasons: "High educational value content, positive audience reaction, creator hasn't been tipped in this session, budget permits"
- Agent decides: tip $2.50 USDT, selects TON for gasless delivery
- Agent explains its reasoning in a log entry visible on the dashboard
- No human clicked anything. The agent exercised judgment.

**The golden principle**: "If you can draw a fixed flowchart of the task, it's automation. If the flowchart branches depend on runtime data that requires reasoning, it's an agent."

---

## Scoring highest across all 7 judging categories

### 1. Agent Intelligence — the make-or-break category

Show the LLM reasoning transparently. Build a **"decision explainer" panel** in the dashboard that shows, for each tip: the input signals, the agent's chain-of-thought reasoning, and the output action. Judges need to SEE the thinking. Use a real LLM call for every tip decision, not a rule engine with LLM window dressing. Include sentiment analysis on chat messages, content quality scoring, and budget optimization reasoning.

### 2. WDK Wallet Integration — demonstrate depth, not just breadth

Don't just list 5 chains. Show the agent autonomously selecting between them. Demonstrate gasless transactions on at least 2 chains (TON gasless + ERC-4337 or TRON gas-free). Use the WDK Indexer API for real-time balance tracking. Show fee estimation via `quoteSendTransaction()` before every tip. Use typed error handling (`isWDKError()`, `withRetry()`, `withTimeout()`). Reference `@tetherto/wdk-mcp-toolkit` for structured tool calling.

### 3. Technical Execution — code quality signals

Clean commit history (not one giant commit), proper error handling with WDK's typed error system, environment variable management, Docker configuration for deployment readiness, and **test coverage** for the agent decision pipeline. Even 5-10 well-written tests signal engineering maturity.

### 4. Agentic Payment Design — the yield angle

**Steal Tip Agent's best idea**: idle tip reserves should earn yield. If you can integrate WDK's Aave V3 lending module (`@tetherto/wdk-protocol-lending-aave-evm`), deposit idle funds and generate tips from earned interest. This transforms TipFlow from a payment pipe into an autonomous capital management system. Also demonstrate: community tipping pools where multiple users contribute funds and the agent distributes based on collective preferences, pre-tip fee quoting, and budget-bounded autonomy with daily/weekly limits.

### 5. Originality — Rumble is your differentiator

Tip Agent tips GitHub PRs. That's developer-focused. TipFlow tips content creators on Rumble — the platform where **Tether owns ~48% equity** and where the **Rumble Wallet (built on WDK) launched January 7, 2026**. This is not coincidence. Frame TipFlow as the natural evolution of Rumble Wallet: "Rumble Wallet lets viewers tip manually. TipFlow gives them an AI agent that tips intelligently, autonomously, 24/7." This narrative directly validates Tether's investment thesis and will resonate powerfully with judges.

### 6. Polish & Ship-ability — the 3 signals judges check

A polished README with architecture diagram, working demo scenarios that don't crash, and clear setup instructions (`npm install` → `npm start` → working). Include a Docker Compose file even if it's basic. Show a deployed testnet instance. The dashboard must look professional — use Tailwind CSS with a dark theme, clean typography, and real-time data.

### 7. Presentation & Demo — this is 40-50% of your score

**The demo video is the single most important deliverable.** More on this below.

---

## The 5-minute demo video that wins

### Structure: Hook → Problem → Solution → Live Demo → Technical Depth → Vision

**0:00-0:20 — Hook**: "Content creators earn $0.003 per view on ad revenue. What if an AI agent could watch alongside your audience and tip creators in real-time based on how good the content actually is? We built that."

**0:20-1:00 — Problem**: Show the manual tipping experience on Rumble Wallet — user has to decide when, decide how much, click buttons, confirm transaction. Then show the creator's perspective: sporadic, unpredictable tips. "Tipping should be autonomous. Creators should be rewarded for quality, not for asking."

**1:00-3:00 — Live Demo (the core)**: Screen recording of TipFlow in action. Show: (1) The agent monitoring a Rumble stream, (2) Chat sentiment spiking positive, (3) The agent's reasoning panel showing its thought process in real-time, (4) The agent deciding to tip $2 USDT, (5) The transaction executing on TON (gasless), (6) The dashboard updating with the new tip and the agent's explanation. **Show a second scenario** where the agent hits a budget limit and explains why it's pausing. This demonstrates constraint-aware autonomy.

**3:00-3:45 — Technical Architecture**: Flash the architecture diagram. Highlight: "ReAct reasoning loop powered by Groq/Gemini → WDK MCP Toolkit for wallet operations → gasless delivery on TON and ERC-4337 → cross-chain bridge for optimal routing → Aave V3 yield on idle reserves. All self-custodial, all on-chain."

**3:45-4:30 — What Makes This Different**: "Unlike manual tipping, TipFlow's agent exercises genuine judgment. Unlike rule-based bots, it explains its decisions. Unlike custodial solutions, WDK keeps users in control. This is what tipping looks like when agents are economic infrastructure."

**4:30-5:00 — Vision**: "Rumble Wallet proved WDK works for manual tipping. TipFlow proves it works for autonomous tipping. Next: multi-platform (YouTube, Twitch), creator-side analytics, and community pool governance. We're building the autonomous tip economy."

### Production tips

- **Pre-record everything** with OBS Studio. Never rely on live demo.
- Show the block explorer transaction hash briefly — proves it's real.
- Use Groq for the LLM calls in the demo — sub-second responses look amazing on camera.
- Bold, clean dashboard visuals. Dark theme. Real-time activity feed scrolling.
- Narrate confidently. No hedging ("this should work..."). State facts.

---

## 72-hour implementation plan

### Day 1 (Thursday March 19): Agent Brain Surgery — 14 hours

**Hours 1-3: LLM Integration Core**
- Set up Groq API client with Llama 3.3 70B (free tier, fastest inference)
- Create the reasoning prompt template: system prompt that defines the agent's tipping personality, constraints, and decision framework
- Build the `evaluateTipOpportunity(context)` function that takes structured event data and returns a reasoned tip decision via LLM

**Hours 3-6: ReAct Decision Loop**
- Replace the rule-based 11-step pipeline with a genuine ReAct loop
- Implement: Event → Context Assembly → LLM Reasoning → Structured Output → WDK Execution → Logging
- Ensure the LLM outputs structured JSON: `{shouldTip, amount, chain, reasoning, confidence}`
- Add budget checking as a tool the agent can call, not a hardcoded rule

**Hours 6-9: Event-Driven Triggers**
- Build at least 3 autonomous trigger types that don't require button clicks:
  1. **Sentiment spike trigger**: Chat messages analyzed for sentiment; positive spike above threshold triggers evaluation
  2. **Milestone trigger**: Viewer count crossing thresholds (100, 500, 1000) triggers celebration tip
  3. **Engagement quality trigger**: Creator responding to chat questions triggers reward evaluation
- Use simulated Rumble data if live API is unavailable — pre-seed realistic event streams

**Hours 9-12: Decision Explainer Dashboard Panel**
- Build a real-time "Agent Thinking" panel that displays:
  - Input signals (sentiment score, viewer count, budget remaining)
  - The agent's reasoning chain (streamed from LLM)
  - Output decision with confidence score
  - Transaction hash once executed
- Use WebSocket for real-time updates

**Hours 12-14: Integration Testing**
- End-to-end test: simulated event → LLM reasoning → WDK tip execution on testnet
- Verify the reasoning is genuinely contextual (same event type, different contexts → different decisions)
- Git commit with meaningful messages throughout the day

### Day 2 (Friday March 20): WDK Deep Integration + Polish — 14 hours

**Hours 1-3: Gasless Transaction Implementation**
- Integrate `@tetherto/wdk-wallet-ton-gasless` for zero-fee TON tips
- Integrate `@tetherto/wdk-wallet-tron-gasfree` for zero-fee TRON tips  
- Add chain selection logic: agent picks the gasless chain when tip amount is below the gas threshold on EVM

**Hours 3-5: Yield-Generating Reserves (if feasible)**
- If time permits: integrate WDK Aave V3 lending module for idle fund yield
- Minimum viable version: show the agent depositing excess funds into Aave and tracking yield
- If not feasible: at least document the architecture and show the code path exists

**Hours 5-8: Dashboard Polish**
- Clean the dashboard UI: Tailwind dark theme, professional typography
- Real-time activity feed: scrolling log of "Agent tipped @creator $X — Reason: [reasoning summary]"
- Budget gauge showing remaining daily/weekly limits
- Chain distribution chart showing where tips are being sent
- Sentiment timeline graph

**Hours 8-11: README and Architecture**
- Architecture diagram using Mermaid.js or Excalidraw showing: User Config → Event Listener → ReAct Agent → WDK MCP Tools → Multi-Chain Settlement
- Comprehensive README following the hackathon-winning structure: Problem → Solution → Architecture → Features → Demo → Quick Start → Tech Stack → How the Agent Works → Vision
- Screenshots and GIFs of the dashboard in action (use LICEcap or Gifski)

**Hours 11-14: Demo Scenario Scripting**
- Script 3 demo scenarios with pre-seeded data that demonstrate different autonomous behaviors
- Test each scenario end-to-end
- Record rough practice runs to identify timing issues

### Day 3 (Saturday March 21): Demo Video + Submission — 10 hours

**Hours 1-4: Demo Video Production**
- Record all demo scenarios using OBS Studio
- Record architecture explanation slides (3-4 slides max)
- Record opening hook and closing vision
- Edit in DaVinci Resolve (free) — aim for 4:30-5:00 final runtime

**Hours 4-6: Final Testing and Bug Fixes**
- Full end-to-end run of all demo scenarios
- Fix any UI glitches visible in recordings
- Ensure all GitHub links, transaction hashes, and explorer links work

**Hours 6-8: Submission Assembly**
- Finalize README with all screenshots, GIFs, and links
- Ensure GitHub repo is public with clean commit history
- Upload demo video (YouTube unlisted or Loom)
- Write compelling DoraHacks project description (2-3 paragraphs)

**Hours 8-10: Submit and Verify**
- Submit on DoraHacks before 23:59 UTC March 22 (submit March 21 for safety margin)
- Verify all links work: GitHub repo, demo video, any deployed instances
- Double-check all submission requirements: GitHub link + Demo video confirmed

---

## Quick wins ranked by impact-per-hour

| Quick Win | Time | Impact on Score | Category |
|-----------|------|----------------|----------|
| Replace rule-based tipping with LLM reasoning call | 3 hrs | **Critical** | Agent Intelligence |
| Decision explainer panel (show agent's thinking) | 3 hrs | **Critical** | Agent Intelligence + Demo |
| Gasless TON or TRON tips | 2 hrs | **High** | WDK Integration |
| Real-time activity feed with tip reasoning | 2 hrs | **High** | Polish + Demo |
| Architecture diagram in README | 1 hr | **High** | Technical Execution + Presentation |
| Demo video with hook structure | 4 hrs | **Critical** | Presentation (40-50% of score) |
| Budget-bounded autonomy (agent respects limits) | 1 hr | **Medium** | Agentic Payment Design |
| Simulated event stream for demo reliability | 2 hrs | **High** | Polish + Demo |
| Commit history cleanup (meaningful messages) | 30 min | **Medium** | Technical Execution |
| Docker Compose file for deployment | 1 hr | **Medium** | Ship-ability |

---

## Risk analysis and mitigation

**Risk 1: LLM API downtime during demo recording.**
*Mitigation*: Use Groq as primary, Gemini as fallback. Record demo with pre-seeded data. Cache one successful LLM response as a fallback display. Never do live LLM calls in the demo video — pre-record everything.

**Risk 2: Testnet transactions fail during demo.**
*Mitigation*: Record transactions in advance. Get testnet USDT from Pimlico and Candide faucets early (Day 1). Have multiple funded testnet wallets ready. If a transaction fails in recording, re-record that segment only.

**Risk 3: Judges perceive the LLM integration as superficial.**
*Mitigation*: The decision explainer panel is the antidote. Show the full reasoning chain for every tip. Include a scenario where the agent decides NOT to tip and explains why — this proves genuine reasoning, not rubber-stamp approval.

**Risk 4: Tip Agent wins Tipping Bot track with cleaner autonomy.**
*Mitigation*: TipFlow must match Tip Agent on autonomy (LLM reasoning) while exceeding it on breadth (multi-chain, multi-trigger, Rumble alignment, dashboard polish). Tip Agent's GitHub-only focus is narrow; TipFlow's content creator focus is more commercially viable and aligns with Tether's Rumble investment.

**Risk 5: Running out of time on Day 3.**
*Mitigation*: The implementation plan front-loads all critical agent work to Day 1. Day 2 is polish and enhancement. Day 3 is purely demo and submission. If Day 1 runs over, cut the yield-generating reserves feature (Day 2, hours 3-5) — that's the most expendable item.

**Risk 6: Too many features, nothing works well.**
*Mitigation*: Ruthlessly prioritize. The minimum viable winning submission needs exactly three things: (1) LLM-powered autonomous tipping that works in a demo, (2) WDK multi-chain with at least one gasless chain, (3) A polished 5-minute demo video. Everything else is bonus.

---

## Honest probability assessment

**Tipping Bot Track ($3,000):**

- **Without the autonomy pivot**: 20-25% chance. The rule-based approach will score poorly on Agent Intelligence (likely the highest-weighted category given the hackathon theme). Tip Agent's genuine LLM integration would likely win.
- **With the autonomy pivot fully executed**: **55-65% chance**. TipFlow's broader feature set, Rumble alignment, multi-chain gasless support, and dashboard polish would offset Tip Agent's cleaner but narrower approach. The risk is execution quality in 72 hours.

**Overall Best Prize ($6,000):**

- **Without the autonomy pivot**: 5-10% chance. Scale alone doesn't win.
- **With the autonomy pivot fully executed**: **25-35% chance**. Depends on the quality of the other 5-6 submissions we can't see. The Rumble/Tether narrative alignment is a significant advantage, but clawOS and unknown competitors may have stronger agent architectures. The Overall prize likely goes to whichever project best embodies "agents as economic infrastructure" — TipFlow's agent managing capital, earning yield, and making autonomous tipping decisions is a strong entry.

**Both prizes combined**: Unclear whether a single project can win both. DoraHacks hackathons typically allow it, but the rules PDF was inaccessible. **Assume you're competing for both and optimize accordingly.**

### What would push probabilities higher

The single highest-leverage investment is making the demo video exceptional. A **flawless 5-minute demo** showing genuine autonomous behavior — the agent reasoning in real-time, making different decisions for different contexts, respecting budget limits, explaining itself — is worth more than any additional code feature. Judges spend 5 minutes with your demo video. They spend maybe 10 minutes with your GitHub. Polish the demo relentlessly.

### The brutal truth

TipFlow's 43 services, 238 endpoints, and 118 dashboard components are engineering overkill for a hackathon. Judges don't count endpoints. They watch the demo, scan the README, and check if the agent actually thinks. **A competitor with 5 services but genuine LLM autonomy will beat 43 services with button-click tipping every time in this hackathon.** The pivot isn't optional — it's existential. But TipFlow's infrastructure means that once the LLM brain is wired in, it has more "body" to work with than any competitor. That's the asymmetric advantage. Use these 72 hours to give the body a brain.

---

## Conclusion: three things that matter, everything else is noise

**First**: Wire Groq's Llama 3.3 70B into the tipping decision pipeline today. Every tip must go through an LLM reasoning call that produces explainable output. This transforms the Agent Intelligence score from a liability into a strength.

**Second**: Build the decision explainer panel and record a demo video that makes judges watch the agent think. Show it deciding to tip, deciding not to tip, and adjusting amounts based on context. The demo is half your score.

**Third**: Frame the narrative around Rumble Wallet evolution. "Rumble Wallet proved WDK works for manual tipping. TipFlow proves it works for autonomous tipping." This makes TipFlow feel like the natural next step in Tether's own product roadmap — and that's the most powerful story you can tell to Tether's judges.

Cut everything else that doesn't serve these three priorities. You have 72 hours. Make them count.