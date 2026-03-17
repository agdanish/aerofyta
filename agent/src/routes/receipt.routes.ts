// Copyright 2026 Danish A. Licensed under Apache-2.0.
// AeroFyta — Cryptographic tip receipt route handlers (extracted from api.ts)

import { Router } from 'express';
import { logger } from '../utils/logger.js';
import type { ReceiptService } from '../services/receipt.service.js';

/**
 * Register receipt-related routes onto the given router.
 * Handles: get receipt, verify receipt, list receipts.
 */
export function registerReceiptRoutes(
  router: Router,
  receiptService: ReceiptService | null,
): void {

  /** GET /api/receipt/:tipId — Get cryptographic receipt for a tip */
  router.get('/receipt/:tipId', (_req, res) => {
    const receipt = receiptService?.getReceipt(_req.params.tipId);
    if (!receipt) {
      res.status(404).json({ error: 'Receipt not found' });
      return;
    }
    res.json({ receipt });
  });

  /** POST /api/receipt/verify — Verify a cryptographic receipt */
  router.post('/receipt/verify', async (req, res) => {
    try {
      const { receipt } = req.body;
      if (!receipt) {
        res.status(400).json({ error: 'receipt object is required' });
        return;
      }
      const verification = await receiptService?.verifyReceipt(receipt);
      res.json({ verification });
    } catch (err) {
      logger.error('Receipt verification failed', { error: String(err) });
      res.status(500).json({ error: 'Receipt verification failed' });
    }
  });

  /** GET /api/receipts — List all receipts */
  router.get('/receipts', (_req, res) => {
    res.json({ receipts: receiptService?.getAllReceipts() ?? [], total: receiptService?.getCount() ?? 0 });
  });
}
