import { useState, useEffect, useCallback } from "react";

// In production (Railway), frontend is served from same origin as backend
// In development, backend runs on localhost:3001
const API_BASE = import.meta.env.PROD ? "" : "http://localhost:3001";

export function useFetch<T>(path: string, demoData: T) {
  const [data, setData] = useState<T>(demoData);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE}${path}`, {
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setIsDemo(false);
        }
      } catch {
        if (!cancelled) {
          setData(demoData);
          setIsDemo(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [path, tick]);

  return { data, loading, isDemo, refetch };
}
