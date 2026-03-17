// Copyright 2026 Danish A. Licensed under Apache-2.0.
// AeroFyta — AI-Powered Rumble Creator Tipping Agent

import { useState, useCallback, lazy, Suspense } from 'react';
import {
  Zap, X, Layers, Shield, Download, AlertTriangle, Copy, Check,
} from 'lucide-react';
import { OnboardingOverlay } from './components/OnboardingOverlay';
import { ChatInterface } from './components/ChatInterface';
import { useTipForm, useAutoTipForm, usePoolForm, useEventForm, useSplitForm, useReasoningPanel, useUIToggles } from './hooks/useAppState';
import { useAgentData, stepLabels, API, fetchJson } from './hooks/useAgentData';
import type { TipResult } from './hooks/useAgentData';
import { useUIState } from './hooks/useUIState';

// View components
import { WalletView } from './views/WalletView';
import { CreatorsView } from './views/CreatorsView';
import { TipFormView } from './views/TipFormView';
import { ActivityView } from './views/ActivityView';
import { AgentPipelineView } from './views/AgentPipelineView';
import { ReasoningView } from './views/ReasoningView';
import { SystemStatusView } from './views/SystemStatusView';
import { DemoRunner } from './components/DemoRunner';
import { LandingPage } from './views/LandingPage';

// Lazy-load Advanced Mode (the full dashboard)
const AdvancedDashboard = lazy(() => import('./AdvancedMode'));

