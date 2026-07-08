import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { applyEmployeeOperation, applyEmployeeOperationToEmployee } from "../../src/game/engine/employeeOperations";
import { hireEmployee } from "../../src/game/engine/employees";
import { deriveRunway } from "../../src/game/engine/runway";
import { advanceGameTurn } from "../../src/game/engine/turn";

function game() {
  const base = createNewGame({
    seed: 20260702,
    founderName: "林序",
    backgroundId: "former-llm-researcher",
    trackId: "ai-coding",
    attributes: { tech: 5, sales: 2, fundraising: 2, management: 2, ethics: 4, stamina: 3, hype: 2, luck: 4 },
  });
  return { ...base, employees: [] };
}

function createTurnGame() {
  return createNewGame({
    seed: 20260630,
    founderName: "回合测试创始人",
    backgroundId: "serial-founder",
    trackId: "ai-agent",
    attributes: { tech: 5, sales: 6, fundraising: 7, management: 4, ethics: 3, stamina: 4, hype: 6, luck: 3 },
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

  it("applies operations to the selected employee only", () => {
    const one = advanceGameTurn(createTurnGame(), { companyActions: ["hire", "build-product"], employeeOperations: [] });
    const two = advanceGameTurn(one, { companyActions: ["hire", "sell"], employeeOperations: [] });
    const first = two.employees[0];
    const second = two.employees[1];

    const next = advanceGameTurn(two, {
      companyActions: ["sell", "build-product"],
      employeeOperations: [{ employeeId: first.id, operationId: "vacation" }],
    });

    expect(next.employees.find((employee) => employee.id === first.id)?.fatigue).toBeLessThan(first.fatigue);
    expect(next.employees.find((employee) => employee.id === second.id)?.fatigue).toBe(second.fatigue);
  });

  it("uses Task 3 selected effects for vacation", () => {
    const hired = hireEmployee(game(), "researcher");
    const employee = hired.employees[0];

    const next = applyEmployeeOperationToEmployee(hired, employee.id, "vacation");

    expect(next.metrics.morale).toBe(hired.metrics.morale + 2);
    expect(next.metrics.productQuality).toBe(hired.metrics.productQuality - 1);
    expect(next.employees[0].fatigue).toBeLessThan(employee.fatigue);
    expect(next.log.at(-1)).toBe(`员工操作：让 ${employee.name} 放假修整。`);
  });

  it("uses Task 3 selected effects for layoff", () => {
    const hired = hireEmployee(hireEmployee(game(), "researcher"), "engineer");
    const target = hired.employees[0];

    const next = applyEmployeeOperationToEmployee(hired, target.id, "layoff");

    expect(next.employees.map((employee) => employee.id)).not.toContain(target.id);
    expect(next.metrics.cash).toBe(hired.metrics.cash + Math.round(target.salary * 0.35));
    expect(next.metrics.runway).toBe(deriveRunway(next.metrics, next.employees));
    expect(next.metrics.runway).toBeGreaterThan(hired.metrics.runway);
    expect(next.metrics.morale).toBe(hired.metrics.morale - 8);
    expect(next.metrics.reputation).toBe(hired.metrics.reputation - 4);
    expect(next.metrics.boardPressure).toBe(hired.metrics.boardPressure);
    expect(next.log.at(-1)).toBe(`员工操作：裁掉 ${target.name} 止血。`);
  });

  it("uses Task 3 selected effects for pua incentive", () => {
    const hired = hireEmployee(game(), "engineer");
    const employee = hired.employees[0];

    const next = applyEmployeeOperationToEmployee(hired, employee.id, "pua-incentive");

    expect(next.metrics.productQuality).toBe(hired.metrics.productQuality + 3);
    expect(next.metrics.modelPower).toBe(hired.metrics.modelPower + 2);
    expect(next.metrics.morale).toBe(hired.metrics.morale + 1);
    expect(next.metrics.founderHealth).toBe(hired.metrics.founderHealth - 4);
    expect(next.log.at(-1)).toBe(`员工操作：对 ${employee.name} 进行 PUA 激励。`);
  });

  it("keeps legacy employee operation effects for old UI compatibility", () => {
    const hired = hireEmployee(game(), "researcher");

    const next = applyEmployeeOperation(hired, "vacation");

    expect(next.metrics.morale).toBe(hired.metrics.morale + 3);
    expect(next.log.at(-1)).toBe(`员工操作：让 ${hired.employees[0].name} 放假修整，团队终于想起自己不是机器。`);
  });
});
