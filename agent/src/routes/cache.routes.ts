// Copyright 2026 Danish A. Licensed under Apache-2.0.
// AeroFyta — Decision Cache Routes

import { Router } from 'express';
import type { DecisionCacheService } from '../services/decision-cache.service.js';

/**
 * Register decision cache routes.
 * Mounts under /api/cache/...
 */
export function registerCacheRoutes(router: Router, service: DecisionCacheService): void {

  // GET /api/cache/stats — cache performance statistics & cost savings
  router.get('/cache/stats', (_req, res) => {
    try {
      res.json({
        ok: true,
        ...service.getStats(),
      });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  // POST /api/cache/clear — clear the decision cache
  router.post('/cache/clear', (_req, res) => {
    try {
      service.clear();
      res.json({ ok: true, message: 'Decision cache cleared' });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });
}