// ─── App ─────────────────────────────────────────────────
export default function App() {
  // Landing page — shown on first visit, stored in localStorage
  const [showLanding, setShowLanding] = useState(() => {
    return localStorage.getItem('aerofyta-dashboard-launched') !== 'true';
  });

  const handleLaunch = useCallback(() => {
    setShowLanding(false);
    localStorage.setItem('aerofyta-dashboard-launched', 'true');
  }, []);

  // Agent/backend data (wallets, creators, activity, protocol status, etc.)
  // NOTE: ALL hooks must be called before any early return (React rules of hooks)
  const {
    balances, creators, agentState, activity, tipResult, setTipResult,
    error, setError, apiError, setApiError, pools, leaderboard, autoTipRules,
    aiMode, demoMode, protocolStatus, initialLoading, loadData,
  } = useAgentData();

  // UI-only state (tabs, onboarding)
  const { activeTab, setActiveTab, showOnboarding, setShowOnboarding } = useUIState();

  // Extracted form state (custom hooks — reduces god-component pattern)
  const { recipient, setRecipient, amount, setAmount, token, setToken, message, setMessage, sending, setSending } = useTipForm();
  const { atMinWatch, setAtMinWatch, atAmount, setAtAmount, atMaxDay, setAtMaxDay, atSaving, setAtSaving } = useAutoTipForm();
  const { poolCreator, setPoolCreator, poolTitle, setPoolTitle, poolGoal, setPoolGoal, poolSaving, setPoolSaving } = usePoolForm();
  const { evtCreator, setEvtCreator, evtType, setEvtType, evtAmount, setEvtAmount, evtSaving, setEvtSaving, evtSuccess, setEvtSuccess } = useEventForm();
  const { splitRecipients, setSplitRecipients, splitAmount, setSplitAmount, splitSending, setSplitSending } = useSplitForm();
  const { reasoningOpen, setReasoningOpen, reasoningEvents, setReasoningEvents, reasoningActive, setReasoningActive, reasoningPrompt, setReasoningPrompt } = useReasoningPanel();
  const { advancedMode, setAdvancedMode, showBackup, setShowBackup, showSystemStatus, setShowSystemStatus, dismissAiBanner, setDismissAiBanner, copied, setCopied } = useUIToggles();

  const reasoningEndRef = useCallback((node: HTMLDivElement | null) => { node?.scrollIntoView({ behavior: 'smooth' }); }, []);

  const startReasoning = useCallback(() => {
    if (!reasoningPrompt.trim()) return;
    setReasoningEvents([]);
    setReasoningActive(true);
    const url = `${API}/reasoning/stream?prompt=${encodeURIComponent(reasoningPrompt.trim())}`;
    const evtSource = new EventSource(url);
    evtSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as { type: string; content: string; confidence?: number; step: number; source?: string; timestamp: string };
        if (data.type === 'done') {
          setReasoningActive(false);
          evtSource.close();
          return;
        }
        setReasoningEvents(prev => [...prev, data]);
      } catch { /* ignore parse errors */ }
    };
    evtSource.onerror = () => {
      setReasoningActive(false);
      evtSource.close();
    };
  }, [reasoningPrompt]);

  const handleSendTip = async () => {
    if (!recipient || !amount) return;
    // Client-side validation
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) { setError('Amount must be a positive number'); return; }
    if (numAmount > 100) { setError('Amount exceeds maximum (100 USDT). Use escrow for large tips.'); return; }
    if (!/^(0x[a-fA-F0-9]{40}|[EU]Q[A-Za-z0-9_-]{46}|T[1-9A-HJ-NP-Za-km-z]{33}|[a-z0-9]+\.eth)$/.test(recipient.trim())) { setError('Invalid recipient address or ENS name'); return; }
    setSending(true); setError(null); setTipResult(null);
    try {
      const result = await fetchJson<TipResult>(`${API}/tip`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, amount, token, message: message || undefined }),
      });
      setTipResult(result); setRecipient(''); setAmount(''); setMessage(''); loadData();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to send tip'); }
    finally { setSending(false); }
  };

  const handleSaveAutoTip = async () => {
    setAtSaving(true);
    try {
      await fetchJson(`${API}/rumble/auto-tip/rules`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'default-user', rules: [{ minWatchPercent: parseInt(atMinWatch), tipAmount: parseFloat(atAmount), maxTipsPerDay: parseInt(atMaxDay), enabledCategories: ['all'] }] }),
      });
      loadData();
    } catch (err) { console.error('Failed to save auto-tip rules:', err); setApiError('Failed to save auto-tip rules'); } finally { setAtSaving(false); }
  };

  const handleCreatePool = async () => {
    if (!poolCreator || !poolTitle || !poolGoal) return;
    setPoolSaving(true);
    try {
      await fetchJson(`${API}/rumble/pools`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId: poolCreator, title: poolTitle, goalAmount: parseFloat(poolGoal) }),
      });
      setPoolTitle(''); setPoolGoal(''); loadData();
    } catch (err) { console.error('Failed to create pool:', err); setApiError('Failed to create pool'); } finally { setPoolSaving(false); }
  };

  const handleEventTrigger = async () => {
    if (!evtCreator) return;
    setEvtSaving(true); setEvtSuccess('');
    try {
      await fetchJson(`${API}/rumble/events/triggers`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId: evtCreator, event: evtType, tipAmount: parseFloat(evtAmount) }),
      });
      setEvtSuccess(`Trigger set: auto-tip on ${evtType}`);
      setTimeout(() => setEvtSuccess(''), 3000);
    } catch (err) { console.error('Failed to set event trigger:', err); setApiError('Failed to set event trigger'); } finally { setEvtSaving(false); }
  };

  const handleSplitTip = async () => {
    const recipients = splitRecipients.filter(r => r.trim());
    if (recipients.length < 2 || !splitAmount) return;
    setSplitSending(true);
    try {
      await fetchJson(`${API}/tip/split`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients, totalAmount: splitAmount, token: 'native' }),
      });
      setSplitRecipients(['', '']); setSplitAmount(''); loadData();
    } catch (err) { console.error('Failed to split tip:', err); setApiError('Failed to send split tip'); } finally { setSplitSending(false); }
  };

  const handleCopy = async (text: string, id: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 2000); } catch (err) { console.error('Clipboard copy failed:', err); }
  };

  const handleExportAddresses = () => {
    const exportData = balances.map((b) => ({
      chainId: b.chainId,
      address: b.address,
      derivationPath: b.chainId.includes('ethereum') ? "m/44'/60'/0'/0/0"
        : b.chainId.includes('ton') ? "m/44'/607'/0'"
        : b.chainId.includes('tron') ? "m/44'/195'/0'/0/0"
        : b.chainId.includes('bitcoin') ? "m/44'/0'/0'/0/0"
        : "m/44'/501'/0'/0'",
      nativeCurrency: b.nativeCurrency,
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aerofyta-wallet-addresses-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTipCreator = (walletAddress: string) => {
    setRecipient(walletAddress);
    setAmount('0.001');
    setActiveTab('tip');
    document.getElementById('tip-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const totalUsdt = balances.reduce((s, b) => s + (parseFloat(b.usdtBalance) || 0), 0);

  // Show landing page for first-time visitors (AFTER all hooks)
  if (showLanding) {
    return <LandingPage onLaunch={handleLaunch} />;
  }

  return (
    <div className="min-h-screen bg-[#050810] text-[#f0f4ff] relative overflow-hidden">
      {/* Onboarding tour for first-time visitors */}
      {showOnboarding && <OnboardingOverlay onComplete={() => setShowOnboarding(false)} />}

      {/* Wallet Backup Modal */}
      {showBackup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowBackup(false)}>
          <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-white/[0.08] bg-[#0a0f1a] shadow-2xl shadow-black/40 p-6" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowBackup(false)} className="absolute top-4 right-4 text-[#5a6480] hover:text-[#f0f4ff] transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#85c742]/15 border border-[#85c742]/25 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#9dd96b]" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Wallet Backup</h3>
                <p className="text-xs text-[#5a6480]">HD wallet addresses and derivation paths</p>
              </div>
            </div>

            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300/90">Your seed phrase is stored in the .env file on the server. Never share it. Keep a secure offline backup. All wallet addresses are derived from a single HD seed using BIP-44 paths.</p>
            </div>

            <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
              {balances.map((b) => {
                const label = b.chainId.includes('ethereum') ? 'ETH' : b.chainId.includes('ton') ? 'TON' : b.chainId.includes('tron') ? 'TRX' : b.chainId.includes('bitcoin') ? 'BTC' : 'SOL';
                const path = b.chainId.includes('ethereum') ? "m/44'/60'/0'/0/0"
                  : b.chainId.includes('ton') ? "m/44'/607'/0'"
                  : b.chainId.includes('tron') ? "m/44'/195'/0'/0/0"
                  : b.chainId.includes('bitcoin') ? "m/44'/0'/0'/0/0"
                  : "m/44'/501'/0'/0'";
                return (
                  <div key={b.chainId} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold">{label} <span className="text-[#5a6480] font-normal text-xs">({b.chainId})</span></span>
                      <button onClick={() => handleCopy(b.address, `backup-${b.chainId}`)} className="text-[#5a6480] hover:text-[#8892b0]">
                        {copied === `backup-${b.chainId}` ? <Check className="w-3.5 h-3.5 text-[#9dd96b]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs text-[#8892b0] font-mono break-all mb-1">{b.address}</p>
                    <p className="text-[10px] text-[#5a6480]">Derivation: <span className="font-mono text-[#8892b0]">{path}</span></p>
                  </div>
                );
              })}
              {balances.length === 0 && (
                <p className="text-sm text-[#5a6480] text-center py-4">No wallets loaded yet</p>
              )}
            </div>

            <button onClick={handleExportAddresses} disabled={balances.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#85c742]/15 border border-[#85c742]/25 text-[#9dd96b] font-medium text-sm hover:bg-[#85c742]/25 transition-colors disabled:opacity-40">
              <Download className="w-4 h-4" /> Export Addresses as JSON
            </button>
          </div>
        </div>
      )}

      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#85c742]/[0.04] blur-[120px] animate-[aurora-drift-1_20s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#ff4d4d]/[0.03] blur-[100px] animate-[aurora-drift-2_25s_ease-in-out_infinite]" />
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full bg-[#9dd96b]/[0.025] blur-[80px] animate-[aurora-drift-3_18s_ease-in-out_infinite]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050810]/80 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#85c742] to-[#6fa832] flex items-center justify-center shadow-lg shadow-[#85c742]/25 ring-1 ring-white/10">
              <Zap className="w-4.5 h-4.5 text-white drop-shadow-sm" />
            </div>
            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">AeroFyta</span>
            {demoMode && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wider animate-pulse">Demo</span>}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#85c742]/15 text-[#9dd96b] border border-[#85c742]/25 font-semibold backdrop-blur-sm">Rumble Tipping Agent</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#8892b0]">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${agentState.status !== 'idle' ? 'bg-[#9dd96b] animate-pulse shadow-lg shadow-[#9dd96b]/40' : 'bg-[#85c742] shadow-sm shadow-[#85c742]/30'}`} />
              Agent {stepLabels[agentState.status] || agentState.status}
            </span>
            <span className="hidden sm:inline">{balances.length} chains</span>
            <button
              onClick={() => setAdvancedMode(!advancedMode)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                advancedMode
                  ? 'bg-[#ff4d4d]/15 text-[#ff4d4d] border border-[#ff4d4d]/25 shadow-sm shadow-[#ff4d4d]/10'
                  : 'bg-white/[0.04] text-[#8892b0] border border-white/[0.08] hover:text-[#f0f4ff] hover:border-white/[0.15] hover:bg-white/[0.06]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {advancedMode ? 'Simple' : 'Advanced'}
            </button>
          </div>
        </div>
      </header>

      {/* API Error Banner */}
      {apiError && (
        <div className="relative z-50 max-w-5xl mx-auto px-4 sm:px-6 mt-2">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            <span>{apiError}</span>
            <button onClick={() => setApiError(null)} className="shrink-0 text-red-400/60 hover:text-red-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* AI Mode Banner — show when running rule-based (no LLM key) */}
      {aiMode === 'rule-based' && !dismissAiBanner && (
        <div className="relative z-50 max-w-5xl mx-auto px-4 sm:px-6 mt-2">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300">
            <span>Running in rule-based mode — fast deterministic decisions. Add <code className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-mono text-xs">GROQ_API_KEY</code> to <code className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-mono text-xs">agent/.env</code> for full AI-powered decisions.</span>
            <button onClick={() => setDismissAiBanner(true)} className="shrink-0 text-amber-400/60 hover:text-amber-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ADVANCED MODE — full dashboard with all 43 services */}
      {advancedMode && (
        <Suspense fallback={
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-5">
            <div className="animate-pulse space-y-3 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.03]">
              <div className="h-5 bg-zinc-800 rounded w-1/3" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {[1,2,3,4].map(i => <div key={i} className="h-16 bg-zinc-800 rounded-xl" />)}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[1,2].map(i => (
                <div key={i} className="animate-pulse space-y-3 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                  <div className="h-8 bg-zinc-800 rounded w-full mt-2" />
                  <div className="h-8 bg-zinc-800 rounded w-full" />
                </div>
              ))}
            </div>
          </div>
        }>
          <AdvancedDashboard />
        </Suspense>
      )}

      {/* SIMPLE MODE — focused Rumble tipping */}
      {!advancedMode && <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Zero-terminal demo — judges click one button */}
        <DemoRunner />

        <WalletView
          balances={balances}
          totalUsdt={totalUsdt}
          initialLoading={initialLoading}
          copied={copied}
          onCopy={handleCopy}
          onShowBackup={() => setShowBackup(true)}
        />

        <CreatorsView
          creators={creators}
          leaderboard={leaderboard}
          onTipCreator={handleTipCreator}
        />

        <TipFormView
          activeTab={activeTab} setActiveTab={setActiveTab}
          recipient={recipient} setRecipient={setRecipient}
          amount={amount} setAmount={setAmount}
          token={token} setToken={setToken}
          message={message} setMessage={setMessage}
          sending={sending}
          error={error} setError={setError}
          tipResult={tipResult}
          onSendTip={handleSendTip}
          splitRecipients={splitRecipients} setSplitRecipients={setSplitRecipients}
          splitAmount={splitAmount} setSplitAmount={setSplitAmount}
          splitSending={splitSending}
          onSplitTip={handleSplitTip}
          atMinWatch={atMinWatch} setAtMinWatch={setAtMinWatch}
          atAmount={atAmount} setAtAmount={setAtAmount}
          atMaxDay={atMaxDay} setAtMaxDay={setAtMaxDay}
          atSaving={atSaving}
          autoTipRules={autoTipRules}
          onSaveAutoTip={handleSaveAutoTip}
          creators={creators}
          pools={pools}
          poolCreator={poolCreator} setPoolCreator={setPoolCreator}
          poolTitle={poolTitle} setPoolTitle={setPoolTitle}
          poolGoal={poolGoal} setPoolGoal={setPoolGoal}
          poolSaving={poolSaving}
          onCreatePool={handleCreatePool}
          evtCreator={evtCreator} setEvtCreator={setEvtCreator}
          evtType={evtType} setEvtType={setEvtType}
          evtAmount={evtAmount} setEvtAmount={setEvtAmount}
          evtSaving={evtSaving}
          evtSuccess={evtSuccess}
          onEventTrigger={handleEventTrigger}
        />

        <AgentPipelineView agentState={agentState} />

        <ReasoningView
          reasoningOpen={reasoningOpen}
          setReasoningOpen={setReasoningOpen}
          reasoningEvents={reasoningEvents}
          reasoningActive={reasoningActive}
          reasoningPrompt={reasoningPrompt}
          setReasoningPrompt={setReasoningPrompt}
          onStartReasoning={startReasoning}
          reasoningEndRef={reasoningEndRef}
        />

        <SystemStatusView
          showSystemStatus={showSystemStatus}
          setShowSystemStatus={setShowSystemStatus}
          protocolStatus={protocolStatus}
          demoMode={demoMode}
        />

        <ActivityView activity={activity} />

      </main>}

      <footer className="relative z-10 border-t border-white/[0.04] mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between text-xs text-[#5a6480]">
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#85c742] shadow-sm shadow-[#85c742]/40" /> AeroFyta — Powered by Tether WDK</div>
          <span>Hackathon Galactica 2026</span>
        </div>
      </footer>

      {/* AI Chat — floating NLP tipping assistant */}
      {!advancedMode && <ChatInterface />}
    </div>
  );
}
