// Copyright 2026 Danish A. Licensed under Apache-2.0.
import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, Cpu, Globe, Package, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

interface HealthData {
  status: string;
  uptime: number;
  timestamp: string;
  services: Record<string, { status: string; [key: string]: unknown }>;
  chains: Record<string, { status: string; type: string }>;
  wdk: { packages: string[]; methods: string[] };
  features: Record<string, boolean | string[]>;
  demoMode: boolean;
}

export function HealthDashboard() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      const data = await api.healthFull();
      setHealth(data as unknown as HealthData);
    } catch (err) {
      console.warn('Health check failed:', err);
      setError(err instanceof Error ? err.message : 'Backend unreachable');
    }
    setLoading(false);
  };

  useEffect(() => { load(); const iv = setInterval(load, 30000); return () => clearInterval(iv); }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-surface-1 p-5 animate-pulse">
        <div className="h-4 bg-surface-2 rounded w-32 mb-3" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-16 bg-surface-2 rounded" />
          <div className="h-16 bg-surface-2 rounded" />
          <div className="h-16 bg-surface-2 rounded" />
        </div>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="rounded-xl border border-border bg-surface-1 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-semibold text-text-primary">System Health</h3>
        </div>
        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-center">
          <p className="text-xs text-red-400 font-medium">Unable to reach backend</p>
          <p className="text-xs text-text-muted mt-1">{error || 'No health data available'}</p>
          <button onClick={() => { setLoading(true); load(); }} className="mt-2 px-3 py-1 text-xs rounded-md bg-surface-2 text-text-secondary hover:text-text-primary transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const serviceEntries = Object.entries(health.services);
  const activeServices = serviceEntries.filter(([, v]) => v.status !== 'disconnected' && v.status !== 'not configured');
  const uptime = Math.floor(health.uptime);
  const hours = Math.floor(uptime / 3600);
  const mins = Math.floor((uptime % 3600) / 60);
  const secs = uptime % 60;

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" />
          System Health
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Uptime: {hours}h {mins}m {secs}s</span>
          <button onClick={() => { setLoading(true); load(); }} className="p-1 rounded hover:bg-surface-2 text-text-secondary">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`p-3 rounded-lg border flex items-center gap-2 ${
        health.status === 'operational' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
      }`}>
        <CheckCircle2 className={`w-4 h-4 ${health.status === 'operational' ? 'text-green-400' : 'text-red-400'}`} />
        <span className="text-xs font-medium text-text-primary">{health.status === 'operational' ? 'All Systems Operational' : 'Issues Detected'}</span>
        <span className="text-xs text-text-secondary ml-auto">{activeServices.length}/{serviceEntries.length} services active</span>
      </div>

      {/* Services Grid */}
      <div>
        <h4 className="text-xs font-medium text-text-secondary mb-2 flex items-center gap-1">
          <Cpu className="w-3 h-3" /> Services ({serviceEntries.length})
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
          {serviceEntries.map(([name, info]) => (
            <div key={name} className="p-2 rounded bg-surface-2 border border-border text-center">
              <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                info.status === 'running' || info.status === 'active' || info.status === 'ready' || info.status === 'connected'
                  ? 'bg-green-400' : info.status === 'not configured' ? 'bg-gray-500' : 'bg-yellow-400'
              }`} />
              <span className="text-xs text-text-secondary block truncate">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chains */}
      <div>
        <h4 className="text-xs font-medium text-text-secondary mb-2 flex items-center gap-1">
          <Globe className="w-3 h-3" /> Blockchains
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(health.chains).map(([id, info]) => (
            <div key={id} className="p-2.5 rounded-lg bg-surface-2 border border-border">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs font-medium text-text-primary">{info.type}</span>
              </div>
              <span className="text-xs text-text-secondary">{id}</span>
            </div>
          ))}
        </div>
      </div>

      {/* WDK Packages */}
      <div>
        <h4 className="text-xs font-medium text-text-secondary mb-2 flex items-center gap-1">
          <Package className="w-3 h-3" /> WDK Packages ({health.wdk.packages.length})
        </h4>
        <div className="flex flex-wrap gap-1">
          {health.wdk.packages.map((pkg) => (
            <span key={pkg} className="text-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent">{pkg.replace('@tetherto/', '')}</span>
          ))}
        </div>
      </div>

      {/* Demo Mode */}
      {health.demoMode && (
        <div className="p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-400 text-center">
          Demo Mode Active — Pre-seeded data loaded
        </div>
      )}
    </div>
  );
}
