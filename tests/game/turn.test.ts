import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { advanceGameTurn } from "../../src/game/engine/turn";
import type { GameState } from "../../src/game/types";

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
    expect(next.employees).toHaveLength(3);
    expect(next.employees[2].role).toBe("product-manager");
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

  it("supports multiple paid extra actions with escalating costs", () => {
    const game = {
      ...createTurnGame(),
      metrics: { ...createTurnGame().metrics, cash: 20_000_000 },
      employees: [
        { id: "e1", name: "员工甲", role: "engineer", level: "mid", ability: 60, salary: 500_000, options: 1, loyalty: 70, ambition: 50, fatigue: 20, scarcity: 50, tags: [] },
        { id: "e2", name: "员工乙", role: "sales", level: "mid", ability: 60, salary: 500_000, options: 1, loyalty: 70, ambition: 50, fatigue: 20, scarcity: 50, tags: [] },
        { id: "e3", name: "员工丙", role: "researcher", level: "mid", ability: 60, salary: 500_000, options: 1, loyalty: 70, ambition: 50, fatigue: 20, scarcity: 50, tags: [] },
      ] satisfies GameState["employees"],
    };

    const next = advanceGameTurn(game, {
      companyActions: ["build-product", "sell"],
      extraCompanyActions: ["train-model", "publish-paper"],
      employeeOperations: [],
    });

    expect(next.metrics.modelPower).toBeGreaterThan(game.metrics.modelPower);
    expect(next.metrics.reputation).toBeGreaterThan(game.metrics.reputation);
    expect(next.log.join(" ")).toContain("第 1 次额外公司动作");
    expect(next.log.join(" ")).toContain("第 2 次额外公司动作");
    expect(next.metrics.cash).toBeLessThan(game.metrics.cash - 7_000_000);
  });

  it("does not apply a paid extra action when cash is insufficient", () => {
    const game = {
      ...createTurnGame(),
      metrics: { ...createTurnGame().metrics, cash: 200_000 },
    };

    const next = advanceGameTurn(game, {
      companyActions: ["build-product", "sell"],
      extraCompanyActions: ["train-model"],
      employeeOperations: [],
    });

    expect(next.metrics.cash).toBe(200_000);
    expect(next.metrics.modelPower).toBe(game.metrics.modelPower);
    expect(next.log.join(" ")).not.toContain("额外公司动作");
  });

  it("does not allow more than one financing in the same quarter", () => {
    const game = {
      ...createTurnGame(),
      metrics: { ...createTurnGame().metrics, cash: 30_000_000, founderEquity: 100 },
    };

    const next = advanceGameTurn(game, {
      companyActions: ["fundraise", "build-product"],
      extraCompanyActions: ["fundraise", "fundraise"],
      investorId: "kevin-founder",
      employeeOperations: [],
    });

    expect(next.log.filter((line) => line.includes("完成融资"))).toHaveLength(1);
    expect(next.log.filter((line) => line.includes("额外公司动作"))).toHaveLength(0);
    expect(next.metrics.founderEquity).toBe(90);
  });

  it("does not apply duplicate hire effects when hire appears twice", () => {
    const game = createTurnGame();

    const singleHire = advanceGameTurn(game, { companyActions: ["hire"], employeeOperations: [] });
    const duplicatedHire = advanceGameTurn(game, { companyActions: ["hire", "hire"], employeeOperations: [] });

    expect(duplicatedHire.employees).toHaveLength(singleHire.employees.length);
    expect(duplicatedHire.metrics.productQuality).toBe(singleHire.metrics.productQuality);
    expect(duplicatedHire.metrics.modelPower).toBe(singleHire.metrics.modelPower);
    expect(duplicatedHire.metrics.founderHealth).toBe(singleHire.metrics.founderHealth);
  });

  it("lets a cash-rich founder buy back shares at a governance cost", () => {
    const game = {
      ...createTurnGame(),
      metrics: { ...createTurnGame().metrics, cash: 30_000_000, founderEquity: 42, boardPressure: 20 },
    };

    const next = advanceGameTurn(game, {
      companyActions: ["buyback-shares", "build-product"],
      employeeOperations: [],
    });

    expect(next.metrics.cash).toBeLessThan(game.metrics.cash);
    expect(next.metrics.founderEquity).toBeGreaterThan(game.metrics.founderEquity);
    expect(next.metrics.boardPressure).toBeGreaterThan(game.metrics.boardPressure);
    expect(next.log.join(" ")).toContain("股份回购");
  });

  it("ends the game when company actions drain cash to zero even if runway was positive", () => {
    const game = {
      ...createTurnGame(),
      metrics: { ...createTurnGame().metrics, cash: 100, runway: 12 },
    };

    const next = advanceGameTurn(game, {
      companyActions: ["train-model", "build-product"],
      employeeOperations: [],
    });

    expect(next.metrics.cash).toBe(0);
    expect(next.metrics.runway).toBe(0);
    expect(next.endingId).toBe("cashflow-break");
  });

  it("recalculates runway from cash instead of trusting the stored runway number", () => {
    const rich = {
      ...createTurnGame(),
      metrics: { ...createTurnGame().metrics, cash: 8_000_000, runway: 99 },
    };
    const poor = {
      ...createTurnGame(),
      metrics: { ...createTurnGame().metrics, cash: 800_000, runway: 99 },
    };

    const richNext = advanceGameTurn(rich, { companyActions: ["build-product", "sell"], employeeOperations: [] });
    const poorNext = advanceGameTurn(poor, { companyActions: ["build-product", "sell"], employeeOperations: [] });

    expect(richNext.metrics.runway).not.toBe(99);
    expect(poorNext.metrics.runway).not.toBe(99);
    expect(richNext.metrics.runway).toBeGreaterThan(poorNext.metrics.runway);
  });

  it("keeps employee operations optional", () => {
    const hired = advanceGameTurn(createTurnGame(), { companyActions: ["hire", "build-product"], employeeOperations: [] });
    const next = advanceGameTurn(hired, { companyActions: ["sell", "build-product"], employeeOperations: [] });

    expect(next.employees).toHaveLength(3);
    expect(next.quarter).toBe(3);
  });

  it("supports the legacy third-argument employee operation path", () => {
    const hired = advanceGameTurn(createTurnGame(), ["hire", "build-product"]);
    const employee = hired.employees[0];

    const next = advanceGameTurn(hired, ["sell", "build-product"], "vacation");

    expect(next.quarter).toBe(3);
    expect(next.employees[0].fatigue).toBeLessThan(employee.fatigue);
  });

  it("ends after the fifteenth year if no stronger ending happened first", () => {
    const game = {
      ...createTurnGame(),
      year: 2040,
      quarter: 4 as const,
      metrics: {
        ...createTurnGame().metrics,
        cash: 50_000_000,
        runway: 24,
        founderHealth: 80,
        complianceRisk: 20,
        boardPressure: 10,
        arr: 5_000_000,
        valuation: 80_000_000,
      },
    };

    const next = advanceGameTurn(game, { companyActions: ["build-product", "sell"], employeeOperations: [] });

    expect(next.year).toBe(2041);
    expect(next.endingId).toBe("fifteen-year-sunset");
    expect(next.completedEndings).toContain("fifteen-year-sunset");
  });
});
