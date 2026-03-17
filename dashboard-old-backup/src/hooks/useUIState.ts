// Copyright 2026 Danish A. Licensed under Apache-2.0.
// Custom hook for UI state — extracted from App.tsx.

import { useState } from 'react';
import { isOnboardingComplete } from '../components/OnboardingOverlay';

/**
 * useUIState — manages UI-only state: active tab, modals, toggles, onboarding.
 * Separated from agent data so UI concerns don't mix with backend data.
 */
export function useUIState() {
  const [activeTab, setActiveTab] = useState<'tip' | 'autotip' | 'pools' | 'events'>('tip');
  const [showOnboarding, setShowOnboarding] = useState(!isOnboardingComplete());

  return {
    activeTab, setActiveTab,
    showOnboarding, setShowOnboarding,
  };
}
