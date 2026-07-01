export interface Rng {
  seed: number;
  next(): number;
  int(min: number, max: number): number;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  const next = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };

  return {
    seed,
    next,
    int(min: number, max: number) {
      const low = Math.ceil(min);
      const high = Math.floor(max);
      if (!Number.isFinite(low) || !Number.isFinite(high) || low > high) {
        throw new RangeError("rng.int requires min <= max");
      }
      return Math.floor(next() * (high - low + 1)) + low;
    },
  };
}
