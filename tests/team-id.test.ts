import { describe, expect, it } from 'vitest';
import { generateAvailableTeamId } from '../src/utils/team-id';

describe('identificadores de equipos', () => {
  it('genera IDs de cuatro dígitos y respeta los existentes', () => {
    const existing = ['0001', '0042', '4821'];
    const next = generateAvailableTeamId(existing);

    expect(next).toMatch(/^\d{4}$/);
    expect(existing).not.toContain(next);
  });

  it('encuentra un ID libre aunque el azar repita candidatos', () => {
    const next = generateAvailableTeamId(['0001', '0002'], 0);
    expect(next).toBe('0003');
  });
});
