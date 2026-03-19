// Copyright 2026 Danish A. Licensed under Apache-2.0.
// AeroFyta — Audit Trail API Routes
// Exposes decision audit log, statistics, and proof bundles.

import { Router } from 'express';
import type { AuditTrailService, AuditDecisionType, AuditOutcome } from '../services/audit-trail.service.js';
import type { AutonomousProofService } from '../services/autonomous-proof.service.js';
import { logger } from '../utils/logger.js';

export interface AuditRouteDeps {
  auditTrail: AuditTrailService;
  autonomousProof: AutonomousProofService;
}

/**
 * Register audit trail routes onto the given router.
 *
 * GET  /api/audit/decisions       — Paginated decision list
 * GET  /api/audit/decisions/:id   — Single decision detail
 * GET  /api/audit/stats           — Statistics summary
 * GET  /api/audit/proof           — Full proof bundle (JSON)
 * GET  /api/audit/proof/readme    — Markdown-formatted proof for README
 */
export function registerAuditRoutes(router: Router, deps: AuditRouteDeps): void {
  const { auditTrail, autonomousProof } = deps;

  // GET /api/audit/decisions — paginated decision list with filters
  router.get('/audit/decisions', (req, res) => {
    try {
      const page = parseInt(String(req.query.page ?? '1'), 10) || 1;
      const limit = Math.min(parseInt(String(req.query.limit ?? '50'), 10) || 50, 200);
      const type = req.query.type as AuditDecisionType | undefined;
      const outcome = req.query.outcome as AuditOutcome | undefined;
      const chain = typeof req.query.chain === 'string' ? req.query.chain : undefined;
      const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
      const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;

      const result = auditTrail.getDecisions({
        page,
        limit,
        type,
        outcome,
        chain,
        startDate,
        endDate,
      });

      res.json({
        ok: true,
        ...result,
      });
    } catch (err) {
      logger.error('Audit decisions query failed', { error: String(err) });
      res.status(500).json({ error: 'Failed to query audit decisions' });
    }
  });

  // GET /api/audit/decisions/:id — single decision detail
  router.get('/audit/decisions/:id', (req, res) => {
    try {
      const decision = auditTrail.getDecisionById(req.params.id);
      if (!decision) {
        res.status(404).json({ error: 'Decision not found', decisionId: req.params.id });
        return;
      }
      res.json({ ok: true, decision });
    } catch (err) {
      logger.error('Audit decision lookup failed', { error: String(err) });
      res.status(500).json({ error: 'Failed to fetch decision' });
    }
  });

  // GET /api/audit/stats — statistics summary
  router.get('/audit/stats', (_req, res) => {
    try {
      const stats = auditTrail.getStatistics();
      res.json({ ok: true, ...stats });
    } catch (err) {
      logger.error('Audit stats failed', { error: String(err) });
      res.status(500).json({ error: 'Failed to compute audit statistics' });
    }
  });

  // GET /api/audit/proof — full proof bundle (JSON)
  router.get('/audit/proof', (_req, res) => {
    try {
      const bundle = auditTrail.generateProofBundle();
      res.json({ ok: true, ...bundle });
    } catch (err) {
      logger.error('Proof bundle generation failed', { error: String(err) });
      res.status(500).json({ error: 'Failed to generate proof bundle' });
    }
  });

  // GET /api/audit/proof/readme — markdown proof for README
  router.get('/audit/proof/readme', (req, res) => {
    try {
      const markdown = autonomousProof.generateReadmeProof();
      const contentType = req.query?.format === 'json' ? 'application/json' : 'text/markdown';

      if (contentType === 'application/json') {
        res.json({ ok: true, markdown });
      } else {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.send(markdown);
      }
    } catch (err) {
      logger.error('README proof generation failed', { error: String(err) });
      res.status(500).json({ error: 'Failed to generate README proof' });
    }
  });

  logger.info('Audit trail routes registered');
}
