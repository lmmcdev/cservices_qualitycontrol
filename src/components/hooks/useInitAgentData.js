// src/components/hooks/useInitAppData.js  (o useInitAgentData.js)
import { useEffect, useRef } from 'react';
import { useAgents } from '../../context/agentsContext';
import { useAuth } from '../../context/authContext';
import { useLoading } from '../../providers/loadingProvider';
import { fetchAgentsFromAAD } from '../../services/fetchAgentData';
import { DEFAULT_AGENT_GROUPS } from '../../utils/js/constants';

export const useInitAgentData = () => {
  const { authLoaded, accessTokenGraph } = useAuth();
  const { dispatch } = useAgents(); // <- del contexto de AGENTES
  const { setLoading } = useLoading();
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!authLoaded || !accessTokenGraph) return;
    if (loadedRef.current) return;
    loadedRef.current = true;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const agents = await fetchAgentsFromAAD(accessTokenGraph, {
          groupIds: DEFAULT_AGENT_GROUPS,
        });
        if (!cancelled) {
          dispatch({ type: 'SET_AGENTS', payload: agents });
        }
      } catch (err) {
        console.error('Agents error:', err);
        if (!cancelled) dispatch({ type: 'SET_AGENTS_ERROR', payload: err?.message });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authLoaded, accessTokenGraph, dispatch, setLoading]);
};
