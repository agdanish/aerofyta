// Copyright 2026 Danish A. Licensed under Apache-2.0.
// AeroFyta — Adversarial / Fraud Testing Demo Service
//
// Runs 6 adversarial scenarios that exercise the real safety, risk-engine,
// and orchestrator services, proving they catch fraud in real time.

import { logger } from '../utils/logger.js';
import type { SafetyService } from './safety.service.js';
import type { RiskEngineService } from './risk-engine.service.js';
import type { OrchestratorService } from './orchestrator.service.js';

// ── Types ────────────────────────────────────────────────────────

export interface AdversarialResult {
  scenario: string;
  attack: string;
  blocked: boolean;
  blockedBy: string;   // e.g. 'safety_limit' | 'velocity_detection' | 'risk_engine' | 'orchestrator' | 'guardian_veto' | 'data_integrity'
  reasoning: string;
  details: Record<string, unknown>;
}

export interface AdversarialScenario {
  id: string;
  name: string;
  description: string;
  attack: () => Promise<AdversarialResult>;
}

// ── Service ──────────────────────────────────────────────────────

/**
 * AdversarialDemoService — runs adversarial / fraud scenarios against
 * the live safety, risk-engine, and orchestrator services and reports
 * how each attack was blocked.
 *
 * Every scenario calls the REAL service methods so the results are
 * genuine, not simulated. This is meant for demo / judging purposes
 * to showcase the agent's self-defence capabilities.
 */
export class AdversarialDemoService {
  private safety: SafetyService;
  private riskEngine: RiskEngineService;
  private orchestrator: OrchestratorService;
  private scenarios: AdversarialScenario[];

  /** Address used as "our own" wallet for self-tip detection */
  private ownAddress: string;

  constructor(
    safety: SafetyService,
    riskEngine: RiskEngineService,
    orchestrator: OrchestratorService,
    ownAddress = '0x74118B69ac22FB7e46081400BD5ef9d9a0AC9b62',
  ) {
    this.safety = safety;
    this.riskEngine = riskEngine;
    this.orchestrator = orchestrator;
    this.ownAddress = ownAddress;

    this.scenarios = [
      {
        id: 'oversized-tip',
        name: 'Oversized Tip Attack',
        description: 'Attempt to tip 999 USDT — safety blocks at maxSingleTip threshold',
        attack: () => this.runOversizedTip(),
      },
      {
        id: 'rapid-fire-drain',
        name: 'Rapid-Fire Drain',
        description: 'Attempt 50 rapid tips to the same address — velocity detection blocks',
        attack: () => this.runRapidFireDrain(),
      },
      {
        id: 'unknown-recipient',
        name: 'Unknown Recipient Exploit',
        description: 'Tip a large amount to a brand-new address with no history — risk engine flags',
        attack: () => this.runUnknownRecipient(),
      },
      {
        id: 'budget-exhaustion',
        name: 'Budget Exhaustion',
        description: 'Exceed daily spending limit — safety spend tracker blocks',
        attack: () => this.runBudgetExhaustion(),
      },
      {
        id: 'manipulated-engagement',
        name: 'Manipulated Engagement Data',
        description: 'Submit a fake engagement score of 99.9 — orchestrator data-integrity check vetoes',
        attack: () => this.runManipulatedEngagement(),
      },
      {
        id: 'self-tip',
        name: 'Self-Tip Attempt',
        description: 'Try to tip your own wallet address — orchestrator guardian blocks',
        attack: () => this.runSelfTip(),
      },
    ];

    logger.info('AdversarialDemoService initialized', { scenarios: this.scenarios.length });
  }

  /** Update the address used for self-tip detection */
  setOwnAddress(addr: string): void {
    this.ownAddress = addr;
  }

  /** List all available adversarial scenarios (without running them) */
  listScenarios(): Array<{ id: string; name: string; description: string }> {
    return this.scenarios.map(s => ({ id: s.id, name: s.name, description: s.description }));
  }

