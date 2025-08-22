// src/hooks/useQcStats.js
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getStats } from '../../utils/apiTickets';

/**
 * useQcStats
 * @param {{ from?: string, to?: string, agent?: string, reviewer?: string }} filters
 */
export default function useQcStats(filters = {}) {
  const { from, to, agent, reviewer } = filters;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const abortRef = useRef();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const res = await getStats({ from, to, agent, reviewer });
      if (!res.success) throw new Error(res.message || 'Request failed');

      setData(res.data);
    } catch (e) {
      if (e.name === 'AbortError') return;
      setErr(e?.message || 'Error fetching metrics');
    } finally {
      setLoading(false);
    }
  }, [from, to, agent, reviewer]);

  useEffect(() => {
    fetchStats();
    return () => abortRef.current?.abort();
  }, [fetchStats]);

  // Lista de agentes para Autocomplete
  const agents = useMemo(() => {
    const s = new Set();
    if (data?.avgScores) data.avgScores.forEach(d => d?.agent && s.add(d.agent));
    return Array.from(s).sort();
  }, [data]);

  return { data, loading, err, refetch: fetchStats, agents };
}
