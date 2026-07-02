import type { Employee, EmployeeOperationId, GameState, MetricEffect } from "../types";
import { applyMetricDelta, clampMetric } from "./clamp";
import { calculateDepartureRisk, retainEmployee } from "./employees";

export interface EmployeeOperation {
  id: EmployeeOperationId;
  name: string;
  description: string;
  risk: "low" | "medium" | "high";
}

export const employeeOperations: EmployeeOperation[] = [
  {
    id: "raise-salary",
    name: "加薪留人",
    description: "给最危险的人涨薪，现金变少，忠诚变高。",
    risk: "low",
  },
  {
    id: "refresh-options",
    name: "期权刷新",
    description: "用股权换信仰，创始人股权被稀释。",
    risk: "medium",
  },
  {
    id: "pua-incentive",
    name: "PUA 激励",
    description: "短期产出更高，疲劳和离职风险一起升空。",
    risk: "high",
  },
  {
    id: "vacation",
    name: "放假修整",
    description: "降低核心员工疲劳，牺牲一点季度推进速度。",
    risk: "low",
  },
  {
    id: "layoff",
    name: "裁员止血",
    description: "延长 Runway，但士气和声誉会留下疤。",
    risk: "high",
  },
];

function clampPercent(value: number): number {
  return clampMetric("morale", value);
}

function applyEffects(game: GameState, effects: MetricEffect[]): GameState {
  return {
    ...game,
    metrics: effects.reduce((nextMetrics, effect) => applyMetricDelta(nextMetrics, effect.metric, effect.delta), game.metrics),
  };
}

function highestDepartureRiskEmployee(game: GameState): Employee {
  return [...game.employees].sort(
    (left, right) => calculateDepartureRisk(game, right) - calculateDepartureRisk(game, left),
  )[0];
}

function highestCashPressureEmployee(game: GameState): Employee {
  return [...game.employees].sort((left, right) => {
    const rightPressure = right.salary + right.fatigue * 6_000 + right.scarcity * 3_000;
    const leftPressure = left.salary + left.fatigue * 6_000 + left.scarcity * 3_000;
    return rightPressure - leftPressure;
  })[0];
}

function updateEmployee(game: GameState, employeeId: string, update: (employee: Employee) => Employee): GameState {
  return {
    ...game,
    employees: game.employees.map((employee) => (employee.id === employeeId ? update(employee) : employee)),
  };
}

function appendLog(game: GameState, line: string): GameState {
  return {
    ...game,
    log: [...game.log, line],
  };
}

export function applyEmployeeOperation(game: GameState, operationId: EmployeeOperationId): GameState {
  if (game.employees.length === 0) return game;

  if (operationId === "raise-salary") {
    const target = highestDepartureRiskEmployee(game);
    return appendLog(retainEmployee(game, target.id, "raise-salary"), `员工操作：给 ${target.name} 加薪留人。`);
  }

  if (operationId === "refresh-options") {
    const target = highestDepartureRiskEmployee(game);
    const retained = retainEmployee(game, target.id, "refresh-options");
    return appendLog(
      applyEffects(retained, [
        { metric: "founderEquity", delta: -1 },
        { metric: "boardPressure", delta: 1 },
      ]),
      `员工操作：给 ${target.name} 刷新期权池。`,
    );
  }

  if (operationId === "vacation") {
    const target = highestDepartureRiskEmployee(game);
    const retained = retainEmployee(game, target.id, "vacation");
    return appendLog(
      applyEffects(retained, [
        { metric: "morale", delta: 3 },
        { metric: "productQuality", delta: -1 },
      ]),
      `员工操作：让 ${target.name} 放假修整，团队终于想起自己不是机器。`,
    );
  }

  if (operationId === "layoff") {
    const target = highestCashPressureEmployee(game);
    return appendLog(
      applyEffects(
        {
          ...game,
          employees: game.employees.filter((employee) => employee.id !== target.id),
        },
        [
          { metric: "cash", delta: Math.round(target.salary * 0.35) },
          { metric: "runway", delta: 1 },
          { metric: "morale", delta: -12 },
          { metric: "reputation", delta: -5 },
          { metric: "boardPressure", delta: 3 },
        ],
      ),
      `员工操作：裁掉 ${target.name} 止血，办公室安静得像坏消息。`,
    );
  }

  const target = highestDepartureRiskEmployee(game);
  return appendLog(
    applyEffects(
      updateEmployee(game, target.id, (employee) => ({
        ...employee,
        fatigue: clampPercent(employee.fatigue + 18),
        loyalty: clampPercent(employee.loyalty - 12),
        ambition: clampPercent(employee.ambition + 5),
      })),
      [
        { metric: "productQuality", delta: 3 },
        { metric: "modelPower", delta: 2 },
        { metric: "morale", delta: 2 },
        { metric: "founderHealth", delta: -4 },
      ],
    ),
    `员工操作：对 ${target.name} 进行 PUA 激励，产出上去了，人味下来了。`,
  );
}
