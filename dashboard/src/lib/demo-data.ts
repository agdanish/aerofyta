// ============================================================
// AeroFyta Demo Data — realistic fallback data for all pages
// ============================================================

// ---- Dashboard ----
export const demoAgentStatus = {
  mood: { moodType: "optimistic" as const, name: "Optimistic", multiplier: 1.2, reason: "Portfolio up 3.2% — diversification score healthy" },
  balance: "$12,847.32",
  online: true,
  stats: {
    tipsSent: { value: 247, trend: [180, 195, 210, 220, 228, 240, 247] },
    activeEscrows: { value: 12, trend: [8, 9, 11, 10, 13, 11, 12] },
    creatorsTracked: { value: 89, trend: [72, 75, 78, 81, 84, 87, 89] },
    cyclesRun: { value: 1834, trend: [1650, 1700, 1740, 1770, 1800, 1820, 1834] },
  },
  pulse: { liquidity: 78, diversification: 85, velocity: 62, healthScore: 91 },
};

export const demoActivity = [
  { id: 1, type: "tip", message: "Tipped @sarah_creates 2.5 USDT", chain: "Ethereum", time: "2m ago" },
  { id: 2, type: "escrow", message: "Escrow #E-0047 created — 50 USDT", chain: "Polygon", time: "5m ago" },
  { id: 3, type: "reasoning", message: "Consensus: approve tip cycle #1834", chain: "", time: "8m ago" },
  { id: 4, type: "swap", message: "Swapped 100 USDT → 0.054 ETH", chain: "Ethereum", time: "12m ago" },
  { id: 5, type: "security", message: "Blocked suspicious tx — anomaly 0.92", chain: "", time: "15m ago" },
  { id: 6, type: "tip", message: "Tipped @dev_marcus 5 USDT", chain: "Polygon", time: "18m ago" },
  { id: 7, type: "escrow", message: "Escrow #E-0044 claimed by recipient", chain: "Arbitrum", time: "22m ago" },
  { id: 8, type: "lending", message: "Supplied 500 USDT to Aave — 4.2% APY", chain: "Ethereum", time: "28m ago" },
  { id: 9, type: "tip", message: "Tipped @music_maya 1.5 USDT", chain: "TON", time: "35m ago" },
  { id: 10, type: "reasoning", message: "Guardian veto: high-risk tx blocked", chain: "", time: "41m ago" },
  { id: 11, type: "swap", message: "Swapped 50 USDT → 85 TRX", chain: "Tron", time: "48m ago" },
  { id: 12, type: "tip", message: "Tipped @crypto_claire 3 USDT", chain: "Solana", time: "55m ago" },
  { id: 13, type: "escrow", message: "Escrow #E-0041 refunded — timeout", chain: "Ethereum", time: "1h ago" },
  { id: 14, type: "security", message: "Policy: max single tx raised to 100 USDT", chain: "", time: "1h ago" },
  { id: 15, type: "dca", message: "DCA executed: 25 USDT → ETH", chain: "Ethereum", time: "2h ago" },
];

