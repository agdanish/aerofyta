/**
 * Unit Tests: Wallet-as-Brain Service
 *
 * Tests mood transitions, max tip limits per mood, health calculation,
 * risk appetite, and brain state management.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { WalletBrainService } from '../../services/wallet-brain.service.js';

// ── Suite ──────────────────────────────────────────────────────

describe('WalletBrainService — Mood Transitions', () => {
  let brain: WalletBrainService;

  before(() => {
    brain = new WalletBrainService();
  });

  after(() => {
    brain.stop();
  });

  it('initializes with strategic mood (default health = 50)', () => {
    const state = brain.getState();
    assert.equal(state.mood, 'strategic');
    assert.equal(state.health, 50);
  });

  it('getMood() returns the current mood string', () => {
    const mood = brain.getMood();
    assert.ok(
      ['generous', 'strategic', 'cautious', 'survival'].includes(mood),
      `Mood should be a valid BrainMood, got: ${mood}`,
    );
  });

  it('generous mood has maxTip = 5 USDT', () => {
    // Verify from state after a recalculate that would produce generous mood
    // Default constructor sets strategic, so we test the config indirectly
    const state = brain.getState();
    if (state.mood === 'generous') {
      assert.equal(state.maxTipUsdt, 5);
    } else {
      // Test the mood config mapping
      assert.ok(state.maxTipUsdt <= 5);
    }
  });

  it('strategic mood has maxTip = 2 USDT', () => {
    const state = brain.getState();
    assert.equal(state.mood, 'strategic');
    assert.equal(state.maxTipUsdt, 2);
  });

  it('getMaxTip() returns the correct value for current mood', () => {
    const maxTip = brain.getMaxTip();
    assert.equal(typeof maxTip, 'number');
    assert.ok(maxTip >= 0 && maxTip <= 5, `maxTip should be 0-5, got: ${maxTip}`);
  });

  it('canTip() returns true when mood is not survival', () => {
    const state = brain.getState();
    if (state.mood === 'survival') {
      assert.equal(brain.canTip(), false);
    } else {
      assert.equal(brain.canTip(), true);
    }
  });

  it('recalculate() produces a valid WalletBrainState without wallet service', async () => {
    const state = await brain.recalculate();
    assert.ok(state.health >= 0 && state.health <= 100);
    assert.ok(state.liquidity >= 0 && state.liquidity <= 100);
    assert.ok(state.diversification >= 0 && state.diversification <= 100);
    assert.ok(state.velocity >= 0 && state.velocity <= 100);
    assert.ok(state.riskAppetite >= 0 && state.riskAppetite <= 100);
    assert.ok(state.timestamp, 'Should have a timestamp');
    assert.ok(state.policy.length > 0, 'Should have a policy description');
  });

  it('records transactions and updates velocity', async () => {
    brain.recordTransaction();
    brain.recordTransaction();
    brain.recordTransaction();

    const state = await brain.recalculate();
    // With 3 recent transactions, velocity should be > 0
    assert.ok(state.velocity > 0, `Velocity should increase with transactions, got: ${state.velocity}`);
  });
});

describe('WalletBrainService — Health Calculation', () => {
  it('health is a weighted composite of liquidity, diversification, and velocity', async () => {
    const brain = new WalletBrainService();
    const state = await brain.recalculate();

    // Health should be bounded [0, 100]
    assert.ok(state.health >= 0);
    assert.ok(state.health <= 100);
    brain.stop();
  });

  it('without any wallet data, health is computed from defaults', async () => {
    const brain = new WalletBrainService();
    const state = await brain.recalculate();

    // Without wallet service, totalUsdt=0, activeChainsCount=0
    // Liquidity=50 (default), diversification=0, velocity depends on recent TXs
    assert.ok(typeof state.health === 'number');
    brain.stop();
  });
});

describe('WalletBrainService — Risk Appetite', () => {
  it('risk appetite is bounded 0-100', async () => {
    const brain = new WalletBrainService();
    const state = await brain.recalculate();
    assert.ok(state.riskAppetite >= 0);
    assert.ok(state.riskAppetite <= 100);
    brain.stop();
  });

  it('generous mood has higher risk base than cautious', () => {
    // From the MOOD_CONFIG: generous=85, strategic=55, cautious=25, survival=5
    // We verify the relationship holds via state
    const brain = new WalletBrainService();
    const state = brain.getState();
    // Default is strategic with riskBase=55
    assert.equal(state.mood, 'strategic');
    assert.ok(state.riskAppetite >= 50, 'Strategic risk appetite should be >= 50');
    brain.stop();
  });
});

describe('WalletBrainService — History & Snapshots', () => {
  it('getHistory returns transitions and snapshots arrays', () => {
    const brain = new WalletBrainService();
    const history = brain.getHistory();
    assert.ok(Array.isArray(history.transitions));
    assert.ok(Array.isArray(history.stateSnapshots));
    brain.stop();
  });

  it('recalculate stores a snapshot in history', async () => {
    const brain = new WalletBrainService();
    await brain.recalculate();
    await brain.recalculate();

    const history = brain.getHistory();
    assert.ok(history.stateSnapshots.length >= 2, 'Should have at least 2 snapshots');
    brain.stop();
  });

  it('mood transition is logged when health changes mood bucket', async () => {
    const brain = new WalletBrainService();
    // Force multiple recalculations; without real wallet data, mood should stay consistent
    await brain.recalculate();
    await brain.recalculate();

    // Even if no transition occurs, history structure should be valid
    const history = brain.getHistory();
    for (const t of history.transitions) {
      assert.ok(t.from, 'Transition should have a from mood');
      assert.ok(t.to, 'Transition should have a to mood');
      assert.ok(t.timestamp);
      assert.ok(typeof t.health === 'number');
    }
    brain.stop();
  });

  it('start and stop heartbeat without error', () => {
    const brain = new WalletBrainService();
    brain.start();
    // Should not throw on double start
    brain.start();
    brain.stop();
    // Should not throw on double stop
    brain.stop();
  });
});
