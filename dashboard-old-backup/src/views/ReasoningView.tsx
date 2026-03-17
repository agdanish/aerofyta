// Copyright 2026 Danish A. Licensed under Apache-2.0.
// ReasoningView — live reasoning SSE section extracted from App.tsx.

import { Brain, Loader2, Eye } from 'lucide-react';
import type { ReasoningEvent } from '../hooks/useAppState';

export interface ReasoningViewProps {
  reasoningOpen: boolean;
  setReasoningOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  reasoningEvents: ReasoningEvent[];
  reasoningActive: boolean;
  reasoningPrompt: string;
  setReasoningPrompt: (v: string) => void;
  onStartReasoning: () => void;
  reasoningEndRef: (node: HTMLDivElement | null) => void;
}

export function ReasoningView({
  reasoningOpen, setReasoningOpen, reasoningEvents, reasoningActive,
  reasoningPrompt, setReasoningPrompt, onStartReasoning, reasoningEndRef,
}: ReasoningViewProps) {
  return (
    <section>
      <button
        onClick={() => setReasoningOpen((o: boolean) => !o)}
        className="flex items-center gap-2 mb-3 w-full text-left group"
      >
        <Brain className="w-5 h-5 text-[#85c742] drop-shadow-[0_0_6px_rgba(133,199,66,0.5)]" />
        <h2 className="text-lg font-bold tracking-tight">Live Reasoning</h2>
        <span className="ml-auto text-xs text-[#5a6480] group-hover:text-[#85c742] transition-colors">
          {reasoningOpen ? 'Collapse' : 'Expand'}
        </span>
        <svg className={`w-4 h-4 text-[#5a6480] transition-transform ${reasoningOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {reasoningOpen && (
        <div className="rounded-2xl border border-[#85c742]/20 bg-[#85c742]/[0.02] backdrop-blur-xl p-5 space-y-4 shadow-xl shadow-black/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={reasoningPrompt}
              onChange={e => setReasoningPrompt(e.target.value)}
              placeholder="Enter a prompt for the agent..."
              className="flex-1 bg-[#0a0f1a] border border-white/[0.08] rounded-xl px-3 py-2 text-sm focus:border-[#85c742]/40 focus:outline-none placeholder:text-[#5a6480]"
              onKeyDown={e => { if (e.key === 'Enter' && !reasoningActive) onStartReasoning(); }}
            />
            <button
              onClick={onStartReasoning}
              disabled={reasoningActive || !reasoningPrompt.trim()}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#85c742] text-[#0a0f1a] hover:bg-[#9dd96b] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 shadow-lg shadow-[#85c742]/20"
            >
              {reasoningActive ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Thinking...</>
              ) : (
                <><Eye className="w-4 h-4" /> Watch Agent Think</>
              )}
            </button>
          </div>

          {reasoningEvents.length > 0 && (
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {reasoningEvents.map((evt, i) => {
                const icons: Record<string, string> = { thought: '\u{1F9E0}', action: '\u26A1', observation: '\u{1F441}\uFE0F', reflection: '\u{1F4AD}', decision: '\u2705' };
                const borderColors: Record<string, string> = { thought: 'border-blue-500/30', action: 'border-yellow-500/30', observation: 'border-purple-500/30', reflection: 'border-cyan-500/30', decision: 'border-[#85c742]/40' };
                return (
                  <div key={i} className={`flex items-start gap-2.5 px-3 py-2 rounded-xl border ${borderColors[evt.type] ?? 'border-white/[0.06]'} bg-white/[0.02]`}>
                    <span className="text-base mt-0.5 shrink-0">{icons[evt.type] ?? '\u2022'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#85c742]">{evt.type}</span>
                        {evt.confidence !== undefined && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-[#8892b0]">{evt.confidence}%</span>
                        )}
                        {evt.source && evt.source !== 'system' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-[#5a6480]">{evt.source}</span>
                        )}
                      </div>
                      <p className="text-sm text-[#c8cfd8] mt-0.5 leading-relaxed">{evt.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={reasoningEndRef} />
            </div>
          )}

          {reasoningEvents.length === 0 && !reasoningActive && (
            <div className="text-center py-6">
              <Brain className="w-10 h-10 text-[#85c742]/20 mx-auto mb-2" />
              <p className="text-sm text-[#5a6480]">Click &quot;Watch Agent Think&quot; to stream the AI reasoning process in real-time</p>
              <p className="text-xs text-[#5a6480]/60 mt-1">Thought &rarr; Action &rarr; Observation &rarr; Reflection &rarr; Decision</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