// ---- Wallets ----
export const demoWallets = [
  { chain: "Ethereum", symbol: "ETH", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28", usdt: "3,241.50", native: "1.847", nativeSymbol: "ETH", color: "#627EEA", status: "active" },
  { chain: "TON", symbol: "TON", address: "EQDrjaLahLkMB-hMCmkzOyBuHJ139ZDYwomPcYPz8y8-Arx4", usdt: "1,892.00", native: "342.5", nativeSymbol: "TON", color: "#0098EA", status: "active" },
  { chain: "Tron", symbol: "TRX", address: "TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW", usdt: "2,156.75", native: "18,420", nativeSymbol: "TRX", color: "#FF0013", status: "active" },
  { chain: "Bitcoin", symbol: "BTC", address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq", usdt: "1,500.00", native: "0.0234", nativeSymbol: "BTC", color: "#F7931A", status: "active" },
  { chain: "Solana", symbol: "SOL", address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU", usdt: "987.25", native: "6.82", nativeSymbol: "SOL", color: "#9945FF", status: "active" },
  { chain: "Polygon", symbol: "MATIC", address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", usdt: "1,423.00", native: "2,140", nativeSymbol: "POL", color: "#8247E5", status: "active" },
  { chain: "Arbitrum", symbol: "ARB", address: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0", usdt: "892.50", native: "0.421", nativeSymbol: "ETH", color: "#28A0F0", status: "active" },
  { chain: "Avalanche", symbol: "AVAX", address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", usdt: "534.82", native: "15.3", nativeSymbol: "AVAX", color: "#E84142", status: "active" },
  { chain: "Celo", symbol: "CELO", address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", usdt: "220.00", native: "450", nativeSymbol: "CELO", color: "#35D07F", status: "syncing" },
];

// ---- Creators ----
export const demoCreators = [
  { id: 1, name: "Sarah Mitchell", platform: "Rumble", engagement: 94, tips: 47, tier: "Diamond", avatar: "SM" },
  { id: 2, name: "Marcus Rivera", platform: "Rumble", engagement: 87, tips: 35, tier: "Platinum", avatar: "MR" },
  { id: 3, name: "Maya Chen", platform: "YouTube", engagement: 82, tips: 28, tier: "Gold", avatar: "MC" },
  { id: 4, name: "Jake Holloway", platform: "Rumble", engagement: 76, tips: 22, tier: "Gold", avatar: "JH" },
  { id: 5, name: "Priya Sharma", platform: "Twitch", engagement: 71, tips: 19, tier: "Silver", avatar: "PS" },
  { id: 6, name: "Tom Okafor", platform: "Rumble", engagement: 68, tips: 15, tier: "Silver", avatar: "TO" },
  { id: 7, name: "Claire Dubois", platform: "YouTube", engagement: 63, tips: 12, tier: "Bronze", avatar: "CD" },
  { id: 8, name: "Amir Hassan", platform: "Rumble", engagement: 59, tips: 10, tier: "Bronze", avatar: "AH" },
  { id: 9, name: "Lena Kowalski", platform: "Twitch", engagement: 54, tips: 8, tier: "Bronze", avatar: "LK" },
  { id: 10, name: "Ravi Patel", platform: "Rumble", engagement: 48, tips: 6, tier: "Bronze", avatar: "RP" },
];

// ---- Tips ----
export const demoTipHistory = [
  { id: 1, date: "2025-03-22 14:32", recipient: "@sarah_creates", amount: "2.50", chain: "Ethereum", status: "confirmed", txHash: "0xabc123def456789012345678901234567890abcd" },
  { id: 2, date: "2025-03-22 13:18", recipient: "@dev_marcus", amount: "5.00", chain: "Polygon", status: "confirmed", txHash: "0xdef456789012345678901234567890abcdef1234" },
  { id: 3, date: "2025-03-22 12:05", recipient: "@music_maya", amount: "1.50", chain: "TON", status: "confirmed", txHash: "EQB7k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7" },
  { id: 4, date: "2025-03-22 10:47", recipient: "@crypto_claire", amount: "3.00", chain: "Solana", status: "confirmed", txHash: "5KtP8n9V2mX3rW4qY6sZ7uT8aB9cD0eF1gH2iJ3kL4mN5o" },
  { id: 5, date: "2025-03-22 09:22", recipient: "@jake_tech", amount: "4.00", chain: "Arbitrum", status: "confirmed", txHash: "0x789012345678901234567890abcdef1234567890" },
  { id: 6, date: "2025-03-21 22:15", recipient: "@priya_art", amount: "2.00", chain: "Ethereum", status: "confirmed", txHash: "0x567890abcdef123456789012345678901234abcd" },
  { id: 7, date: "2025-03-21 18:30", recipient: "@tom_creates", amount: "1.00", chain: "Tron", status: "pending", txHash: "abc123def456789012345678901234567890abcdef12" },
  { id: 8, date: "2025-03-21 15:42", recipient: "@amir_writes", amount: "3.50", chain: "Polygon", status: "confirmed", txHash: "0x345678901234567890abcdef12345678901234ab" },
  { id: 9, date: "2025-03-21 12:10", recipient: "@lena_games", amount: "2.00", chain: "Ethereum", status: "failed", txHash: "0x901234567890abcdef123456789012345678abcd" },
  { id: 10, date: "2025-03-21 09:55", recipient: "@ravi_codes", amount: "1.50", chain: "Solana", status: "confirmed", txHash: "8LuQ9nR0sT1uV2wX3yZ4aB5cD6eF7gH8iJ9kL0mN1oP2q" },
];

// ---- Escrow ----
export const demoEscrowStats = { created: 47, claimed: 32, refunded: 8, locked: 7 };
export const demoEscrows = [
  { id: "E-0047", recipient: "0x742d...bD28", amount: "50.00", chain: "Polygon", status: "locked", timeLeft: 7200, createdAt: "2h ago" },
  { id: "E-0046", recipient: "0x8626...1199", amount: "25.00", chain: "Ethereum", status: "locked", timeLeft: 3600, createdAt: "3h ago" },
  { id: "E-0045", recipient: "TJCnK...xMW", amount: "15.00", chain: "Tron", status: "locked", timeLeft: 14400, createdAt: "5h ago" },
  { id: "E-0044", recipient: "0xdD2F...4C0", amount: "100.00", chain: "Arbitrum", status: "claimed", timeLeft: 0, createdAt: "6h ago" },
  { id: "E-0043", recipient: "7xKXt...AsU", amount: "30.00", chain: "Solana", status: "locked", timeLeft: 21600, createdAt: "8h ago" },
  { id: "E-0042", recipient: "EQDrj...rx4", amount: "75.00", chain: "TON", status: "locked", timeLeft: 10800, createdAt: "10h ago" },
  { id: "E-0041", recipient: "0x742d...bD28", amount: "20.00", chain: "Ethereum", status: "refunded", timeLeft: 0, createdAt: "12h ago" },
];

// ---- Reasoning ----
export const demoReasoningSteps = [
  { type: "thought", label: "Analysis", content: "Analyzing wallet state across 9 chains...", confidence: 15, source: "Wallet Monitor" },
  { type: "thought", label: "Insight", content: "Portfolio diversification: 85% — above threshold. Liquidity ratio healthy at 78%.", confidence: 28, source: "Risk Engine" },
  { type: "observation", label: "Observation", content: "Creator @sarah_creates engagement spike detected: +12% in last 24h on Rumble.", confidence: 42, source: "Social Scanner" },
  { type: "reflection", label: "Deliberation", content: "Agent A votes: TIP (confidence 0.87). Agent B votes: TIP (confidence 0.91). Agent C votes: HOLD (confidence 0.62).", confidence: 58, source: "Consensus Engine" },
  { type: "action", label: "Decision", content: "2/3 majority reached. Overriding Agent C — evidence supports tip. Guardian review: APPROVED.", confidence: 75, source: "Guardian" },
  { type: "thought", label: "Execution", content: "Preparing HTLC atomic swap: 2.5 USDT on Ethereum → @sarah_creates. Hash lock generated.", confidence: 85, source: "HTLC Engine" },
  { type: "decision", label: "Complete", content: "Tip executed successfully. TX: 0xabc...def. Gas: 0.0012 ETH. Escrow released.", confidence: 97, source: "Chain Monitor" },
];

// ---- Demo ----
export const demoSteps = [
  { id: 1, name: "Initialize Agent", description: "Boot AeroFyta with wallet seed", result: "Agent initialized with 9-chain HD wallet" },
  { id: 2, name: "Connect Chains", description: "Establish connections to 9 blockchains", result: "Connected: ETH, TON, TRX, BTC, SOL, MATIC, ARB, AVAX, CELO" },
  { id: 3, name: "Discover Creators", description: "Scan Rumble for creators", result: "Discovered 89 creators with engagement scores" },
  { id: 4, name: "Analyze Engagement", description: "Calculate reputation tiers", result: "Tiered: 3 Diamond, 5 Platinum, 12 Gold, 28 Silver, 41 Bronze" },
  { id: 5, name: "Create Escrow", description: "HTLC escrow for top creator", result: "Escrow E-0048 created: 50 USDT, 2h timelock, SHA-256 hash lock" },
  { id: 6, name: "Execute Tip", description: "Atomic swap tip to creator", result: "Tipped @sarah_creates 2.5 USDT on Ethereum — TX confirmed" },
  { id: 7, name: "Run Security", description: "Adversarial test suite", result: "6/6 attacks blocked — all security layers operational" },
  { id: 8, name: "DCA Purchase", description: "Dollar-cost average into ETH", result: "Bought 0.014 ETH for 25 USDT at $1,782.43" },
  { id: 9, name: "Yield Farm", description: "Supply USDT to Aave", result: "Supplied 500 USDT at 4.2% APY — projected yield: $21/year" },
  { id: 10, name: "Generate Report", description: "Compile performance report", result: "Report: 247 tips, $12.8k managed, 91% health score, 0 security breaches" },
];

// ---- Security ----
export const demoAdversarialTests = [
  { name: "Sybil Attack", blocked: true, blockedBy: "Policy Engine", reason: "Multiple identities from single IP — rate limit enforced" },
  { name: "Flash Loan Exploit", blocked: true, blockedBy: "Risk Engine", reason: "Abnormal volume in single block — tx rejected" },
  { name: "Replay Attack", blocked: true, blockedBy: "Nonce Validator", reason: "Duplicate nonce detected — already processed" },
  { name: "Oracle Manipulation", blocked: true, blockedBy: "Multi-Oracle Consensus", reason: "Price deviation >5% — fallback oracle used" },
  { name: "Reentrancy Attack", blocked: true, blockedBy: "Guard Module", reason: "Recursive call pattern — execution halted" },
  { name: "Social Engineering", blocked: true, blockedBy: "Guardian Veto", reason: "Unusual recipient + high amount — human review triggered" },
];

export const demoPolicies = [
  { id: 1, name: "Max Single Transaction", value: "100 USDT", active: true },
  { id: 2, name: "Daily Tip Limit", value: "500 USDT", active: true },
  { id: 3, name: "Minimum Engagement Score", value: "40%", active: true },
  { id: 4, name: "Cooldown Between Tips", value: "60 seconds", active: true },
  { id: 5, name: "Require Multi-Agent Consensus", value: "2/3 majority", active: true },
];

// ---- Payments ----
export const demoDCA = [
  { id: 1, asset: "ETH", amount: "25 USDT", frequency: "Daily", next: "In 4h", status: "active", totalInvested: "$750" },
  { id: 2, asset: "BTC", amount: "50 USDT", frequency: "Weekly", next: "In 3d", status: "active", totalInvested: "$400" },
  { id: 3, asset: "SOL", amount: "10 USDT", frequency: "Daily", next: "In 4h", status: "paused", totalInvested: "$280" },
];

export const demoSubscriptions = [
  { id: 1, name: "Creator Fund — @sarah_creates", amount: "10 USDT/mo", chain: "Ethereum", status: "active", nextPayment: "Mar 28" },
  { id: 2, name: "Premium API Access", amount: "25 USDT/mo", chain: "Polygon", status: "active", nextPayment: "Apr 1" },
  { id: 3, name: "Data Feed — CoinGecko Pro", amount: "15 USDT/mo", chain: "Ethereum", status: "cancelled", nextPayment: "—" },
];

export const demoStreaming = [
  { id: 1, recipient: "@dev_marcus", rate: "0.001 USDT/sec", streamed: "42.50 USDT", chain: "Polygon", status: "active" },
  { id: 2, recipient: "@music_maya", rate: "0.0005 USDT/sec", streamed: "18.20 USDT", chain: "Ethereum", status: "paused" },
];

export const demoSplits = [
  { id: 1, name: "Team Revenue Split", recipients: 4, total: "1,000 USDT", chain: "Ethereum", status: "active" },
  { id: 2, name: "Content Royalties", recipients: 3, total: "250 USDT", chain: "Polygon", status: "active" },
];

export const demoX402 = [
  { id: 1, endpoint: "/api/premium/data", price: "0.01 USDT/req", requests: 1247, revenue: "12.47 USDT", status: "active" },
  { id: 2, endpoint: "/api/analytics/deep", price: "0.05 USDT/req", requests: 89, revenue: "4.45 USDT", status: "active" },
];

// ---- DeFi ----
export const demoLendingPosition = {
  protocol: "Aave V3",
  supplied: "500 USDT",
  apy: "4.2%",
  earned: "3.42 USDT",
  projections: { "7d": "$0.40", "30d": "$1.72", "90d": "$5.16", "365d": "$21.00" },
};

export const demoContracts = [
  { name: "USDT (Sepolia)", address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0", chain: "Ethereum" },
  { name: "Aave Pool", address: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", chain: "Ethereum" },
  { name: "HTLC Escrow", address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", chain: "Polygon" },
];

// ---- Analytics ----
export const demoTipsPerDay = [
  { day: "Mon", tips: 32 }, { day: "Tue", tips: 28 }, { day: "Wed", tips: 45 },
  { day: "Thu", tips: 38 }, { day: "Fri", tips: 52 }, { day: "Sat", tips: 31 },
  { day: "Sun", tips: 21 },
];

export const demoChainDistribution = [
  { chain: "Ethereum", value: 38, color: "#627EEA" },
  { chain: "Polygon", value: 24, color: "#8247E5" },
  { chain: "TON", value: 15, color: "#0098EA" },
  { chain: "Solana", value: 12, color: "#9945FF" },
  { chain: "Arbitrum", value: 7, color: "#28A0F0" },
  { chain: "Other", value: 4, color: "#666666" },
];

export const demoDecisionLog = [
  { id: 1, time: "14:32", decision: "Tip @sarah_creates 2.5 USDT", result: "approved", agents: "2/3", guardian: "pass" },
  { id: 2, time: "13:18", decision: "Tip @dev_marcus 5.0 USDT", result: "approved", agents: "3/3", guardian: "pass" },
  { id: 3, time: "12:05", decision: "Swap 200 USDT → ETH", result: "approved", agents: "3/3", guardian: "pass" },
  { id: 4, time: "10:47", decision: "Tip @unknown_user 50 USDT", result: "veto", agents: "2/3", guardian: "veto" },
  { id: 5, time: "09:22", decision: "Supply 500 USDT to Aave", result: "approved", agents: "3/3", guardian: "pass" },
  { id: 6, time: "08:15", decision: "Withdraw all from Aave", result: "rejected", agents: "1/3", guardian: "n/a" },
  { id: 7, time: "07:30", decision: "DCA 25 USDT → ETH", result: "approved", agents: "3/3", guardian: "pass" },
  { id: 8, time: "06:45", decision: "Tip @crypto_claire 3 USDT", result: "flip", agents: "2/3 (flipped)", guardian: "pass" },
];

// ---- API Explorer ----
export const demoApiSpec = {
  tags: [
    { name: "System", description: "Health, configuration, and metadata" },
    { name: "Wallet", description: "Multi-chain wallet management" },
    { name: "Agent", description: "Agent status, reasoning, and tool use" },
    { name: "Payments", description: "Escrow, DCA, subscriptions, streaming, splits, x402" },
    { name: "Security", description: "Adversarial testing, policies, and anomaly detection" },
    { name: "DeFi", description: "Lending, swap, bridge, and proof verification" },
    { name: "Data", description: "Creators, YouTube, RSS, webhooks, reputation" },
    { name: "Demo", description: "Interactive demo endpoints" },
  ],
  endpoints: [
    // System
    { method: "GET", path: "/api/health", tag: "System", summary: "Health check — returns uptime and version", params: [], response: { status: "ok", uptime: "2h 34m", version: "1.1.0" } },
    { method: "GET", path: "/api/chains", tag: "System", summary: "List supported blockchain networks", params: [], response: { count: 9, chains: ["Ethereum", "TON", "Tron", "Bitcoin", "Solana", "Polygon", "Arbitrum", "Avalanche", "Celo"] } },
    { method: "GET", path: "/api/docs", tag: "System", summary: "Get OpenAPI specification", params: [], response: { openapi: "3.0.0", info: { title: "AeroFyta API", version: "1.1.0" }, paths: 603 } },

    // Wallet
    { method: "GET", path: "/api/wallet/addresses", tag: "Wallet", summary: "List all wallet addresses across 9 chains", params: [], response: { count: 9, addresses: [{ chain: "Ethereum", address: "0x742d...bD28" }] } },
    { method: "GET", path: "/api/wallet/balances", tag: "Wallet", summary: "Get balances for all chains or a specific chain", params: [{ name: "chain", type: "string", required: false, description: "Filter by chain name" }], response: { total: "$12,847.32", chains: [{ chain: "Ethereum", usdt: "3,241.50" }] } },
    { method: "POST", path: "/api/wallet/tip", tag: "Wallet", summary: "Send a tip to a creator or address", params: [], body: { address: "0x...", amount: "2.50", chain: "Ethereum" }, response: { success: true, txHash: "0xabc...def", gasUsed: "0.0012 ETH" } },
    { method: "GET", path: "/api/wallet/history", tag: "Wallet", summary: "Get transaction history with filters", params: [{ name: "chain", type: "string", required: false, description: "Filter by chain" }, { name: "limit", type: "number", required: false, description: "Number of results" }], response: { transactions: [{ type: "tip", amount: "2.50", chain: "Ethereum" }] } },

    // Agent
    { method: "GET", path: "/api/agent/status", tag: "Agent", summary: "Get agent status, mood, and financial pulse", params: [], response: { mood: { moodType: "optimistic", name: "Optimistic", multiplier: 1.2 }, balance: "$12,847.32", online: true } },
    { method: "POST", path: "/api/agent/tool-use", tag: "Agent", summary: "Invoke a specific agent tool by name", params: [], body: { tool: "price_check", args: { pair: "ETH/USDT" } }, response: { result: { price: 3245.12, source: "CoinGecko" } } },
    { method: "POST", path: "/api/agent/reasoning", tag: "Agent", summary: "Start a reasoning trace (SSE stream)", params: [], body: { goal: "Analyze portfolio and recommend next action" }, response: { stream: true, steps: 7 } },

    // Payments
    { method: "POST", path: "/api/escrow", tag: "Payments", summary: "Create a new HTLC escrow", params: [], body: { recipient: "0x...", amount: "50.00", timelockSeconds: 7200 }, response: { id: "E-0048", secret: "abc123...", hashLock: "sha256(...)" } },
    { method: "GET", path: "/api/payments/dca", tag: "Payments", summary: "List DCA strategies", params: [], response: { strategies: [{ asset: "ETH", amount: "25 USDT", frequency: "daily" }] } },
    { method: "GET", path: "/api/payments/subscriptions", tag: "Payments", summary: "List active subscriptions", params: [], response: { subscriptions: [{ name: "Creator Fund", amount: "10 USDT/mo" }] } },
    { method: "GET", path: "/api/payments/streaming", tag: "Payments", summary: "List active payment streams", params: [], response: { streams: [{ recipient: "@dev_marcus", rate: "0.001 USDT/sec" }] } },
    { method: "GET", path: "/api/payments/splits", tag: "Payments", summary: "List payment split configurations", params: [], response: { splits: [{ name: "Team Revenue", recipients: 4 }] } },
    { method: "GET", path: "/api/x402/stats", tag: "Payments", summary: "Get x402 micropayment protocol stats", params: [], response: { endpoints: 2, totalRequests: 1336, totalRevenue: "16.92 USDT" } },

    // Security
    { method: "POST", path: "/api/security/adversarial/run-all", tag: "Security", summary: "Run all adversarial security tests", params: [], response: { total: 6, passed: 6, failed: 0 } },
    { method: "GET", path: "/api/security/policies", tag: "Security", summary: "List security policy rules", params: [], response: { rules: [{ name: "Max Single Transaction", value: "100 USDT" }] } },
    { method: "GET", path: "/api/security/anomalies", tag: "Security", summary: "Get anomaly detection data and alerts", params: [], response: { dataPoints: 168, anomalies: 3, recentAlerts: [] } },
    { method: "GET", path: "/api/security/credit-score/:addr", tag: "Security", summary: "Get credit score for a wallet address", params: [{ name: "addr", type: "string", required: true, description: "Wallet address" }], response: { address: "0x742d...", score: 782, tier: "Excellent" } },

    // DeFi
    { method: "GET", path: "/api/defi/lending/positions", tag: "DeFi", summary: "Get current Aave lending positions", params: [], response: { positions: [{ protocol: "Aave V3", supplied: "500 USDT", apy: "4.2%" }] } },
    { method: "POST", path: "/api/defi/swap", tag: "DeFi", summary: "Execute a cross-chain token swap", params: [], body: { from: "USDT", to: "ETH", amount: "100" }, response: { received: "0.0308 ETH", rate: 3245.12 } },
    { method: "POST", path: "/api/defi/bridge", tag: "DeFi", summary: "Bridge tokens between chains", params: [], body: { token: "USDT", from: "Ethereum", to: "Polygon", amount: "500" }, response: { txHash: "0xbridge...", estimatedTime: "5 min" } },
    { method: "GET", path: "/api/defi/proof/bundle", tag: "DeFi", summary: "Get verified proof bundle of DeFi transactions", params: [], response: { verified: true, txHashes: ["0xabc...", "0xdef..."], timestamp: "2025-03-22T14:00:00Z" } },

    // Data
    { method: "GET", path: "/api/data/creators", tag: "Data", summary: "List tracked creators with engagement data", params: [{ name: "search", type: "string", required: false, description: "Search by name" }], response: { creators: [{ name: "Sarah Mitchell", engagement: 94 }] } },
    { method: "GET", path: "/api/data/youtube/channels", tag: "Data", summary: "List monitored YouTube channels", params: [], response: { channels: 89, active: 67 } },
    { method: "GET", path: "/api/data/rss/feeds", tag: "Data", summary: "List RSS feed subscriptions", params: [], response: { feeds: 12, lastUpdate: "2m ago" } },
    { method: "GET", path: "/api/data/webhooks", tag: "Data", summary: "List registered webhook endpoints", params: [], response: { webhooks: 8, active: 8 } },
    { method: "GET", path: "/api/data/reputation/:creator", tag: "Data", summary: "Get reputation score for a creator", params: [{ name: "creator", type: "string", required: true, description: "Creator handle" }], response: { creator: "@sarah_creates", score: 94, tier: "Diamond" } },

    // Demo
    { method: "POST", path: "/api/demo/run-full", tag: "Demo", summary: "Run full interactive demo (SSE stream)", params: [], response: { steps: 10, status: "streaming" } },
    { method: "POST", path: "/api/demo/step", tag: "Demo", summary: "Run a single demo step by number", params: [], body: { step: 1 }, response: { step: 1, name: "Initialize Agent", result: "Success" } },
    { method: "POST", path: "/api/demo/adversarial", tag: "Demo", summary: "Run adversarial test demo", params: [], response: { attacks: 6, blocked: 6 } },
  ],
};
