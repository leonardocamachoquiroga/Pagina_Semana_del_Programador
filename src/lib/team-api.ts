import type { RemoteTeam } from '../types/game';
import { hasPublicSupabaseConfig, supabaseBrowser } from './supabase-browser';
import { generateAvailableTeamId } from '../utils/team-id';

export type TeamSource = 'supabase' | 'local';

export interface TeamListResult {
  rows: RemoteTeam[];
  source: TeamSource;
  error?: string;
}

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body?.message || 'No se pudo completar la operación.';
  } catch {
    return `El servidor respondió con ${response.status}.`;
  }
}

export async function fetchRemoteTeams(includeInactive = false): Promise<TeamListResult> {
  try {
    const query = includeInactive ? '?include_inactive=true' : '';
    const response = await fetch(`/api/teams${query}`, { headers: { Accept: 'application/json' } });

    if (response.ok) {
      const body = await response.json();
      return { rows: Array.isArray(body?.teams) ? body.teams : [], source: 'supabase' };
    }
  } catch {
    // Si el host no sirve endpoints, intentamos lectura directa con la clave pública.
  }

  if (!includeInactive && hasPublicSupabaseConfig && supabaseBrowser) {
    const { data, error } = await supabaseBrowser
      .from('teams')
      .select('id, name, members, active, created_at')
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (!error) return { rows: (data ?? []) as RemoteTeam[], source: 'supabase' };
    return { rows: [], source: 'local', error: 'Supabase no está disponible en este momento.' };
  }

  return {
    rows: [],
    source: 'local',
    error: hasPublicSupabaseConfig ? 'No se pudo conectar con Supabase. Se está usando el modo local.' : undefined
  };
}

export interface OperatorLoginResult {
  ok: boolean;
  unavailable?: boolean;
  message?: string;
}

export async function loginOperator(pin: string): Promise<OperatorLoginResult> {
  try {
    const response = await fetch('/api/operator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });

    if (response.ok) return { ok: true };
    return { ok: false, unavailable: response.status === 503, message: await readError(response) };
  } catch {
    return { ok: false, unavailable: true, message: 'La API de operador no está disponible.' };
  }
}

export async function logoutOperator(): Promise<void> {
  await fetch('/api/operator', { method: 'DELETE' }).catch(() => undefined);
}

class TeamApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'TeamApiError';
  }
}

async function mutateTeam(method: 'POST' | 'PATCH', body: Record<string, unknown>): Promise<RemoteTeam> {
  const response = await fetch('/api/teams', {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new TeamApiError(await readError(response), response.status);
  const payload = await response.json();
  return payload.team as RemoteTeam;
}

export async function createRemoteTeam(input: { id: string; name: string; members: string[]; active: boolean }): Promise<RemoteTeam> {
  let candidateId = input.id;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await mutateTeam('POST', { ...input, id: candidateId });
    } catch (error) {
      if (!(error instanceof TeamApiError) || error.status !== 409 || attempt === 2) throw error;

      const nextId = generateAvailableTeamId([candidateId]);
      if (!nextId) throw new Error('No quedan IDs de equipo disponibles.');
      candidateId = nextId;
    }
  }

  throw new Error('No se pudo registrar el equipo después de varios intentos.');
}

export function updateRemoteTeam(
  id: string,
  input: { name?: string; members?: string[]; active?: boolean }
): Promise<RemoteTeam> {
  return mutateTeam('PATCH', { id, ...input });
}
