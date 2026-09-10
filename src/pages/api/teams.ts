import type { APIRoute } from 'astro';
import { isOperatorRequest } from '../../lib/operator-session';
import { getServerReadClient, getServerSupabaseClient } from '../../lib/supabase-server';
import type { Database } from '../../types/database';

const TEAM_FIELDS = 'id, name, members, active, created_at';

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });

function normalizeMembers(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((member) => String(member).trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((member) => member.slice(0, 80));
}

function normalizeTeamBody(body: Record<string, unknown>, partial = false) {
  const id = typeof body.id === 'string' ? body.id.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '';
  const members = normalizeMembers(body.members);

  if (!partial && (!/^\d{4}$/.test(id) || !name)) {
    return { error: 'El equipo necesita un ID numérico de 4 dígitos y un nombre.' };
  }
  if (partial && id && !/^\d{4}$/.test(id)) return { error: 'El ID del equipo debe tener 4 dígitos.' };
  if (name.length > 0 && name.length < 2) return { error: 'El nombre del equipo es demasiado corto.' };

  return { id, name, members, active: typeof body.active === 'boolean' ? body.active : true };
}

export const GET: APIRoute = async ({ request, url }) => {
  const includeInactive = url.searchParams.get('include_inactive') === 'true' && isOperatorRequest(request);
  const client = getServerReadClient();

  if (!client) return json({ message: 'Supabase no está configurado en el servidor.' }, 503);

  let query = client.from('teams').select(TEAM_FIELDS).order('created_at', { ascending: true });
  if (!includeInactive) query = query.eq('active', true);

  const { data, error } = await query;
  if (error) return json({ message: 'No se pudo leer el catálogo de equipos.' }, 502);
  return json({ teams: data ?? [] });
};

export const POST: APIRoute = async ({ request }) => {
  if (!isOperatorRequest(request)) return json({ message: 'Se requiere una sesión de operador.' }, 401);
  const client = getServerSupabaseClient();
  if (!client) return json({ message: 'Configura SUPABASE_SERVICE_ROLE_KEY solo en el servidor para guardar equipos.' }, 503);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ message: 'Solicitud inválida.' }, 400);
  }

  const normalized = normalizeTeamBody(body);
  if ('error' in normalized) return json({ message: normalized.error }, 400);

  const { data, error } = await client
    .from('teams')
    .insert({ id: normalized.id, name: normalized.name, members: normalized.members, active: normalized.active })
    .select(TEAM_FIELDS)
    .single();

  if (error) return json({ message: error.code === '23505' ? 'Ya existe un equipo con ese ID.' : 'No se pudo registrar el equipo.' }, 409);
  return json({ team: data }, 201);
};

export const PATCH: APIRoute = async ({ request }) => {
  if (!isOperatorRequest(request)) return json({ message: 'Se requiere una sesión de operador.' }, 401);
  const client = getServerSupabaseClient();
  if (!client) return json({ message: 'Configura SUPABASE_SERVICE_ROLE_KEY solo en el servidor para guardar equipos.' }, 503);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ message: 'Solicitud inválida.' }, 400);
  }

  const normalized = normalizeTeamBody(body, true);
  if ('error' in normalized || !normalized.id) return json({ message: 'Falta el ID del equipo.' }, 400);

  const update: Database['public']['Tables']['teams']['Update'] = {};
  if (normalized.name) update.name = normalized.name;
  if (Array.isArray(body.members)) update.members = normalized.members;
  if (typeof body.active === 'boolean') update.active = body.active;
  if (Object.keys(update).length === 0) return json({ message: 'No hay cambios para guardar.' }, 400);

  const { data, error } = await client.from('teams').update(update).eq('id', normalized.id).select(TEAM_FIELDS).single();
  if (error || !data) return json({ message: 'No se pudo actualizar el equipo.' }, 409);
  return json({ team: data });
};
