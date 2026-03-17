// Copyright 2026 Danish A. Licensed under Apache-2.0.
// WalletView — wallet balances section extracted from App.tsx.

import { Wallet, Shield, Copy, Check } from 'lucide-react';
import type { WalletBalance } from '../hooks/useAgentData';

export interface WalletViewProps {
  balances: WalletBalance[];
  totalUsdt: number;
  initialLoading: boolean;
  copied: string | null;
  onCopy: (text: string, id: string) => void;
  onShowBackup: () => void;
}

export function WalletView({ balances, totalUsdt, initialLoading, copied, onCopy, onShowBackup }: WalletViewProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-[#85c742] drop-shadow-[0_0_6px_rgba(133,199,66,0.5)]" />
        <h2 className="text-lg font-bold tracking-tight">Wallets</h2>
        <button onClick={onShowBackup}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-[#8892b0] hover:text-[#f0f4ff] hover:border-white/[0.15] hover:bg-white/[0.06] transition-all ml-auto mr-3">
          <Shield className="w-3.5 h-3.5" /> Backup
        </button>
        <span className="text-xs text-[#9dd96b] font-semibold">${totalUsdt.toFixed(2)} <span className="text-[#5a6480] font-normal">USDT total</span></span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {initialLoading && balances.length === 0 && [0, 1, 2].map(i => (
          <div key={i} className="flex-shrink-0 w-52 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-4 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-white/[0.08]" />
              <div className="h-4 w-12 rounded bg-white/[0.08]" />
            </div>
            <div className="h-5 w-28 rounded bg-white/[0.06] mb-2" />
            <div className="h-4 w-20 rounded bg-white/[0.05]" />
          </div>
        ))}
        {balances.map((b) => {
          const label = b.chainId.includes('ethereum') ? 'ETH' : b.chainId.includes('ton') ? 'TON' : b.chainId.includes('tron') ? 'TRX' : b.chainId.includes('bitcoin') ? 'BTC' : 'SOL';
          const color = b.chainId.includes('ethereum') ? '#627eea' : b.chainId.includes('ton') ? '#0098ea' : b.chainId.includes('tron') ? '#eb0029' : '#f7931a';
          return (
            <div key={b.chainId} className="flex-shrink-0 w-52 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-4 hover:border-white/[0.12] hover:bg-white/[0.05] hover:shadow-lg hover:shadow-black/20 transition-all duration-300 group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-md" style={{ backgroundColor: color, boxShadow: `0 4px 12px ${color}30` }}>{label}</div>
                <span className="text-sm font-semibold">{label}</span>
                <button onClick={() => onCopy(b.address, b.chainId)} className="ml-auto text-[#5a6480] hover:text-[#8892b0]">
                  {copied === b.chainId ? <Check className="w-3.5 h-3.5 text-[#9dd96b]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-lg font-bold tabular-nums">{(parseFloat(b.nativeBalance) || 0).toFixed(4)} <span className="text-xs text-[#8892b0]">{b.nativeCurrency}</span></p>
              {(parseFloat(b.usdtBalance) || 0) > 0 && <p className="text-sm text-[#9dd96b] tabular-nums mt-1 drop-shadow-[0_0_8px_rgba(0,229,204,0.3)]">{(parseFloat(b.usdtBalance) || 0).toFixed(2)} USDT</p>}
            </div>
          );
        })}
      </div>
      {/* Funding guide — shown when all balances are near zero */}
      {balances.length > 0 && totalUsdt < 0.001 && balances.every(b => (parseFloat(b.nativeBalance) || 0) < 0.001) && (
        <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] backdrop-blur-xl p-5">
          <h3 className="text-sm font-semibold text-amber-300 mb-2">Fund Your Wallet</h3>
          <p className="text-xs text-[#8892b0] mb-3">To send tips, you need testnet ETH and USDT:</p>
          <ol className="text-xs text-[#8892b0] space-y-1.5 list-decimal list-inside">
            <li>Copy your Ethereum address above using the copy button</li>
            <li>Get Sepolia ETH from faucet: <a href="https://faucets.chain.link/sepolia" target="_blank" rel="noopener noreferrer" className="text-[#9dd96b] hover:underline">faucets.chain.link/sepolia</a></li>
            <li>Get testnet USDT from: <a href="https://faucet.pimlico.io" target="_blank" rel="noopener noreferrer" className="text-[#9dd96b] hover:underline">faucet.pimlico.io</a></li>
          </ol>
        </div>
      )}
    </section>
  );
}
