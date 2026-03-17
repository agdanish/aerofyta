// Copyright 2026 Danish A. Licensed under Apache-2.0.
// Custom hooks for App.tsx state management — reduces god-component pattern.

import { useState, useCallback } from 'react';

// ─── Tip Form State ──────────────────────────────────────
export function useTipForm() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState<'native' | 'usdt' | 'xaut' | 'btc'>('native');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const reset = useCallback(() => {
    setRecipient('');
    setAmount('');
    setToken('native');
    setMessage('');
    setSending(false);
  }, []);

  return { recipient, setRecipient, amount, setAmount, token, setToken, message, setMessage, sending, setSending, reset };
}

// ─── Auto-Tip Form State ────────────────────────────────
export function useAutoTipForm() {
  const [atMinWatch, setAtMinWatch] = useState('70');
  const [atAmount, setAtAmount] = useState('0.001');
  const [atMaxDay, setAtMaxDay] = useState('5');
  const [atSaving, setAtSaving] = useState(false);

  return { atMinWatch, setAtMinWatch, atAmount, setAtAmount, atMaxDay, setAtMaxDay, atSaving, setAtSaving };
}

// ─── Pool Form State ─────────────────────────────────────
export function usePoolForm() {
  const [poolCreator, setPoolCreator] = useState('');
  const [poolTitle, setPoolTitle] = useState('');
  const [poolGoal, setPoolGoal] = useState('');
  const [poolSaving, setPoolSaving] = useState(false);

  return { poolCreator, setPoolCreator, poolTitle, setPoolTitle, poolGoal, setPoolGoal, poolSaving, setPoolSaving };
}

// ─── Event Trigger Form State ────────────────────────────
export function useEventForm() {
  const [evtCreator, setEvtCreator] = useState('');
  const [evtType, setEvtType] = useState<'new_video' | 'milestone' | 'live_start' | 'anniversary'>('new_video');
  const [evtAmount, setEvtAmount] = useState('0.001');
  const [evtSaving, setEvtSaving] = useState(false);
  const [evtSuccess, setEvtSuccess] = useState('');

  return { evtCreator, setEvtCreator, evtType, setEvtType, evtAmount, setEvtAmount, evtSaving, setEvtSaving, evtSuccess, setEvtSuccess };
}

// ─── Split Form State ────────────────────────────────────
export function useSplitForm() {
  const [splitRecipients, setSplitRecipients] = useState<string[]>(['', '']);
  const [splitAmount, setSplitAmount] = useState('');
  const [splitSending, setSplitSending] = useState(false);

  return { splitRecipients, setSplitRecipients, splitAmount, setSplitAmount, splitSending, setSplitSending };
}

// ─── Live Reasoning SSE State ────────────────────────────
export interface ReasoningEvent {
  type: string;
  content: string;
  confidence?: number;
  step: number;
  source?: string;
  timestamp: string;
}

export function useReasoningPanel() {
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [reasoningEvents, setReasoningEvents] = useState<ReasoningEvent[]>([]);
  const [reasoningActive, setReasoningActive] = useState(false);
  const [reasoningPrompt, setReasoningPrompt] = useState('Tip 0.01 USDT to top Rumble creator');

  return { reasoningOpen, setReasoningOpen, reasoningEvents, setReasoningEvents, reasoningActive, setReasoningActive, reasoningPrompt, setReasoningPrompt };
}

// ─── UI Toggle State ─────────────────────────────────────
export function useUIToggles() {
  const [advancedMode, setAdvancedMode] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  const [dismissAiBanner, setDismissAiBanner] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  return { advancedMode, setAdvancedMode, showBackup, setShowBackup, showSystemStatus, setShowSystemStatus, dismissAiBanner, setDismissAiBanner, copied, setCopied };
}
