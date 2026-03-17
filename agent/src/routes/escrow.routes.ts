// Copyright 2026 Danish A. Licensed under Apache-2.0.
// AeroFyta — Escrow route handlers (extracted from api.ts)
// Upgraded to HTLC (Hash Time-Locked Contract) pattern

import { Router } from 'express';
import type { EscrowService } from '../services/escrow.service.js';

/**
 * Register escrow-related routes onto the given router.
 * Handles: create (HTLC), list, list active, stats, get by id,
 * claim (with secret), release, refund (timelock-gated), dispute.
 */
export function registerEscrowRoutes(
  router: Router,
  escrowService: EscrowService,
): void {

  // === TIP ESCROW PROTOCOL (HTLC) ========================================

  /** POST /api/escrow — Create a new hash-time-locked escrowed tip.
   *  Returns the escrow record AND the secret preimage (share only with depositor). */
  router.post('/escrow', async (req, res) => {
    const { escrow, secret } = await escrowService.createEscrow(req.body);
    res.status(201).json({
      escrow,
      secret,
      warning: 'Store the secret securely. Share it with the recipient to allow them to claim the escrow. If lost, funds can only be refunded after the timelock expires.',
    });
  });

  /** GET /api/escrow — List all escrows */
  router.get('/escrow', (_req, res) => {
    res.json(escrowService.getAllEscrows());
  });

  /** GET /api/escrow/active — List active (held) escrows */
  router.get('/escrow/active', (_req, res) => {
    res.json(escrowService.getActiveEscrows());
  });

  /** GET /api/escrow/stats — Escrow statistics */
  router.get('/escrow/stats', (_req, res) => {
    res.json(escrowService.getStats());
  });

  /** GET /api/escrow/:id — Get a specific escrow (hashLock visible, secret never stored) */
  router.get('/escrow/:id', (req, res) => {
    const escrow = escrowService.getEscrow(req.params.id);
    if (!escrow) return res.status(404).json({ error: 'Escrow not found' });
    res.json(escrow);
  });

  /** POST /api/escrow/:id/claim — Claim escrowed tip by providing the secret preimage.
   *  Verifies SHA-256(secret) === stored hashLock before releasing funds. */
  router.post('/escrow/:id/claim', async (req, res) => {
    try {
      const secret = req.body.secret as string | undefined;
      if (!secret || typeof secret !== 'string') {
        return res.status(400).json({ error: 'Secret preimage is required to claim an HTLC escrow' });
      }
      const escrow = await escrowService.claimEscrow(req.params.id, secret);
      if (!escrow) return res.status(400).json({ error: 'Cannot claim escrow — invalid secret, timelock expired, or escrow not in claimable state' });
      res.json(escrow);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Claim failed' });
    }
  });

  /** POST /api/escrow/:id/release — Release escrowed tip to recipient.
   *  Accepts optional secret for HTLC verification, or txHash for direct release. */
  router.post('/escrow/:id/release', async (req, res) => {
    try {
      const secret = req.body.secret as string | undefined;
      const txHash = req.body.txHash as string | undefined;
      const escrow = await escrowService.releaseEscrow(req.params.id, txHash, secret);
      if (!escrow) return res.status(404).json({ error: 'Cannot release escrow' });
      res.json(escrow);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Release failed' });
    }
  });

  /** POST /api/escrow/:id/refund — Refund escrowed tip to sender.
   *  Only allowed after the HTLC timelock has expired. */
  router.post('/escrow/:id/refund', async (req, res) => {
    try {
      const reason = req.body.reason as string | undefined;
      const escrow = await escrowService.refundEscrow(req.params.id, reason);
      if (!escrow) return res.status(400).json({ error: 'Cannot refund escrow — timelock may not have expired yet, or escrow is not in held state' });
      res.json(escrow);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Refund failed' });
    }
  });

  /** POST /api/escrow/:id/dispute — Dispute an escrowed tip */
  router.post('/escrow/:id/dispute', (req, res) => {
    const reason = req.body.reason as string | undefined;
    if (!reason) return res.status(400).json({ error: 'Reason is required for disputes' });
    const escrow = escrowService.disputeEscrow(req.params.id, reason);
    if (!escrow) return res.status(404).json({ error: 'Cannot dispute escrow' });
    res.json(escrow);
  });
}
