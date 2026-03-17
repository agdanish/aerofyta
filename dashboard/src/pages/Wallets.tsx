import { useMemo } from "react";
import { demoWallets } from "@/lib/demo-data";
import { useFetch } from "@/hooks/useFetch";
import CopyButton from "@/components/shared/CopyButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

/* ── chain metadata for display ── */
const chainMeta: Record<string, { label: string; symbol: string; color: string }> = {
  "ethereum-sepolia":          { label: "Ethereum Sepolia", symbol: "ETH",  color: "#627EEA" },
  "ton-testnet":               { label: "TON Testnet",     symbol: "TON",  color: "#0098EA" },
  "tron-nile":                 { label: "Tron Nile",       symbol: "TRX",  color: "#FF0013" },
  "ethereum-sepolia-gasless":  { label: "ETH Gasless",     symbol: "ETH",  color: "#627EEA" },
  "ton-testnet-gasless":       { label: "TON Gasless",     symbol: "TON",  color: "#0098EA" },
  "bitcoin-testnet":           { label: "Bitcoin Testnet", symbol: "BTC",  color: "#F7931A" },
  "solana-devnet":             { label: "Solana Devnet",   symbol: "SOL",  color: "#9945FF" },
  "plasma":                    { label: "Plasma",          symbol: "ETH",  color: "#8247E5" },
  "stable":                    { label: "Stable",          symbol: "ETH",  color: "#50AF95" },
};

/* ── API response types ── */
interface AddressesResponse {
  addresses: Record<string, string>;
}

interface BalanceEntry {
  chainId: string;
  address: string;
  nativeBalance: string;
  nativeCurrency: string;
  usdtBalance: string;
}

interface BalancesResponse {
  balances: BalanceEntry[];
}

export default function Wallets() {
  const { data: addrData, isDemo: isAddrDemo } = useFetch<AddressesResponse | typeof demoWallets>(
    "/api/wallet/addresses",
    demoWallets,
  );
  const { data: balData } = useFetch<BalancesResponse | null>(
    "/api/wallet/balances",
    null,
  );

  /* merge addresses + balances into the shape the UI expects */
  const wallets = useMemo(() => {
    // If we got demo data (array), just use it directly
    if (isAddrDemo || Array.isArray(addrData)) {
      return demoWallets;
    }

    const resp = addrData as AddressesResponse;
    if (!resp?.addresses) return demoWallets;

    const balMap = new Map<string, BalanceEntry>();
    if (balData && !Array.isArray(balData) && (balData as BalancesResponse).balances) {
      for (const b of (balData as BalancesResponse).balances) {
        balMap.set(b.chainId, b);
      }
    }

    return Object.entries(resp.addresses).map(([chainId, address]) => {
      const meta = chainMeta[chainId] ?? { label: chainId, symbol: "?", color: "#666" };
      const bal = balMap.get(chainId);
      return {
        chain: meta.label,
        symbol: meta.symbol,
        address,
        usdt: bal ? parseFloat(bal.usdtBalance).toFixed(2) : "0.00",
        native: bal ? bal.nativeBalance : "0",
        nativeSymbol: bal ? bal.nativeCurrency : meta.symbol,
        color: meta.color,
        status: address === "Error" ? "error" : "active",
      };
    });
  }, [addrData, balData, isAddrDemo]);

  const truncate = (addr: string) =>
    addr.length > 16 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Multi-Chain Wallets</h1>
        <p className="text-sm text-muted-foreground mt-1">One seed. Nine chains. Non-custodial.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.map((w) => (
          <div
            key={w.chain}
            className="rounded-xl border border-border/50 bg-card/50 overflow-hidden hover:border-border transition-all group"
            style={{ borderLeftWidth: 3, borderLeftColor: w.color }}
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: w.color }}
                  >
                    {w.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{w.chain}</h3>
                    <p className="text-[11px] text-muted-foreground">{w.symbol}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`h-1.5 w-1.5 rounded-full ${w.status === "active" ? "bg-success" : "bg-yellow-500"}`} />
                  <span className="text-[10px] text-muted-foreground capitalize">{w.status}</span>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-1 mb-4 bg-secondary/40 rounded-md px-2.5 py-1.5">
                <code className="text-[11px] font-mono text-muted-foreground flex-1 truncate">
                  {truncate(w.address)}
                </code>
                <CopyButton text={w.address} />
              </div>

              {/* Balances */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">USDT</p>
                  <p className="text-sm font-semibold tabular-nums">${w.usdt}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{w.nativeSymbol}</p>
                  <p className="text-sm font-semibold tabular-nums">{w.native}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-border/30 px-5 py-2.5 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => toast.info(`Faucet link for ${w.chain} opened`)}
              >
                Fund
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => toast.success(`Gasless test sent on ${w.chain}`)}
              >
                Gasless Test
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground ml-auto"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
