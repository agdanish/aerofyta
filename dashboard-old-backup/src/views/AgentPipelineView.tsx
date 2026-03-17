// Copyright 2026 Danish A. Licensed under Apache-2.0.
// AgentPipelineView — agent pipeline status section extracted from App.tsx.

import { Radio, Brain, Loader2 } from 'lucide-react';
import type { AgentState } from '../hooks/useAgentData';
import { stepLabels } from '../hooks/useAgentData';

export interface AgentPipelineViewProps {
  agentState: AgentState;
}

export function AgentPipelineView({ agentState }: AgentPipelineViewProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Radio className="w-5 h-5 text-[#ff4d4d] drop-shadow-[0_0_6px_rgba(255,77,77,0.5)]" />
        <h2 className="text-lg font-bold tracking-tight">Agent Pipeline</h2>
        <span className={`ml-auto text-xs px-2.5 py-0.5 rounded-full font-medium ${agentState.status === 'idle' ? 'bg-white/[0.04] text-[#8892b0]' : 'bg-[#9dd96b]/15 text-[#9dd96b] animate-pulse shadow-sm shadow-[#9dd96b]/20'}`}>
          {stepLabels[agentState.status] || agentState.status}
        </span>
      </div>
      <div className={`rounded-2xl border p-5 backdrop-blur-xl shadow-xl shadow-black/10 ${agentState.status !== 'idle' ? 'border-[#85c742]/30 bg-[#85c742]/[0.03]' : 'border-white/[0.06] bg-white/[0.03]'}`}>
        {agentState.status === 'idle' ? (
          <div className="text-center py-6">
            <Brain className="w-12 h-12 text-[#5a6480]/30 mx-auto mb-3" />
            <p className="text-sm text-[#8892b0]">Agent ready — 11-step decision pipeline</p>
            <p className="text-xs text-[#5a6480] mt-1">INTAKE {'\u2192'} ANALYZE {'\u2192'} REASON {'\u2192'} CONSENSUS {'\u2192'} EXECUTE {'\u2192'} VERIFY</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#ff4d4d]/20 flex items-center justify-center"><Brain className="w-4 h-4 text-[#ff4d4d]" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{stepLabels[agentState.currentStep || ''] || stepLabels[agentState.status] || agentState.currentStep || agentState.status}</p>
                {agentState.reasoning && <p className="text-xs text-[#8892b0] mt-0.5">{agentState.reasoning}</p>}
              </div>
              <Loader2 className="w-4 h-4 text-[#85c742] animate-spin" />
            </div>
            {agentState.progress !== undefined && (
              <div className="h-1.5 rounded-full bg-[#0a0f1a] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#85c742] to-[#ff4d4d] transition-all duration-500" style={{ width: `${agentState.progress}%` }} />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
