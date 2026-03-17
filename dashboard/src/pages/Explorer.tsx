import { useState, useMemo, useEffect } from "react";
import { demoApiSpec } from "@/lib/demo-data";
import JsonViewer from "@/components/shared/JsonViewer";
import ShimmerSkeleton from "@/components/shared/ShimmerSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Send, ChevronDown, Loader2, Menu, Wifi, WifiOff } from "lucide-react";
import { API_BASE } from "@/hooks/useFetch";

interface Endpoint {
  method: string;
  path: string;
  tag: string;
  summary: string;
  params: { name: string; type: string; required: boolean; description: string; in?: string }[];
  body?: Record<string, unknown>;
  response?: unknown;
}

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  PUT: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
  PATCH: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const timeColor = (ms: number) => ms < 200 ? "bg-emerald-500/15 text-emerald-400" : ms < 500 ? "bg-yellow-500/15 text-yellow-400" : "bg-red-500/15 text-red-400";

/** Parse OpenAPI spec JSON into our Endpoint[] format */
function parseOpenApiSpec(spec: Record<string, unknown>): Endpoint[] {
  const paths = (spec.paths ?? {}) as Record<string, Record<string, unknown>>;
  const endpoints: Endpoint[] = [];

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, info] of Object.entries(methods)) {
      if (["get", "post", "put", "delete", "patch"].indexOf(method) === -1) continue;
      const op = info as Record<string, unknown>;
      const tags = (op.tags ?? []) as string[];
      const tag = tags[0] || "Other";
      const summary = (op.summary ?? op.description ?? "") as string;

      // Parse parameters
      const rawParams = (op.parameters ?? []) as Array<Record<string, unknown>>;
      const params = rawParams.map((p) => {
        const schema = (p.schema ?? {}) as Record<string, unknown>;
        return {
          name: (p.name ?? "") as string,
          type: (schema.type ?? "string") as string,
          required: !!p.required,
          description: (p.description ?? schema.description ?? "") as string,
          in: (p.in ?? "query") as string,
        };
      });

      // Parse request body into a default body object
      let body: Record<string, unknown> | undefined;
      const requestBody = op.requestBody as Record<string, unknown> | undefined;
      if (requestBody) {
        const content = (requestBody.content ?? {}) as Record<string, Record<string, unknown>>;
        const jsonContent = content["application/json"];
        if (jsonContent) {
          const schema = (jsonContent.schema ?? {}) as Record<string, unknown>;
          body = buildDefaultBody(schema);
        }
      }

      endpoints.push({
        method: method.toUpperCase(),
        path: `/api${path}`,
        tag,
        summary,
        params,
        body,
      });
    }
  }

  return endpoints.sort((a, b) => a.tag.localeCompare(b.tag) || a.path.localeCompare(b.path));
}

/** Build a default body from a JSON Schema */
function buildDefaultBody(schema: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const properties = (schema.properties ?? {}) as Record<string, Record<string, unknown>>;
  for (const [key, prop] of Object.entries(properties)) {
    if (prop.example !== undefined) {
      result[key] = prop.example;
    } else if (prop.default !== undefined) {
      result[key] = prop.default;
    } else if (prop.type === "string") {
      result[key] = prop.enum ? (prop.enum as string[])[0] : "";
    } else if (prop.type === "number" || prop.type === "integer") {
      result[key] = 0;
    } else if (prop.type === "boolean") {
      result[key] = false;
    } else if (prop.type === "object") {
      result[key] = buildDefaultBody(prop);
    } else if (prop.type === "array") {
      result[key] = [];
    } else {
      result[key] = "";
    }
  }
  return result;
}

