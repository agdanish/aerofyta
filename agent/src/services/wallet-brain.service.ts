// Copyright 2026 Danish A. Licensed under Apache-2.0.
// AeroFyta — Wallet-as-Brain™ Engine
// The wallet IS the brain. Financial state drives agent cognition.

import { logger } from '../utils/logger.js';
import { ServiceRegistry } from './service-registry.js';

// ── Types ─────────────────────────────────────────────────────

export type BrainMood = 'generous' | 'strategic' | 'cautious' | 'survival';

export interface WalletBrainState {
  /** Overall brain health 0-100, computed from wallet metrics */
  health: number;
  /** Current mood — drives behavioral policy */
  mood: BrainMood;
  /** 0-100: ratio of liquid funds vs committed (escrow, lending) */
  liquidity: number;
  /** 0-100: how spread funds are across chains */
  diversification: number;
  /** 0-100: recent transaction frequency trend */
  velocity: number;
  /** 0-100: willingness to take on risky tips / new creators */
  riskAppetite: number;
  /** Max tip amount in USDT allowed by current mood */
  maxTipUsdt: number;
  /** Behavioral policy description for current mood */
  policy: string;
  /** ISO timestamp of this reading */
  timestamp: string;
}

export interface BrainTransition {
  from: BrainMood;
  to: BrainMood;
  health: number;
  reason: string;
  timestamp: string;
}

export interface BrainHistory {
  transitions: BrainTransition[];
  stateSnapshots: WalletBrainState[];
}

// ── Mood policies ─────────────────────────────────────────────

const MOOD_CONFIG: Record<BrainMood, { maxTip: number; policy: string; riskBase: number }> = {
  generous: {
    maxTip: 5,
    policy: 'Tip aggressively, explore new creators, maximize community impact',
    riskBase: 85,
  },
  strategic: {
    maxTip: 2,
    policy: 'Selective tipping, fee optimization, favor proven creators',
    riskBase: 55,
  },
  cautious: {
    maxTip: 0.5,
    policy: 'Conservation mode, essential tips only, minimize gas spend',
    riskBase: 25,
  },
  survival: {
    maxTip: 0,
    policy: 'EMERGENCY — no tips, consolidate funds across chains, alert user',
    riskBase: 5,
  },
};

function healthToMood(health: number): BrainMood {
  if (health > 80) return 'generous';
  if (health > 50) return 'strategic';
  if (health > 25) return 'cautious';
  return 'survival';
}

// ── Service ───────────────────────────────────────────────────

export class WalletBrainService {
  private currentState: WalletBrainState;
  private history: BrainHistory = { transitions: [], stateSnapshots: [] };
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private recentTxTimestamps: number[] = [];

  constructor() {
    // Initialize with a neutral state; first heartbeat will overwrite
    this.currentState = {
      health: 50,
      mood: 'strategic',
      liquidity: 50,
      diversification: 0,
      velocity: 30,
      riskAppetite: 55,
      maxTipUsdt: 2,
      policy: MOOD_CONFIG.strategic.policy,
      timestamp: new Date().toISOString(),
    };
  }

  /** Start the 60-second heartbeat */
  start(): void {
    if (this.heartbeatTimer) return;
    logger.info('[WalletBrain] Heartbeat started — recalculating every 60s');
    // Immediate first beat
    this.recalculate().catch((err) =>
      logger.warn('[WalletBrain] Initial recalculate failed', { error: String(err) }),
    );
    this.heartbeatTimer = setInterval(() => {
      this.recalculate().catch((err) =>
        logger.warn('[WalletBrain] Heartbeat recalculate failed', { error: String(err) }),
      );
    }, 60_000);
  }

