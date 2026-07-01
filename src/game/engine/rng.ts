export interface Rng {
  seed: number;
  next(): number;
  int(min: number, max: number): number;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  return {
    seed,
    next() {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 0x100000000;
    },
    int(min: number, max: number) {
      const low = Math.ceil(min);
      const high = Math.floor(max);
      return Math.floor(this.next() * (high - low + 1)) + low;
    },
  };
}
