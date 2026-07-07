import { EMPLOYEE_ROLE_IDS, METRIC_IDS, PERCENT_METRICS } from "../constants";
import { actions } from "../data/actions";
import type { ActionId, ActionPreview, GameState, MetricEffect, PlayerAction } from "../types";
import { applyMetricDelta } from "./clamp";
import { hireEmployee } from "./employees";
import { executeFundraise } from "./finance";

const METRIC_LABELS: Record<MetricEffect["metric"], string> = {
  cash: "现金",
  runway: "Runway",
  arr: "ARR",
  mrr: "MRR",
  pmf: "PMF",
  modelPower: "模型能力",
  productQuality: "产品质量",
  computeSupply: "算力供给",
  computeCost: "算力成本",
  grossMargin: "Gross Margin",
  techDebt: "技术债",
  reputation: "声誉",
  morale: "士气",
  complianceRisk: "合规风险",
  globalReadiness: "全球化准备",
  boardPressure: "董事会压力",
  founderHealth: "创始人健康",
  founderEquity: "创始人股权",
  valuation: "估值",
  marketHeat: "市场热度",
};

export function findAction(actionId: ActionId): PlayerAction {
  const action = actions.find((item) => item.id === actionId);
  if (!action) throw new Error(`Unknown action: ${actionId}`);
  return action;
}

function efficiencyMultiplier(game: GameState, action: PlayerAction): number {
  const attributeBonus = Object.entries(action.efficiency.attributes ?? {}).reduce((total, [id, weight]) => {
    const value = game.founder.attributes[id as keyof typeof game.founder.attributes];
    return total + (value - 3) * (weight ?? 0);
  }, 0);
  const metricBonus = Object.entries(action.efficiency.metrics ?? {}).reduce((total, [id, weight]) => {
    const metricId = id as keyof typeof game.metrics;
    const value = normalizedMetricValue(metricId, game.metrics[metricId]);
    return total + ((value - 50) / 50) * (weight ?? 0);
  }, 0);
  const moralePenalty = game.metrics.morale < 35 ? -0.12 : 0;
  const healthPenalty = game.metrics.founderHealth < 30 ? -0.1 : 0;
  return Number(
    Math.max(0.55, Math.min(1.85, 1 + attributeBonus + metricBonus + moralePenalty + healthPenalty)).toFixed(2),
  );
}

function normalizedMetricValue(metric: MetricEffect["metric"], value: number): number {
  if (PERCENT_METRICS.has(metric)) return value;
  if (metric === "cash") return Math.max(0, Math.min(100, value / 200_000));
  if (metric === "runway") return Math.max(0, Math.min(100, value * 5));
  if (metric === "mrr") return Math.max(0, Math.min(100, value / 50_000));
  if (metric === "arr") return Math.max(0, Math.min(100, value / 600_000));
  if (metric === "valuation") return Math.max(0, Math.min(100, value / 10_000_000));
  return value;
}

function scaleEffect(effect: MetricEffect, multiplier: number): MetricEffect {
  if (effect.delta <= 0 || effect.metric === "cash") return { ...effect };
  const scaled = Math.round(effect.delta * multiplier);
  return { ...effect, delta: PERCENT_METRICS.has(effect.metric) ? Math.min(100, scaled) : scaled };
}

function metricDeltaText(effect: MetricEffect): string {
  const sign = effect.delta > 0 ? "+" : "-";
  const abs = Math.abs(effect.delta);
  if (["cash", "arr", "mrr", "valuation"].includes(effect.metric) && abs >= 10_000) {
    return `${METRIC_LABELS[effect.metric]} ${sign}${Math.round(abs / 10_000)}万`;
  }
  return `${METRIC_LABELS[effect.metric]} ${sign}${abs}`;
}

function effectsFromMetricDiff(before: GameState, after: GameState): MetricEffect[] {
  return METRIC_IDS.map((metric) => ({ metric, delta: after.metrics[metric] - before.metrics[metric] }))
    .filter((effect) => effect.delta !== 0);
}

function calculateBaseActionPreview(game: GameState, actionId: ActionId): ActionPreview {
  const action = findAction(actionId);
  const multiplier = efficiencyMultiplier(game, action);
  const healthEffect: MetricEffect = { metric: "founderHealth", delta: -action.healthCost };
  const effects = [...action.effects, healthEffect].map((effect) =>
    scaleEffect(effect, multiplier),
  );
  return {
    actionId,
    efficiencyMultiplier: multiplier,
    effects,
    summary: effects.map(metricDeltaText),
  };
}

export function applyActionEffects(game: GameState, actionId: ActionId): GameState {
  const preview = calculateBaseActionPreview(game, actionId);
  const action = findAction(actionId);
  return {
    ...game,
    metrics: preview.effects.reduce(
      (metrics, effect) => applyMetricDelta(metrics, effect.metric, effect.delta),
      game.metrics,
    ),
    log: [...game.log, `执行行动：${action.name}（效率 x${preview.efficiencyMultiplier}）`],
  };
}

export function calculateActionPreview(game: GameState, actionId: ActionId): ActionPreview {
  const basePreview = calculateBaseActionPreview(game, actionId);

  if (actionId === "fundraise") {
    const withHealthCost = {
      ...game,
      metrics: applyMetricDelta(game.metrics, "founderHealth", -findAction(actionId).healthCost),
    };
    const afterFundraise = executeFundraise(withHealthCost);
    const effects = effectsFromMetricDiff(game, afterFundraise);
    return {
      ...basePreview,
      effects,
      summary: effects.map(metricDeltaText),
    };
  }

  if (actionId === "hire") {
    const role = EMPLOYEE_ROLE_IDS[game.employees.length % EMPLOYEE_ROLE_IDS.length];
    const afterHire = hireEmployee(applyActionEffects(game, actionId), role);
    const effects = effectsFromMetricDiff(game, afterHire);
    return {
      ...basePreview,
      effects,
      summary: effects.map(metricDeltaText),
    };
  }

  return basePreview;
}
