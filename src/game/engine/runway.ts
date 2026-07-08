import type { CompanyMetrics, Employee, GameState } from "../types";
import { clampMetric } from "./clamp";

const MAX_DISPLAY_RUNWAY = 60;

export function estimateMonthlyBurn(metrics: CompanyMetrics, employees: Employee[]): number {
  const monthlyPayroll = employees.reduce((total, employee) => total + employee.salary, 0) / 12;
  const fixedOperations = 50_000 + employees.length * 10_000;
  const computeBurn = 15_000 + metrics.computeCost * 1_000 + Math.max(0, metrics.computeSupply - 35) * 800;
  const techDebtDrag =
    metrics.techDebt * 700 + Math.max(0, metrics.techDebt - 45) * Math.max(0, metrics.techDebt - 45) * 55;
  const globalOperatingOverhead = Math.max(0, metrics.globalReadiness - 35) * 1_200;
  const organizationalDrag =
    techDebtDrag +
    metrics.complianceRisk * 250 +
    metrics.boardPressure * 600 +
    Math.max(0, 50 - metrics.morale) * 1_000 +
    globalOperatingOverhead;
  const revenue = Math.max(metrics.mrr, metrics.arr / 12);
  const grossProfit = revenue * (metrics.grossMargin / 100);

  return Math.max(40_000, monthlyPayroll + fixedOperations + computeBurn + organizationalDrag - grossProfit);
}

export function deriveRunway(metrics: CompanyMetrics, employees: Employee[]): number {
  if (metrics.cash <= 0) return 0;
  const monthlyBurn = estimateMonthlyBurn(metrics, employees);
  const months = Math.round(metrics.cash / monthlyBurn);
  return Math.min(MAX_DISPLAY_RUNWAY, clampMetric("runway", months));
}

export function syncRunway(game: GameState): GameState {
  const runway = deriveRunway(game.metrics, game.employees);
  if (game.metrics.runway === runway) return game;
  return {
    ...game,
    metrics: {
      ...game.metrics,
      runway,
    },
  };
}
