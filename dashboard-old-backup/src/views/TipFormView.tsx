// Copyright 2026 Danish A. Licensed under Apache-2.0.
// TipFormView — tipping actions (Send Tip, Auto-Tip, Pools, Events) extracted from App.tsx.

import {
  Zap, Send, Eye, Target, Play, GitBranch, Plus, X,
  CheckCircle2, Loader2, Brain, ArrowUpRight,
} from 'lucide-react';
import type { Creator, TipResult, AutoTipRule, TipPool } from '../hooks/useAgentData';

export interface TipFormViewProps {
  activeTab: 'tip' | 'autotip' | 'pools' | 'events';
  setActiveTab: (tab: 'tip' | 'autotip' | 'pools' | 'events') => void;
  // Send Tip
  recipient: string; setRecipient: (v: string) => void;
  amount: string; setAmount: (v: string) => void;
  token: 'native' | 'usdt' | 'xaut' | 'btc'; setToken: (v: 'native' | 'usdt' | 'xaut' | 'btc') => void;
  message: string; setMessage: (v: string) => void;
  sending: boolean;
  error: string | null; setError: (v: string | null) => void;
  tipResult: TipResult | null;
  onSendTip: () => void;
  // Split
  splitRecipients: string[]; setSplitRecipients: (v: string[]) => void;
  splitAmount: string; setSplitAmount: (v: string) => void;
  splitSending: boolean;
  onSplitTip: () => void;
  // Auto-Tip
  atMinWatch: string; setAtMinWatch: (v: string) => void;
  atAmount: string; setAtAmount: (v: string) => void;
  atMaxDay: string; setAtMaxDay: (v: string) => void;
  atSaving: boolean;
  autoTipRules: AutoTipRule[];
  onSaveAutoTip: () => void;
  // Pools
  creators: Creator[];
  pools: TipPool[];
  poolCreator: string; setPoolCreator: (v: string) => void;
  poolTitle: string; setPoolTitle: (v: string) => void;
  poolGoal: string; setPoolGoal: (v: string) => void;
  poolSaving: boolean;
  onCreatePool: () => void;
  // Events
  evtCreator: string; setEvtCreator: (v: string) => void;
  evtType: 'new_video' | 'milestone' | 'live_start' | 'anniversary';
  setEvtType: (v: 'new_video' | 'milestone' | 'live_start' | 'anniversary') => void;
  evtAmount: string; setEvtAmount: (v: string) => void;
  evtSaving: boolean;
  evtSuccess: string;
  onEventTrigger: () => void;
}

