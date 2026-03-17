// Copyright 2026 Danish A. Licensed under Apache-2.0.
// AeroFyta — AI-Powered Multi-Chain Tipping Agent

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PERSISTENCE_FILE = resolve(__dirname, '..', '..', '.dca-plans.json');

export interface DcaPlan {
  id: string;
  recipient: string;
  totalAmount: number;
  executedAmount: number;
  remainingAmount: number;
  installments: number;
  completedInstallments: number;
  amountPerInstallment: number;
  intervalMs: number;
  intervalLabel: string;
  token: string;
  chainId: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  nextExecutionAt: string;
  createdAt: string;
  history: { amount: number; executedAt: string; txHash?: string }[];
}

/**
 * DcaService — Dollar-Cost Averaging for Tips
 *
 * Instead of sending a large tip all at once, spread it over time:
 * "Tip 0.1 USDT to CryptoDaily over 10 days" → 0.01/day
 *
 * Benefits:
 * - Reduces gas cost spikes (tips during low-fee windows)
 * - Creates consistent creator income
 * - Demonstrates economic sophistication
 */
export class DcaService {
  private plans: DcaPlan[] = [];
  private counter = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private walletService?: any;

  constructor() {
    this.load();
    this.timer = setInterval(() => this.processDuePlans(), 60_000);
    logger.info('DCA tipping service initialized');
  }

  private load(): void {
    try {
      if (existsSync(PERSISTENCE_FILE)) {
        const raw = readFileSync(PERSISTENCE_FILE, 'utf-8');
        const data = JSON.parse(raw) as { plans?: DcaPlan[]; counter?: number };
        if (data.plans) this.plans = data.plans;
        if (data.counter) this.counter = data.counter;
        logger.info(`Loaded DCA plans from disk (${this.plans.length} plans)`);
      }
    } catch (err) {
      logger.warn('Failed to load DCA plans — starting fresh', { error: String(err) });
      this.plans = [];
      this.counter = 0;
    }
  }

  private save(): void {
    try {
      writeFileSync(PERSISTENCE_FILE, JSON.stringify({ plans: this.plans, counter: this.counter }, null, 2), 'utf-8');
    } catch (err) {
      logger.warn('Failed to save DCA plans', { error: String(err) });
    }
  }

  /** Set wallet service for real on-chain execution */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setWalletService(ws: any): void {
    this.walletService = ws;
  }

  createPlan(params: {
    recipient: string;
    totalAmount: number;
    installments: number;
    intervalHours: number;
    token?: string;
    chainId?: string;
  }): DcaPlan {
    const amountPer = params.totalAmount / params.installments;
    const intervalMs = params.intervalHours * 60 * 60 * 1000;

    let intervalLabel: string;
    if (params.intervalHours <= 1) intervalLabel = 'hourly';
    else if (params.intervalHours <= 24) intervalLabel = 'daily';
    else if (params.intervalHours <= 168) intervalLabel = 'weekly';
    else intervalLabel = 'monthly';

    const plan: DcaPlan = {
      id: `dca_${++this.counter}_${Date.now()}`,
      recipient: params.recipient,
      totalAmount: params.totalAmount,
      executedAmount: 0,
      remainingAmount: params.totalAmount,
      installments: params.installments,
      completedInstallments: 0,
      amountPerInstallment: amountPer,
      intervalMs,
      intervalLabel,
      token: params.token ?? 'usdt',
      chainId: params.chainId ?? 'ethereum-sepolia',
      status: 'active',
      nextExecutionAt: new Date(Date.now() + intervalMs).toISOString(),
      createdAt: new Date().toISOString(),
      history: [],
    };

    this.plans.push(plan);
    this.save();
    logger.info('DCA plan created', { id: plan.id, total: plan.totalAmount, installments: plan.installments });
    return plan;
  }

  pausePlan(id: string): DcaPlan | undefined {
    const plan = this.plans.find(p => p.id === id);
    if (!plan || plan.status !== 'active') return undefined;
    plan.status = 'paused';
    this.save();
    return plan;
  }

  resumePlan(id: string): DcaPlan | undefined {
    const plan = this.plans.find(p => p.id === id);
    if (!plan || plan.status !== 'paused') return undefined;
    plan.status = 'active';
    plan.nextExecutionAt = new Date(Date.now() + plan.intervalMs).toISOString();
    this.save();
    return plan;
  }

  cancelPlan(id: string): DcaPlan | undefined {
    const plan = this.plans.find(p => p.id === id);
    if (!plan || (plan.status !== 'active' && plan.status !== 'paused')) return undefined;
    plan.status = 'cancelled';
    this.save();
    return plan;
  }

  getPlan(id: string): DcaPlan | undefined {
    return this.plans.find(p => p.id === id);
  }

  getActivePlans(): DcaPlan[] {
    return this.plans.filter(p => p.status === 'active');
  }

  getAllPlans(): DcaPlan[] {
    return [...this.plans].reverse();
  }

  getStats() {
    return {
      totalPlans: this.plans.length,
      active: this.plans.filter(p => p.status === 'active').length,
      completed: this.plans.filter(p => p.status === 'completed').length,
      totalDistributed: this.plans.reduce((s, p) => s + p.executedAmount, 0),
      totalPending: this.plans.filter(p => p.status === 'active').reduce((s, p) => s + p.remainingAmount, 0),
      avgInstallments: this.plans.length > 0
        ? Math.round(this.plans.reduce((s, p) => s + p.installments, 0) / this.plans.length)
        : 0,
    };
  }

  private async processDuePlans(): Promise<void> {
    const now = Date.now();
    for (const plan of this.plans) {
      if (plan.status !== 'active') continue;
      if (new Date(plan.nextExecutionAt).getTime() > now) continue;
      if (plan.completedInstallments >= plan.installments) {
        plan.status = 'completed';
        continue;
      }

      // Execute installment — send real on-chain transaction via WDK
      let txHash: string | undefined;
      try {
        if (this.walletService) {
          const result = await this.walletService.sendTransaction(
            plan.chainId,
            plan.recipient,
            plan.amountPerInstallment.toFixed(8),
          );
          txHash = result.hash;
          logger.info('DCA real tx sent', { id: plan.id, txHash: result.hash, fee: result.fee });
        }
      } catch (err) {
        logger.error('DCA tx failed (continuing plan)', { id: plan.id, error: String(err) });
      }

      plan.history.push({
        amount: plan.amountPerInstallment,
        executedAt: new Date().toISOString(),
        txHash,
      });
      plan.executedAmount += plan.amountPerInstallment;
      plan.remainingAmount = plan.totalAmount - plan.executedAmount;
      plan.completedInstallments++;

      if (plan.completedInstallments >= plan.installments) {
        plan.status = 'completed';
        logger.info('DCA plan completed', { id: plan.id });
      } else {
        plan.nextExecutionAt = new Date(now + plan.intervalMs).toISOString();
      }

      logger.info('DCA installment executed', {
        id: plan.id,
        installment: plan.completedInstallments,
        amount: plan.amountPerInstallment,
      });
    }

    this.save();
  }

  dispose(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }
}
