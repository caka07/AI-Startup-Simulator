import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { applyEmployeeOperation } from "../../src/game/engine/employeeOperations";
import { hireEmployee } from "../../src/game/engine/employees";

function game() {
  return createNewGame({
    seed: 20260702,
    founderName: "林序",
    backgroundId: "former-llm-researcher",
    trackId: "ai-coding",
    attributes: { tech: 5, sales: 2, fundraising: 2, management: 2, ethics: 4, stamina: 3, hype: 2, luck: 4 },
  });
}

describe("employee operations", () => {
  it("returns the original game when there are no employees to operate on", () => {
    const original = game();

    expect(applyEmployeeOperation(original, "raise-salary")).toBe(original);
  });

  it("pua incentive raises short-term output but increases fatigue and pressure", () => {
    const hired = hireEmployee(game(), "engineer");

    const next = applyEmployeeOperation(hired, "pua-incentive");

    expect(next.metrics.productQuality).toBeGreaterThan(hired.metrics.productQuality);
    expect(next.metrics.founderHealth).toBeLessThan(hired.metrics.founderHealth);
    expect(next.employees[0].fatigue).toBeGreaterThan(hired.employees[0].fatigue);
    expect(next.employees[0].loyalty).toBeLessThan(hired.employees[0].loyalty);
  });

  it("layoff removes one employee and trades culture for runway", () => {
    const hired = hireEmployee(hireEmployee(game(), "researcher"), "engineer");

    const next = applyEmployeeOperation(hired, "layoff");

    expect(next.employees).toHaveLength(1);
    expect(next.metrics.runway).toBeGreaterThanOrEqual(hired.metrics.runway);
    expect(next.metrics.morale).toBeLessThan(hired.metrics.morale);
    expect(next.metrics.reputation).toBeLessThan(hired.metrics.reputation);
  });

  it("raise salary targets the highest departure risk employee", () => {
    const hired = hireEmployee(hireEmployee(game(), "researcher"), "engineer");
    const stressed = {
      ...hired,
      employees: [
        { ...hired.employees[0], loyalty: 15, fatigue: 90 },
        { ...hired.employees[1], loyalty: 90, fatigue: 5 },
      ],
    };

    const next = applyEmployeeOperation(stressed, "raise-salary");

    expect(next.employees[0].loyalty).toBeGreaterThan(stressed.employees[0].loyalty);
    expect(next.employees[1].loyalty).toBe(stressed.employees[1].loyalty);
    expect(next.metrics.cash).toBeLessThan(stressed.metrics.cash);
  });
});
