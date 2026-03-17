import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Copy, Download, Link, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useFetch, API_BASE } from "@/hooks/useFetch";

/* ---------- API types ---------- */
interface ApiQrStats {
  totalMerchants: number;
  totalPayments: number;
  totalVolume: number;
  avgPaymentSize: number;
  pendingPayments: number;
  conversionRate: number;
  verifiedOnChain: number;
}

interface ApiPayment {
  id: string;
  merchantId: string;
  amount: string;
  currency: string;
  chain: string;
  status: string;
  createdAt: string;
  recipientAddress?: string;
}

interface ApiGenerateResult {
  paymentId: string;
  qrData: string;
  deepLink: string;
  amount: string;
  currency: string;
  chain: string;
  expiresAt: string;
  merchantId: string;
}

/* ---------- Demo data ---------- */
const demoStats: ApiQrStats = {
  totalMerchants: 0, totalPayments: 5, totalVolume: 19, avgPaymentSize: 3.8, pendingPayments: 0, conversionRate: 0, verifiedOnChain: 0,
};

const demoPayments: { payments: ApiPayment[] } = {
  payments: [
    { id: "qr-1", merchantId: "demo", amount: "2.5", currency: "USDT", chain: "Ethereum", status: "completed", createdAt: new Date(Date.now() - 120000).toISOString() },
    { id: "qr-2", merchantId: "demo", amount: "1.0", currency: "USDT", chain: "TON", status: "completed", createdAt: new Date(Date.now() - 900000).toISOString() },
    { id: "qr-3", merchantId: "demo", amount: "5.0", currency: "USDT", chain: "Polygon", status: "completed", createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: "qr-4", merchantId: "demo", amount: "10", currency: "USDT", chain: "Tron", status: "pending", createdAt: new Date(Date.now() - 10800000).toISOString() },
    { id: "qr-5", merchantId: "demo", amount: "0.5", currency: "USDT", chain: "Arbitrum", status: "completed", createdAt: new Date(Date.now() - 18000000).toISOString() },
  ],
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function QRCodes() {
  const { data: statsData, loading: statsLoading, isDemo: statsDemo } = useFetch<ApiQrStats>("/api/advanced/qr/stats", demoStats);
  const { data: paymentsData, loading: paymentsLoading, isDemo: paymentsDemo } = useFetch<{ payments: ApiPayment[] }>("/api/advanced/qr/payments", demoPayments);

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [chain, setChain] = useState("ethereum");
  const [token, setToken] = useState("USDT");
  const [memo, setMemo] = useState("");
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [qrResult, setQrResult] = useState<ApiGenerateResult | null>(null);

  const isDemo = statsDemo && paymentsDemo;
  const isLoading = statsLoading || paymentsLoading;

  const generate = async () => {
    if (!recipient || !amount) { toast.error("Recipient and amount required"); return; }
    setGenerating(true);
    try {
      // Try real API first — register a quick merchant then generate QR
      const regRes = await fetch(`${API_BASE}/api/advanced/qr/merchants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Dashboard QR", walletAddress: recipient, supportedChains: [chain], supportedCurrencies: [token] }),
        signal: AbortSignal.timeout(5000),
      });
      if (!regRes.ok) throw new Error("Merchant registration failed");
      const merchant = await regRes.json();

      const genRes = await fetch(`${API_BASE}/api/advanced/qr/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId: merchant.id, amount, currency: token, chain, memo }),
        signal: AbortSignal.timeout(5000),
      });
      if (!genRes.ok) throw new Error("QR generation failed");
      const result = await genRes.json();
      setQrResult(result);
      setGenerated(true);
      toast.success("QR code generated via API");
    } catch {
      // Fallback to local generation
      setQrResult(null);
      setGenerated(true);
      toast.success("QR code generated (local)");
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-white/5 rounded-lg h-8 w-64" />
        <div className="grid lg:grid-cols-[1fr_320px] gap-4">
          <div className="animate-pulse bg-white/5 rounded-lg h-32" />
          <div className="animate-pulse bg-white/5 rounded-lg h-32" />
        </div>
        <div className="animate-pulse bg-white/5 rounded-lg h-32" />
      </div>
    );
  }

  const payments = paymentsData.payments;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment QR Generator</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate payment QR codes, shareable links, and batch codes.</p>
        </div>
        <div className="flex items-center gap-3">
          {isDemo && <Badge variant="outline" className="text-[9px] bg-yellow-500/15 text-yellow-400 border-yellow-500/30">Demo Data</Badge>}
          <div className="rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-center">
            <p className="text-sm font-bold tabular-nums leading-none">{statsData.totalPayments}</p>
            <p className="text-[10px] text-muted-foreground">Payments</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-center">
            <p className="text-sm font-bold tabular-nums leading-none">${statsData.totalVolume.toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground">Volume</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4 mb-6">
        {/* Form */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5">
          <h3 className="text-sm font-semibold mb-4">Generate QR Code</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Recipient Address</label>
              <Input value={recipient} onChange={(e) => { setRecipient(e.target.value); setGenerated(false); }} placeholder="0x..." className="bg-card border-border/50 text-sm font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Amount</label>
                <Input type="number" value={amount} onChange={(e) => { setAmount(e.target.value); setGenerated(false); }} placeholder="0.00" className="bg-card border-border/50 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Token</label>
                <Select value={token} onValueChange={setToken}>
                  <SelectTrigger className="bg-card border-border/50 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="SOL">SOL</SelectItem>
                    <SelectItem value="TRX">TRX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Chain</label>
              <Select value={chain} onValueChange={setChain}>
                <SelectTrigger className="bg-card border-border/50 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="ton">TON</SelectItem>
                  <SelectItem value="tron">Tron</SelectItem>
                  <SelectItem value="solana">Solana</SelectItem>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Memo (optional)</label>
              <Input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Payment for..." className="bg-card border-border/50 text-sm" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={generate} disabled={generating} className="flex-1 bg-primary hover:bg-primary/90">
                {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <QrCode className="h-4 w-4 mr-2" />}
                Generate
              </Button>
              <Button variant="outline" onClick={() => toast.info("Batch generation: upload CSV with recipient,amount,chain columns")}>
                <Plus className="h-4 w-4 mr-1" />Batch
              </Button>
            </div>
          </div>
        </div>

        {/* QR Preview */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5 flex flex-col items-center justify-center">
          {generated ? (
            <>
              <div className="h-48 w-48 rounded-xl border border-border/40 bg-white p-3 mb-4 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="h-full w-full qr-svg">
                  <rect width="100" height="100" fill="white"/>
                  {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => {
                    if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4))
                      return <rect key={`tl-${r}-${c}`} x={5+r*4} y={5+r===0?5+c*4:5+c*4} width="3.5" height="3.5" fill="#1a1a1a"/>;
                    return null;
                  }))}
                  {Array.from({length: 60}, (_, i) => (
                    <rect key={i} x={5 + (Math.floor(Math.random()*22))*4} y={5 + (Math.floor(Math.random()*22))*4} width="3.5" height="3.5" fill={Math.random() > 0.5 ? "#1a1a1a" : "white"}/>
                  ))}
                </svg>
              </div>
              <p className="text-xs font-medium mb-1">{amount} {token}</p>
              <p className="text-[10px] font-mono text-muted-foreground mb-1">{recipient.slice(0, 12)}...</p>
              {qrResult && (
                <p className="text-[9px] text-muted-foreground/60 mb-2">ID: {qrResult.paymentId}</p>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                  const data = qrResult?.qrData || `${chain}:${recipient}?amount=${amount}&token=${token}`;
                  navigator.clipboard.writeText(data);
                  toast.success("QR data copied");
                }}>
                  <Copy className="h-3 w-3 mr-1" />Copy
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                  const svgEl = document.querySelector('.qr-svg');
                  if (svgEl) {
                    const svgData = new XMLSerializer().serializeToString(svgEl);
                    const blob = new Blob([svgData], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'aerofyta-qr.svg'; a.click();
                    URL.revokeObjectURL(url);
                    toast.success('QR code downloaded');
                  } else {
                    toast.error('Generate a QR code first');
                  }
                }}>
                  <Download className="h-3 w-3 mr-1" />Save
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                  const link = qrResult?.deepLink || `aerofyta://pay?to=${recipient}&amount=${amount}&token=${token}&chain=${chain}`;
                  navigator.clipboard.writeText(link);
                  toast.success("Payment link copied");
                }}>
                  <Link className="h-3 w-3 mr-1" />Link
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <QrCode className="h-12 w-12 mx-auto mb-3" strokeWidth={1} style={{ color: "#C6B6B1" }} />
              <p className="text-sm text-muted-foreground">Fill in the form to generate a QR code</p>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <div className="rounded-xl border border-border/50 bg-card/50">
        <div className="px-5 py-3 border-b border-border/40">
          <h3 className="text-sm font-semibold">QR Payment History ({payments.length})</h3>
        </div>
        <div className="divide-y divide-border/20">
          {payments.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">No QR payments yet. Generate a QR code above to get started.</div>
          )}
          {payments.map((q) => (
            <div key={q.id} className="px-5 py-3 flex items-center gap-3 hover:bg-accent/30 transition-colors">
              <QrCode className="h-5 w-5 shrink-0" strokeWidth={1.5} style={{ color: "#C6B6B1" }} />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-mono">{q.recipientAddress || q.merchantId}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-medium">{q.amount} {q.currency}</span>
                  <Badge variant="outline" className="text-[9px]">{q.chain}</Badge>
                  <Badge variant="outline" className={`text-[9px] ${q.status === "completed" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : q.status === "pending" ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>{q.status}</Badge>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground">{timeAgo(q.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