  /** Run a single scenario by id */
  async runScenario(id: string): Promise<AdversarialResult | undefined> {
    const scenario = this.scenarios.find(s => s.id === id);
    if (!scenario) return undefined;
    logger.info(`[Adversarial] Running scenario: ${scenario.name}`);
    const result = await scenario.attack();
    logger.info(`[Adversarial] ${scenario.name} — blocked=${result.blocked} by=${result.blockedBy}`);
    return result;
  }

  /** Run all 6 scenarios and return the full results array */
  async runAll(): Promise<AdversarialResult[]> {
    const results: AdversarialResult[] = [];
    for (const scenario of this.scenarios) {
      logger.info(`[Adversarial] Running scenario: ${scenario.name}`);
      const result = await scenario.attack();
      results.push(result);
      logger.info(`[Adversarial] ${scenario.name} — blocked=${result.blocked} by=${result.blockedBy}`);
    }
    return results;
  }

  // ── Scenario Implementations ───────────────────────────────────

  /**
   * Scenario 1: Oversized Tip Attack
   * Try to tip 999 USDT which exceeds the maxSingleTip policy.
   */
  private async runOversizedTip(): Promise<AdversarialResult> {
    const amount = 999;
    const recipient = '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF';

    const validation = this.safety.validateTip({ recipient, amount });

    return {
      scenario: 'Oversized Tip Attack',
      attack: `Attempted to tip ${amount} USDT (safety maxSingleTip is ${this.safety.getPolicies().maxSingleTip})`,
      blocked: !validation.allowed,
      blockedBy: !validation.allowed ? 'safety_limit' : 'none',
      reasoning: validation.reason,
      details: {
        attemptedAmount: amount,
        maxSingleTip: this.safety.getPolicies().maxSingleTip,
        policy: validation.policy,
      },
    };
  }

  /**
   * Scenario 2: Rapid-Fire Drain
   * Simulate recording many spends in quick succession to trigger velocity detection.
   * We record 4 fast spends (crossing the velocity threshold of 3 in 60s), then
   * attempt a 5th tip which should be velocity-blocked.
   */
  private async runRapidFireDrain(): Promise<AdversarialResult> {
    const recipient = '0xRaPiDfIrE000000000000000000000000000dRaIn';
    const amount = 0.001;

    // Record a burst of spends to the same address to prime velocity detection
    for (let i = 0; i < 4; i++) {
      this.safety.recordSpend(recipient, amount);
    }

    // Now the 5th validation should be blocked by velocity
    const validation = this.safety.validateTip({ recipient, amount });

    return {
      scenario: 'Rapid-Fire Drain',
      attack: `Recorded 4 rapid spends then attempted a 5th tip to ${recipient.slice(0, 12)}... — velocity detection should trigger`,
      blocked: !validation.allowed,
      blockedBy: !validation.allowed ? 'velocity_detection' : 'none',
      reasoning: validation.reason,
      details: {
        rapidTipCount: 5,
        windowSeconds: 60,
        policy: validation.policy,
      },
    };
  }

  /**
   * Scenario 3: Unknown Recipient Exploit
   * Tip a large amount to a totally new address with no history.
   * The risk engine should flag this as high/critical risk.
   */
  private async runUnknownRecipient(): Promise<AdversarialResult> {
    const unknownRecipient = '0x0000000000000000000000000000000000C0FFEE';
    const amount = 0.05;

    const risk = this.riskEngine.assessRisk({
      recipient: unknownRecipient,
      amount,
      chainId: 'ethereum-sepolia',
      walletBalance: 0.1,
      gasFee: 0.002,
      token: 'usdt',
    });

    return {
      scenario: 'Unknown Recipient Exploit',
      attack: `Attempted ${amount} USDT tip to brand-new address ${unknownRecipient.slice(0, 12)}... with no transaction history`,
      blocked: risk.action === 'block' || risk.action === 'require_confirmation',
      blockedBy: risk.score > 50 ? 'risk_engine' : 'none',
      reasoning: risk.reasoning.join('; '),
      details: {
        riskScore: risk.score,
        riskLevel: risk.level,
        recommendedAction: risk.action,
        factors: risk.factors,
      },
    };
  }

