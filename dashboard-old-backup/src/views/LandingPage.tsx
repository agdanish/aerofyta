// Copyright 2026 Danish A. Licensed under Apache-2.0.
// LandingPage — marketing/landing page shown before the dashboard.

import { Zap, Eye, Users, Send, Brain, ArrowRight, Repeat, Lock, Star, Radio, Wallet, Check, X } from 'lucide-react';

export interface LandingPageProps {
  onLaunch: () => void;
}

const stats = [
  { label: 'Tests', value: '991' },
  { label: 'WDK Packages', value: '12' },
  { label: 'Chains', value: '9' },
  { label: 'Services', value: '60+' },
];

const steps = [
  { icon: Eye, title: 'Watch', desc: 'Agent monitors creator content via YouTube API + RSS feeds in real time' },
  { icon: Users, title: 'Decide', desc: 'Multi-agent consensus — 3 agents vote, deliberate, and flip decisions' },
  { icon: Send, title: 'Execute', desc: 'WDK sends payments across 9 chains with fee optimization' },
  { icon: Brain, title: 'Learn', desc: 'Agent learns from outcomes, adapts thresholds and tip amounts' },
];

const features = [
  { icon: Wallet, title: 'Wallet-as-Brain', desc: 'Financial Pulse scoring drives 8 adaptive agent behaviors based on wallet health' },
  { icon: Repeat, title: 'Cross-Chain Atomic Swaps', desc: 'Trustless HTLC-based exchange across any two chains without bridges' },
  { icon: Eye, title: 'Pay-per-Engagement', desc: 'Streaming micro-tips tied to real-time viewer engagement metrics' },
  { icon: Lock, title: 'HTLC Smart Escrow', desc: 'SHA-256 hash-locked conditional holds with automatic timeout refunds' },
  { icon: Star, title: 'Reputation Passport', desc: 'Cross-chain portable reputation score aggregated from on-chain activity' },
  { icon: Radio, title: 'Real-Time Reasoning (SSE)', desc: 'Watch the agent think live — streamed Thought, Action, Observation steps' },
];

const comparison = [
  { feature: 'WDK Packages', ours: '12', theirs: '3\u20137' },
  { feature: 'Chains Supported', ours: '9', theirs: '1\u20136' },
  { feature: 'Test Count', ours: '1,001', theirs: '0\u2013111' },
  { feature: 'MCP Tools', ours: '97+', theirs: '0\u201320' },
  { feature: 'Payment Types', ours: '8', oursDetail: 'escrow, swap, DCA, stream, x402, tips, splits, subscriptions', theirs: '1\u20133' },
  { feature: 'Agent Model', ours: 'Multi-agent vote flipping + ReAct + tool_use', theirs: 'Single LLM call' },
  { feature: 'Security Layers', ours: '6', oursDetail: 'policy, anomaly, risk, consensus, veto, de-escalate', theirs: '0\u20132' },
  { feature: 'Data Sources', ours: '4-tier', oursDetail: 'YouTube API, webhooks, RSS, simulator', theirs: '1' },
];

const techStack = [
  'Tether WDK', 'TypeScript', 'React', 'Node.js', 'Groq', 'YouTube API',
];

