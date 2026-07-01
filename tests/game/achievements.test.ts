import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { unlockAchievements } from "../../src/game/engine/achievements";
import type { GameState, NewGameInput } from "../../src/game/types";

const input: NewGameInput = {
  seed: 2,
  founderName: "Morgan",
  backgroundId: "serial-founder",
  trackId: "enterprise-knowledge",
  attributes: { tech: 4, sales: 7, fundraising: 7, management: 4, ethics: 3, stamina: 4, hype: 5, luck: 2 },
};

function gameWithMetrics(metrics: Partial<GameState["metrics"]> = {}): GameState {
  const game = createNewGame(input);
  return {
    ...game,
    metrics: {
      ...game.metrics,
      ...metrics,
    },
  };
}

describe("achievements", () => {
  it("unlocks ten-million-arr when ARR reaches the threshold", () => {
    const game = gameWithMetrics({ arr: 10_000_000 });

    const next = unlockAchievements(game);

    expect(next.completedAchievements).toContain("ten-million-arr");
    expect(next.log.at(-1)).toContain("Ten Million ARR");
    expect(game.completedAchievements).toEqual([]);
  });

  it("does not duplicate achievement ids or logs when run twice", () => {
    const game = gameWithMetrics({ arr: 10_000_000 });

    const first = unlockAchievements(game);
    const second = unlockAchievements(first);

    expect(second.completedAchievements.filter((id) => id === "ten-million-arr")).toHaveLength(1);
    expect(second.log.filter((entry) => entry.includes("Ten Million ARR"))).toHaveLength(1);
  });
});