function EndpointList({ search, setSearch, grouped, selected, selectEndpoint, totalCount }: {
  search: string;
  setSearch: (v: string) => void;
  grouped: Record<string, Endpoint[]>;
  selected: Endpoint | null;
  selectEndpoint: (ep: Endpoint) => void;
  totalCount: number;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border/40">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-background"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.entries(grouped).map(([tag, endpoints]) => (
            <Collapsible key={tag} defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-[11px] text-muted-foreground uppercase tracking-wider font-medium hover:text-foreground transition-colors">
                {tag} ({endpoints.length})
                <ChevronDown className="h-3 w-3" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-0.5 mb-2">
                  {endpoints.map((ep) => (
                    <button
                      key={`${ep.method}-${ep.path}`}
                      onClick={() => selectEndpoint(ep)}
                      className={`w-full text-left px-2 py-1.5 rounded-md flex items-center gap-2 text-xs transition-colors ${
                        selected?.path === ep.path && selected?.method === ep.method
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      }`}
                    >
                      <Badge variant="outline" className={`text-[9px] px-1 py-0 font-mono ${methodColors[ep.method] || ""}`}>
                        {ep.method}
                      </Badge>
                      <span className="truncate font-mono">{ep.path}</span>
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t border-border/40 px-3 py-2 text-[10px] text-muted-foreground/60">
        {totalCount} endpoints
      </div>
    </div>
  );
}

export default function Explorer() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Endpoint | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [bodyValue, setBodyValue] = useState("");
  const [response, setResponse] = useState<unknown>(null);
  const [responseStatus, setResponseStatus] = useState<number>(200);
  const [responseTime, setResponseTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [allEndpoints, setAllEndpoints] = useState<Endpoint[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch real OpenAPI spec from backend
  useEffect(() => {
    let cancelled = false;
    async function fetchSpec() {
      setPageLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/docs`, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const spec = await res.json();
        if (!cancelled) {
          const parsed = parseOpenApiSpec(spec);
          if (parsed.length > 0) {
            setAllEndpoints(parsed);
            setIsLive(true);
          } else {
            setAllEndpoints(demoApiSpec.endpoints as Endpoint[]);
          }
        }
      } catch {
        // Keep demo data as fallback
        if (!cancelled) {
          setAllEndpoints(demoApiSpec.endpoints as Endpoint[]);
          setIsLive(false);
        }
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    }
    fetchSpec();
    return () => { cancelled = true; };
  }, []);

  const grouped = useMemo(() => {
    const filtered = allEndpoints.filter(
      (e) =>
        e.path.toLowerCase().includes(search.toLowerCase()) ||
        e.summary.toLowerCase().includes(search.toLowerCase())
    );
    const groups: Record<string, Endpoint[]> = {};
    for (const ep of filtered) {
      (groups[ep.tag] = groups[ep.tag] || []).push(ep);
    }
    return groups;
  }, [search, allEndpoints]);

  const selectEndpoint = (ep: Endpoint) => {
    setSelected(ep);
    setResponse(null);
    setResponseTime(0);
    setResponseStatus(200);
    setFormValues({});
    setBodyValue(ep.body ? JSON.stringify(ep.body, null, 2) : "");
    setMobileOpen(false);
  };

  const sendRequest = async () => {
    if (!selected) return;
    setLoading(true);
    const start = Date.now();

    try {
      // Build URL with path params substituted and query params appended
      let url = `${API_BASE}${selected.path}`;
      const queryParams: string[] = [];

      for (const p of selected.params) {
        const val = formValues[p.name] || "";
        if (!val) continue;
        if (p.in === "path" || url.includes(`:${p.name}`)) {
          url = url.replace(`:${p.name}`, encodeURIComponent(val));
        } else {
          queryParams.push(`${encodeURIComponent(p.name)}=${encodeURIComponent(val)}`);
        }
      }
      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }

      const fetchOpts: RequestInit = {
        method: selected.method,
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000),
      };
      if (selected.method !== "GET" && selected.method !== "HEAD" && bodyValue.trim()) {
        fetchOpts.body = bodyValue;
      }

      const res = await fetch(url, fetchOpts);
      const elapsed = Date.now() - start;
      setResponseTime(elapsed);
      setResponseStatus(res.status);

      const text = await res.text();
      try {
        setResponse(JSON.parse(text));
      } catch {
        setResponse({ raw: text });
      }
    } catch (err) {
      setResponseTime(Date.now() - start);
      setResponseStatus(0);
      setResponse({ error: err instanceof Error ? err.message : "Request failed" });
    } finally {
      setLoading(false);
    }
  };

  const statusBadgeClass = responseStatus >= 200 && responseStatus < 300
    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
    : responseStatus >= 400
    ? "bg-red-500/15 text-red-400 border-red-500/30"
    : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";

  const detailPanel = selected ? (
    <div className="rounded-xl border border-border/50 bg-card/50 p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <Badge variant="outline" className={`text-xs font-mono ${methodColors[selected.method] || ""}`}>
          {selected.method}
        </Badge>
        <code className="text-sm font-mono break-all">{selected.path}</code>
      </div>
      <p className="text-sm text-muted-foreground mb-5">{selected.summary}</p>

      {/* Parameters */}
      {selected.params && selected.params.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Parameters</p>
          <div className="space-y-2">
            {selected.params.map((p) => (
              <div key={p.name} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <Label className="text-xs w-24 shrink-0">
                  {p.name}
                  {p.required && <span className="text-primary ml-0.5">*</span>}
                </Label>
                <Input
                  placeholder={p.description || p.type}
                  value={formValues[p.name] || ""}
                  onChange={(e) => setFormValues({ ...formValues, [p.name]: e.target.value })}
                  className="h-8 text-xs bg-background"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request Body */}
      {selected.body && (
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Request Body</p>
          <Textarea
            value={bodyValue}
            onChange={(e) => setBodyValue(e.target.value)}
            className="font-mono text-xs bg-background min-h-[100px]"
          />
        </div>
      )}

      {/* Send */}
      <Button onClick={sendRequest} disabled={loading} className="bg-primary hover:bg-primary/90 mb-5">
        {loading ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-2" />}
        Send Request
      </Button>

      {/* Response */}
      {response && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className={`text-xs ${statusBadgeClass}`}>
              {responseStatus === 0 ? "Error" : `${responseStatus} ${responseStatus >= 200 && responseStatus < 300 ? "OK" : ""}`}
            </Badge>
            <Badge variant="outline" className={`text-[10px] ${timeColor(responseTime)}`}>
              {responseTime}ms
            </Badge>
          </div>
          <JsonViewer data={response} />
        </div>
      )}
    </div>
  ) : (
    <div className="rounded-xl border border-border/50 bg-card/30 flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center text-muted-foreground">
        <p className="text-sm mb-1">Select an endpoint to explore</p>
        <p className="text-xs text-muted-foreground/60">Or press Cmd+K to search</p>
      </div>
    </div>
  );

  if (pageLoading) {
    return (
      <div className="p-6 space-y-6">
        <ShimmerSkeleton className="h-8 w-48" />
        <ShimmerSkeleton className="h-4 w-72" />
        <div className="flex gap-4 min-h-[600px]">
          <ShimmerSkeleton className="w-72 shrink-0 hidden lg:block" />
          <ShimmerSkeleton className="flex-1" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{allEndpoints.length} API Endpoints</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Interactive explorer with auto-generated forms.
            <Badge variant="outline" className={`ml-2 text-[10px] ${isLive ? "text-emerald-400 border-emerald-500/30" : "text-yellow-400 border-yellow-500/30"}`}>
              {isLive ? <><Wifi className="h-3 w-3 mr-1 inline" />Live API</> : <><WifiOff className="h-3 w-3 mr-1 inline" />Demo</>}
            </Badge>
          </p>
        </div>
        {/* Mobile endpoint list trigger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden">
              <Menu className="h-4 w-4 mr-2" />Endpoints
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-card border-border">
            <EndpointList search={search} setSearch={setSearch} grouped={grouped} selected={selected} selectEndpoint={selectEndpoint} totalCount={allEndpoints.length} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-4 min-h-[600px]">
        {/* Left panel: endpoint list -- hidden on mobile */}
        <div className="w-72 shrink-0 rounded-xl border border-border/50 bg-card/50 overflow-hidden hidden lg:flex flex-col">
          <EndpointList search={search} setSearch={setSearch} grouped={grouped} selected={selected} selectEndpoint={selectEndpoint} totalCount={allEndpoints.length} />
        </div>

        {/* Right panel: details */}
        <div className="flex-1 min-w-0">
          {detailPanel}
        </div>
      </div>
    </div>
  );
}