export function TipFormView(props: TipFormViewProps) {
  const {
    activeTab, setActiveTab,
    recipient, setRecipient, amount, setAmount, token, setToken, message, setMessage,
    sending, error, setError, tipResult, onSendTip,
    splitRecipients, setSplitRecipients, splitAmount, setSplitAmount, splitSending, onSplitTip,
    atMinWatch, setAtMinWatch, atAmount, setAtAmount, atMaxDay, setAtMaxDay, atSaving, autoTipRules, onSaveAutoTip,
    creators, pools, poolCreator, setPoolCreator, poolTitle, setPoolTitle, poolGoal, setPoolGoal, poolSaving, onCreatePool,
    evtCreator, setEvtCreator, evtType, setEvtType, evtAmount, setEvtAmount, evtSaving, evtSuccess, onEventTrigger,
  } = props;

  return (
    <section id="tip-section">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-[#85c742] drop-shadow-[0_0_8px_rgba(133,199,66,0.6)]" />
        <h2 className="text-lg font-bold tracking-tight">Tipping Actions</h2>
      </div>
      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm mb-5">
        {([
          { id: 'tip' as const, label: 'Send Tip', icon: Send },
          { id: 'autotip' as const, label: 'Auto-Tip', icon: Eye },
          { id: 'pools' as const, label: 'Pools', icon: Target },
          { id: 'events' as const, label: 'Events', icon: Play },
        ]).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${activeTab === id ? 'bg-[#85c742]/15 text-[#9dd96b] shadow-sm shadow-[#85c742]/10 border border-[#85c742]/20' : 'text-[#5a6480] hover:text-[#8892b0] border border-transparent'}`}>
            <Icon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* TAB: Send Tip */}
      {activeTab === 'tip' && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 shadow-xl shadow-black/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-[#8892b0] mb-1.5">Recipient</label>
              <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x... or UQ... address"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm placeholder:text-[#5a6480] focus:border-[#85c742]/50 focus:shadow-[0_0_0_3px_rgba(133,199,66,0.1)] outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8892b0] mb-1.5">Amount & Token</label>
              <div className="flex gap-2">
                <input type="number" step="0.001" min="0.001" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.001"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm placeholder:text-[#5a6480] focus:border-[#85c742]/50 focus:shadow-[0_0_0_3px_rgba(133,199,66,0.1)] outline-none transition-all tabular-nums" />
                <select value={token} onChange={(e) => setToken(e.target.value as typeof token)}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm focus:border-[#85c742]/50 focus:shadow-[0_0_0_3px_rgba(133,199,66,0.1)] outline-none transition-all">
                  <option value="native">Native</option>
                  <option value="usdt">USDT</option>
                  <option value="xaut">XAUT</option>
                  <option value="btc">BTC</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-[#8892b0] mb-1.5">Message</label>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Great video!"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm placeholder:text-[#5a6480] focus:border-[#85c742]/50 focus:shadow-[0_0_0_3px_rgba(133,199,66,0.1)] outline-none transition-all" />
          </div>
          {/* Smart Splits */}
          <details className="mb-4 group">
            <summary className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#8892b0] hover:text-[#f0f4ff] transition-colors">
              <GitBranch className="w-3.5 h-3.5" /> Smart Split (tip multiple creators)
              <span className="ml-auto text-[#5a6480] group-open:rotate-180 transition-transform">{'\u25BC'}</span>
            </summary>
            <div className="mt-3 space-y-2">
              {splitRecipients.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={r} onChange={(e) => { const n = [...splitRecipients]; n[i] = e.target.value; setSplitRecipients(n); }} placeholder={`Recipient ${i + 1}`}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs placeholder:text-[#5a6480] focus:border-[#85c742]/50 focus:shadow-[0_0_0_3px_rgba(133,199,66,0.1)] outline-none transition-all font-mono" />
                  {i >= 2 && <button onClick={() => setSplitRecipients(splitRecipients.filter((_, j) => j !== i))} className="text-[#5a6480] hover:text-red-400"><X className="w-4 h-4" /></button>}
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={() => setSplitRecipients([...splitRecipients, ''])} className="text-xs text-[#9dd96b] hover:text-[#9dd96b] flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                <input type="number" step="0.001" min="0.001" value={splitAmount} onChange={(e) => setSplitAmount(e.target.value)} placeholder="Total amount"
                  className="w-32 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs placeholder:text-[#5a6480] outline-none" />
                <button onClick={onSplitTip} disabled={splitSending} className="px-3 py-1.5 rounded-lg bg-[#85c742]/20 text-[#9dd96b] text-xs font-medium hover:bg-[#85c742]/30 disabled:opacity-50">
                  {splitSending ? 'Splitting...' : 'Split Tip'}
                </button>
              </div>
            </div>
          </details>
          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center justify-between gap-2">
              <span>{error}</span>
              <button onClick={() => { setError(null); onSendTip(); }} className="shrink-0 px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium transition-colors">
                Retry
              </button>
            </div>
          )}
          {tipResult && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[#85c742]/10 border border-[#85c742]/20 space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#9dd96b] font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Tip {tipResult.status === 'confirmed' ? 'Confirmed' : tipResult.status === 'pending' ? 'Submitted' : 'Sent'}!
              </div>
              <p className="text-xs text-[#8892b0]">{tipResult.amount} {tipResult.token?.toUpperCase() || ''} {'\u2192'} {tipResult.recipient?.slice(0, 10) || tipResult.to?.slice(0, 10)}... on {tipResult.chainId}</p>
              {tipResult.txHash && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#5a6480]">Tx:</span>
                  {tipResult.explorerUrl ? (
                    <a href={tipResult.explorerUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#9dd96b] hover:underline font-mono truncate">{tipResult.txHash.slice(0, 16)}...{tipResult.txHash.slice(-8)}</a>
                  ) : (
                    <span className="text-xs text-[#8892b0] font-mono truncate">{tipResult.txHash.slice(0, 16)}...{tipResult.txHash.slice(-8)}</span>
                  )}
                </div>
              )}
              {tipResult.fee && <p className="text-xs text-[#5a6480]">Gas fee: {tipResult.fee}</p>}
              {tipResult.reasoning && <p className="text-xs text-[#5a6480] flex items-center gap-1"><Brain className="w-3 h-3" /> {tipResult.reasoning}</p>}
              {tipResult.decision?.reasoning && !tipResult.reasoning && <p className="text-xs text-[#5a6480] flex items-center gap-1"><Brain className="w-3 h-3" /> {tipResult.decision.reasoning}</p>}
            </div>
          )}
          <button onClick={onSendTip} disabled={sending || !recipient || !amount}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#85c742] to-[#6fa832] hover:from-[#9dd96b] hover:to-[#85c742] text-white font-semibold transition-all disabled:opacity-40 active:scale-[0.98] shadow-lg shadow-[#85c742]/30 hover:shadow-xl hover:shadow-[#85c742]/40">
            {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> AI Agent processing...</> : <><Zap className="w-4 h-4" /> Send Tip <ArrowUpRight className="w-4 h-4 opacity-60" /></>}
          </button>
          <p className="text-xs text-[#5a6480] text-center mt-2.5">AI agent selects cheapest chain {'\u00B7'} Supports USDT, XAUT, BTC</p>
        </div>
      )}

      {/* TAB: Auto-Tip (watch-time based) */}
      {activeTab === 'autotip' && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 shadow-xl shadow-black/10">
          <h3 className="text-sm font-semibold mb-1">Watch-Time Auto-Tipping</h3>
          <p className="text-xs text-[#5a6480] mb-4">Automatically tip creators when you watch their Rumble videos past a threshold</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-[#8892b0] mb-1.5">Min Watch %</label>
              <input type="number" value={atMinWatch} onChange={(e) => setAtMinWatch(e.target.value)} min="10" max="100"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm focus:border-[#85c742]/50 focus:shadow-[0_0_0_3px_rgba(133,199,66,0.1)] outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8892b0] mb-1.5">Tip Amount</label>
              <input type="number" step="0.001" min="0.001" value={atAmount} onChange={(e) => setAtAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm focus:border-[#85c742]/50 focus:shadow-[0_0_0_3px_rgba(133,199,66,0.1)] outline-none transition-all tabular-nums" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8892b0] mb-1.5">Max Tips/Day</label>
              <input type="number" value={atMaxDay} onChange={(e) => setAtMaxDay(e.target.value)} min="1" max="100"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm focus:border-[#85c742]/50 focus:shadow-[0_0_0_3px_rgba(133,199,66,0.1)] outline-none transition-all" />
            </div>
          </div>
          {autoTipRules.length > 0 && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <p className="text-xs text-[#9dd96b] font-medium mb-1">Active Rules</p>
              {autoTipRules.map((r, i) => (
                <p key={i} className="text-xs text-[#8892b0]">Watch {'\u2265'}{r.minWatchPercent}% {'\u2192'} tip {r.tipAmount} (max {r.maxTipsPerDay}/day)</p>
              ))}
            </div>
          )}
          <button onClick={onSaveAutoTip} disabled={atSaving}
            className="w-full py-2.5 rounded-xl bg-[#85c742]/20 text-[#9dd96b] font-medium text-sm hover:bg-[#85c742]/30 transition-colors disabled:opacity-50">
            {atSaving ? 'Saving...' : 'Save Auto-Tip Rules'}
          </button>
        </div>
      )}

      {/* TAB: Community Pools */}
      {activeTab === 'pools' && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 shadow-xl shadow-black/10">
          <h3 className="text-sm font-semibold mb-1">Community Tipping Pools</h3>
          <p className="text-xs text-[#5a6480] mb-4">Create pools for fans to collectively tip their favorite creators</p>
          {pools.length > 0 && (
            <div className="space-y-2 mb-4">
              {pools.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <Target className="w-4 h-4 text-purple-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-[rgba(136,146,176,0.15)] overflow-hidden">
                        <div className="h-full rounded-full bg-[#85c742]" style={{ width: `${Math.min(100, p.goalAmount ? ((p.currentAmount ?? 0) / p.goalAmount) * 100 : 0)}%` }} />
                      </div>
                      <span className="text-xs text-[#8892b0] tabular-nums">{p.goalAmount ? (((p.currentAmount ?? 0) / p.goalAmount) * 100).toFixed(0) : 0}%</span>
                    </div>
                  </div>
                  <span className="text-xs text-[#5a6480]">{p.contributors} fans</span>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <select value={poolCreator} onChange={(e) => setPoolCreator(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm focus:border-[#85c742]/50 focus:shadow-[0_0_0_3px_rgba(133,199,66,0.1)] outline-none transition-all">
              <option value="">Select creator</option>
              {creators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="text" value={poolTitle} onChange={(e) => setPoolTitle(e.target.value)} placeholder="Pool title"
              className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm placeholder:text-[#5a6480] outline-none" />
            <input type="number" step="0.001" min="0.001" value={poolGoal} onChange={(e) => setPoolGoal(e.target.value)} placeholder="Goal amount"
              className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm placeholder:text-[#5a6480] outline-none tabular-nums" />
          </div>
          <button onClick={onCreatePool} disabled={poolSaving || !poolCreator || !poolTitle || !poolGoal}
            className="w-full py-2.5 rounded-xl bg-purple-500/20 text-purple-300 font-medium text-sm hover:bg-purple-500/30 transition-colors disabled:opacity-50">
            {poolSaving ? 'Creating...' : 'Create Pool'}
          </button>
        </div>
      )}

      {/* TAB: Event-Triggered Tipping */}
      {activeTab === 'events' && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 shadow-xl shadow-black/10">
          <h3 className="text-sm font-semibold mb-1">Event-Triggered Tipping</h3>
          <p className="text-xs text-[#5a6480] mb-4">Auto-tip when creators hit milestones, go live, or post new videos</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <select value={evtCreator} onChange={(e) => setEvtCreator(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm focus:border-[#85c742]/50 focus:shadow-[0_0_0_3px_rgba(133,199,66,0.1)] outline-none transition-all">
              <option value="">Select creator</option>
              {creators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={evtType} onChange={(e) => setEvtType(e.target.value as typeof evtType)}
              className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm outline-none">
              <option value="new_video">New Video</option>
              <option value="milestone">Milestone</option>
              <option value="live_start">Goes Live</option>
              <option value="anniversary">Anniversary</option>
            </select>
            <input type="number" step="0.001" min="0.001" value={evtAmount} onChange={(e) => setEvtAmount(e.target.value)} placeholder="Tip amount"
              className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm placeholder:text-[#5a6480] outline-none tabular-nums" />
          </div>
          {evtSuccess && <div className="mb-4 px-4 py-2 rounded-xl bg-[#85c742]/10 border border-[#85c742]/20 text-xs text-[#9dd96b]">{evtSuccess}</div>}
          <button onClick={onEventTrigger} disabled={evtSaving || !evtCreator}
            className="w-full py-2.5 rounded-xl bg-amber-500/20 text-amber-300 font-medium text-sm hover:bg-amber-500/30 transition-colors disabled:opacity-50">
            {evtSaving ? 'Setting...' : 'Set Event Trigger'}
          </button>
        </div>
      )}
    </section>
  );
}
