import type { APIRoute } from 'astro';
import {
  clearOperatorCookie,
  createOperatorCookie,
  isOperatorRequest,
  operatorAuthConfigured,
  verifyOperatorPin
} from '../../lib/operator-session';

const json = (body: Record<string, unknown>, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
  });

export const GET: APIRoute = ({ request }) =>
  json({ authenticated: isOperatorRequest(request), configured: operatorAuthConfigured() });

export const POST: APIRoute = async ({ request }) => {
  if (!operatorAuthConfigured()) {
    return json({ message: 'Configura MODERATOR_PIN en el servidor para habilitar la administración remota.' }, 503);
  }

  let pin = '';
  try {
    const body = await request.json();
    pin = typeof body?.pin === 'string' ? body.pin : '';
  } catch {
    return json({ message: 'Solicitud inválida.' }, 400);
  }

  if (!verifyOperatorPin(pin)) return json({ message: 'PIN de operador incorrecto.' }, 401);
  return json({ authenticated: true }, 200, { 'Set-Cookie': createOperatorCookie() });
};

export const DELETE: APIRoute = () => json({ authenticated: false }, 200, { 'Set-Cookie': clearOperatorCookie() });
