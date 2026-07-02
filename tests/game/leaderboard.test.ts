import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { getLeaderboard } from "../../src/game/engine/leaderboard";
import type { GameState } from "../../src/game/types";

function gameWithMetrics(metrics: Partial<GameState["metrics"]> = {}): GameState {
  const game = createNewGame({
    seed: 20260702,
    founderName: "榜单测试公司",
    backgroundId: "serial-founder",
    trackId: "foundation-model",
    attributes: { tech: 4, sales: 4, fundraising: 5, management: 3, ethics: 2, stamina: 3, hype: 2, luck: 1 },
  });
  return {
    ...game,
    metrics: {
      ...game.metrics,
      ...metrics,
    },
  };
}

describe("leaderboard", () => {
  it("includes simulated AI giants and the player company", () => {
    const leaderboard = getLeaderboard(gameWithMetrics());

    expect(leaderboard.map((row) => row.id)).toContain("deepduck");
    expect(leaderboard.map((row) => row.id)).toContain("openmind");
    expect(leaderboard.map((row) => row.id)).toContain("player");
  });

  it("moves the player upward when metrics become frontier-grade", () => {
    const early = getLeaderboard(gameWithMetrics({ arr: 0, modelPower: 25, productQuality: 25, globalReadiness: 10 }));
    const strong = getLeaderboard(
      gameWithMetrics({ arr: 80_000_000, modelPower: 82, productQuality: 78, globalReadiness: 65, reputation: 78 }),
    );

    expect(strong.findIndex((row) => row.id === "player")).toBeLessThan(
      early.findIndex((row) => row.id === "player"),
    );
  });
});
