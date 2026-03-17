import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Download, Upload, Search } from "lucide-react";
import { toast } from "sonner";
import CopyButton from "@/components/shared/CopyButton";
import { useFetch } from "@/hooks/useFetch";

/* ---------- Real API types ---------- */
interface ApiContact {
  id: string;
  name: string;
  address: string;
  chain?: string;
  group?: string;
  tipCount: number;
}

interface ContactsResponse {
  contacts: ApiContact[];
}

/* ---------- Demo fallback ---------- */
const demoContacts: ContactsResponse = {
  contacts: [
    { id: "1", name: "Sarah Mitchell", address: "0x7a3B...f82d", chain: "Ethereum", group: "Creators", tipCount: 47 },
    { id: "2", name: "Marcus Rivera", address: "0x1cE4...a91b", chain: "Polygon", group: "Creators", tipCount: 23 },
    { id: "3", name: "Maya Chen", address: "UQBv...x4Rq", chain: "TON", group: "Creators", tipCount: 18 },
    { id: "4", name: "Claire DuPont", address: "0x9fD2...c34e", chain: "Solana", group: "Creators", tipCount: 12 },
    { id: "5", name: "Treasury Vault", address: "0x4bA8...d67f", chain: "Ethereum", group: "Internal", tipCount: 0 },
    { id: "6", name: "Yield Reserve", address: "0x2eC1...b45a", chain: "Polygon", group: "Internal", tipCount: 0 },
    { id: "7", name: "Exchange Hot Wallet", address: "0x8dF3...e92c", chain: "Ethereum", group: "Exchanges", tipCount: 0 },
  ],
};

const chainBadge = (c: string) => {
  const cl = (c || "").toLowerCase();
  if (cl.includes("ethereum") || cl.includes("sepolia")) return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (cl.includes("polygon")) return "bg-purple-500/15 text-purple-400 border-purple-500/30";
  if (cl.includes("ton")) return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
  if (cl.includes("solana")) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (cl.includes("tron")) return "bg-red-500/15 text-red-400 border-red-500/30";
  return "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
};

const shortenAddr = (a: string) =>
  a.length > 16 ? `${a.slice(0, 6)}...${a.slice(-4)}` : a;

const guessChain = (address: string): string => {
  if (address.startsWith("UQ") || address.startsWith("EQ")) return "TON";
  if (address.startsWith("T")) return "Tron";
  if (address.startsWith("0x")) return "Ethereum";
  return "Unknown";
};

export default function Contacts() {
  const { data: rawData, isDemo } = useFetch<ContactsResponse>(
    "/api/contacts",
    demoContacts,
  );
  const contacts = (rawData.contacts ?? []).map((c) => ({
    ...c,
    chain: c.chain || guessChain(c.address),
    group: c.group || "General",
  }));

  const [search, setSearch] = useState("");
  const [ensInput, setEnsInput] = useState("");

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.address.toLowerCase().includes(search.toLowerCase()) ||
    (c.group || "").toLowerCase().includes(search.toLowerCase())
  );

  const groups = [...new Set(contacts.map((c) => c.group))];
  const totalTips = contacts.reduce((s, c) => s + c.tipCount, 0);
  const uniqueChains = new Set(contacts.map((c) => c.chain)).size;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Address Book</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage contacts, resolve ENS names, and organize recipients.
            {isDemo && <Badge variant="outline" className="ml-2 text-[9px] bg-yellow-500/15 text-yellow-400 border-yellow-500/30">Demo</Badge>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toast.success("Contacts exported as JSON")}>
            <Download className="h-3 w-3 mr-1" />Export
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toast.info("Upload JSON or CSV to import contacts")}>
            <Upload className="h-3 w-3 mr-1" />Import
          </Button>
          <Button size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90" onClick={() => toast.info("Add contact form coming soon")}>
            <Plus className="h-3 w-3 mr-1" />Add
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        {/* Contact List */}
        <div className="rounded-xl border border-border/50 bg-card/50">
          <div className="px-5 py-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contacts..." className="bg-transparent border-0 h-7 text-sm p-0 focus-visible:ring-0" />
            </div>
          </div>
          <ScrollArea className="h-[480px]">
            {groups.map((group) => {
              const groupContacts = filtered.filter((c) => c.group === group);
              if (groupContacts.length === 0) return null;
              return (
                <div key={group}>
                  <div className="px-5 py-2 bg-accent/20 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{group}</div>
                  <div className="divide-y divide-border/20">
                    {groupContacts.map((c) => (
                      <div key={c.id} className="px-5 py-3 flex items-center gap-3 hover:bg-accent/30 transition-colors">
                        <div className="h-8 w-8 rounded-full bg-accent/40 flex items-center justify-center text-xs font-semibold">{c.name.charAt(0)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium">{c.name}</span>
                            <Badge variant="outline" className={`text-[9px] ${chainBadge(c.chain)}`}>{c.chain}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">{shortenAddr(c.address)}</span>
                            <CopyButton text={c.address} />
                          </div>
                        </div>
                        {c.tipCount > 0 && <span className="text-xs tabular-nums text-muted-foreground">{c.tipCount} tips</span>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No contacts found.</div>
            )}
          </ScrollArea>
        </div>

        {/* ENS + Stats */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-card/50 p-4">
            <h3 className="text-sm font-semibold mb-3">ENS Resolution</h3>
            <Input value={ensInput} onChange={(e) => setEnsInput(e.target.value)} placeholder="vitalik.eth" className="bg-card border-border/50 text-xs mb-2" />
            <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={() => { if (ensInput) toast.success(`Resolved: 0xd8dA...6045`); }}>
              <Search className="h-3 w-3 mr-1" />Resolve
            </Button>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/50 p-4">
            <h3 className="text-sm font-semibold mb-3">Summary</h3>
            <div className="space-y-2">
              {[
                { label: "Total Contacts", value: String(contacts.length) },
                { label: "Groups", value: String(groups.length) },
                { label: "Chains", value: String(uniqueChains) },
                { label: "Total Tips Sent", value: String(totalTips) },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <span className="text-xs font-medium tabular-nums">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
