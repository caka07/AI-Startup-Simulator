import { employeeRoles } from "../data/employeeRoles";
import type { Employee, EmployeeRole, EmployeeRoleId, GameState } from "../types";
import { applyMetricDelta, clampMetric } from "./clamp";
import { createRng } from "./rng";
import { syncRunway } from "./runway";

export type RetentionMove = "raise-salary" | "refresh-options" | "promote" | "vacation";

const LEVEL_ORDER: Employee["level"][] = ["junior", "mid", "senior", "lead", "cxo"];
const CHINESE_SURNAMES = ["沈", "林", "周", "陈", "许", "梁", "赵", "顾", "何", "陆", "唐", "秦"];
const CHINESE_GIVEN_NAMES = ["序", "砚", "知微", "星河", "云起", "景明", "若川", "以航", "宁远", "见山", "念初", "清越"];
const ENGLISH_FIRST_NAMES = ["Ava", "Maya", "Noah", "Ethan", "Iris", "Leo", "Nora", "Owen", "Riley", "Victor", "Zoe", "Miles"];
const ENGLISH_LAST_NAMES = ["Chen", "Lin", "Wang", "Zhang", "Liu", "Park", "Singh", "Kim", "Patel", "Nguyen", "Morgan", "Taylor"];

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

function generatedEmployeeName(game: GameState, role: EmployeeRoleId, employeeIndex: number): string {
  const roleSalt = Array.from(role).reduce((total, char) => total + char.charCodeAt(0), 0);
  const rng = createRng(game.seed + employeeIndex * 997 + roleSalt * 37);
  if (rng.next() < 0.58) {
    return `${CHINESE_SURNAMES[rng.int(0, CHINESE_SURNAMES.length - 1)]}${
      CHINESE_GIVEN_NAMES[rng.int(0, CHINESE_GIVEN_NAMES.length - 1)]
    }`;
  }
  return `${ENGLISH_FIRST_NAMES[rng.int(0, ENGLISH_FIRST_NAMES.length - 1)]} ${
    ENGLISH_LAST_NAMES[rng.int(0, ENGLISH_LAST_NAMES.length - 1)]
  }`;
}

function createEmployee(game: GameState, role: EmployeeRoleId, employeeIndex: number): Employee {
  const roleData = roleFor(role);
  const scarcity = startingScarcity(roleData);
  return {
    id: `employee-${employeeIndex}-${role}`,
    name: generatedEmployeeName(game, role, employeeIndex),
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
}

export function createInitialEmployees(game: GameState): Employee[] {
  return [
    {
      ...createEmployee(game, "researcher", 1),
      options: 1.2,
      loyalty: clampPercent(startingLoyalty(game) + 8),
    },
    {
      ...createEmployee(game, "engineer", 2),
      options: 1,
      loyalty: clampPercent(startingLoyalty(game) + 6),
    },
  ];
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
  const employee = createEmployee(game, role, employeeIndex);
  const hiringCost = Math.round(roleData.salaryBase * 0.4 + scarcity * 1_000);

  return syncRunway({
    ...game,
    metrics: applyMetricDelta(game.metrics, "cash", -hiringCost),
    employees: [...game.employees, employee],
    log: [...game.log, `招聘 ${employee.name}（${roleData.name}），前置成本 ${Math.round(hiringCost / 10_000)} 万。`],
  });
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

  return syncRunway({
    ...game,
    metrics: applyMetricDelta(game.metrics, "cash", -cost),
    employees,
    log: game.log,
  });
}
