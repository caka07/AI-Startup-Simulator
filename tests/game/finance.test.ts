import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { evaluateFundraising, executeFundraise } from "../../src/game/engine/finance";

function baseGame() {
  return createNewGame({
    seed: 7,
    founderName: "赵路",
    backgroundId: "serial-founder",
    trackId: "ai-coding",
    attributes: {
      tech: 5,
      sales: 5,
      fundraising: 8,
      management: 4,
      ethics: 3,
      stamina: 4,
      hype: 6,
      luck: 3,
    },
  });
}

describe("finance", () => {
  it("discounts valuation when runway is below six months", () => {
    const game = baseGame();
    const healthy = evaluateFundraising({
      ...game,
      metrics: { ...game.metrics, runway: 12, arr: 12_000_000, pmf: 65 },
    });
    const pressured = evaluateFundraising({
      ...game,
      metrics: { ...game.metrics, runway: 4, arr: 12_000_000, pmf: 65 },
    });

    expect(pressured.valuation).toBeLessThan(healthy.valuation);
    expect(pressured.termStyle).not.toBe("friendly");
  });

  it("unlocks Series A only with ARR and PMF", () => {
    const noPmf = evaluateFundraising({
      ...baseGame(),
      metrics: { ...baseGame().metrics, arr: 12_000_000, pmf: 45 },
    });
    const ready = evaluateFundraising({
      ...baseGame(),
      metrics: { ...baseGame().metrics, arr: 12_000_000, pmf: 65 },
    });

    expect(noPmf.availableRounds).not.toContain("series-a");
    expect(ready.availableRounds).toContain("series-a");
  });

  it("fundraising dilutes founder equity and increases board pressure", () => {
    const game = baseGame();
    const next = executeFundraise({
      ...game,
      metrics: { ...game.metrics, arr: 12_000_000, pmf: 65, runway: 10 },
    });

    expect(next.metrics.cash).toBeGreaterThan(game.metrics.cash);
    expect(next.metrics.founderEquity).toBeLessThan(game.metrics.founderEquity);
    expect(next.metrics.boardPressure).toBeGreaterThan(game.metrics.boardPressure);
  });

  it("uses predatory terms when runway is below the death spiral threshold", () => {
    const evaluation = evaluateFundraising({
      ...baseGame(),
      metrics: { ...baseGame().metrics, runway: 2, arr: 8_000_000, pmf: 55 },
    });

    expect(evaluation.termStyle).toBe("predatory");
    expect(evaluation.dilution).toBe(35);
  });

  it("discounts valuation and worsens terms when compliance risk is high", () => {
    const game = baseGame();
    const normal = evaluateFundraising({
      ...game,
      metrics: { ...game.metrics, arr: 20_000_000, pmf: 70, complianceRisk: 20, runway: 12 },
    });
    const risky = evaluateFundraising({
      ...game,
      metrics: { ...game.metrics, arr: 20_000_000, pmf: 70, complianceRisk: 70, runway: 12 },
    });

    expect(risky.valuation).toBeLessThan(normal.valuation);
    expect(risky.termStyle).toBe("pressure");
  });

  it("keeps the valuation floor after runway and compliance discounts", () => {
    const evaluation = evaluateFundraising({
      ...baseGame(),
      metrics: { ...baseGame().metrics, arr: 0, runway: 2, complianceRisk: 70 },
    });

    expect(evaluation.valuation).toBe(10_000_000);
  });

  it("raises cash only for actual dilution when founder equity is low", () => {
    const game = {
      ...baseGame(),
      metrics: { ...baseGame().metrics, arr: 12_000_000, pmf: 65, runway: 10, founderEquity: 5 },
    };
    const evaluation = evaluateFundraising(game);

    const next = executeFundraise(game);

    expect(evaluation.dilution).toBe(15);
    expect(next.metrics.cash).toBe(game.metrics.cash + Math.round(evaluation.valuation * 0.05));
    expect(next.metrics.founderEquity).toBe(0);
    expect(next.log.at(-1)).toContain("稀释 5%");
  });

  it("appends a funding log and updates valuation and runway without mutating the original game", () => {
    const game = {
      ...baseGame(),
      metrics: { ...baseGame().metrics, arr: 12_000_000, pmf: 65, runway: 10 },
    };
    const originalMetrics = { ...game.metrics };
    const originalLog = [...game.log];
    const evaluation = evaluateFundraising(game);

    const next = executeFundraise(game);

    expect(game.metrics).toEqual(originalMetrics);
    expect(game.log).toEqual(originalLog);
    expect(next.metrics.valuation).toBe(evaluation.valuation);
    expect(next.metrics.runway).toBe(originalMetrics.runway + 12);
    expect(next.log).toHaveLength(originalLog.length + 1);
    expect(next.log.at(-1)).toContain("完成融资");
  });
});
