import { describe, expect, it } from 'vitest';
import { TYPING_DIFFICULTIES, TYPING_LANGUAGES } from '../src/utils/typing';

describe('pruebas de Speedtest', () => {
  it('mantiene exactamente tres pruebas por cada lenguaje existente', () => {
    expect(TYPING_LANGUAGES.map((language) => language.lenguaje)).toEqual(['JavaScript', 'Python', 'TypeScript']);
    expect(TYPING_DIFFICULTIES.map((difficulty) => difficulty.id)).toEqual(['facil', 'intermedio', 'dificil']);
    expect(TYPING_LANGUAGES.every((language) => language.pruebas.length === 3)).toBe(true);
  });

  it('ordena fácil, intermedio y difícil con dificultad progresiva', () => {
    for (const language of TYPING_LANGUAGES) {
      expect(language.pruebas[0].dificultad).toBe('facil');
      expect(language.pruebas[1].dificultad).toBe('intermedio');
      expect(language.pruebas[2].dificultad).toBe('dificil');
      expect(language.pruebas[0].code.length).toBeLessThan(language.pruebas[1].code.length);
      expect(language.pruebas[1].code.length).toBeLessThan(language.pruebas[2].code.length);
    }
  });

  it('conserva los fragmentos difíciles originales', () => {
    expect(TYPING_LANGUAGES[0].pruebas[2].code).toContain("Array.from({ length: 10 })");
    expect(TYPING_LANGUAGES[1].pruebas[2].code).toContain('busqueda_binaria');
    expect(TYPING_LANGUAGES[2].pruebas[2].code).toContain('getNextPosta');
  });
});
