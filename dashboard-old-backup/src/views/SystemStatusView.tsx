// Copyright 2026 Danish A. Licensed under Apache-2.0.
// SystemStatusView — system status panel extracted from App.tsx.

import { Activity, ChevronDown, ChevronRight, Info, Loader2 } from 'lucide-react';
import type { ProtocolStatusMap } from '../hooks/useAgentData';

export interface SystemStatusViewProps {
  showSystemStatus: boolean;
  setShowSystemStatus: (v: boolean) => void;
  protocolStatus: ProtocolStatusMap | null;
  demoMode: boolean;
}

export function SystemStatusView({ showSystemStatus, setShowSystemStatus, protocolStatus, demoMode }: SystemStatusViewProps) {
  return (
    <section>
      <button
        onClick={() => setShowSystemStatus(!showSystemStatus)}
        className="flex items-center gap-2 w-full text-left mb-3 group"
      >
        <Activity className="w-4 h-4 text-[#85c742] drop-shadow-[0_0_6px_rgba(133,199,66,0.4)]" />
        <h2 className="text-sm font-bold tracking-tight text-[#8892b0] group-hover:text-[#f0f4ff] transition-colors">System Status</h2>
        {showSystemStatus
          ? <ChevronDown className="w-3.5 h-3.5 text-[#5a6480]" />
          : <ChevronRight className="w-3.5 h-3.5 text-[#5a6480]" />}
        <span className="ml-auto text-[10px] text-[#5a6480] font-medium">Protocol transparency</span>
      </button>
      {showSystemStatus && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-4 space-y-2">
          <div className="flex items-start gap-2 mb-3 px-1">
            <Info className="w-3.5 h-3.5 text-[#5a6480] mt-0.5 shrink-0" />
            <p className="text-[11px] text-[#5a6480] leading-relaxed">
              Simulation mode means the agent logs verifiable intent but the underlying protocol is not available on this testnet. All WDK integrations are correctly wired.
            </p>
          </div>
          {protocolStatus ? (
            <>
              {([
                ['Lending (Aave V3)', protocolStatus.lending] as const,
                ['Bridge (USDT0)', protocolStatus.bridge] as const,
                ['Swap (Velora)', protocolStatus.swap] as const,
                ['Escrow (HTLC)', protocolStatus.escrow] as const,
              ] as const).map(([label, entry]) => {
                const mode = entry.mode ?? (entry.available ? 'live' : 'unavailable');
                const dotColor = mode === 'live' ? 'bg-[#85c742] shadow-[#85c742]/40'
                  : mode === 'simulation' ? 'bg-amber-400 shadow-amber-400/30'
                  : mode === 'htlc' ? 'bg-[#85c742] shadow-[#85c742]/40'
                  : 'bg-red-400 shadow-red-400/30';
                const modeLabel = mode === 'htlc' ? 'HTLC' : mode === 'live' ? 'Live' : mode === 'simulation' ? 'Simulation' : 'Unavailable';
                return (
                  <div key={label} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                    <span className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${dotColor}`} />
                    <span className="text-sm font-medium text-[#c8d1e0] w-32 shrink-0">{label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                      mode === 'live' || mode === 'htlc' ? 'bg-[#85c742]/15 text-[#9dd96b] border border-[#85c742]/25'
                      : mode === 'simulation' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                      : 'bg-red-500/15 text-red-400 border border-red-500/25'
                    }`}>{modeLabel}</span>
                    <span className="text-[11px] text-[#5a6480] ml-2 truncate">{entry.reason ?? entry.note ?? ''}</span>
                  </div>
                );
              })}
              {/* LLM provider row */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <span className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${protocolStatus.llm.available ? 'bg-[#85c742] shadow-[#85c742]/40' : 'bg-amber-400 shadow-amber-400/30'}`} />
                <span className="text-sm font-medium text-[#c8d1e0] w-32 shrink-0">LLM Engine</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                  protocolStatus.llm.available
                    ? 'bg-[#85c742]/15 text-[#9dd96b] border border-[#85c742]/25'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                }`}>{protocolStatus.llm.provider ?? 'rule-based'}</span>
                <span className="text-[11px] text-[#5a6480] ml-2 truncate">{protocolStatus.llm.model ?? ''}</span>
              </div>
            </>
          ) : demoMode ? (
            <p className="text-xs text-[#5a6480] px-3 py-2">Protocol status unavailable in demo mode</p>
          ) : (
            <div className="flex items-center justify-center py-4"><Loader2 className="w-4 h-4 text-[#5a6480] animate-spin" /></div>
          )}
        </div>
      )}
    </section>
  );
}
