import { describe, expect, it } from "vitest";
import { actions } from "../../src/game/data/actions";
import { createNewGame } from "../../src/game/engine/createGame";
import { advanceQuarter } from "../../src/game/engine/advance";
import type { ActionId, CompanyMetrics, MetricEffect } from "../../src/game/types";

const input = {
  seed: 99,
  founderName: "林舟",
  backgroundId: "former-llm-researcher" as const,
  trackId: "foundation-model" as const,
  attributes: {
    tech: 8,
    sales: 3,
    fundraising: 4,
    management: 3,
    ethics: 5,
    stamina: 5,
    hype: 3,
    luck: 2,
  },
};

describe("advanceQuarter", () => {
  it("advances quarter and year correctly", () => {
    let game = createNewGame(input);
    game = advanceQuarter(game, ["build-product", "train-model"]);
    expect(game.year).toBe(2026);
    expect(game.quarter).toBe(2);

    game = advanceQuarter(game, ["build-product", "sell"]);
    game = advanceQuarter(game, ["build-product", "sell"]);
    game = advanceQuarter(game, ["build-product", "sell"]);
    expect(game.year).toBe(2027);
    expect(game.quarter).toBe(1);
  });

  it("keeps percent metrics clamped after actions", () => {
    let game = createNewGame(input);
    for (let i = 0; i < 20; i += 1) {
      game = advanceQuarter(game, ["train-model", "pr-launch"]);
    }
    expect(game.metrics.modelPower).toBeLessThanOrEqual(100);
    expect(game.metrics.reputation).toBeLessThanOrEqual(100);
    expect(game.metrics.founderHealth).toBeGreaterThanOrEqual(0);
  });

  it("applies only the first two actions without mutating the original game", () => {
    const game = createNewGame(input);
    const originalMetrics = { ...game.metrics };
    const originalLog = [...game.log];

    const next = advanceQuarter(game, ["build-product", "sell", "train-model"]);
    const expectedMetrics = applyStaticActionEffects(originalMetrics, ["build-product", "sell"]);

    expect(game.metrics).toEqual(originalMetrics);
    expect(game.log).toEqual(originalLog);
    expect(next.metrics).toEqual(expectedMetrics);
    expect(next.metrics.modelPower).toBe(originalMetrics.modelPower);
    expect(next.metrics.computeCost).toBe(originalMetrics.computeCost);
    expect(next.metrics.cash).toBe(originalMetrics.cash);
    expect(next.log.slice(originalLog.length)).toEqual(["执行行动：build-product", "执行行动：sell"]);
    expect(next.log).toHaveLength(originalLog.length + 2);
    expect(next.year).toBe(2026);
    expect(next.quarter).toBe(2);
  });
});

function applyStaticActionEffects(metrics: CompanyMetrics, actionIds: ActionId[]): CompanyMetrics {
  return actionIds.reduce((nextMetrics, actionId) => {
    const action = actions.find((candidate) => candidate.id === actionId);
    if (!action) throw new Error(`Missing static action: ${actionId}`);
    return [...action.effects, { metric: "founderHealth" as const, delta: -action.healthCost }].reduce(
      (updatedMetrics, effect) => applyMetricDeltaForTest(updatedMetrics, effect),
      nextMetrics,
    );
  }, metrics);
}

function applyMetricDeltaForTest(metrics: CompanyMetrics, effect: MetricEffect): CompanyMetrics {
  return {
    ...metrics,
    [effect.metric]: metrics[effect.metric] + effect.delta,
  };
}
