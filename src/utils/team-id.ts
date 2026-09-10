export const TEAM_ID_LENGTH = 4;
export const TEAM_ID_SPACE = 10_000;
export const TEAM_ID_RANDOM_ATTEMPTS = 48;

const formatTeamId = (value: number) => String(value).padStart(TEAM_ID_LENGTH, '0');

function randomNumber(maxExclusive: number): number {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.getRandomValues) {
    const values = new Uint32Array(1);
    cryptoApi.getRandomValues(values);
    return values[0] % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

export function generateAvailableTeamId(existingIds: Iterable<string>, maxAttempts = TEAM_ID_RANDOM_ATTEMPTS): string | null {
  const taken = new Set([...existingIds].filter((id) => /^\d{4}$/.test(id)));
  if (taken.size >= TEAM_ID_SPACE - 1) return null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = formatTeamId(randomNumber(TEAM_ID_SPACE - 1) + 1);
    if (!taken.has(candidate)) return candidate;
  }

  for (let value = 1; value < TEAM_ID_SPACE; value += 1) {
    const candidate = formatTeamId(value);
    if (!taken.has(candidate)) return candidate;
  }

  return null;
}
