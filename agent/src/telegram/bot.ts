// Copyright 2026 AeroFyta
// Licensed under the Apache License, Version 2.0
// See LICENSE file for details

/**
 * AeroFyta Telegram Bot — Grammy-based implementation.
 *
 * Provides command-based and natural language interaction with the
 * autonomous multi-chain payment agent. Uses long polling (no webhook
 * server needed), integrates with existing agent services.
 *
 * When running in standalone/demo mode (no backend services), falls
 * back to pre-built demo responses so judges can interact immediately.
 */

import { Bot } from 'grammy';
import { logger } from '../utils/logger.js';
import type { TipFlowAgent } from '../core/agent.js';
import type { WalletService } from '../services/wallet.service.js';
import type { FeeArbitrageService } from '../services/fee-arbitrage.service.js';
import type { AutonomousLoopService } from '../services/autonomous-loop.service.js';
import {
  handleStart,
  handleHelp,
  handleTip,
  handleBalance,
  handleStatus,
  handleWallets,
  handleHistory,
  handleGas,
  handleReasoning,
  handleSuggest,
} from './commands.js';
import type { CommandDeps } from './commands.js';
import {
  demoStart,
  demoHelp,
  demoTip,
  demoBalance,
  demoStatus,
  demoWallets,
  demoHistory,
  demoGas,
  demoReasoning,
  demoMood,
  demoPulse,
  demoEscrow,
  demoCreators,
  demoDca,
  demoSubscribe,
  demoKill,
  demoYield,
  demoBridge,
  demoSwap,
  demoPolicy,
  demoAudit,
  demoMetrics,
} from './demo-responses.js';
import { parseNaturalLanguage } from './nlp.js';

// ── Types ──────────────────────────────────────────────────────

export interface TelegramGrammyBotOptions {
  token: string;
  agent: TipFlowAgent;
  wallet: WalletService;
  feeArbitrage: FeeArbitrageService;
  autonomousLoop: AutonomousLoopService | null;
}

/** Options for standalone mode (no backend services needed) */
export interface TelegramStandaloneOptions {
  token: string;
}

export interface TelegramGrammyBotStatus {
  connected: boolean;
  username: string | null;
  messageCount: number;
  startedAt: string | null;
  mode: 'full' | 'demo';
}

// ── Bot class ──────────────────────────────────────────────────

export class TelegramGrammyBot {
  private bot: Bot;
  private deps: CommandDeps | null;
  private botUsername: string | null = null;
  private messageCount = 0;
  private startedAt: string | null = null;
  private running = false;
  private demoMode: boolean;

  /** Full mode: all backend services available */
  constructor(options: TelegramGrammyBotOptions);
  /** Standalone/demo mode: no backend services */
  constructor(options: TelegramStandaloneOptions);
  constructor(options: TelegramGrammyBotOptions | TelegramStandaloneOptions) {
    this.bot = new Bot(options.token);

    if ('agent' in options) {
      this.deps = {
        agent: options.agent,
        wallet: options.wallet,
        feeArbitrage: options.feeArbitrage,
        autonomousLoop: options.autonomousLoop,
      };
      this.demoMode = !options.agent;
    } else {
      this.deps = null;
      this.demoMode = true;
    }

    this.registerCommands();
    this.registerNaturalLanguage();
    this.registerErrorHandler();
  }

  /** Update services after WDK initialization completes */
  updateServices(feeArbitrage: FeeArbitrageService, autonomousLoop: AutonomousLoopService | null): void {
    if (this.deps) {
      this.deps.feeArbitrage = feeArbitrage;
      this.deps.autonomousLoop = autonomousLoop;
      this.demoMode = false;
      logger.info('Telegram bot services updated with full WDK backend');
    }
  }

  /** Start the bot with long polling */
  async start(): Promise<void> {
    try {
      const me = await this.bot.api.getMe();
      this.botUsername = me.username ?? me.first_name;
      this.startedAt = new Date().toISOString();
      this.running = true;

      const modeLabel = this.demoMode ? 'DEMO' : 'FULL';
      logger.info(`Telegram bot connected: @${this.botUsername} [${modeLabel} mode]`);

      if (this.deps) {
        this.deps.agent.addActivity({
          type: 'system',
          message: `Telegram bot connected: @${this.botUsername} (Grammy)`,
        });
      }

      // Start long polling (non-blocking)
      this.bot.start({
        onStart: () => {
          logger.info('Telegram bot polling started');
        },
      });
    } catch (err) {
      logger.error('Failed to start Telegram bot', { error: String(err) });
      throw err;
    }
  }

  /** Stop the bot */
  async stop(): Promise<void> {
    this.running = false;
    await this.bot.stop();
    logger.info('Telegram bot stopped');
  }

  /** Get bot status */
  getStatus(): TelegramGrammyBotStatus {
    return {
      connected: this.running && this.botUsername !== null,
      username: this.botUsername,
      messageCount: this.messageCount,
      startedAt: this.startedAt,
      mode: this.demoMode ? 'demo' : 'full',
    };
  }

  // ── Command registration ───────────────────────────────────

