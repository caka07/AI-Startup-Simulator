import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { advanceGameTurn } from "../../src/game/engine/turn";

function createTurnGame() {
  return createNewGame({
    seed: 20260630,
    founderName: "回合测试创始人",
    backgroundId: "serial-founder",
    trackId: "ai-agent",
    attributes: { tech: 5, sales: 6, fundraising: 7, management: 4, ethics: 3, stamina: 4, hype: 6, luck: 3 },
  });
}

describe("advanceGameTurn", () => {
  it("matches App semantics for a combined fundraise and hire turn", () => {
    const game = createTurnGame();
    const next = advanceGameTurn(game, ["fundraise", "hire"]);

    expect(next.year).toBe(2026);
    expect(next.quarter).toBe(2);
    expect(next.employees).toHaveLength(1);
    expect(next.employees[0].role).toBe("researcher");
    expect(next.metrics.cash).toBeGreaterThan(game.metrics.cash);
    expect(next.metrics.founderEquity).toBeLessThan(game.metrics.founderEquity);
    expect(next.metrics.founderHealth).toBeLessThan(game.metrics.founderHealth);
    expect(next.metrics.boardPressure).toBeGreaterThan(game.metrics.boardPressure);
  });

  it("supports two company actions plus a paid extra action and founder action", () => {
    const game = createTurnGame();
    const next = advanceGameTurn(game, {
      companyActions: ["build-product", "sell"],
      extraCompanyAction: "train-model",
      founderAction: "take-vacation",
      employeeOperations: [],
    });

    expect(next.quarter).toBe(2);
    expect(next.metrics.cash).toBeLessThan(game.metrics.cash);
    expect(next.metrics.productQuality).toBeGreaterThan(game.metrics.productQuality);
    expect(next.metrics.founderHealth).toBeGreaterThanOrEqual(game.metrics.founderHealth - 4);
    expect(next.log.join(" ")).toContain("额外公司动作");
    expect(next.log.join(" ")).toContain("创始人动作");
  });

  it("keeps employee operations optional", () => {
    const hired = advanceGameTurn(createTurnGame(), { companyActions: ["hire", "build-product"], employeeOperations: [] });
    const next = advanceGameTurn(hired, { companyActions: ["sell", "build-product"], employeeOperations: [] });

    expect(next.employees).toHaveLength(1);
    expect(next.quarter).toBe(3);
  });

  it("supports the legacy third-argument employee operation path", () => {
    const hired = advanceGameTurn(createTurnGame(), ["hire", "build-product"]);
    const employee = hired.employees[0];

    const next = advanceGameTurn(hired, ["sell", "build-product"], "vacation");

    expect(next.quarter).toBe(3);
    expect(next.employees[0].fatigue).toBeLessThan(employee.fatigue);
  });
});