  /** Stop heartbeat */
  stop(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
      logger.info('[WalletBrain] Heartbeat stopped');
    }
  }

  /** Record a transaction timestamp (for velocity calculation) */
  recordTransaction(): void {
    this.recentTxTimestamps.push(Date.now());
    // Keep last 100
    if (this.recentTxTimestamps.length > 100) {
      this.recentTxTimestamps = this.recentTxTimestamps.slice(-100);
    }
  }

  /** Core recalculation — reads real wallet data and computes brain state */
  async recalculate(): Promise<WalletBrainState> {
    const services = ServiceRegistry.getInstance();
    const walletService = services.wallet;

    let totalUsdt = 0;
    let activeChainsCount = 0;
    const chainBalances: number[] = [];

    // ── Read real wallet balances ──
    if (walletService) {
      try {
        const balances = await walletService.getAllBalances();
        for (const bal of balances) {
          const usdt = parseFloat(bal.usdtBalance) || 0;
          const native = parseFloat(bal.nativeBalance) || 0;
          totalUsdt += usdt;
          chainBalances.push(usdt + native * 0.01);
          if (usdt > 0 || native > 0) activeChainsCount++;
        }
      } catch (err) {
        logger.warn('[WalletBrain] Failed to read wallet balances', { error: String(err) });
      }
    }

    // ── Liquidity score ──
    let committedUsdt = 0;
    const memory = services.memory;
    if (memory) {
      const escrowMem = memory.recall('context_escrow_active_count');
      if (escrowMem) {
        const count = parseInt(escrowMem.value, 10);
        committedUsdt += count * 0.01;
      }
    }
    const totalFunds = totalUsdt + committedUsdt;
    const liquidity = totalFunds > 0 ? Math.round((totalUsdt / totalFunds) * 100) : 50;

    // ── Diversification score ──
    const maxChains = 9;
    const diversification = Math.round((activeChainsCount / maxChains) * 100);

    // ── Velocity score ──
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    const recentTxCount = this.recentTxTimestamps.filter((t) => t > fiveMinAgo).length;
    const velocity = Math.min(100, recentTxCount * 15);

    // ── Health score (weighted composite) ──
    const health = Math.round(
      liquidity * 0.4 + diversification * 0.3 + velocity * 0.15 + (totalUsdt > 0 ? 15 : 0),
    );

    // ── Determine mood ──
    const newMood = healthToMood(health);
    const moodCfg = MOOD_CONFIG[newMood];

    // ── Risk appetite ──
    const riskAppetite = Math.round(moodCfg.riskBase + diversification * 0.1 + velocity * 0.05);

    const prevMood = this.currentState.mood;
    const now = new Date().toISOString();

    const newState: WalletBrainState = {
      health,
      mood: newMood,
      liquidity,
      diversification,
      velocity,
      riskAppetite: Math.min(100, riskAppetite),
      maxTipUsdt: moodCfg.maxTip,
      policy: moodCfg.policy,
      timestamp: now,
    };

    // ── Log mood transition ──
    if (prevMood !== newMood) {
      const transition: BrainTransition = {
        from: prevMood,
        to: newMood,
        health,
        reason: `Health ${health}/100 → mood shifted from ${prevMood} to ${newMood}. ` +
          `Liquidity: ${liquidity}, Diversification: ${diversification}, Velocity: ${velocity}`,
        timestamp: now,
      };
      this.history.transitions.push(transition);
      // Keep last 50 transitions
      if (this.history.transitions.length > 50) {
        this.history.transitions = this.history.transitions.slice(-50);
      }
      logger.info(`[WalletBrain] Mood transition: ${prevMood} → ${newMood}`, {
        health,
        reason: transition.reason,
      });
    }

    // ── Store snapshot ──
    this.history.stateSnapshots.push(newState);
    if (this.history.stateSnapshots.length > 120) {
      this.history.stateSnapshots = this.history.stateSnapshots.slice(-120);
    }

    this.currentState = newState;
    return newState;
  }

  /** Get current brain state */
  getState(): WalletBrainState {
    return { ...this.currentState };
  }

  /** Get mood transition history */
  getHistory(): BrainHistory {
    return {
      transitions: [...this.history.transitions],
      stateSnapshots: this.history.stateSnapshots.slice(-30),
    };
  }

  /** Get current mood string */
  getMood(): BrainMood {
    return this.currentState.mood;
  }

  /** Get max tip allowed by current brain state */
  getMaxTip(): number {
    return this.currentState.maxTipUsdt;
  }

  /** Check if tipping is allowed at all */
  canTip(): boolean {
    return this.currentState.mood !== 'survival';
  }
}