export function LandingPage({ onLaunch }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#050810] text-[#f0f4ff] relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#85c742]/[0.04] blur-[120px] animate-[aurora-drift-1_20s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#ff4d4d]/[0.03] blur-[100px] animate-[aurora-drift-2_25s_ease-in-out_infinite]" />
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full bg-[#9dd96b]/[0.025] blur-[80px] animate-[aurora-drift-3_18s_ease-in-out_infinite]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06] bg-[#050810]/80 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#85c742] to-[#6fa832] flex items-center justify-center shadow-lg shadow-[#85c742]/25 ring-1 ring-white/10">
              <Zap className="w-4.5 h-4.5 text-white drop-shadow-sm" />
            </div>
            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">AeroFyta</span>
          </div>
          <button
            onClick={onLaunch}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#85c742]/15 border border-[#85c742]/25 text-[#9dd96b] font-semibold text-sm hover:bg-[#85c742]/25 transition-all"
          >
            Launch Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#85c742]/10 border border-[#85c742]/20 text-xs text-[#9dd96b] font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-[#9dd96b] animate-pulse" />
            Powered by Tether WDK
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-4">
            <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">AeroFyta</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#8892b0] max-w-2xl mx-auto mb-3">
            Autonomous Multi-Chain Payment Agent
          </p>
          <p className="text-sm text-[#5a6480] max-w-xl mx-auto mb-10">
            AI-powered agent that watches creator engagement, makes intelligent tipping decisions, and executes multi-chain payments — all without human intervention.
          </p>
          <button
            onClick={onLaunch}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#85c742] to-[#6fa832] text-white font-bold text-base shadow-xl shadow-[#85c742]/30 hover:shadow-[#85c742]/50 hover:scale-[1.02] transition-all"
          >
            Launch Dashboard <ArrowRight className="w-5 h-5" />
          </button>
        </section>

        {/* Stats Bar */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#9dd96b]">{s.value}</div>
                <div className="text-xs text-[#5a6480] mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">How It Works</h2>
          <p className="text-sm text-[#5a6480] text-center mb-10 max-w-lg mx-auto">
            A fully autonomous loop: watch, decide, execute, learn — every 60 seconds.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <div key={s.title} className="relative p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-[#85c742]/20 transition-colors">
                <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-[#85c742] text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-[#85c742]/30">
                  {i + 1}
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#85c742]/10 border border-[#85c742]/20 flex items-center justify-center mb-3">
                  <s.icon className="w-5 h-5 text-[#9dd96b]" />
                </div>
                <h3 className="text-base font-bold mb-1">{s.title}</h3>
                <p className="text-xs text-[#5a6480] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">Key Features</h2>
          <p className="text-sm text-[#5a6480] text-center mb-10 max-w-lg mx-auto">
            Built for autonomous financial intelligence across multiple chains.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-[#85c742]/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#85c742]/10 border border-[#85c742]/20 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-[#9dd96b]" />
                </div>
                <h3 className="text-sm font-bold mb-1">{f.title}</h3>
                <p className="text-xs text-[#5a6480] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why AeroFyta — Comparison Table */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">Why AeroFyta?</h2>
          <p className="text-sm text-[#5a6480] text-center mb-10 max-w-lg mx-auto">
            Side-by-side comparison with typical hackathon submissions.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#85c742]/[0.06]">
                  <th className="text-left px-4 py-3 font-semibold text-[#9dd96b]">Feature</th>
                  <th className="text-center px-4 py-3 font-semibold text-[#9dd96b]">AeroFyta</th>
                  <th className="text-center px-4 py-3 font-semibold text-[#5a6480]">Typical</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-white/[0.04] ${i % 2 === 0 ? 'bg-white/[0.01]' : 'bg-white/[0.025]'} hover:bg-[#85c742]/[0.04] transition-colors`}>
                    <td className="px-4 py-3 font-medium text-[#f0f4ff]">{row.feature}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-[#85c742] flex-shrink-0" />
                        <span className="text-[#9dd96b] font-bold">{row.ours}</span>
                      </div>
                      {row.oursDetail && (
                        <div className="text-[10px] text-[#5a6480] mt-0.5 leading-tight">{row.oursDetail}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <X className="w-4 h-4 text-[#ff4d4d]/60 flex-shrink-0" />
                        <span className="text-[#5a6480]">{row.theirs}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Built With */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Built With</h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {techStack.map((t) => (
              <div key={t} className="px-5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm font-semibold text-[#8892b0] hover:text-[#f0f4ff] hover:border-[#85c742]/25 transition-colors">
                {t}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 text-center">
          <div className="p-8 rounded-3xl border border-[#85c742]/20 bg-[#85c742]/[0.04]">
            <h2 className="text-xl sm:text-2xl font-bold mb-3">Ready to explore?</h2>
            <p className="text-sm text-[#5a6480] mb-6 max-w-md mx-auto">
              Launch the dashboard to see the autonomous agent in action — real wallets, real decisions, real-time reasoning.
            </p>
            <button
              onClick={onLaunch}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#85c742] to-[#6fa832] text-white font-bold text-base shadow-xl shadow-[#85c742]/30 hover:shadow-[#85c742]/50 hover:scale-[1.02] transition-all"
            >
              Launch Dashboard <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between text-xs text-[#5a6480]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#85c742] shadow-sm shadow-[#85c742]/40" />
            AeroFyta — Powered by Tether WDK
          </div>
          <span>Hackathon Galactica 2026</span>
        </div>
      </footer>
    </div>
  );
}
