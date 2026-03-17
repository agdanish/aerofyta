import { useState, useEffect, useCallback } from 'react';
import { Brain, ChevronDown, ChevronUp, RefreshCw, Zap, BookOpen } from 'lucide-react';
import { api } from '../lib/api';

/** Matches DecisionLogEntry from agent/src/services/decision-log.service.ts */
interface Decision {
  id: string;
  cycleNumber: number;
  timestamp: string;
  observation: string;
  llmRecommendation: string;
  actionTaken: string;
  outcome: 'executed' | 'skipped' | 'refused' | 'error';
  skipReason?: string;
  txHash?: string;
  creatorName?: string;
  tipAmount?: number;
  chain?: string;
  engagementScore?: number;
  cycleDurationMs?: number;
  llmProvider?: string;
}

interface DecisionLogResponse {
  decisions: Decision[];
  total: number;
  page: number;
  totalPages: number;
}

const OUTCOME_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  executed: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Executed' },
  skipped: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Skipped' },
  refused: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Refused' },
  error: { bg: 'bg-red-500/10', text: 'text-red-300', label: 'Error' },
};

function DecisionCard({ decision }: { decision: Decision }) {
  const [expanded, setExpanded] = useState(false);
  const style = OUTCOME_STYLES[decision.outcome] || OUTCOME_STYLES.error;
  const time = new Date(decision.timestamp).toLocaleTimeString();
  const hasLlm = !!decision.llmRecommendation && decision.llmRecommendation !== 'No LLM recommendation';

  return (
    <div className="border border-border rounded-lg bg-surface-2/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-surface-2 transition-colors"
      >
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${style.bg} ${style.text}`}>
          {style.label}
        </span>

        {hasLlm && (
          <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-400 flex items-center gap-1">
            <Brain className="w-3 h-3" />
            LLM
          </span>
        )}

        <span className="flex-1 text-sm text-text-primary truncate">
          {decision.creatorName
            ? `${decision.actionTaken || decision.outcome} → ${decision.creatorName}`
            : decision.actionTaken || decision.outcome}
        </span>

        {decision.cycleDurationMs != null && (
          <span className="text-xs font-mono text-text-muted">{(decision.cycleDurationMs / 1000).toFixed(1)}s</span>
        )}
        <span className="text-xs text-text-muted whitespace-nowrap">{time}</span>

        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-text-muted shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-text-muted shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-border">
          {/* LLM Recommendation */}
          {hasLlm && (
            <div>
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">LLM Recommendation</span>
              <p className="text-sm text-text-secondary mt-0.5">{decision.llmRecommendation}</p>
            </div>
          )}

          {/* Skip reason */}
          {decision.skipReason && (
            <div>
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Skip Reason</span>
              <p className="text-sm text-amber-400/90 mt-0.5">{decision.skipReason}</p>
            </div>
          )}

          {/* Observation */}
          {decision.observation && (
            <div>
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Observation</span>
              <p className="text-sm text-text-secondary mt-0.5 break-words">{decision.observation}</p>
            </div>
          )}

          {/* Metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {decision.tipAmount != null && (
              <div className="px-2 py-1.5 rounded bg-surface-2 border border-border">
                <span className="text-xs text-text-muted block">Amount</span>
                <span className="text-sm font-mono text-text-primary">{decision.tipAmount} USDT</span>
              </div>
            )}
            {decision.chain && (
              <div className="px-2 py-1.5 rounded bg-surface-2 border border-border">
                <span className="text-xs text-text-muted block">Chain</span>
                <span className="text-sm text-text-primary">{decision.chain}</span>
              </div>
            )}
            {decision.engagementScore != null && (
              <div className="px-2 py-1.5 rounded bg-surface-2 border border-border">
                <span className="text-xs text-text-muted block">Engagement</span>
                <span className="text-sm font-mono text-text-primary">{decision.engagementScore}</span>
              </div>
            )}
            {decision.txHash && (
              <div className="px-2 py-1.5 rounded bg-surface-2 border border-border col-span-2">
                <span className="text-xs text-text-muted block">Tx Hash</span>
                <span className="text-sm font-mono text-text-primary truncate block">
                  {decision.txHash.slice(0, 16)}...{decision.txHash.slice(-8)}
                </span>
              </div>
            )}
            {decision.llmProvider && (
              <div className="px-2 py-1.5 rounded bg-surface-2 border border-border">
                <span className="text-xs text-text-muted block">LLM Provider</span>
                <span className="text-sm text-text-primary">{decision.llmProvider}</span>
              </div>
            )}
            <div className="px-2 py-1.5 rounded bg-surface-2 border border-border">
              <span className="text-xs text-text-muted block">Cycle</span>
              <span className="text-sm font-mono text-text-primary">#{decision.cycleNumber}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function DecisionAuditTrail() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 10;

  const fetchDecisions = useCallback(async (p: number, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await api.getDecisionLog(p, pageSize) as unknown as DecisionLogResponse;
      setDecisions((data.decisions as unknown as Decision[]) || []);
      setTotal(data.total || 0);
      setPage(data.page || p);
    } catch (err) {
      console.warn('Failed to fetch decision log:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDecisions(1);
    const id = setInterval(() => fetchDecisions(page, true), 15_000);
    return () => clearInterval(id);
  }, [fetchDecisions, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const llmCount = decisions.filter((d) => !!d.llmRecommendation && d.llmRecommendation !== 'No LLM recommendation').length;
  const executedCount = decisions.filter((d) => d.outcome === 'executed').length;

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-surface-1 p-4 sm:p-5 animate-pulse">
        <div className="h-4 bg-surface-2 rounded w-48 mb-4" />
        <div className="space-y-3">
          <div className="h-10 bg-surface-2 rounded" />
          <div className="h-10 bg-surface-2 rounded" />
          <div className="h-10 bg-surface-2 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-purple-500/10">
          <BookOpen className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-text-primary">Decision Audit Trail</h3>
          <p className="text-xs text-text-muted">
            {total} decisions · {llmCount}/{decisions.length} LLM-driven · {executedCount} executed
          </p>
        </div>
        <button
          onClick={() => fetchDecisions(page, true)}
          disabled={refreshing}
          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {decisions.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No decisions yet. Start the autonomous loop to see agent decisions.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {decisions.map((d, i) => (
            <DecisionCard key={`${d.id || d.timestamp}-${d.cycleNumber}-${i}`} decision={d} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <button
            onClick={() => fetchDecisions(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-xs rounded-md bg-surface-2 text-text-secondary hover:bg-surface-2/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <span className="text-xs text-text-muted">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => fetchDecisions(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-xs rounded-md bg-surface-2 text-text-secondary hover:bg-surface-2/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
