# Competitor Analysis — Tether Hackathon Galactica WDK Edition

> **20 BUIDLs Analyzed | March 21, 2026**
>
> This document captures a comprehensive competitive landscape analysis for the Tether Hackathon Galactica: WDK Edition 1. Each project is evaluated on WDK integration depth, AI sophistication, test coverage, autonomy, and overall polish.

---

## Table of Contents

- [Tipping Bot Track (Direct Competitors)](#tipping-bot-track-direct-competitors)
- [Agent Wallets Track](#agent-wallets-track)
- [Autonomous DeFi Agent Track](#autonomous-defi-agent-track)
- [Lending Bot Track](#lending-bot-track)
- [Threat Ranking (Overall Prize)](#threat-ranking-overall-prize)
- [Critical Competitor Weaknesses We Exploit](#critical-competitor-weaknesses-we-exploit)
- [Improvements Already Implemented](#improvements-already-implemented-from-this-analysis)

---

## Tipping Bot Track (Direct Competitors)

These are our direct track competitors. The Tipping Bot track had 0 competitors at the time of initial registration, but 4 projects ultimately entered.

---

### 1. Rumble Pulse

| Field | Detail |
|-------|--------|
| **Builder** | Fakhri Danial |
| **Threat Level** | 5/10 |
| **GitHub** | `github.com/rumble-agent/frontend` + `contracts` |
| **Stack** | Next.js 16, Groq Llama 4 Scout, Vercel deployed |
| **Smart Contracts** | TipSplitter Solidity contract on Sepolia |
| **Chains** | Single chain (Ethereum Sepolia) |

**Strengths:**
- Real Rumble API integration with content analysis
- Beautiful landing page and polished UI
- Deployed and accessible on Vercel
- TipSplitter contract for on-chain tip splitting

**Weaknesses:**
- **CRITICAL: WDK is FAKE** — imports WDK packages but uses raw ethers.js for all wallet operations. Judges who inspect the code will see this.
- Zero frontend tests
- Single chain only (Sepolia)
- No persistence layer
- No autonomous operation

---

### 2. RumbleTipAI

| Field | Detail |
|-------|--------|
| **Builder** | kalxe |
| **Threat Level** | 6/10 |
| **GitHub** | `github.com/kalxe/rumble-ai-extension` |
| **Stack** | Chrome Extension (Manifest V3), JavaScript |
| **AI** | GPT-4o-mini (optional), rule-based fallback |

**Strengths:**
- Clever form factor as a Chrome Extension — judges can install and use immediately
- Works directly on Rumble.com pages
- Rule-based fallback means it works without API keys
- Lightweight and focused

**Weaknesses:**
- Only 3 commits total — very thin development history
- Zero tests
- Unencrypted seed phrase stored in `chrome.storage` — security vulnerability
- Shallow AI integration (GPT is optional, not core)
- No autonomous loop or scheduling

---

### 3. Tip Agent

| Field | Detail |
|-------|--------|
| **Builder** | mimpowo |
| **Threat Level** | 5/10 |
| **GitHub** | `github.com/envexx/tipagent-api` |
| **Stack** | Hono.js + Prisma + PostgreSQL, Gemini 2.0 Flash |
| **DeFi** | Aave V3 yield on idle funds |

**Strengths:**
- Multi-tenant architecture with per-project HD wallets
- Aave V3 yield generation on idle tip funds
- Task-based evaluation system is a clever concept
- Proper database with Prisma ORM

**Weaknesses:**
- Zero tests
- Reactive webhook processor, not autonomous — only acts when triggered
- No autonomous loop or scheduling
- Limited AI sophistication

---

### 4. flowlend

| Field | Detail |
|-------|--------|
| **Builder** | Lakshmikanth |
| **Threat Level** | 7/10 |
| **GitHub** | `github.com/Lakshmikanth-3/flowlend` |
| **Stack** | 5-agent system, ZK proofs (Circom + snarkjs), ONNX ML model |

**Strengths:**
- Strongest technical breadth among tipping competitors
- 5-agent system architecture
- ZK proofs with Circom and snarkjs for privacy
- ONNX ML model for prediction/analysis
- Ambitious feature set

**Weaknesses:**
- **CRITICAL: Bypasses WDK for transfers** — uses raw ethers.js for actual token transfers despite importing WDK
- `node_modules` committed to git (unprofessional)
- No tests
- Simulated circular payments (not real transfers)
- Complexity without depth — broad but shallow

---

## Agent Wallets Track

---

### 5. AgentVerse

| Field | Detail |
|-------|--------|
| **Builder** | bambam |
| **Threat Level** | 5/10 |
| **GitHub** | `github.com/ajanaku1/AgentVerse` |
| **Stack** | Next.js 15, SQLite, Groq Llama 3.3 70B |
| **Tests** | 22 tests |

**Strengths:**
- Polished UI with Next.js 15
- 22 tests (more than most competitors)
- SQLite persistence

**Weaknesses:**
- Shallow WDK integration — stubs for Aave and bridge protocols
- Sends ETH not USDT (misses the point of a USDT-focused hackathon)
- Limited autonomous capabilities

---

### 6. Arbiter

| Field | Detail |
|-------|--------|
| **Builder** | adidshaft |
| **Threat Level** | 8/10 |
| **GitHub** | `github.com/adidshaft/arbiter` |
| **Stack** | TypeScript monorepo, Supabase, 6 WDK chains + bridge protocol |
| **Security** | Encrypted seeds, Docker deployment |

**Strengths:**
- Professional TypeScript monorepo architecture
- 6 WDK chains with bridge protocol — widest chain coverage
- Encrypted seed storage
- Docker deployment ready
- Supabase backend

**Weaknesses:**
- **NO AI agent brain** — just trust scoring with OpenAI, no autonomous decision-making
- No autonomous loop
- Missing the "agent" in "agent wallet"

---

### 7. ClawWallet Agent

| Field | Detail |
|-------|--------|
| **Builder** | ElromEvedElElyon |
| **Threat Level** | 6/10 |
| **GitHub** | `github.com/ElromEvedElElyon/clawwallet-agent` |
| **Stack** | CLI-only, 6 source files |
| **WDK** | Velora + Aave + Bridge WDK protocols |

**Strengths:**
- Uses multiple WDK protocols (Velora, Aave, Bridge)
- Safety model with risk assessment
- Focused and functional

**Weaknesses:**
- CLI-only interface, no web dashboard
- Only 6 source files — very thin implementation
- No tests
- Limited scope

---

### 8. Auric

| Field | Detail |
|-------|--------|
| **Builder** | TNT-LABS |
| **Threat Level** | **9/10** |
| **GitHub** | `github.com/TNT-LABS-XYZ/auric-backend` |
| **Stack** | NestJS, MongoDB, Auth0, 7 WDK packages |
| **AI** | Claude AI |
| **Deployment** | Ethereum MAINNET, `auric-web.vercel.app` |

> **MOST DANGEROUS COMPETITOR**

**Strengths:**
- **7 WDK packages** — deepest WDK integration of any competitor
- ERC-4337 gasless transactions via Candide
- MCP server implementation
- Telegram bot integration
- Claude AI for intelligence
- Ethereum MAINNET deployment (not just testnet)
- Bitfinex pricing integration
- Velora swaps
- Gold savings engine with 4 strategy types
- Beautiful website at `auric-web.vercel.app`
- Auth0 authentication
- Professional NestJS architecture with MongoDB

**Weaknesses:**
- Narrow use case — gold savings only, does not cover the full payment agent spectrum
- Single-purpose agent (savings) vs. general-purpose payment agent

---

### 9. AMP: Agent Market Protocol

| Field | Detail |
|-------|--------|
| **Builder** | PABI0 |
| **Threat Level** | 8/10 |
| **GitHub** | `github.com/PrinceAikinsBaidoo/AMP` |
| **Stack** | Claude tool_use agentic loop, 3-layer validation |

**Strengths:**
- Novel concept: multi-agent market where agents hire and pay each other
- Claude `tool_use` for agentic loop — proper function calling
- 3-layer validation + adversarial testing
- Real on-chain USDT escrow with verified Sepolia transaction hashes
- Creative and original concept

**Weaknesses:**
- No automated tests
- Narrow scope (agent marketplace only)
- Complex concept may be hard to demo in 5 minutes

---

### 10. Axiom

| Field | Detail |
|-------|--------|
| **Threat Level** | 5/10 |

Limited public information available. Moderate threat based on visible implementation.

---

### 11. K-Life

| Field | Detail |
|-------|--------|
| **Threat Level** | 4/10 |

**Weaknesses:**
- WDK barely used — ethers.js does the actual work
- Shallow integration

---

### 12. peaq

| Field | Detail |
|-------|--------|
| **Threat Level** | 2/10 |

**Notes:**
- Robotics/IoT project with WDK bolted on as an afterthought
- Not a natural fit for any of the payment-focused tracks
- Lowest threat in the competition

---

### 13. Ajo-Agent

| Field | Detail |
|-------|--------|
| **Threat Level** | 5/10 |

**Strengths:**
- Real mainnet smart contracts deployed
- Claude chat integration

**Weaknesses:**
- Limited scope and depth

---

## Autonomous DeFi Agent Track

---

### 14. Intend

| Field | Detail |
|-------|--------|
| **Builder** | thinkDecade |
| **Threat Level** | 7/10 |
| **WDK** | 6 WDK packages |
| **Narrative** | Africa-first financial inclusion |

**Strengths:**
- 6 WDK packages — strong integration breadth
- Africa-first financial inclusion narrative (compelling story for judges)
- Chain routing algorithm for optimal path selection
- HEDGE/YIELD/TRANSFER primitives — clean abstraction
- Strong narrative angle

**Weaknesses:**
- Plain JavaScript (no TypeScript)
- No tests
- AI brain outsourced to OpenClaw — not deeply integrated
- No autonomous loop

---

### 15. SigmaGuard

| Field | Detail |
|-------|--------|
| **Builder** | ronaldmego |
| **Threat Level** | 8/10 |
| **Architecture** | 4-layer governance |
| **Tests** | 111 tests |

**Strengths:**
- 4-layer governance: rules -> Z-score/IQR anomaly detection -> Claude interpretation -> human approval
- **111 tests** — second highest test count in competition
- Zero-terminal demo mode (judges can run without setup)
- LLM-cannot-de-escalate constraint — AI can only increase security, never decrease it
- Sophisticated risk model

**Weaknesses:**
- Narrow scope (anomaly detection and governance only)
- No tipping, streaming, or broad payment features

---

### 16. Morbido

| Field | Detail |
|-------|--------|
| **Builder** | GG256 |
| **Threat Level** | 7/10 |
| **Stack** | Solidity vault contract, 4 protocol adapters, Ollama local AI |

**Strengths:**
- Solidity vault contract for on-chain fund management
- 4 protocol adapters
- Ollama local AI (no API costs — good for zero-budget)
- Strategy-as-markdown approach
- Risk engine with auto-cap

**Weaknesses:**
- **WDK bypass** — extracts private key from WDK for raw signing
- Local AI only (Ollama) limits capability vs. cloud models
- No tests visible

---

### 17. SafeAgent

| Field | Detail |
|-------|--------|
| **Builder** | kled |
| **Threat Level** | 5/10 |
| **Stack** | CLI-only |
| **Innovation** | On-chain policy enforcement (SHLL Protocol) |

**Strengths:**
- On-chain policy enforcement via SHLL Protocol — unique approach
- Safety-first design

**Weaknesses:**
- CLI-only interface
- Thin codebase
- One-shot execution (no persistence or loop)

---

### 18. PayMind AI

| Field | Detail |
|-------|--------|
| **Threat Level** | 5/10 |

Moderate implementation with standard payment agent features.

---

### 19. Tsentry

| Field | Detail |
|-------|--------|
| **Threat Level** | 6/10 |

Above-average implementation with some differentiating features.

---

## Lending Bot Track

---

### 20. LendGuard

| Field | Detail |
|-------|--------|
| **Threat Level** | 4/10 |

Low threat. Basic lending bot implementation without standout features.

---

## Threat Ranking (Overall Prize)

Ranked by likelihood of winning an overall prize:

| Rank | Project | Track | Threat | Key Strength |
|------|---------|-------|--------|-------------|
| 1 | **Auric** | Agent Wallets | 9/10 | ERC-4337 gasless, MCP server, Telegram, Claude AI, 7 WDK packages, mainnet deployment |
| 2 | **SigmaGuard** | Autonomous DeFi | 8/10 | Z-score anomaly detection, 111 tests, zero-terminal demo mode |
| 3 | **Arbiter** | Agent Wallets | 8/10 | 6 chains + bridge protocol, professional TypeScript monorepo |
| 4 | **AMP** | Agent Wallets | 8/10 | Claude tool_use agentic loop, multi-agent market, adversarial testing |
| 5 | **flowlend** | Tipping Bot | 7/10 | ZK proofs, ONNX ML model — but WDK bypass is disqualifying risk |
| 6 | **Intend** | Autonomous DeFi | 7/10 | 6 WDK packages, Africa-first financial inclusion narrative |
| 7 | **Morbido** | Autonomous DeFi | 7/10 | Solidity vault, 4 protocol adapters, Ollama local AI |

---

## Critical Competitor Weaknesses We Exploit

### 1. Fake WDK Integration

**Affected:** Rumble Pulse, K-Life, Morbido, flowlend

Multiple competitors import WDK packages but bypass them for actual wallet operations, using raw ethers.js instead. This is likely to be caught by judges who inspect the source code. Our WDK usage is genuine — all wallet operations go through the WDK SDK.

### 2. Test Coverage Gap

**Affected:** Nearly all competitors

| Project | Tests |
|---------|-------|
| **AeroFyta (us)** | 1,001 |
| SigmaGuard | 111 |
| AgentVerse | 22 |
| Everyone else | 0 |

We have 9x more tests than the next competitor. This directly addresses the "Technical Execution" judging criterion.

### 3. No Autonomous Loop

**Affected:** Most competitors (Tip Agent, RumbleTipAI, Arbiter, Intend, SafeAgent)

Most competitors are reactive — they respond to webhooks or user commands but do not operate autonomously. We run persistent 60-second cycles with learning and self-improvement.

### 4. Narrow Scope

**Affected:** AMP (agent marketplace only), SigmaGuard (anomaly detection only), Auric (gold savings only)

The strongest competitors are deep but narrow. We cover the full payment agent spectrum: tipping, DeFi, escrow, streaming, swaps, lending, bridging, and more.

### 5. Auric — Our Primary Rival

Auric is the most dangerous competitor with 7 WDK packages, mainnet deployment, and professional architecture. However, it is a narrow gold savings engine. We differentiate by covering the full payment agent spectrum with autonomous operation, 1,001 tests, and breadth across tipping + DeFi + escrow + streaming + swaps.

---

## Improvements Already Implemented (from this analysis)

All 54 identified competitive gaps have been addressed across 5 rounds of targeted improvements:

### Round 1 — Feature Parity
- x402 micropayments protocol
- ZK proofs (snarkjs)
- Z-score anomaly detection (matching SigmaGuard)
- Credit scoring engine

### Round 2 — AI Sophistication
- LLM tool_use function calling (matching AMP)
- Cannot-de-escalate constraint (matching SigmaGuard)
- Adversarial demo scenarios
- Data integrity validation

### Round 3 — Security Hardening
- AES-256 seed encryption (matching Arbiter)
- Tool blocklist for safety
- Policy enforcement engine
- Signer verification

### Round 4 — Demo and Presentation
- Zero-terminal demo mode (matching SigmaGuard)
- Landing page
- 62 MCP tools
- SKILL.md agent capability file
- GitHub Actions CI/CD

### Round 5 — Final Differentiation
- Bitfinex pricing integration (matching Auric)
- TipSplitter contract (matching Rumble Pulse)
- Solidity contracts
- Technical PRD and DESIGN_DECISIONS.md
- Telegram bot with 11 commands
- Rumble RSS feed integration
- SQLite persistence
- End-to-end test suite

---

## Summary

The competitive landscape has 3-4 serious contenders for overall prizes (Auric, SigmaGuard, Arbiter, AMP) and 4 direct tipping track competitors (Rumble Pulse, RumbleTipAI, Tip Agent, flowlend). Our key differentiators are:

1. **Genuine WDK integration** (multiple competitors fake it)
2. **1,001 tests** (9x more than the next competitor)
3. **Autonomous 60s loop with learning** (most competitors are reactive)
4. **Full-spectrum payment agent** (competitors are narrow)
5. **Every competitive gap addressed** (54 improvements across 5 rounds)
