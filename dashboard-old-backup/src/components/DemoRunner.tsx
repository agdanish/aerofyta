// Copyright 2026 Danish A. Licensed under Apache-2.0.
// DemoRunner — Zero-terminal full demo & step-by-step guided demo for judges.

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, ChevronRight, CheckCircle, XCircle, Loader2, RotateCcw, List } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface DemoEvent {
  step: number;
  total: number;
  title: string;
  result: Record<string, unknown>;
  status: 'success' | 'error' | 'done';
}

export function DemoRunner() {
  const [mode, setMode] = useState<'idle' | 'full' | 'step'>('idle');
  const [events, setEvents] = useState<DemoEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(10);
  const [expanded, setExpanded] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll as steps complete
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [events.length]);

  // Load step count
  useEffect(() => {
    fetch(`${API}/demo/steps`).then(r => r.json()).then(d => {
      if (d.total) setTotalSteps(d.total);
    }).catch(() => {});
  }, []);

  const runFullDemo = useCallback(async () => {
    setEvents([]);
    setRunning(true);
    setMode('full');

    try {
      const response = await fetch(`${API}/demo/run-full`, { method: 'POST' });
      if (!response.body) {
        setRunning(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6)) as DemoEvent;
              if (event.status === 'done') {
                setRunning(false);
              } else {
                setEvents(prev => [...prev, event]);
              }
            } catch { /* skip parse errors */ }
          }
        }
      }
    } catch (err) {
      console.error('Demo stream error:', err);
    }
    setRunning(false);
  }, []);

  const runSingleStep = useCallback(async (step: number) => {
    setRunning(true);
    setMode('step');

    try {
      const res = await fetch(`${API}/demo/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step }),
      });
      const data = await res.json() as DemoEvent;
      setEvents(prev => {
        // Replace if same step already exists, else append
        const existing = prev.findIndex(e => e.step === step);
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = data;
          return next;
        }
        return [...prev, data];
      });
      setCurrentStep(step < totalSteps ? step + 1 : step);
    } catch (err) {
      console.error('Demo step error:', err);
    }
    setRunning(false);
  }, [totalSteps]);

  const reset = () => {
    setEvents([]);
    setCurrentStep(1);
    setMode('idle');
    setRunning(false);
    setExpanded(null);
  };

  const progress = events.length > 0 ? (events.length / totalSteps) * 100 : 0;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] bg-gradient-to-r from-[#85c742]/[0.08] to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#f0f4ff]">Live Demo</h3>
            <p className="text-xs text-[#5a6480] mt-0.5">Run the full agent demo — no terminal needed</p>
          </div>
          <div className="flex items-center gap-2">
            {events.length > 0 && (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8892b0] hover:text-[#f0f4ff] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-5 py-4 flex flex-col sm:flex-row gap-3">
        <button
          onClick={runFullDemo}
          disabled={running}
          className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#85c742] to-[#6fa832] text-white font-bold text-sm shadow-lg shadow-[#85c742]/25 hover:shadow-[#85c742]/40 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running && mode === 'full' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Running Demo...</>
          ) : (
            <><Play className="w-4 h-4" /> Run Full Demo (No Terminal Needed)</>
          )}
        </button>

        <button
          onClick={() => runSingleStep(currentStep)}
          disabled={running}
          className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-[#f0f4ff] font-semibold text-sm hover:bg-white/[0.1] hover:border-white/[0.15] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running && mode === 'step' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Running Step {currentStep}...</>
          ) : (
            <><List className="w-4 h-4" /> Step {currentStep} of {totalSteps}</>
          )}
        </button>
      </div>

      {/* Step-by-step navigation */}
      {mode === 'step' && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => {
            const completed = events.some(e => e.step === s && e.status === 'success');
            const errored = events.some(e => e.step === s && e.status === 'error');
            return (
              <button
                key={s}
                onClick={() => { setCurrentStep(s); runSingleStep(s); }}
                disabled={running}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  completed ? 'bg-[#85c742]/20 text-[#9dd96b] border border-[#85c742]/30' :
                  errored ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  s === currentStep ? 'bg-white/[0.1] text-[#f0f4ff] border border-white/[0.2]' :
                  'bg-white/[0.03] text-[#5a6480] border border-white/[0.06] hover:text-[#8892b0]'
                } disabled:opacity-50`}
              >
                {s}
              </button>
            );
          })}
        </div>
      )}

      {/* Progress bar */}
      {events.length > 0 && (
        <div className="px-5 pb-3">
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#85c742] to-[#9dd96b] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-[#5a6480] mt-1.5">{events.length} of {totalSteps} steps completed</p>
        </div>
      )}

      {/* Results */}
      {events.length > 0 && (
        <div className="px-5 pb-5 space-y-2 max-h-[500px] overflow-y-auto">
          {events.map((evt) => (
            <div
              key={`step-${evt.step}`}
              className={`rounded-xl border p-3 transition-all cursor-pointer ${
                evt.status === 'success'
                  ? 'border-[#85c742]/20 bg-[#85c742]/[0.04] hover:bg-[#85c742]/[0.07]'
                  : 'border-red-500/20 bg-red-500/[0.04] hover:bg-red-500/[0.07]'
              }`}
              onClick={() => setExpanded(expanded === evt.step ? null : evt.step)}
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  {evt.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-[#9dd96b]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#5a6480] bg-white/[0.06] px-1.5 py-0.5 rounded">
                      {evt.step}/{evt.total}
                    </span>
                    <span className="text-sm font-semibold text-[#f0f4ff] truncate">{evt.title}</span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-[#5a6480] transition-transform ${expanded === evt.step ? 'rotate-90' : ''}`} />
              </div>

              {/* Expanded result details */}
              {expanded === evt.step && (
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                  <pre className="text-xs text-[#8892b0] font-mono whitespace-pre-wrap break-all leading-relaxed max-h-60 overflow-y-auto">
                    {JSON.stringify(evt.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      )}
    </div>
  );
}
