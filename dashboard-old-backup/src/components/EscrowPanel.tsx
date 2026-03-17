// Copyright 2026 Danish A. Licensed under Apache-2.0.
import { useState, useEffect } from 'react';
import { Lock, Unlock, RotateCcw, Clock, Plus, X, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { Skeleton } from './Skeleton';

interface EscrowTip {
  id: string;
  sender: string;
  recipient: string;
  amount: string;
  token: string;
  chainId: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  releaseCondition: string;
  memo?: string;
  txHash?: string;
}

interface EscrowStats {
  totalEscrowed: number;
  totalReleased: number;
  totalRefunded: number;
  activeCount: number;
  avgHoldTime: number;
  disputeRate: number;
}

const RELEASE_CONDITIONS = [
  { value: 'manual', label: 'Manual Release', desc: 'Sender manually releases the tip' },
  { value: 'auto_after_24h', label: 'Auto (24h)', desc: 'Automatically released after 24 hours' },
  { value: 'creator_confirm', label: 'Creator Confirm', desc: 'Recipient must acknowledge the tip' },
  { value: 'watch_time', label: 'Watch Time', desc: 'Released after viewer reaches watch time threshold' },
];

interface ReleaseResult {
  escrowId: string;
  txHash?: string;
}

export function EscrowPanel() {
  const [escrows, setEscrows] = useState<EscrowTip[]>([]);
  const [stats, setStats] = useState<EscrowStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createRecipient, setCreateRecipient] = useState('');
  const [createAmount, setCreateAmount] = useState('');
  const [createToken, setCreateToken] = useState('usdt');
  const [createChain] = useState('ethereum-sepolia');
  const [createCondition, setCreateCondition] = useState('manual');
  const [createMemo, setCreateMemo] = useState('');
  const [creating, setCreating] = useState(false);

  // Dispute state
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputing, setDisputing] = useState(false);

  // Release / confirm delivery feedback
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [releaseResult, setReleaseResult] = useState<ReleaseResult | null>(null);

  const load = async () => {
    try {
      const [e, s] = await Promise.all([api.escrowActive(), api.escrowStats()]);
      setEscrows(e as unknown as EscrowTip[]);
      setStats(s as unknown as EscrowStats);
    } catch (err) { showError('load escrows', err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!createRecipient.trim() || !createAmount.trim()) return;
    setError(null);
    setCreating(true);
    try {
      await api.escrowCreate({
        recipient: createRecipient.trim(),
        amount: createAmount.trim(),
        token: createToken,
        chainId: createChain,
        releaseCondition: createCondition,
        memo: createMemo.trim() || undefined,
      });
      setShowCreate(false);
      setCreateRecipient('');
      setCreateAmount('');
      setCreateMemo('');
      await load();
    } catch (err) { showError('create escrow', err); }
    setCreating(false);
  };

  const release = async (id: string) => {
    setError(null);
    setReleasingId(id);
    try {
      const result = await api.escrowRelease(id) as unknown as EscrowTip;
      setReleaseResult({ escrowId: id, txHash: result.txHash });
      await load();
    } catch (err) { showError('release escrow', err); }
    setReleasingId(null);
  };

  const confirmDelivery = async (id: string) => {
    setError(null);
    setReleasingId(id);
    try {
      const result = await api.escrowRelease(id, { trigger: 'creator_confirm' }) as unknown as EscrowTip;
      setReleaseResult({ escrowId: id, txHash: result.txHash });
      await load();
    } catch (err) { showError('confirm delivery', err); }
    setReleasingId(null);
  };

  const refund = async (id: string) => {
    setError(null);
    try { await api.escrowRefund(id, 'User requested refund'); await load(); } catch (err) { showError('refund escrow', err); }
  };

  const handleDispute = async (id: string) => {
    if (!disputeReason.trim()) return;
    setError(null);
    setDisputing(true);
    try {
      await api.escrowDispute(id, disputeReason.trim());
      setDisputeId(null);
      setDisputeReason('');
      await load();
    } catch (err) { showError('submit dispute', err); }
    setDisputing(false);
  };

  const showError = (action: string, err: unknown) => {
    const msg = `Failed to ${action}: ${err instanceof Error ? err.message : 'Unknown error'}`;
    setError(msg);
    setTimeout(() => setError(null), 5000);
  };

  const isHeldOrActive = (status: string) => status === 'held' || status === 'active';

  if (loading) return (
    <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="text-line" width="140px" height="16px" />
        <Skeleton variant="text-line" width="50px" height="14px" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1,2,3].map(i => <Skeleton key={i} variant="card" height="56px" />)}
      </div>
      <Skeleton variant="card" height="90px" />
    </div>
  );

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Lock className="w-4 h-4 text-accent" />
          Tip Escrow Protocol
        </h3>
        <div className="flex items-center gap-2">
          {stats && <span className="text-xs text-text-secondary">{stats.activeCount} active</span>}
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="text-xs px-2.5 py-1 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors flex items-center gap-1 btn-press"
          >
            {showCreate ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {showCreate ? 'Cancel' : 'New Escrow'}
          </button>
        </div>
      </div>

      {/* ── ERROR BANNER ── */}
      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 animate-slide-down flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="flex-1 text-xs font-medium text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400/60 hover:text-red-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── SUCCESS BANNER ── */}
      {releaseResult && (
        <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/10 animate-slide-down flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-green-400">Escrow released successfully</p>
            {releaseResult.txHash && (
              <p className="text-xs text-green-400/70 mt-0.5 font-mono truncate">
                TX: {releaseResult.txHash}
              </p>
            )}
          </div>
          <button
            onClick={() => setReleaseResult(null)}
            className="text-green-400/60 hover:text-green-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── CREATE ESCROW FORM ── */}
      {showCreate && (
        <div className="p-4 rounded-lg border border-accent/20 bg-accent/5 space-y-3 animate-slide-down">
          <h4 className="text-xs font-semibold text-accent flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Create Escrowed Tip
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={createRecipient}
              onChange={e => setCreateRecipient(e.target.value)}
              placeholder="Recipient address..."
              className="col-span-2 px-3 py-2 rounded-lg bg-surface-2 border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-border transition-colors font-mono"
            />
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={createAmount}
              onChange={e => setCreateAmount(e.target.value)}
              placeholder="Amount"
              className="px-3 py-2 rounded-lg bg-surface-2 border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-border transition-colors"
            />
            <select
              value={createToken}
              onChange={e => setCreateToken(e.target.value)}
              className="px-3 py-2 rounded-lg bg-surface-2 border border-border text-xs text-text-primary focus:outline-none focus:border-accent-border transition-colors"
            >
              <option value="usdt">USDT</option>
              <option value="native">Native (ETH/TON)</option>
            </select>
          </div>

          {/* Release condition selector */}
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">Release Condition</label>
            <div className="grid grid-cols-2 gap-1.5">
              {RELEASE_CONDITIONS.map(rc => (
                <button
                  key={rc.value}
                  type="button"
                  onClick={() => setCreateCondition(rc.value)}
                  className={`text-left p-2 rounded-lg border text-sm transition-all ${
                    createCondition === rc.value
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-surface-2 text-text-secondary hover:border-border-light'
                  }`}
                >
                  <div className="font-medium">{rc.label}</div>
                  <div className="text-xs text-text-muted mt-0.5">{rc.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            value={createMemo}
            onChange={e => setCreateMemo(e.target.value)}
            placeholder="Memo (optional)"
            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-border transition-colors"
          />

          <button
            onClick={handleCreate}
            disabled={creating || !createRecipient.trim() || !createAmount.trim()}
            className="w-full py-2.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-light disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5 btn-press"
          >
            <Send className="w-3.5 h-3.5" />
            {creating ? 'Creating...' : 'Create Escrow'}
          </button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-lg bg-surface-2 border border-border text-center">
            <div className="text-sm font-bold text-text-primary tabular-nums">{(stats.totalEscrowed ?? 0).toFixed(4)}</div>
            <div className="text-xs text-text-secondary">Total Escrowed</div>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-2 border border-border text-center">
            <div className="text-sm font-bold text-green-400 tabular-nums">{(stats.totalReleased ?? 0).toFixed(4)}</div>
            <div className="text-xs text-text-secondary">Released</div>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-2 border border-border text-center">
            <div className="text-sm font-bold text-red-400 tabular-nums">{(stats.totalRefunded ?? 0).toFixed(4)}</div>
            <div className="text-xs text-text-secondary">Refunded</div>
          </div>
        </div>
      )}

      {/* Active Escrows */}
      {escrows.length === 0 ? (
        <div className="text-center py-6 animate-fade-in">
          <Lock className="w-8 h-8 text-text-muted/30 mx-auto mb-2" />
          <p className="text-xs text-text-muted">No active escrows</p>
          <p className="text-xs text-text-muted/60 mt-1">Create one to hold tips with release conditions</p>
        </div>
      ) : (
        <div className="space-y-2">
          {escrows.map((escrow, i) => (
            <div key={escrow.id} className="p-3 rounded-lg bg-surface-2 border border-border card-hover animate-list-item-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-text-primary tabular-nums">{escrow.amount} {escrow.token.toUpperCase()}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {escrow.releaseCondition.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="text-xs text-text-secondary mb-2">
                &rarr; {escrow.recipient.slice(0, 10)}...{escrow.recipient.slice(-4)}
                {escrow.memo && <span className="ml-2 italic">&ldquo;{escrow.memo}&rdquo;</span>}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {/* Confirm Delivery — shown for creator_confirm escrows that are held/active */}
                {escrow.releaseCondition === 'creator_confirm' && isHeldOrActive(escrow.status) && (
                  <button
                    onClick={() => confirmDelivery(escrow.id)}
                    disabled={releasingId === escrow.id}
                    className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 disabled:opacity-40 transition-colors flex items-center gap-1 btn-press"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {releasingId === escrow.id ? 'Confirming...' : 'Confirm Delivery'}
                  </button>
                )}
                {/* Generic Release — for non-creator_confirm escrows */}
                {escrow.releaseCondition !== 'creator_confirm' && isHeldOrActive(escrow.status) && (
                  <button
                    onClick={() => release(escrow.id)}
                    disabled={releasingId === escrow.id}
                    className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 disabled:opacity-40 transition-colors flex items-center gap-1 btn-press"
                  >
                    <Unlock className="w-2.5 h-2.5" />
                    {releasingId === escrow.id ? 'Releasing...' : 'Release'}
                  </button>
                )}
                {isHeldOrActive(escrow.status) && (
                  <button onClick={() => refund(escrow.id)} className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1 btn-press">
                    <RotateCcw className="w-2.5 h-2.5" /> Refund
                  </button>
                )}
                {isHeldOrActive(escrow.status) && (
                  <button
                    onClick={() => setDisputeId(disputeId === escrow.id ? null : escrow.id)}
                    className="text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors flex items-center gap-1 btn-press ml-auto"
                  >
                    <AlertTriangle className="w-2.5 h-2.5" /> Dispute
                  </button>
                )}
              </div>

              {/* Dispute form */}
              {disputeId === escrow.id && (
                <div className="mt-2 flex gap-1.5 animate-slide-down">
                  <input
                    type="text"
                    value={disputeReason}
                    onChange={e => setDisputeReason(e.target.value)}
                    placeholder="Dispute reason..."
                    className="flex-1 px-2.5 py-1.5 rounded-md bg-surface-3 border border-amber-500/30 text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleDispute(escrow.id)}
                    disabled={disputing || !disputeReason.trim()}
                    className="px-2.5 py-1.5 rounded-md bg-amber-500 text-white text-xs font-medium hover:bg-amber-400 disabled:opacity-40 transition-colors btn-press"
                  >
                    {disputing ? '...' : 'Submit'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
