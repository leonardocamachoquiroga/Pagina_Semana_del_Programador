export type HanoiPeg = number[];
export type HanoiPegs = HanoiPeg[];

export function createHanoiPegs(numDisks: number): HanoiPegs {
  return [Array.from({ length: numDisks }, (_, index) => numDisks - index), [], []];
}

export function getHanoiRenderOrder(peg: HanoiPeg): HanoiPeg {
  return [...peg].reverse();
}

export function canMoveDisk(pegs: HanoiPegs, from: number, to: number): boolean {
  if (from === to || !pegs[from] || !pegs[to] || pegs[from].length === 0) return false;

  const disk = pegs[from][pegs[from].length - 1];
  const targetTop = pegs[to][pegs[to].length - 1];
  return targetTop === undefined || disk < targetTop;
}

export function moveDisk(pegs: HanoiPegs, from: number, to: number): HanoiPegs | null {
  if (!canMoveDisk(pegs, from, to)) return null;

  const nextPegs = pegs.map((peg) => [...peg]);
  const disk = nextPegs[from].pop();
  if (disk === undefined) return null;
  nextPegs[to].push(disk);
  return nextPegs;
}

export function isHanoiSolved(pegs: HanoiPegs, numDisks: number): boolean {
  const target = pegs[2] ?? [];
  if (target.length !== numDisks) return false;
  return target.every((disk, index) => disk === numDisks - index);
}
