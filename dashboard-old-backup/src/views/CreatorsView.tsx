// Copyright 2026 Danish A. Licensed under Apache-2.0.
// CreatorsView — Rumble creators list + leaderboard extracted from App.tsx.

import { Users, Star, TrendingUp, Send, Trophy } from 'lucide-react';
import type { Creator, LeaderboardEntry } from '../hooks/useAgentData';

export interface CreatorsViewProps {
  creators: Creator[];
  leaderboard: LeaderboardEntry[];
  onTipCreator: (walletAddress: string) => void;
}

export function CreatorsView({ creators, leaderboard, onTipCreator }: CreatorsViewProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-[#ff4d4d] drop-shadow-[0_0_6px_rgba(255,77,77,0.4)]" />
        <h2 className="text-lg font-bold tracking-tight">Rumble Creators</h2>
        <span className="text-xs text-[#5a6480] ml-auto">{creators.length} registered</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-2">
          {creators.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8 text-center">
              <Users className="w-8 h-8 text-[#5a6480] mx-auto mb-3 opacity-50" />
              <p className="text-sm text-[#8892b0]">No creators yet — start agent with DEMO=true</p>
            </div>
          ) : creators.map((c) => (
            <div key={c.id} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm px-4 py-3 hover:border-white/[0.12] hover:bg-white/[0.05] hover:shadow-lg hover:shadow-[#85c742]/5 transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff4d4d]/20 to-[#85c742]/20 border border-white/10 flex items-center justify-center shadow-inner">
                <span className="text-sm font-bold text-[#ff4d4d]">{c.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{c.name}</p>
                <p className="text-xs text-[#5a6480] truncate">{c.channelUrl}</p>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-xs text-[#8892b0]">
                <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {c.totalTips}</span>
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {(c.totalAmount ?? 0).toFixed(4)}</span>
              </div>
              <button onClick={() => onTipCreator(c.walletAddress)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#85c742]/10 border border-[#85c742]/20 text-[#9dd96b] text-xs font-medium hover:bg-[#85c742]/20 transition-colors">
                <Send className="w-3 h-3" /> Tip
              </button>
            </div>
          ))}
        </div>
        {/* Leaderboard sidebar */}
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-4 shadow-xl shadow-black/10">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Trophy className="w-4 h-4 text-amber-400" /> Top Creators</h3>
          {leaderboard.length === 0 ? <p className="text-xs text-[#5a6480]">No tips yet</p> : (
            <div className="space-y-2">
              {leaderboard.map((e, i) => (
                <div key={e.address} className="flex items-center gap-2 text-xs">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-400/20 text-amber-400' : i === 1 ? 'bg-[#8892b0]/20 text-[#8892b0]' : i === 2 ? 'bg-[#ff4d4d]/20 text-[#ff4d4d]' : 'bg-[#0a0f1a] text-[#8892b0]'}`}>{i + 1}</span>
                  <span className="text-[#8892b0] font-mono truncate flex-1">{e.address.slice(0, 8)}...{e.address.slice(-4)}</span>
                  <span className="text-[#f0f4ff] font-medium">{e.totalTips} tips</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
