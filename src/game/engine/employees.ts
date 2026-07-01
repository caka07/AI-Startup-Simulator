import { employeeRoles } from "../data/employeeRoles";
import type { Employee, EmployeeRole, EmployeeRoleId, GameState } from "../types";
import { applyMetricDelta, clampMetric } from "./clamp";

export type RetentionMove = "raise-salary" | "refresh-options" | "promote" | "vacation";

const LEVEL_ORDER: Employee["level"][] = ["junior", "mid", "senior", "lead", "cxo"];

function clampPercent(value: number): number {
  return clampMetric("morale", value);
}

function roleFor(roleId: EmployeeRoleId): EmployeeRole {
  const role = employeeRoles.find((candidate) => candidate.id === roleId);
  if (!role) throw new Error(`Unknown employee role: ${roleId}`);
  return role;
}

function startingLevel(role: EmployeeRole): Employee["level"] {
  if (role.id === "cfo") return "cxo";
  if (role.salaryBase >= 700_000) return "senior";
  return "mid";
}

function startingAbility(role: EmployeeRole): number {
  return clampPercent(52 + role.strengths.length * 4 + role.salaryBase / 50_000);
}

function startingScarcity(role: EmployeeRole): number {
  const scarceRisk = role.risks.some((risk) => /flight|professional|travel/.test(risk)) ? 12 : 0;
  return clampPercent(40 + role.salaryBase / 25_000 + scarceRisk);
}

function startingAmbition(role: EmployeeRole, game: GameState): number {
  const executiveAmbition = role.id === "cfo" ? 10 : 0;
  return clampPercent(45 + role.salaryBase / 45_000 + game.metrics.marketHeat / 10 + executiveAmbition);
}

function startingLoyalty(game: GameState): number {
  return clampPercent(48 + game.founder.attributes.management * 2 + game.metrics.morale / 10 - game.metrics.boardPressure / 8);
}

function tagsFor(role: EmployeeRole): string[] {
  return [...role.strengths.map((effect) => effect.metric), ...role.risks];
}

function nextLevel(level: Employee["level"]): Employee["level"] {
  const index = LEVEL_ORDER.indexOf(level);
  return LEVEL_ORDER[Math.min(LEVEL_ORDER.length - 1, index + 1)];
}

function retentionCost(role: EmployeeRole, move: RetentionMove): number {
  const multiplier = move === "raise-salary" ? 0.35 : move === "refresh-options" ? 0.25 : move === "promote" ? 0.2 : 0.1;
  return Math.round(role.salaryBase * multiplier);
}

export function hireEmployee(game: GameState, role: EmployeeRoleId): GameState {
  const roleData = roleFor(role);
  const employeeIndex = game.employees.length + 1;
  const scarcity = startingScarcity(roleData);
  const employee: Employee = {
    id: `employee-${employeeIndex}-${role}`,
    name: `${roleData.name} ${employeeIndex}`,
    role,
    level: startingLevel(roleData),
    ability: startingAbility(roleData),
    salary: roleData.salaryBase,
    options: roleData.id === "cfo" ? 2 : roleData.salaryBase >= 700_000 ? 0.8 : 0.4,
    loyalty: startingLoyalty(game),
    ambition: startingAmbition(roleData, game),
    fatigue: clampPercent(10 + Math.max(0, scarcity - 60) / 5),
    scarcity,
    tags: tagsFor(roleData),
  };
  const hiringCost = Math.round(roleData.salaryBase * 0.4 + scarcity * 1_000);

  return {
    ...game,
    metrics: applyMetricDelta(game.metrics, "cash", -hiringCost),
    employees: [...game.employees, employee],
    log: [...game.log, `Hired ${employee.name}; upfront hiring cost ${hiringCost}.`],
  };
}

export function calculateDepartureRisk(game: GameState, employee: Employee): number {
  const roleData = roleFor(employee.role);
  const salaryGapRatio = Math.max(0, (roleData.salaryBase - employee.salary) / roleData.salaryBase);
  const moralePressure = Math.max(0, 65 - game.metrics.morale) * 0.45;
  const fatiguePressure = employee.fatigue * 0.35;
  const lowLoyaltyPressure = Math.max(0, 70 - employee.loyalty) * 0.5;
  const salaryPressure = salaryGapRatio * 35;
  const scarcityPressure = employee.scarcity * 0.12;
  const ambitionPressure = employee.ambition * 0.12;
  const optionExposure = Math.min(20, employee.options * 8);
  const underwaterOptions =
    game.metrics.valuation < 20_000_000 ? ((20_000_000 - game.metrics.valuation) / 20_000_000) * optionExposure : 0;
  const technicalPoaching =
    employee.role === "researcher" || employee.role === "engineer" ? Math.max(0, game.metrics.modelPower - 55) * 0.3 : 0;
  const marketPoaching = Math.max(0, game.metrics.marketHeat - 65) * 0.2;
  const scarcityPoaching = Math.max(0, employee.scarcity - 70) * 0.2;
  const poachingPressure = (technicalPoaching + marketPoaching + scarcityPoaching) * (employee.ambition / 100);
  const reputationShield = game.metrics.reputation * 0.18;
  const loyaltyShield = employee.loyalty * 0.2;

  return clampPercent(
    8 +
      moralePressure +
      fatiguePressure +
      lowLoyaltyPressure +
      salaryPressure +
      scarcityPressure +
      ambitionPressure +
      underwaterOptions +
      poachingPressure -
      reputationShield -
      loyaltyShield,
  );
}

export function retainEmployee(game: GameState, employeeId: string, move: RetentionMove): GameState {
  const target = game.employees.find((employee) => employee.id === employeeId);
  if (!target) return game;

  const roleData = roleFor(target.role);
  const cost = retentionCost(roleData, move);
  const employees = game.employees.map((employee) => {
    if (employee.id !== employeeId) return employee;

    if (move === "raise-salary") {
      return {
        ...employee,
        salary: Math.max(employee.salary, Math.round(roleData.salaryBase * 1.12)),
        loyalty: clampPercent(employee.loyalty + 14),
      };
    }

    if (move === "refresh-options") {
      return {
        ...employee,
        options: Number((employee.options + 0.3).toFixed(2)),
        loyalty: clampPercent(employee.loyalty + 18),
      };
    }

    if (move === "promote") {
      return {
        ...employee,
        level: nextLevel(employee.level),
        ability: clampPercent(employee.ability + 4),
        salary: Math.max(employee.salary, Math.round(roleData.salaryBase * 1.08)),
        options: Number((employee.options + 0.1).toFixed(2)),
        loyalty: clampPercent(employee.loyalty + 10),
        ambition: clampPercent(employee.ambition - 4),
      };
    }

    return {
      ...employee,
      fatigue: clampPercent(employee.fatigue - 25),
      loyalty: clampPercent(employee.loyalty + 6),
    };
  });

  return {
    ...game,
    metrics: applyMetricDelta(game.metrics, "cash", -cost),
    employees,
    log: [...game.log, `Retention move ${move} applied to ${target.name}; cost ${cost}.`],
  };
}
