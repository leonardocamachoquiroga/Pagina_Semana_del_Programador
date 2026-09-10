import { describe, expect, it } from 'vitest';
import { canMoveDisk, createHanoiPegs, getHanoiRenderOrder, isHanoiSolved, moveDisk } from '../src/utils/hanoi';

describe('Torre de Hanoi', () => {
  it('inicia todos los discos en la torre 1', () => {
    expect(createHanoiPegs(3)).toEqual([[3, 2, 1], [], []]);
  });

  it('renderiza cada torre de abajo hacia arriba sin alterar el estado lógico', () => {
    const peg = [3, 2, 1];
    expect(getHanoiRenderOrder(peg)).toEqual([1, 2, 3]);
    expect(peg).toEqual([3, 2, 1]);
  });

  it('bloquea colocar un disco grande sobre uno pequeño', () => {
    expect(canMoveDisk([[3, 2], [1], []], 0, 1)).toBe(false);
    expect(moveDisk([[3, 2], [1], []], 0, 1)).toBeNull();
  });

  it('solo considera ganadora la torre 3', () => {
    expect(isHanoiSolved([[], [3, 2, 1], []], 3)).toBe(false);
    expect(isHanoiSolved([[], [], [3, 2, 1]], 3)).toBe(true);
  });

  it('permite completar la solución tradicional hacia la torre 3', () => {
    let pegs = createHanoiPegs(3);
    const moves: Array<[number, number]> = [[0, 2], [0, 1], [2, 1], [0, 2], [1, 0], [1, 2], [0, 2]];

    for (const [from, to] of moves) {
      const next = moveDisk(pegs, from, to);
      expect(next).not.toBeNull();
      pegs = next!;
    }

    expect(isHanoiSolved(pegs, 3)).toBe(true);
  });
});
