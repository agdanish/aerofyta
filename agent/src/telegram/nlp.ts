// Copyright 2026 AeroFyta
// Licensed under the Apache License, Version 2.0
// See LICENSE file for details

/**
 * Natural language parser for Telegram bot messages.
 * Converts free-form text into structured intents.
 */

import type { ChainId, TokenType } from '../types/index.js';

// ── Types ──────────────────────────────────────────────────────

export type IntentType =
  | 'tip'
  | 'balance'
  | 'status'
  | 'help'
  | 'wallets'
  | 'history'
  | 'gas'
  | 'reasoning'
  | 'suggest'
  | 'unknown';

export interface ParsedTipIntent {
  type: 'tip';
  recipient: string;
  amount: number;
  chain?: string;
  token: TokenType;
}

export interface ParsedSimpleIntent {
  type: Exclude<IntentType, 'tip'>;
}

export type ParsedIntent = ParsedTipIntent | ParsedSimpleIntent;

// ── Chain alias map ────────────────────────────────────────────

const CHAIN_ALIASES: Record<string, ChainId> = {
  'ethereum': 'ethereum-sepolia',
  'eth': 'ethereum-sepolia',
  'sepolia': 'ethereum-sepolia',
  'ethereum-sepolia': 'ethereum-sepolia',
  'ton': 'ton-testnet',
  'ton-testnet': 'ton-testnet',
  'toncoin': 'ton-testnet',
  'tron': 'tron-nile',
  'tron-nile': 'tron-nile',
  'trx': 'tron-nile',
  'polygon': 'ethereum-sepolia',
  'matic': 'ethereum-sepolia',
  'bitcoin': 'bitcoin-testnet',
  'btc': 'bitcoin-testnet',
  'solana': 'solana-devnet',
  'sol': 'solana-devnet',
  'gasless': 'ethereum-sepolia-gasless',
  'erc4337': 'ethereum-sepolia-gasless',
  'ton-gasless': 'ton-testnet-gasless',
};

// ── Tip patterns ───────────────────────────────────────────────

const TIP_PATTERNS = [
  // "tip @username 2.5 polygon"
  /tip\s+@?(\S+)\s+([\d.]+)\s*(?:usdt\s+)?(?:on\s+)?(\w+)?/i,
  // "send 2.5 usdt to @username on polygon"
  /send\s+([\d.]+)\s*(?:usdt|native)?\s*to\s+@?(\S+)(?:\s+on\s+(\w+))?/i,
  // "tip @username 2.5 usdt on polygon"
  /tip\s+@?(\S+)\s+([\d.]+)\s*usdt(?:\s+on\s+(\w+))?/i,
  // "2.5 usdt to @username"
  /([\d.]+)\s*(?:usdt|native)\s+to\s+@?(\S+)(?:\s+on\s+(\w+))?/i,
];

// ── Intent keyword patterns ────────────────────────────────────

const INTENT_KEYWORDS: Array<{ pattern: RegExp; type: IntentType }> = [
  { pattern: /\b(balance|balances|funds|how much|wallet balance)\b/i, type: 'balance' },
  { pattern: /\b(status|running|uptime|how.?s the agent)\b/i, type: 'status' },
  { pattern: /\b(help|commands|what can you do|how do i)\b/i, type: 'help' },
  { pattern: /\b(wallets|addresses|my wallet|wallet address)\b/i, type: 'wallets' },
  { pattern: /\b(history|recent tips|past tips|tip history|last tips)\b/i, type: 'history' },
  { pattern: /\b(gas|fees|gas price|gas cost|chain fees)\b/i, type: 'gas' },
  { pattern: /\b(reasoning|thinking|why|explain|thought process|decision)\b/i, type: 'reasoning' },
  { pattern: /\b(suggest|recommend|who should i tip|who to tip)\b/i, type: 'suggest' },
];

// ── Parser ─────────────────────────────────────────────────────

/**
 * Parse natural language text into a structured intent.
 */
export function parseNaturalLanguage(text: string): ParsedIntent {
  const trimmed = text.trim().toLowerCase();

  // Try tip patterns first
  for (const pattern of TIP_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return parseTipMatch(match, pattern);
    }
  }

  // Try intent keywords
  for (const { pattern, type } of INTENT_KEYWORDS) {
    if (pattern.test(trimmed)) {
      return { type } as ParsedSimpleIntent;
    }
  }

  // Check for tip-like words without full pattern match
  if (/\btip\b/i.test(trimmed) && /\d/.test(trimmed)) {
    // Attempt a loose parse: find a number and a recipient-like string
    const amountMatch = trimmed.match(/([\d.]+)/);
    const recipientMatch = trimmed.match(/@(\S+)/);
    if (amountMatch && recipientMatch) {
      const amount = parseFloat(amountMatch[1]);
      if (!isNaN(amount) && amount > 0) {
        return {
          type: 'tip',
          recipient: recipientMatch[1],
          amount,
          token: trimmed.includes('usdt') ? 'usdt' : 'native',
        };
      }
    }
  }

  return { type: 'unknown' };
}

/**
 * Resolve a chain alias to a ChainId.
 */
export function resolveChain(alias: string): ChainId | undefined {
  return CHAIN_ALIASES[alias.toLowerCase()];
}

// ── Internal helpers ───────────────────────────────────────────

function parseTipMatch(match: RegExpMatchArray, pattern: RegExp): ParsedIntent {
  // Different patterns have recipient/amount in different capture groups
  const patternStr = pattern.source;

  let recipient: string;
  let amount: number;
  let chainStr: string | undefined;

  if (patternStr.startsWith('send') || patternStr.startsWith('(')) {
    // "send <amount> to <recipient>" or "<amount> to <recipient>"
    amount = parseFloat(match[1]);
    recipient = match[2];
    chainStr = match[3];
  } else {
    // "tip <recipient> <amount>"
    recipient = match[1];
    amount = parseFloat(match[2]);
    chainStr = match[3];
  }

  if (isNaN(amount) || amount <= 0) {
    return { type: 'unknown' };
  }

  const result: ParsedTipIntent = {
    type: 'tip',
    recipient: recipient.replace(/^@/, ''),
    amount,
    token: pattern.source.includes('usdt') ? 'usdt' : 'native',
  };

  if (chainStr) {
    const resolved = resolveChain(chainStr);
    if (resolved) {
      result.chain = resolved;
    }
  }

  return result;
}
