# CLAUDE.md — Tether WDK Hackathon Project

## Mission
Build a winning submission for Tether Hackathon Galactica: WDK Edition 1.
Target: Tipping Bot track (0 competitors) + Overall prizes.
Deadline: March 22, 2026 23:59 UTC.

## Project: Zynvaro (formerly AeroFyta) — Autonomous Multi-Chain Payment Agent powered by Tether WDK
- Node.js agent backend using WDK SDK
- React + Vite + Tailwind web dashboard
- Track: Tipping Bot
- License: Apache 2.0

## Confirmed Constraints
- ZERO budget — no paid APIs, servers, or services
- Solo developer with AI assistance
- WDK integration is mandatory (JS/TS)
- Must submit: GitHub repo + YouTube demo video (≤5 min)
- Must be easy for judges to run (one-command startup)
- Node.js 22+ required for WDK

## Anti-Hallucination Rules
- Never invent WDK API methods — check docs
- Never fake transaction flows — use real testnet
- Never claim features work without testing
- Pin exact package versions
- GitHub org is `tetherto` (NOT `nicetytether`)

## Code Principles
- TypeScript throughout
- Clean, readable code over clever code
- Every feature must work end-to-end
- Error handling on all wallet operations
- No mocked WDK calls in production code
- Env vars for secrets (seed phrase, API keys)
- Apache 2.0 license header

## Quality Bar
- `npm install && npm run dev` must work
- No broken buttons or fake features
- Clean loading and error states
- Real testnet transactions
- Clear README with setup instructions

## WDK Packages
- @tetherto/wdk (core)
- @tetherto/wdk-wallet-evm (Ethereum/EVM)
- @tetherto/wdk-wallet-ton (TON)
- Stretch: wdk-wallet-evm-erc-4337, wdk-wallet-ton-gasless

## Judging Criteria (7 categories)
1. Agent Intelligence
2. WDK Wallet Integration
3. Technical Execution
4. Agentic Payment Design
5. Originality
6. Polish & Ship-ability
7. Presentation & Demo

## Build Gate
Do not start coding until user explicitly approves the strategy.

## Implementation Plan — 11 Groups (CRITICAL: Follow This Order)
88 unique features from 8-model council, grouped by dependency.
Full details: `memory/project_implementation_groups.md`
Feature lists: `model-council/88-unique-features.md`

### Dependency Flow (NEVER skip order)
```
G1 (Decisions) → G2 (LLM Brain) → G3 (Autonomous Loop)
→ G4 (WDK Wallets) ↔ G5 (Safety) → G6 (Economics) ↔ G7 (Advanced WDK)
→ G8 (Frontend — parallel after G3) → G9 (README) → G10 (Demo Video) → G11 (Submit)
```

### Group Summary
| Group | Name | Hours | Type | Depends On |
|---|---|---|---|---|
| G1 | Strategic Decisions | 1.4h | Decisions only | Nothing |
| G2 | LLM Brain | 10.6h | Backend | G1 |
| G3 | Autonomous Loop | 15.2h | Backend | G2 |
| G4 | WDK Wallet Ops | 18.2h | Backend + WDK | G3 |
| G5 | Safety & Risk | 11.5h | Backend hardening | G2-G4 |
| G6 | Economic Features | 20.4h | Backend | G2-G5 |
| G7 | Advanced WDK | 24.3h | Backend + arch | G4 |
| G8 | Frontend/Dashboard | 11.8h | Frontend only | G2-G3 |
| G9 | README & Docs | 6.8h | Docs only | All code groups |
| G10 | Demo Video | 8.0h | Recording | G1-G8 |
| G11 | Submission | 5.4h | Final step | Everything |

### Key Rules
- Total: ~133h needed, ~36h available → must prioritize
- Groups 1-3 are NON-NEGOTIABLE (LLM + autonomy = what wins)
- Groups 9-11 are NON-NEGOTIABLE (demo + README + submit = required)
- Groups 4-7 are pick-and-choose based on remaining time
- Group 8 (frontend) runs PARALLEL to Groups 4-7, cannot break backend
- Each group depends ONLY on previous groups — no circular dependencies