  private registerCommands(): void {
    const deps = this.deps;
    const useDemoFallback = this.demoMode;

    const wrap = (
      liveHandler: ((ctx: import('grammy').Context, d: CommandDeps) => Promise<void>) | null,
      demoHandler: (ctx: import('grammy').Context) => Promise<void>,
    ) => {
      return async (ctx: import('grammy').Context) => {
        this.messageCount++;
        if (!useDemoFallback && deps && liveHandler) {
          try {
            await liveHandler(ctx, deps);
          } catch (_err) {
            // Backend call failed — fall back to demo response
            logger.warn('Backend unavailable, using demo response');
            await demoHandler(ctx);
          }
        } else {
          await demoHandler(ctx);
        }
      };
    };

    this.bot.command('start', wrap(handleStart, demoStart));
    this.bot.command('help', wrap(handleHelp, demoHelp));
    this.bot.command('tip', wrap(handleTip, demoTip));
    this.bot.command('balance', wrap(handleBalance, demoBalance));
    this.bot.command('status', wrap(handleStatus, demoStatus));
    this.bot.command('wallets', wrap(handleWallets, demoWallets));
    this.bot.command('history', wrap(handleHistory, demoHistory));
    this.bot.command('gas', wrap(handleGas, demoGas));
    this.bot.command('reasoning', wrap(handleReasoning, demoReasoning));
    this.bot.command('mood', wrap(null, demoMood));
    this.bot.command('pulse', wrap(null, demoPulse));
    this.bot.command('escrow', wrap(null, demoEscrow));
    this.bot.command('creators', wrap(null, demoCreators));
    this.bot.command('dca', wrap(null, demoDca));
    this.bot.command('subscribe', wrap(null, demoSubscribe));
    this.bot.command('kill', wrap(null, demoKill));
    this.bot.command('yield', wrap(null, demoYield));
    this.bot.command('bridge', wrap(null, demoBridge));
    this.bot.command('swap', wrap(null, demoSwap));
    this.bot.command('policy', wrap(null, demoPolicy));
    this.bot.command('audit', wrap(null, demoAudit));
    this.bot.command('metrics', wrap(null, demoMetrics));
  }

  // ── Natural language handler ───────────────────────────────

  private registerNaturalLanguage(): void {
    const deps = this.deps;

    this.bot.on('message:text', async (ctx) => {
      const text = ctx.message.text;

      // Skip if it looks like an unrecognized command
      if (text.startsWith('/')) {
        this.messageCount++;
        await ctx.reply('Unknown command. Type /help for available commands.');
        return;
      }

      this.messageCount++;
      const intent = parseNaturalLanguage(text);

      // In demo mode, route NLP intents to demo handlers
      if (this.demoMode || !deps) {
        switch (intent.type) {
          case 'tip': await demoTip(ctx); break;
          case 'balance': await demoBalance(ctx); break;
          case 'status': await demoStatus(ctx); break;
          case 'help': await demoHelp(ctx); break;
          case 'wallets': await demoWallets(ctx); break;
          case 'history': await demoHistory(ctx); break;
          case 'gas': await demoGas(ctx); break;
          case 'reasoning': await demoReasoning(ctx); break;
          case 'suggest': await demoHelp(ctx); break;
          case 'unknown':
          default:
            await ctx.reply(
              'I didn\'t understand that. Try commands like:\n' +
              '  "tip @sarah 2.5 polygon"\n' +
              '  "check my balance"\n' +
              '  "who should I tip?"\n\n' +
              'Type /help for all commands.',
            );
            break;
        }
        return;
      }

      // Full mode — use live handlers
      switch (intent.type) {
        case 'tip': {
          const tipText = `/tip ${intent.recipient} ${intent.amount}${intent.chain ? ` ${intent.chain}` : ''}`;
          const originalText = ctx.message.text;
          Object.defineProperty(ctx.message, 'text', { value: tipText, writable: true });
          await handleTip(ctx, deps);
          Object.defineProperty(ctx.message, 'text', { value: originalText, writable: true });
          break;
        }
        case 'balance': await handleBalance(ctx, deps); break;
        case 'status': await handleStatus(ctx, deps); break;
        case 'help': await handleHelp(ctx, deps); break;
        case 'wallets': await handleWallets(ctx, deps); break;
        case 'history': await handleHistory(ctx, deps); break;
        case 'gas': await handleGas(ctx, deps); break;
        case 'reasoning': await handleReasoning(ctx, deps); break;
        case 'suggest': await handleSuggest(ctx, deps); break;
        case 'unknown':
        default:
          await ctx.reply(
            'I didn\'t understand that. Try commands like:\n' +
            '  "tip @sarah 2.5 polygon"\n' +
            '  "check my balance"\n' +
            '  "who should I tip?"\n\n' +
            'Type /help for all commands.',
          );
          break;
      }
    });
  }

  // ── Error handler ──────────────────────────────────────────

  private registerErrorHandler(): void {
    this.bot.catch((err) => {
      logger.error('Telegram bot error', { error: String(err.error) });
    });
  }
}
