// Copyright 2026 AeroFyta
// Licensed under the Apache License, Version 2.0
// See LICENSE file for details

/**
 * AeroFyta Telegram Bot — Grammy-based implementation.
 *
 * Provides command-based and natural language interaction with the
 * autonomous multi-chain payment agent. Uses long polling (no webhook
 * server needed), integrates with existing agent services.
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
import { parseNaturalLanguage } from './nlp.js';

// ── Types ──────────────────────────────────────────────────────

export interface TelegramGrammyBotOptions {
  token: string;
  agent: TipFlowAgent;
  wallet: WalletService;
  feeArbitrage: FeeArbitrageService;
  autonomousLoop: AutonomousLoopService | null;
}

export interface TelegramGrammyBotStatus {
  connected: boolean;
  username: string | null;
  messageCount: number;
  startedAt: string | null;
}

// ── Bot class ──────────────────────────────────────────────────

export class TelegramGrammyBot {
  private bot: Bot;
  private deps: CommandDeps;
  private botUsername: string | null = null;
  private messageCount = 0;
  private startedAt: string | null = null;
  private running = false;

  constructor(options: TelegramGrammyBotOptions) {
    this.bot = new Bot(options.token);
    this.deps = {
      agent: options.agent,
      wallet: options.wallet,
      feeArbitrage: options.feeArbitrage,
      autonomousLoop: options.autonomousLoop,
    };

    this.registerCommands();
    this.registerNaturalLanguage();
    this.registerErrorHandler();
  }

  /** Start the bot with long polling */
  async start(): Promise<void> {
    try {
      const me = await this.bot.api.getMe();
      this.botUsername = me.username ?? me.first_name;
      this.startedAt = new Date().toISOString();
      this.running = true;

      logger.info(`Telegram Grammy bot connected: @${this.botUsername}`);
      this.deps.agent.addActivity({
        type: 'system',
        message: `Telegram bot connected: @${this.botUsername} (Grammy)`,
      });

      // Start long polling (non-blocking)
      this.bot.start({
        onStart: () => {
          logger.info('Telegram Grammy bot polling started');
        },
      });
    } catch (err) {
      logger.error('Failed to start Telegram Grammy bot', { error: String(err) });
      throw err;
    }
  }

  /** Stop the bot */
  async stop(): Promise<void> {
    this.running = false;
    await this.bot.stop();
    logger.info('Telegram Grammy bot stopped');
  }

  /** Get bot status */
  getStatus(): TelegramGrammyBotStatus {
    return {
      connected: this.running && this.botUsername !== null,
      username: this.botUsername,
      messageCount: this.messageCount,
      startedAt: this.startedAt,
    };
  }

  // ── Command registration ───────────────────────────────────

  private registerCommands(): void {
    const deps = this.deps;

    this.bot.command('start', async (ctx) => {
      this.messageCount++;
      await handleStart(ctx, deps);
    });

    this.bot.command('help', async (ctx) => {
      this.messageCount++;
      await handleHelp(ctx, deps);
    });

    this.bot.command('tip', async (ctx) => {
      this.messageCount++;
      await handleTip(ctx, deps);
    });

    this.bot.command('balance', async (ctx) => {
      this.messageCount++;
      await handleBalance(ctx, deps);
    });

    this.bot.command('status', async (ctx) => {
      this.messageCount++;
      await handleStatus(ctx, deps);
    });

    this.bot.command('wallets', async (ctx) => {
      this.messageCount++;
      await handleWallets(ctx, deps);
    });

    this.bot.command('history', async (ctx) => {
      this.messageCount++;
      await handleHistory(ctx, deps);
    });

    this.bot.command('gas', async (ctx) => {
      this.messageCount++;
      await handleGas(ctx, deps);
    });

    this.bot.command('reasoning', async (ctx) => {
      this.messageCount++;
      await handleReasoning(ctx, deps);
    });
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

      switch (intent.type) {
        case 'tip': {
          // Rewrite as a /tip-like message so we can reuse the handler
          const tipText = `/tip ${intent.recipient} ${intent.amount}${intent.chain ? ` ${intent.chain}` : ''}`;
          // Create a synthetic message text for the handler
          const originalText = ctx.message.text;
          Object.defineProperty(ctx.message, 'text', { value: tipText, writable: true });
          await handleTip(ctx, deps);
          Object.defineProperty(ctx.message, 'text', { value: originalText, writable: true });
          break;
        }
        case 'balance':
          await handleBalance(ctx, deps);
          break;
        case 'status':
          await handleStatus(ctx, deps);
          break;
        case 'help':
          await handleHelp(ctx, deps);
          break;
        case 'wallets':
          await handleWallets(ctx, deps);
          break;
        case 'history':
          await handleHistory(ctx, deps);
          break;
        case 'gas':
          await handleGas(ctx, deps);
          break;
        case 'reasoning':
          await handleReasoning(ctx, deps);
          break;
        case 'suggest':
          await handleSuggest(ctx, deps);
          break;
        case 'unknown':
        default:
          await ctx.reply(
            'I didn\'t understand that. Try commands like:\n' +
            '• "tip @sarah 2.5 polygon"\n' +
            '• "check my balance"\n' +
            '• "who should I tip?"\n\n' +
            'Type /help for all commands.',
          );
          break;
      }
    });
  }

  // ── Error handler ──────────────────────────────────────────

  private registerErrorHandler(): void {
    this.bot.catch((err) => {
      logger.error('Telegram Grammy bot error', { error: String(err.error) });
    });
  }
}