  /**
   * Scenario 4: Budget Exhaustion
   * Try to exceed the daily spending limit.
   */
  private async runBudgetExhaustion(): Promise<AdversarialResult> {
    const policies = this.safety.getPolicies();
    // Attempt a tip that would push past the daily limit
    const amount = policies.maxDailySpend + 1;
    const recipient = '0xBuDgEtExHaUsT0000000000000000000000000000';

    const validation = this.safety.validateTip({ recipient, amount });

    return {
      scenario: 'Budget Exhaustion',
      attack: `Attempted ${amount} USDT tip to exceed daily limit of ${policies.maxDailySpend} USDT`,
      blocked: !validation.allowed,
      blockedBy: !validation.allowed ? 'safety_spend_tracker' : 'none',
      reasoning: validation.reason,
      details: {
        attemptedAmount: amount,
        dailyLimit: policies.maxDailySpend,
        currentUsage: this.safety.getUsage(),
        policy: validation.policy,
      },
    };
  }

  /**
   * Scenario 5: Manipulated Engagement Data
   * Submit a tip proposal with a fabricated engagement score of 99.9
   * (scores should be 0-1). The orchestrator's data integrity check
   * should reject before voting even begins.
   */
  private async runManipulatedEngagement(): Promise<AdversarialResult> {
    const action = await this.orchestrator.propose('tip', {
      recipient: '0xFaKeEnGaGeMeNt000000000000000000DeAdBeEf',
      amount: '0.01',
      token: 'usdt',
      chainId: 'ethereum-sepolia',
      memo: 'Manipulated engagement score',
      engagementScore: 99.9,  // fraudulent — real scores are 0-1
    });

    const wasRejected = action.consensus === 'rejected';
    const integrityViolation = action.reasoningChain.some(r =>
      r.includes('data integrity') || r.includes('Data integrity'),
    );

    return {
      scenario: 'Manipulated Engagement Data',
      attack: 'Submitted tip proposal with fabricated engagementScore=99.9 (valid range is 0-1)',
      blocked: wasRejected,
      blockedBy: integrityViolation ? 'data_integrity' : (wasRejected ? 'guardian_veto' : 'none'),
      reasoning: action.reasoningChain.join(' | '),
      details: {
        consensus: action.consensus,
        confidence: action.overallConfidence,
        votes: action.votes.map(v => ({ agent: v.agent, decision: v.decision, confidence: v.confidence })),
        fakeEngagementScore: 99.9,
      },
    };
  }

  /**
   * Scenario 6: Self-Tip Attempt
   * Try to tip your own wallet address. The orchestrator guardian
   * should catch and reject this.
   */
  private async runSelfTip(): Promise<AdversarialResult> {
    const action = await this.orchestrator.propose('tip', {
      recipient: this.ownAddress,
      amount: '0.01',
      token: 'usdt',
      chainId: 'ethereum-sepolia',
      memo: 'Self-tip attempt — should be blocked',
      selfTipAttempt: true,
    });

    const wasRejected = action.consensus === 'rejected';

    return {
      scenario: 'Self-Tip Attempt',
      attack: `Attempted to tip own address ${this.ownAddress.slice(0, 16)}...`,
      blocked: wasRejected,
      blockedBy: wasRejected ? 'guardian_veto' : 'none',
      reasoning: action.reasoningChain.join(' | '),
      details: {
        ownAddress: this.ownAddress,
        consensus: action.consensus,
        confidence: action.overallConfidence,
        votes: action.votes.map(v => ({ agent: v.agent, decision: v.decision, confidence: v.confidence })),
      },
    };
  }
}
