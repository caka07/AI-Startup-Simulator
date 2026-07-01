import { describe, expect, it } from "vitest";
import { achievements } from "../../src/game/data/achievements";
import { endings } from "../../src/game/data/endings";
import { events } from "../../src/game/data/events";
import { validateContent } from "../../src/game/engine/validation";

describe("content validation", () => {
  it("ships the first playable slice content counts", () => {
    expect(events).toHaveLength(40);
    expect(achievements).toHaveLength(20);
    expect(endings).toHaveLength(12);
  });

  it("rejects content that references unknown metrics or ids", () => {
    const result = validateContent();
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("keeps endings ordered from most forced to most optional", () => {
    const priorities = endings.map((ending) => ending.priority);
    const sorted = [...priorities].sort((a, b) => a - b);
    expect(priorities).toEqual(sorted);
  });
});
