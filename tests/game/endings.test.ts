import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { applyEndingResolution, evaluateEnding, evaluateEndingResolution } from "../../src/game/engine/endings";
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

  it("records HK IPO as a milestone without ending the game", () => {
    const game = gameWithMetrics({
      arr: 90_000_000,
      grossMargin: 52,
      complianceRisk: 25,
      globalReadiness: 60,
      founderHealth: 70,
      valuation: 900_000_000,
    });

    const resolution = evaluateEndingResolution(game);
    const next = applyEndingResolution(game);

    expect(resolution.milestoneEndings.map((ending) => ending.id)).toContain("hk-ipo");
    expect(resolution.terminalEnding).toBeNull();
    expect(next.completedEndings).toContain("hk-ipo");
    expect(next.endingId).toBeNull();
    expect(next.log.at(-1)).toContain("阶段结局：港股 IPO");
  });

  it("does not record the same milestone ending twice", () => {
    const game = {
      ...gameWithMetrics({
        arr: 90_000_000,
        grossMargin: 52,
        complianceRisk: 25,
        globalReadiness: 60,
        founderHealth: 70,
        valuation: 900_000_000,
      }),
      completedEndings: ["hk-ipo"],
    };

    const next = applyEndingResolution(game);

    expect(next.completedEndings.filter((id) => id === "hk-ipo")).toHaveLength(1);
    expect(next.log.filter((line) => line.includes("阶段结局：港股 IPO"))).toHaveLength(0);
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

  it("keeps cashflow break as a terminal ending even when milestones match", () => {
    const game = gameWithMetrics({
      runway: 0,
      arr: 200_000_000,
      grossMargin: 60,
      complianceRisk: 20,
      globalReadiness: 80,
      founderHealth: 70,
      valuation: 2_500_000_000,
    });

    const next = applyEndingResolution(game);

    expect(next.endingId).toBe("cashflow-break");
    expect(next.completedEndings).toContain("cashflow-break");
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

  it("uses a 15-year terminal ending when the company outlives the lifecycle", () => {
    const game = {
      ...gameWithMetrics({ cash: 20_000_000, runway: 24, complianceRisk: 20, founderHealth: 70 }),
      year: 2041,
      quarter: 1 as const,
    };

    const resolution = evaluateEndingResolution(game);
    const next = applyEndingResolution(game);

    expect(resolution.terminalEnding?.id).toBe("fifteen-year-sunset");
    expect(next.endingId).toBe("fifteen-year-sunset");
  });

  it("lets a stronger success ending beat the 15-year sunset", () => {
    const game = {
      ...gameWithMetrics({
        arr: 800_000_000,
        grossMargin: 60,
        complianceRisk: 20,
        globalReadiness: 85,
        founderHealth: 60,
        valuation: 2_500_000_000,
      }),
      year: 2041,
      quarter: 1 as const,
    };

    expect(evaluateEnding(game)?.id).toBe("us-ipo");
  });
});
