import { describe, expect, it } from "vitest";
import { createRng } from "../../src/game/engine/rng";

describe("createRng", () => {
  it("produces the same next sequence for the same seed", () => {
    const first = createRng(123);
    const second = createRng(123);

    expect([first.next(), first.next(), first.next()]).toEqual([second.next(), second.next(), second.next()]);
  });

  it("produces different next sequences for different seeds", () => {
    const first = createRng(123);
    const second = createRng(124);

    expect([first.next(), first.next(), first.next()]).not.toEqual([second.next(), second.next(), second.next()]);
  });

  it("returns inclusive integers within rounded bounds", () => {
    const rng = createRng(321);

    for (let i = 0; i < 50; i += 1) {
      const value = rng.int(1.2, 3.8);
      expect(value).toBeGreaterThanOrEqual(2);
      expect(value).toBeLessThanOrEqual(3);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it("supports a single-value integer range", () => {
    const rng = createRng(321);

    expect(rng.int(7, 7)).toBe(7);
  });

  it("throws RangeError for invalid bounds", () => {
    const rng = createRng(321);

    expect(() => rng.int(4, 3)).toThrow(new RangeError("rng.int requires min <= max"));
    expect(() => rng.int(Number.NaN, 3)).toThrow(new RangeError("rng.int requires min <= max"));
    expect(() => rng.int(1, Number.POSITIVE_INFINITY)).toThrow(new RangeError("rng.int requires min <= max"));
    expect(() => rng.int(1.2, 1.1)).toThrow(new RangeError("rng.int requires min <= max"));
  });

  it("supports destructured int calls", () => {
    const { int } = createRng(321);

    expect(int(1, 3)).toBeGreaterThanOrEqual(1);
    expect(int(1, 3)).toBeLessThanOrEqual(3);
  });
});
