import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { getEligibleEvents, matchesAll, matchesCondition, pickNextEvent, resolveEventChoice } from "../../src/game/engine/events";
import type { Condition, GameState, NewGameInput } from "../../src/game/types";

const input: NewGameInput = {
  seed: 1,
  founderName: "Dana",
  backgroundId: "former-llm-researcher",
  trackId: "foundation-model",
  attributes: { tech: 8, sales: 3, fundraising: 5, management: 3, ethics: 4, stamina: 5, hype: 4, luck: 2 },
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

describe("events", () => {
  it("matches conditions with every supported operator", () => {
    const game = gameWithMetrics({ cash: 3_000_000, runway: 12, modelPower: 25, marketHeat: 55, arr: 0 });

    expect(matchesCondition(game, { metric: "cash", op: ">=", value: 3_000_000 })).toBe(true);
    expect(matchesCondition(game, { metric: "runway", op: ">", value: 11 })).toBe(true);
    expect(matchesCondition(game, { metric: "marketHeat", op: "<=", value: 55 })).toBe(true);
    expect(matchesCondition(game, { metric: "modelPower", op: "<", value: 30 })).toBe(true);
    expect(matchesCondition(game, { metric: "arr", op: "===", value: 0 })).toBe(true);
    expect(matchesCondition(game, { metric: "arr", op: "===", value: 1 })).toBe(false);
  });

  it("matches all conditions only when every condition passes", () => {
    const game = gameWithMetrics({ modelPower: 45, marketHeat: 70 });
    const vulnerableTrigger: Condition[] = [
      { metric: "modelPower", op: "<=", value: 55 },
      { metric: "marketHeat", op: ">=", value: 65 },
    ];

    expect(matchesAll(game, vulnerableTrigger)).toBe(true);
    expect(matchesAll(game, [...vulnerableTrigger, { metric: "pmf", op: ">", value: 80 }])).toBe(false);
  });

  it("surfaces DeepDuck shock only when model moat is vulnerable", () => {
    const vulnerable = gameWithMetrics({ modelPower: 45, marketHeat: 70 });
    const insulated = gameWithMetrics({ modelPower: 65, marketHeat: 70 });

    expect(getEligibleEvents(vulnerable).map((event) => event.id)).toContain("deepduck-open-source-shock");
    expect(getEligibleEvents(insulated).map((event) => event.id)).not.toContain("deepduck-open-source-shock");
  });

  it("event choices apply metric effects through clamps and append event logs without mutating the original game", () => {
    const game = gameWithMetrics({ modelPower: 45, marketHeat: 70, pmf: 99, productQuality: 99 });
    const event = getEligibleEvents(game).find((item) => item.id === "deepduck-open-source-shock");
    if (!event) throw new Error("Missing DeepDuck event fixture");

    const next = resolveEventChoice(game, event, "wrap-with-workflow");

    expect(next).not.toBe(game);
    expect(next.metrics.pmf).toBe(100);
    expect(next.metrics.productQuality).toBe(100);
    expect(next.log.at(-1)).toContain(event.title);
    expect(game.metrics.pmf).toBe(99);
    expect(game.metrics.productQuality).toBe(99);
    expect(game.log).toHaveLength(1);
  });

  it("event choices do not allow non-percent metrics to drop below zero", () => {
    const game = gameWithMetrics({ boardPressure: 50, cash: 100 });
    const event = getEligibleEvents(game).find((item) => item.id === "board-suggests-professional-ceo");
    if (!event) throw new Error("Missing board event fixture");

    const next = resolveEventChoice(game, event, "hire-coo");

    expect(next.metrics.cash).toBe(0);
    expect(next.metrics.boardPressure).toBe(42);
  });

  it("returns the original game unchanged for an unknown event choice", () => {
    const game = gameWithMetrics({ modelPower: 45, marketHeat: 70 });
    const event = getEligibleEvents(game).find((item) => item.id === "deepduck-open-source-shock");
    if (!event) throw new Error("Missing DeepDuck event fixture");

    expect(resolveEventChoice(game, event, "missing-choice")).toBe(game);
  });

  it("picks an unresolved eligible event with deterministic rotation", () => {
    const game = gameWithMetrics({ valuation: 25_000_000, arr: 800_000, reputation: 40 });
    const first = pickNextEvent(game);
    if (!first) throw new Error("Expected at least one eligible event");

    const second = pickNextEvent({ ...game, resolvedEventIds: [first.id] });

    expect(second).not.toBeNull();
    expect(second?.id).not.toBe(first.id);
  });
});
