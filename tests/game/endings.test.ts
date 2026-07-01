import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { evaluateEnding } from "../../src/game/engine/endings";
import type { GameState, NewGameInput } from "../../src/game/types";

const input: NewGameInput = {
  seed: 3,
  founderName: "Casey",
  backgroundId: "overseas-phd",
  trackId: "ai-coding",
  attributes: { tech: 7, sales: 4, fundraising: 6, management: 4, ethics: 5, stamina: 4, hype: 4, luck: 2 },
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

function withUsRevenue(game: GameState, revenueShare = 45): GameState {
  return {
    ...game,
    markets: {
      ...game.markets,
      us: {
        ...game.markets.us,
        unlocked: true,
        revenueShare,
        localization: 80,
      },
    },
  };
}

describe("endings", () => {
  it("returns null when no ending trigger matches", () => {
    expect(evaluateEnding(createNewGame(input))).toBeNull();
  });

  it("prioritizes forced failure over prestige endings", () => {
    const game = withUsRevenue(
      gameWithMetrics({ runway: 0, arr: 800_000_000, grossMargin: 60, complianceRisk: 20, globalReadiness: 85 }),
    );

    expect(evaluateEnding(game)?.id).toBe("cashflow-break");
  });

  it("unlocks US IPO only with global revenue and clean compliance", () => {
    const game = withUsRevenue(
      gameWithMetrics({ arr: 800_000_000, grossMargin: 60, complianceRisk: 20, globalReadiness: 85 }),
    );

    expect(evaluateEnding(game)?.id).toBe("us-ipo");
  });

  it("blocks US IPO when US revenue is not unlocked", () => {
    const game = gameWithMetrics({ arr: 800_000_000, grossMargin: 60, complianceRisk: 20, globalReadiness: 85 });

    expect(evaluateEnding(game)?.id).toBe("hk-ipo");
  });

  it("blocks US IPO when US revenue share is below forty percent", () => {
    const game = withUsRevenue(
      gameWithMetrics({ arr: 800_000_000, grossMargin: 60, complianceRisk: 20, globalReadiness: 85 }),
      39,
    );

    expect(evaluateEnding(game)?.id).toBe("hk-ipo");
  });

  it("blocks US IPO when compliance risk is too high", () => {
    const game = withUsRevenue(
      gameWithMetrics({ arr: 800_000_000, grossMargin: 35, complianceRisk: 36, globalReadiness: 85, founderHealth: 60 }),
    );

    expect(evaluateEnding(game)).toBeNull();
  });
});
