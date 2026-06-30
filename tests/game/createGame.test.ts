import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";

describe("createNewGame", () => {
  it("creates a 2026 Q1 company with clamped metrics and founder equity", () => {
    const game = createNewGame({
      seed: 42,
      founderName: "沈一",
      backgroundId: "ex-bigtech-pm",
      trackId: "ai-agent",
      attributes: {
        tech: 4,
        sales: 7,
        fundraising: 6,
        management: 4,
        ethics: 4,
        stamina: 5,
        hype: 7,
        luck: 3,
      },
    });

    expect(game.year).toBe(2026);
    expect(game.quarter).toBe(1);
    expect(game.metrics.founderEquity).toBe(100);
    expect(game.metrics.arr).toBe(0);
    expect(game.metrics.pmf).toBeGreaterThanOrEqual(0);
    expect(game.metrics.pmf).toBeLessThanOrEqual(100);
    expect(game.log[0]).toContain("沈一创办了公司");
  });
});
