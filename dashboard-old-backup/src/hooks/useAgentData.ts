// Copyright 2026 Danish A. Licensed under Apache-2.0.
// Custom hook for agent/backend data state — extracted from App.tsx.

import { useState, useCallback, useEffect } from 'react';

// ─── Types (shared with App.tsx) ─────────────────────────
export interface WalletBalance { chainId: string; address: string; nativeBalance: string; nativeCurrency: string; usdtBalance: string; }
export interface Creator { id: string; name: string; channelUrl: string; walletAddress: string; categories: string[]; totalTips: number; totalAmount: number; }
export interface AgentState { status: string; currentStep?: string; reasoning?: string; progress?: number; }
export interface ActivityEvent { id: string; type: string; message: string; timestamp: string; detail?: string; }
export interface TipResult { status: string; txHash: string; amount: string; recipient: string; chainId: string; fee?: string; reasoning?: string; to?: string; decision?: { reasoning?: string }; explorerUrl?: string; token?: string; }
export interface AutoTipRule { userId: string; minWatchPercent: number; tipAmount: number; maxTipsPerDay: number; enabledCategories: string[]; }
export interface TipPool { id: string; creatorId: string; title: string; goalAmount: number; currentAmount: number; contributors: number; }
export interface LeaderboardEntry { address: string; totalTips: number; totalAmount: number; rank: number; }
export interface ProtocolStatusEntry { available: boolean; mode?: string; reason?: string; provider?: string; model?: string; note?: string; }
export interface ProtocolStatusMap { lending: ProtocolStatusEntry; bridge: ProtocolStatusEntry; swap: ProtocolStatusEntry; llm: ProtocolStatusEntry; escrow: ProtocolStatusEntry; }

export const stepLabels: Record<string, string> = {
  'idle': 'Ready',
  'intake': 'Receiving events...',
  'reasoning': 'AI analyzing...',
  'executing': 'Executing action...',
  'reflecting': 'Learning from result...',
  'observe': 'Scanning for events...',
  'reason': 'Making decision...',
  'act': 'Taking action...',
  'reflect': 'Updating memory...',
};

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export { API, fetchJson };

/**
 * useAgentData — manages all backend/agent data: wallets, creators, activity,
 * agent status, protocol status, leaderboard, pools, auto-tip rules, etc.
 */
export function useAgentData() {
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [agentState, setAgentState] = useState<AgentState>({ status: 'idle' });
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [tipResult, setTipResult] = useState<TipResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [pools, setPools] = useState<TipPool[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [autoTipRules, setAutoTipRules] = useState<AutoTipRule[]>([]);
  const [aiMode, setAiMode] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [protocolStatus, setProtocolStatus] = useState<ProtocolStatusMap | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [b, c, a, p, l, r] = await Promise.all([
        fetchJson<{ balances: WalletBalance[] }>(`${API}/wallet/balances`),
        fetchJson<{ creators: Creator[] }>(`${API}/rumble/creators`),
        fetchJson<{ activity: ActivityEvent[] }>(`${API}/activity`),
        fetchJson<{ pools: TipPool[] }>(`${API}/rumble/pools`).catch(() => ({ pools: [] })),
        fetchJson<{ leaderboard: LeaderboardEntry[] }>(`${API}/rumble/leaderboard`).catch(() => ({ leaderboard: [] })),
        fetchJson<{ rules: AutoTipRule[] }>(`${API}/rumble/auto-tip/rules/default-user`).catch(() => ({ rules: [] })),
      ]);
      setBalances(b.balances || []);
      setCreators(c.creators || []);
      setActivity((a.activity || []).slice(0, 8));
      setPools(p.pools || []);
      setLeaderboard((l.leaderboard || []).slice(0, 5));
      setAutoTipRules(r.rules || []);
      setInitialLoading(false);
      // Fetch AI mode from health endpoint
      fetchJson<{ ai: string }>(`${API}/health`).then(h => setAiMode(h.ai ?? 'unknown')).catch(() => {});
      // Fetch protocol status for System Status panel
      fetchJson<{ protocolStatus: ProtocolStatusMap }>(`${API}/agent/status`).then(s => { if (s.protocolStatus) setProtocolStatus(s.protocolStatus); }).catch(() => {});
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setDemoMode(true);
      setApiError('Demo mode \u2014 showing sample data. Start backend with `npm run dev:agent` for live data');
      setBalances([
        { chainId: 'ethereum-sepolia', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28', nativeBalance: '0.5', nativeCurrency: 'ETH', usdtBalance: '10.00' },
        { chainId: 'ton-testnet', address: 'UQBvW8Z5huBkMJYdnfAEM5JqTNLuKD5InKQYR2BN8GKPwT8p', nativeBalance: '2.0', nativeCurrency: 'TON', usdtBalance: '5.00' },
      ]);
      setCreators([
        { id: 'demo-1', name: 'TechReview', channelUrl: 'rumble.com/c/techreview', walletAddress: '0x' + 'a'.repeat(40), categories: ['tech'], totalTips: 12, totalAmount: 1.5 },
        { id: 'demo-2', name: 'CryptoDaily', channelUrl: 'rumble.com/c/cryptodaily', walletAddress: '0x' + 'b'.repeat(40), categories: ['crypto'], totalTips: 8, totalAmount: 0.8 },
        { id: 'demo-3', name: 'NewsNow', channelUrl: 'rumble.com/c/newsnow', walletAddress: '0x' + 'c'.repeat(40), categories: ['news'], totalTips: 5, totalAmount: 0.3 },
      ]);
      setActivity([
        { id: '1', type: 'tip_sent', message: 'Tipped TechReview 0.001 ETH for "WDK Deep Dive"', timestamp: new Date().toISOString() },
        { id: '2', type: 'auto_tip', message: 'Auto-tipped CryptoDaily after 85% watch time', timestamp: new Date(Date.now() - 300000).toISOString() },
        { id: '3', type: 'agent_decision', message: 'Agent chose Ethereum (lowest gas: 12 gwei)', timestamp: new Date(Date.now() - 600000).toISOString() },
      ]);
      setInitialLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => { loadData(); }, [loadData]);

  // SSE for agent state
  useEffect(() => {
    const es = new EventSource(`${API}/agent/events`);
    es.onmessage = (e) => { try { const d = JSON.parse(e.data); if (d.type === 'state') setAgentState(d); } catch (err) { console.error('SSE parse error:', err); } };
    return () => es.close();
  }, []);

  // Poll activity
  useEffect(() => {
    const iv = setInterval(async () => {
      try { const a = await fetchJson<{ activity: ActivityEvent[] }>(`${API}/activity`); setActivity((a.activity || []).slice(0, 8)); } catch (err) { console.error('Activity poll failed:', err); }
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  return {
    balances, setBalances,
    initialLoading, setInitialLoading,
    creators, setCreators,
    agentState, setAgentState,
    activity, setActivity,
    tipResult, setTipResult,
    error, setError,
    apiError, setApiError,
    pools, setPools,
    leaderboard, setLeaderboard,
    autoTipRules, setAutoTipRules,
    aiMode, setAiMode,
    demoMode, setDemoMode,
    protocolStatus, setProtocolStatus,
    loadData,
  };
}
