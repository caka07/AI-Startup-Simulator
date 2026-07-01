import { describe, expect, it } from "vitest";
import { employeeRoles } from "../../src/game/data/employeeRoles";
import { createNewGame } from "../../src/game/engine/createGame";
import { calculateDepartureRisk, hireEmployee, retainEmployee } from "../../src/game/engine/employees";
import type { EmployeeRoleId } from "../../src/game/types";

function game() {
  return createNewGame({
    seed: 13,
    founderName: "周见",
    backgroundId: "open-source-maintainer",
    trackId: "ai-coding",
    attributes: {
      tech: 7,
      sales: 3,
      fundraising: 3,
      management: 4,
      ethics: 7,
      stamina: 4,
      hype: 3,
      luck: 3,
    },
  });
}

function salaryBase(roleId: EmployeeRoleId) {
  const role = employeeRoles.find((candidate) => candidate.id === roleId);
  if (!role) throw new Error(`Unknown role ${roleId}`);
  return role.salaryBase;
}

describe("employees", () => {
  it("hires role cards instead of only increasing headcount", () => {
    const next = hireEmployee(game(), "researcher");
    expect(next.employees).toHaveLength(1);
    expect(next.employees[0].role).toBe("researcher");
    expect(next.metrics.cash).toBeLessThan(game().metrics.cash);
  });

  it("uses employee role salary data when hiring", () => {
    const next = hireEmployee(game(), "engineer");

    expect(next.employees[0].salary).toBe(salaryBase("engineer"));
    expect(next.employees[0].tags.length).toBeGreaterThan(0);
    expect(next.employees[0].id).toBe("employee-1-engineer");
  });

  it("departure risk increases when morale is low and employee is tired", () => {
    const hired = hireEmployee(game(), "researcher");
    const employee = { ...hired.employees[0], fatigue: 90, loyalty: 20 };
    const calmRisk = calculateDepartureRisk({ ...hired, metrics: { ...hired.metrics, morale: 75 } }, employee);
    const crisisRisk = calculateDepartureRisk({ ...hired, metrics: { ...hired.metrics, morale: 20 } }, employee);
    expect(crisisRisk).toBeGreaterThan(calmRisk);
  });

  it("retention spends cash and increases loyalty", () => {
    const hired = hireEmployee(game(), "engineer");
    const employeeId = hired.employees[0].id;
    const retained = retainEmployee(hired, employeeId, "refresh-options");
    expect(retained.metrics.cash).toBeLessThan(hired.metrics.cash);
    expect(retained.employees[0].loyalty).toBeGreaterThan(hired.employees[0].loyalty);
  });

  it("does not mutate the original game when hiring or retaining", () => {
    const original = game();
    const originalMetrics = { ...original.metrics };
    const originalEmployees = [...original.employees];
    const hired = hireEmployee(original, "sales");

    expect(original.metrics).toEqual(originalMetrics);
    expect(original.employees).toEqual(originalEmployees);

    const hiredMetrics = { ...hired.metrics };
    const hiredEmployees = hired.employees.map((employee) => ({ ...employee, tags: [...employee.tags] }));
    const retained = retainEmployee(hired, hired.employees[0].id, "raise-salary");

    expect(hired.metrics).toEqual(hiredMetrics);
    expect(hired.employees).toEqual(hiredEmployees);
    expect(retained.employees[0]).not.toBe(hired.employees[0]);
  });

  it("returns the original game unchanged for a missing employee id", () => {
    const hired = hireEmployee(game(), "engineer");

    const retained = retainEmployee(hired, "missing-employee", "promote");

    expect(retained).toBe(hired);
  });

  it("vacation reduces fatigue without going below zero", () => {
    const hired = hireEmployee(game(), "engineer");
    const rested = {
      ...hired,
      employees: [{ ...hired.employees[0], fatigue: 8 }],
    };

    const retained = retainEmployee(rested, rested.employees[0].id, "vacation");

    expect(retained.employees[0].fatigue).toBe(0);
    expect(retained.metrics.cash).toBeLessThan(rested.metrics.cash);
  });

  it("clamps departure risk to a percentage range", () => {
    const hired = hireEmployee(game(), "researcher");
    const highRiskEmployee = {
      ...hired.employees[0],
      salary: 0,
      options: 10,
      loyalty: 0,
      ambition: 100,
      fatigue: 100,
      scarcity: 100,
    };
    const lowRiskEmployee = {
      ...hired.employees[0],
      salary: salaryBase("researcher") * 2,
      options: 0,
      loyalty: 100,
      ambition: 0,
      fatigue: 0,
      scarcity: 0,
    };

    expect(
      calculateDepartureRisk(
        { ...hired, metrics: { ...hired.metrics, morale: 0, reputation: 0, modelPower: 100, valuation: 0 } },
        highRiskEmployee,
      ),
    ).toBe(100);
    expect(
      calculateDepartureRisk(
        {
          ...hired,
          metrics: { ...hired.metrics, morale: 100, reputation: 100, modelPower: 0, valuation: 1_000_000_000 },
        },
        lowRiskEmployee,
      ),
    ).toBe(0);
  });
});
