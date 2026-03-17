import { Zap, ArrowUpRight, TrendingUp, Activity } from 'lucide-react';
import type { WalletBalance, HealthResponse } from '../../types';
import { formatNumber, chainColor } from '../../lib/utils';
import { useAnimatedValue } from '../../hooks/useAnimatedNumber';

interface DashboardHeroProps {
  balances: WalletBalance[];
  health: HealthResponse | null;
  agentStatus: string;
  totalTips: number;
  onSendTip: () => void;
}

export function DashboardHero({ balances, health, agentStatus, totalTips, onSendTip }: DashboardHeroProps) {
  const totalUsdt = balances.reduce((sum, b) => sum + (parseFloat(b.usdtBalance) || 0), 0);
  const totalNative = balances.reduce((sum, b) => sum + (parseFloat(b.nativeBalance) || 0), 0);
  const isOnline = health?.status === 'ok';
  const animatedUsdt = useAnimatedValue(totalUsdt, 1200);
  const animatedTips = useAnimatedValue(totalTips, 1200);

  return (
    <div className="relative mb-8">
      {/* Background */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-[rgba(136,146,176,0.15)]/90 border border-zinc-700/40" />
      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.12),transparent_50%)]" />
      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.06),transparent_50%)]" />

      <div className="relative px-8 py-8">
        {/* Top bar: status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(136,146,176,0.15)]/60 border border-zinc-700/40">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#85c742] animate-pulse' : 'bg-red-400'}`} />
              <span className="text-xs font-medium text-[#8892b0]">{isOnline ? 'Connected' : 'Connecting'}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(136,146,176,0.15)]/60 border border-zinc-700/40">
              <Activity className="w-3 h-3 text-[#8892b0]" />
              <span className="text-xs font-medium text-[#8892b0]">Agent {agentStatus}</span>
            </div>
          </div>
          <button
            onClick={onSendTip}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#85c742] hover:bg-[#85c742]/80 text-white font-semibold transition-all hover:shadow-xl hover:shadow-[#85c742]/25 active:scale-[0.97] text-sm"
          >
            <Zap className="w-4 h-4" />
            Send Tip
            <ArrowUpRight className="w-4 h-4 opacity-60" />
          </button>
        </div>

        {/* Main metrics row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total USDT */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">Total USDT</p>
            <p className="text-3xl lg:text-4xl font-extrabold text-white tabular-nums tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              ${formatNumber(animatedUsdt, 2)}
            </p>
          </div>
          {/* Native Holdings */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">Native Holdings</p>
            <p className="text-2xl lg:text-3xl font-bold text-zinc-200 tabular-nums tracking-tight">
              {formatNumber(totalNative, 4)}
            </p>
            <div className="flex items-center gap-3 mt-1">
              {balances.slice(0, 3).map((b) => (
                <span key={b.chainId} className="flex items-center gap-1 text-xs text-zinc-500">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: chainColor(b.chainId) }} />
                  {b.nativeCurrency}
                </span>
              ))}
            </div>
          </div>
          {/* Tips Sent */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">Tips Sent</p>
            <p className="text-2xl lg:text-3xl font-bold text-zinc-200 tabular-nums tracking-tight">
              {Math.round(animatedTips)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-[#85c742]" />
              <span className="text-xs text-[#85c742]">Active</span>
            </div>
          </div>
          {/* Chains */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">Chains</p>
            <div className="flex items-center gap-2 mt-1">
              {balances.map((b) => (
                <div
                  key={b.chainId}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-lg"
                  style={{ backgroundColor: chainColor(b.chainId), boxShadow: `0 4px 12px ${chainColor(b.chainId)}33` }}
                >
                  {b.chainId.includes('ethereum') ? 'ETH' : b.chainId.includes('ton') ? 'TON' : b.chainId.includes('tron') ? 'TRX' : b.chainId.includes('bitcoin') ? 'BTC' : 'SOL'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
