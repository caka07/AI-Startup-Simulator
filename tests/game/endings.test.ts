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

describe("endings", () => {
  it("returns null when no ending trigger matches", () => {
    expect(evaluateEnding(createNewGame(input))).toBeNull();
  });

  it("prioritizes forced failure over prestige endings", () => {
    const game = gameWithMetrics({
      runway: 0,
      arr: 800_000_000,
      grossMargin: 60,
      complianceRisk: 20,
      globalReadiness: 85,
      founderHealth: 60,
      valuation: 2_500_000_000,
    });

    expect(evaluateEnding(game)?.id).toBe("cashflow-break");
  });

  it("prefers US IPO over HK IPO when both public-market triggers match", () => {
    const game = gameWithMetrics({
      arr: 800_000_000,
      grossMargin: 60,
      complianceRisk: 20,
      globalReadiness: 85,
      founderHealth: 60,
      valuation: 2_500_000_000,
    });

    expect(evaluateEnding(game)?.id).toBe("us-ipo");
  });

  it("unlocks HK IPO for public-scale revenue below US IPO valuation", () => {
    const game = gameWithMetrics({
      arr: 800_000_000,
      grossMargin: 60,
      complianceRisk: 20,
      globalReadiness: 85,
      founderHealth: 60,
      valuation: 900_000_000,
    });

    expect(evaluateEnding(game)?.id).toBe("hk-ipo");
  });

  it("does not require US market revenue share for US IPO", () => {
    const game = gameWithMetrics({
      arr: 800_000_000,
      grossMargin: 60,
      complianceRisk: 20,
      globalReadiness: 85,
      founderHealth: 60,
      valuation: 2_500_000_000,
    });

    expect(evaluateEnding(game)?.id).toBe("us-ipo");
  });

  it("blocks US IPO when compliance risk is too high", () => {
    const game = gameWithMetrics({
      arr: 800_000_000,
      grossMargin: 35,
      complianceRisk: 36,
      globalReadiness: 85,
      founderHealth: 60,
      valuation: 2_500_000_000,
    });

    expect(evaluateEnding(game)?.id).not.toBe("us-ipo");
  });

  it("requires global readiness, clean compliance, founder health, and public-scale ARR for US IPO", () => {
    const game = gameWithMetrics({
      arr: 160_000_000,
      globalReadiness: 80,
      complianceRisk: 25,
      founderHealth: 55,
      grossMargin: 58,
      valuation: 2_500_000_000,
    });

    expect(evaluateEnding(game)?.id).toBe("us-ipo");
    expect(
      evaluateEnding(
        gameWithMetrics({ arr: 160_000_000, globalReadiness: 80, complianceRisk: 55, founderHealth: 55 }),
      )?.id,
    ).not.toBe("us-ipo");
  });
});
