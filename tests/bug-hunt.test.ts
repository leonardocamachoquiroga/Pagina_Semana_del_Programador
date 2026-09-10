import { describe, expect, it } from 'vitest';
import { BUG_CHALLENGES, BUG_DIFFICULTIES, BUG_LANGUAGES } from '../src/utils/bug-hunt';

describe('niveles de Encuentra el Error', () => {
  it('expone tres lenguajes con tres dificultades cada uno', () => {
    expect(BUG_LANGUAGES.map((language) => language.label)).toEqual(['JavaScript', 'C++', 'TypeScript']);
    expect(BUG_DIFFICULTIES.map((difficulty) => difficulty.id)).toEqual(['facil', 'intermedio', 'dificil']);

    for (const language of BUG_LANGUAGES) {
      expect(Object.keys(BUG_CHALLENGES[language.id])).toHaveLength(3);
      expect(Object.keys(BUG_CHALLENGES[language.id])).toEqual(['facil', 'intermedio', 'dificil']);
    }
  });

  it('mantiene un único error intencional en Fácil e Intermedio para cada lenguaje', () => {
    for (const language of BUG_LANGUAGES) {
      expect(BUG_CHALLENGES[language.id].facil.lines.filter((line) => line.isBug)).toHaveLength(1);
      expect(BUG_CHALLENGES[language.id].intermedio.lines.filter((line) => line.isBug)).toHaveLength(1);
    }
  });

  it('conserva los desafíos difíciles originales por lenguaje', () => {
    expect(BUG_CHALLENGES.javascript.dificil.titulo).toBe('Bucle infinito en servidor de notas');
    expect(BUG_CHALLENGES.cpp.dificil.titulo).toBe('Fuga de memoria y puntero nulo');
    expect(BUG_CHALLENGES.typescript.dificil.titulo).toBe('Inmutabilidad de estado en React');
    expect(BUG_CHALLENGES.typescript.dificil.lines.filter((line) => line.isBug)).toHaveLength(2);
  });
});
