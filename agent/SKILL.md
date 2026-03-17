---
name: aerofyta
description: Autonomous multi-chain payment agent with WDK integration
version: 1.0.0
author: Danish A
license: Apache-2.0
capabilities:
  - tip_creator
  - check_balance
  - create_escrow
  - atomic_swap
  - analyze_creator
  - manage_dca
  - stream_payments
  - assess_risk
  - bridge_usdt0
  - governance
  - treasury_management
  - conditional_payments
tools: 97+
chains: [ethereum-sepolia, ton-testnet, tron-nile, bitcoin-testnet, solana-devnet]
protocols: [aave-v3, uniswap-v3, usdt0-bridge, velora-swap]
---

# AeroFyta Agent Skill

> Compatible with [OpenClaw Agent Protocol v1](https://openclaw.ai)
> MCP integration via [WDK MCP Toolkit](https://github.com/tetherto/wdk-mcp-toolkit)

## Agent Metadata

| Field | Value |
|---|---|
| Agent Name | AeroFyta |
| Version | 1.0.0 |
| License | Apache 2.0 |
| MCP Server | `aerofyta-mcp` (97+ tools) |
| Chains | Ethereum Sepolia, TON Testnet, TRON Nile, Bitcoin Testnet, Solana Devnet |
| WDK Packages | `@tetherto/wdk`, `wdk-wallet-evm`, `wdk-wallet-ton`, `wdk-wallet-tron`, `wdk-protocol-bridge-usdt0-evm`, `wdk-protocol-swap-velora-evm`, `wdk-protocol-lending-aave-evm` |

## Capabilities

| Capability | Description |
|---|---|
| `tip_creator` | Send USDT tips to content creators on any supported blockchain |
| `check_balance` | Query wallet balances across all chains and accounts |
| `create_escrow` | Lock funds in escrow with conditional release |
| `atomic_swap` | Swap tokens via Velora DEX aggregator |
| `analyze_creator` | Score creators by engagement, reputation, and tip history |
| `manage_dca` | Create and manage dollar-cost averaging tip schedules |
| `stream_payments` | Set up recurring subscription payments |
| `assess_risk` | Evaluate transaction risk before execution |
| `bridge_usdt0` | Bridge USDT0 cross-chain via LayerZero OFT |
| `governance` | Create and vote on governance proposals |
| `treasury_management` | Monitor and rebalance treasury allocations |
| `conditional_payments` | Trigger payments based on engagement or milestone conditions |

## Tool Catalog

### Built-in WDK Tools (~35 tools)

| Category | Count | Tools |
|---|---|---|
| Wallet | ~15 | `get_balance`, `send_tip`, `get_addresses`, `sign_message`, `get_transaction`, etc. |
| Pricing | ~5 | `getCurrentPrice`, `getHistoricalPrice`, `getPriceChange`, etc. |
| Indexer | ~5 | `getIndexerTokenBalance`, `getTokenTransfers`, `getTransactionStatus`, etc. |
| Bridge | ~2 | `quoteBridge`, `executeBridge` |
| Swap | ~2 | `quoteSwap`, `swap` |
| Lending | ~6 | `supply`, `withdraw`, `borrow`, `repay`, `getPosition`, `getMarkets` |

### Custom AeroFyta Tools (62 tools)

#### Safety Tools
| Tool | Description |
|---|---|
| `aerofyta_check_policies` | Get safety policies, spend limits, kill switch status |
| `aerofyta_kill_switch` | Activate/deactivate emergency kill switch |
| `aerofyta_get_safety_status` | Full safety system status with usage metrics |

#### Economics Tools
| Tool | Description |
|---|---|
| `aerofyta_creator_score` | Calculate creator engagement score |
| `aerofyta_pool_status` | Community tipping pool balance and history |
| `aerofyta_split_config` | Tip split configuration (creator/platform/community) |
| `aerofyta_bonus_check` | Check creator milestone bonus triggers |

#### Autonomous Loop Tools
| Tool | Description |
|---|---|
| `aerofyta_loop_status` | Autonomous decision loop status |
| `aerofyta_loop_control` | Pause/resume/start/stop autonomous loop |

#### Wallet Operations Tools
| Tool | Description |
|---|---|
| `aerofyta_routing_analysis` | Find cheapest chain for a tip amount |
| `aerofyta_preflight` | Pre-tip balance and gas verification |
| `aerofyta_fee_estimate` | Estimate TX fee with economic viability check |
| `aerofyta_paymaster_status` | Gasless transaction availability |
| `aerofyta_get_balance` | Get USDT and native balance per chain |
| `aerofyta_get_address` | Get wallet address per chain |
| `aerofyta_send_transaction` | Send USDT or native tokens |
| `aerofyta_get_history` | Transaction history per chain |
| `aerofyta_estimate_fee_detailed` | Detailed fee estimate with gasless options |

#### Bridge Tools
| Tool | Description |
|---|---|
| `aerofyta_bridge_routes` | List all USDT0 bridge routes |
| `aerofyta_bridge_transfer` | Execute cross-chain bridge transfer |
| `aerofyta_bridge_quote` | Get bridge fee quote |

#### DeFi Tools
| Tool | Description |
|---|---|
| `aerofyta_aave_supply` | Supply USDT to Aave lending |
| `aerofyta_aave_withdraw` | Withdraw USDT from Aave |
| `aerofyta_get_yield_rates` | Current DeFi yield rates |
| `aerofyta_swap_quote` | Get swap quote via Velora |

#### Agent Tools
| Tool | Description |
|---|---|
| `aerofyta_agent_status` | Full agent status and health |
| `aerofyta_financial_pulse` | Real-time financial health pulse |
| `aerofyta_mood_modifiers` | Personality mood and tipping behavior modifiers |
| `aerofyta_reputation_score` | On-chain reputation and trust metrics |

#### Payment Tools
| Tool | Description |
|---|---|
| `aerofyta_create_escrow` | Create conditional escrow payment |
| `aerofyta_claim_escrow` | Claim funds from escrow |
| `aerofyta_start_dca` | Start dollar-cost averaging schedule |
| `aerofyta_create_subscription` | Create recurring subscription payment |
| `aerofyta_record_engagement` | Record content engagement for proof-of-engagement |

#### Data Tools
| Tool | Description |
|---|---|
| `aerofyta_search_youtube` | Search YouTube for creators |
| `aerofyta_creator_stats` | Detailed creator statistics |
| `aerofyta_rss_feeds` | Get latest RSS feed data |
| `aerofyta_webhook_events` | Get platform webhook events |

#### x402 Micropayment Tools
| Tool | Description |
|---|---|
| `aerofyta_x402_status` | x402 protocol status and earnings |
| `aerofyta_x402_paywalls` | List x402 paywalled endpoints |
| `aerofyta_x402_create_paywall` | Create new x402 paywall |

#### Indexer Tools
| Tool | Description |
|---|---|
| `aerofyta_verify_tx` | Verify transaction via WDK Indexer |

#### Service & Skill Tools
| Tool | Description |
|---|---|
| `aerofyta_services` | List all 43+ agent services |
| `aerofyta_skills` | List skills in OpenClaw format |
| `aerofyta_accounts` | List BIP-39 segregated accounts |

#### Analytics Tools
| Tool | Description |
|---|---|
| `aerofyta_get_creator_analytics` | Comprehensive creator analytics with trends |
| `aerofyta_get_top_creators` | Ranked list of top creators |
| `aerofyta_get_tip_history` | Detailed filtered tip history |
| `aerofyta_get_decision_log` | Autonomous decision log with rationale |

#### Treasury Tools
| Tool | Description |
|---|---|
| `aerofyta_get_treasury_status` | Full treasury status and financial health |
| `aerofyta_get_yield_opportunities` | Discover DeFi yield opportunities |
| `aerofyta_rebalance_portfolio` | Rebalance treasury portfolio allocations |

#### Governance Tools
| Tool | Description |
|---|---|
| `aerofyta_create_proposal` | Create governance proposal |
| `aerofyta_vote_on_proposal` | Vote on active proposal |
| `aerofyta_get_proposals` | List governance proposals |

#### Automation Tools
| Tool | Description |
|---|---|
| `aerofyta_create_dca_plan` | Create multi-target DCA plan |
| `aerofyta_pause_dca` | Pause active DCA plan |
| `aerofyta_list_subscriptions` | List all subscriptions and DCA plans |
| `aerofyta_process_conditional_payment` | Create conditional payment with triggers |

#### Security Tools
| Tool | Description |
|---|---|
| `aerofyta_get_security_report` | Comprehensive security report |
| `aerofyta_get_risk_assessment` | Assess risk of proposed transaction |
| `aerofyta_get_anomaly_stats` | Detected anomaly statistics |

## Example Interactions

### 1. Tip a Creator
**Prompt:** "Tip the crypto educator on Ethereum 0.5 USDT"
**Agent behavior:** Runs `aerofyta_preflight` to verify balance and gas, then `aerofyta_fee_estimate` to check economic viability, then `aerofyta_send_transaction` to execute the transfer. Reports the transaction hash and verification via `aerofyta_verify_tx`.

### 2. Optimize Treasury Yield
**Prompt:** "Find the best yield for idle treasury funds"
**Agent behavior:** Calls `aerofyta_get_treasury_status` to check available balances, then `aerofyta_get_yield_opportunities` to discover DeFi rates, then recommends the best strategy. If approved, calls `aerofyta_aave_supply` to deploy funds.

### 3. Assess Risk Before Large Tip
**Prompt:** "Is it safe to send 50 USDT to this new creator?"
**Agent behavior:** Runs `aerofyta_get_risk_assessment` with the amount and recipient, checks `aerofyta_get_safety_status` for current limits, then `aerofyta_creator_score` for creator reputation. Returns a risk verdict with reasoning.

### 4. Set Up Recurring Tips
**Prompt:** "Tip 0.1 USDT daily to my top 3 favorite creators"
**Agent behavior:** Calls `aerofyta_get_top_creators` to confirm the creators, then `aerofyta_create_dca_plan` with multiple targets. Confirms the plan details and first execution time.

### 5. Governance Proposal
**Prompt:** "Create a proposal to increase community pool share to 10%"
**Agent behavior:** Calls `aerofyta_create_proposal` with type `tip_split` and the proposed new split values. Returns the proposal ID and voting period. Other stakeholders can vote via `aerofyta_vote_on_proposal`.

## API Endpoints

All skills are also accessible via REST API:

```
GET  /api/advanced/services          - Service registry
GET  /api/advanced/skills            - OpenClaw skills
GET  /api/advanced/mcp/tools         - MCP tool listing
POST /api/advanced/mcp/execute       - MCP tool execution
GET  /api/advanced/bridge/routes     - Bridge routes
POST /api/advanced/bridge/transfer   - Bridge execution
GET  /api/advanced/indexer/verify/:h - TX verification
GET  /api/advanced/accounts          - Segregated accounts
GET  /api/advanced/x402/status       - x402 protocol status
GET  /api/advanced/safety/status     - Safety status
POST /api/advanced/safety/kill-switch - Kill switch
GET  /api/advanced/autonomous/status - Loop status
POST /api/advanced/autonomous/control - Loop control
GET  /api/analytics/treasury         - Treasury status
GET  /api/analytics/decisions        - Decision log
GET  /api/analytics/top-creators     - Top creators
POST /api/analytics/risk-assessment  - Risk assessment
GET  /api/governance/proposals       - Proposals
POST /api/governance/proposals       - Create proposal
GET  /api/payments/subscriptions     - Subscriptions
POST /api/payments/conditional       - Conditional payments
```

## MCP Server

Start the MCP server for IDE/agent integration:

```bash
npx tsx src/mcp-server.ts
```

Configure in Claude Desktop or other MCP clients:

```json
{
  "mcpServers": {
    "aerofyta": {
      "command": "npx",
      "args": ["tsx", "src/mcp-server.ts"],
      "cwd": "/path/to/agent",
      "env": {
        "WDK_SEED": "your seed phrase"
      }
    }
  }
}
```
