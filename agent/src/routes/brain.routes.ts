// Copyright 2026 Danish A. Licensed under Apache-2.0.
// AeroFyta — Wallet-as-Brain™ API routes

import { Router } from 'express';
import type { WalletBrainService } from '../services/wallet-brain.service.js';
import { logger } from '../utils/logger.js';

export function registerBrainRoutes(router: Router, brain: WalletBrainService): void {
  /**
   * GET /api/brain/state — Current brain state (mood, health, dimensions)
   */
  router.get('/brain/state', (_req, res) => {
    try {
      const state = brain.getState();
      res.json({ ok: true, ...state });
    } catch (err) {
      logger.error('Brain state error', { error: err instanceof Error ? err.message : String(err) });
      res.status(500).json({ error: 'Failed to read brain state' });
    }
  });

  /**
   * GET /api/brain/mood — Just the current mood (lightweight)
   */
  router.get('/brain/mood', (_req, res) => {
    try {
      const state = brain.getState();
      res.json({
        ok: true,
        mood: state.mood,
        health: state.health,
        maxTipUsdt: state.maxTipUsdt,
        policy: state.policy,
        canTip: brain.canTip(),
      });
    } catch (err) {
      logger.error('Brain mood error', { error: err instanceof Error ? err.message : String(err) });
      res.status(500).json({ error: 'Failed to read brain mood' });
    }
  });

  /**
   * GET /api/brain/history — Mood transitions and recent state snapshots
   */
  router.get('/brain/history', (_req, res) => {
    try {
      const history = brain.getHistory();
      res.json({ ok: true, ...history });
    } catch (err) {
      logger.error('Brain history error', { error: err instanceof Error ? err.message : String(err) });
      res.status(500).json({ error: 'Failed to read brain history' });
    }
  });

  /**
   * POST /api/brain/recalculate — Force a brain recalculation
   */
  router.post('/brain/recalculate', async (_req, res) => {
    try {
      const state = await brain.recalculate();
      res.json({ ok: true, ...state });
    } catch (err) {
      logger.error('Brain recalculate error', { error: err instanceof Error ? err.message : String(err) });
      res.status(500).json({ error: 'Failed to recalculate brain state' });
    }
  });

  logger.info('Wallet-as-Brain routes mounted at /api/brain/*');
}
