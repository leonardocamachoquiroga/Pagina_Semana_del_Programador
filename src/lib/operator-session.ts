import { createHmac, timingSafeEqual } from 'node:crypto';

const OPERATOR_COOKIE = 'vibecode_operator';
const OPERATOR_MAX_AGE = 8 * 60 * 60;

function getOperatorPin(): string {
  return import.meta.env.MODERATOR_PIN?.trim() ?? '';
}

function getSessionSecret(): string {
  return import.meta.env.MODERATOR_SESSION_SECRET?.trim() || getOperatorPin();
}

function sign(value: string): string {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url');
}

function parseCookies(request: Request): Record<string, string> {
  return Object.fromEntries(
    (request.headers.get('cookie') ?? '')
      .split(';')
      .map((part) => part.trim().split('='))
      .filter(([key, value]) => key && value)
      .map(([key, ...value]) => [key, value.join('=')])
  );
}

export function operatorAuthConfigured(): boolean {
  return Boolean(getOperatorPin() && getSessionSecret());
}

export function verifyOperatorPin(pin: string): boolean {
  const expected = getOperatorPin();
  if (!expected || !pin) return false;

  const providedBuffer = Buffer.from(pin);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

export function isOperatorRequest(request: Request): boolean {
  if (!operatorAuthConfigured()) return false;

  const raw = parseCookies(request)[OPERATOR_COOKIE] ?? '';
  const [issuedAt, signature] = raw.split('.');
  const issuedAtMs = Number(issuedAt);
  if (!Number.isFinite(issuedAtMs) || !signature) return false;
  if (issuedAtMs > Date.now() + 30_000 || Date.now() - issuedAtMs > OPERATOR_MAX_AGE * 1000) return false;

  const expectedSignature = sign(issuedAt);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

export function createOperatorCookie(): string {
  const secure = import.meta.env.PROD ? '; Secure' : '';
  const issuedAt = String(Date.now());
  return `${OPERATOR_COOKIE}=${issuedAt}.${sign(issuedAt)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${OPERATOR_MAX_AGE}${secure}`;
}

export function clearOperatorCookie(): string {
  return `${OPERATOR_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}
