import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { getLeaderboard, getLeaderboardCategories, getLeaderboardCompanyDetail } from "../../src/game/engine/leaderboard";
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
  it("includes simulated AI giants in visible rows", () => {
    const leaderboard = getLeaderboard(gameWithMetrics());

    expect(leaderboard.rows.map((row) => row.id)).toContain("deepduck");
    expect(leaderboard.rows.map((row) => row.id)).toContain("openmind");
  });

  it("moves the player upward when metrics become frontier-grade", () => {
    const early = getLeaderboard(gameWithMetrics({ arr: 0, modelPower: 25, productQuality: 25, globalReadiness: 10 }));
    const strong = getLeaderboard(
      gameWithMetrics({ arr: 80_000_000, modelPower: 82, productQuality: 78, globalReadiness: 65, reputation: 78 }),
    );

    expect(strong.playerRank).toBeLessThan(early.playerRank);
  });

  it("keeps the player outside top rankings until company has enough signal", () => {
    const game = gameWithMetrics();
    const early = getLeaderboard(game, "overall");

    expect(early.rows).toHaveLength(9);
    expect(early.rows.some((row) => row.id === "player")).toBe(false);
    expect(early.rows.every((row) => row.id !== "player")).toBe(true);
    expect(early.rows.every((row) => getLeaderboardCompanyDetail(game, row.id) !== null)).toBe(true);
    expect(early.playerRankLabel).toContain("TOP 50 外");
  });

  it("supports model, commercial, and global ranking categories", () => {
    expect(getLeaderboardCategories().map((category) => category.id)).toEqual(["overall", "model", "commercial", "global"]);

    const strong = getLeaderboard(
      gameWithMetrics({ arr: 150_000_000, modelPower: 90, productQuality: 80, globalReadiness: 85, reputation: 80, pmf: 75 }),
      "commercial",
    );

    expect(strong.rows.some((row) => row.id === "player")).toBe(true);
  });

  it("returns company detail for simulated giants and player", () => {
    const game = gameWithMetrics({ arr: 80_000_000, modelPower: 82, globalReadiness: 65 });
    const detail = getLeaderboardCompanyDetail(game, "deepduck");

    expect(detail?.name).toBe("DeepDuck");
    expect(detail?.description).toContain("开源");
    expect(getLeaderboardCompanyDetail(game, "oasis-models")?.description).toContain("主权 AI");
    expect(getLeaderboardCompanyDetail(game, "player")?.description).toContain(game.founder.name);
  });

  it("returns defensive copies for simulated company detail arrays", () => {
    const game = gameWithMetrics();
    const detail = getLeaderboardCompanyDetail(game, "oasis-models");

    detail?.strengths.push("mutated");

    expect(getLeaderboardCompanyDetail(game, "oasis-models")?.strengths).not.toContain("mutated");
  });

  it("does not label a high-scoring hidden player as top nine", () => {
    const game = gameWithMetrics({
      modelPower: 80,
      productQuality: 80,
      pmf: 80,
      globalReadiness: 80,
      reputation: 80,
    });
    const leaderboard = getLeaderboard(
      {
        ...game,
        factionRelations: Object.fromEntries(Object.keys(game.factionRelations).map((id) => [id, 100])) as GameState["factionRelations"],
      },
      "overall",
    );

    expect(leaderboard.playerScore).toBeGreaterThanOrEqual(78);
    expect(leaderboard.playerRank).toBeGreaterThan(9);
    expect(leaderboard.rows.some((row) => row.id === "player")).toBe(false);
    expect(leaderboard.playerRankLabel).not.toBe("TOP 9");
  });
});
