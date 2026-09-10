import { useCallback, useEffect, useState } from 'react';
import { fetchRemoteTeams, type TeamSource } from '../lib/team-api';
import { getEquipos, hydrateRemoteTeams, subscribeToChanges } from '../utils/storage';
import type { Equipo } from '../types/game';

interface UseEventTeamsOptions {
  includeInactive?: boolean;
}

export function useEventTeams({ includeInactive = false }: UseEventTeamsOptions = {}) {
  const initial = getEquipos();
  const [equipos, setEquipos] = useState<Equipo[]>(includeInactive ? initial : initial.filter((equipo) => equipo.active));
  const [source, setSource] = useState<TeamSource | 'loading'>('loading');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const result = await fetchRemoteTeams(includeInactive);

    if (result.source === 'supabase') {
      const hydrated = hydrateRemoteTeams(result.rows);
      setEquipos(includeInactive ? hydrated : hydrated.filter((equipo) => equipo.active));
      setSource('supabase');
      setError('');
    } else {
      const local = getEquipos();
      setEquipos(includeInactive ? local : local.filter((equipo) => equipo.active));
      setSource('local');
      setError(result.error ?? 'Modo local activo: los cambios se guardan en este navegador.');
    }

    setIsLoading(false);
  }, [includeInactive]);

  useEffect(() => {
    void refresh();
    return subscribeToChanges(() => {
      const local = getEquipos();
      setEquipos(includeInactive ? local : local.filter((equipo) => equipo.active));
    });
  }, [includeInactive, refresh]);

  return { equipos, source, isLoading, error, refresh };
}
