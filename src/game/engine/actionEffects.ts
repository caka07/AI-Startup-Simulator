import { PERCENT_METRICS } from "../constants";
import { actions } from "../data/actions";
import type { ActionId, ActionPreview, GameState, MetricEffect, PlayerAction } from "../types";
import { applyMetricDelta } from "./clamp";

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
    const value = game.metrics[id as keyof typeof game.metrics];
    return total + ((value - 50) / 50) * (weight ?? 0);
  }, 0);
  const moralePenalty = game.metrics.morale < 35 ? -0.12 : 0;
  const healthPenalty = game.metrics.founderHealth < 30 ? -0.1 : 0;
  return Number(
    Math.max(0.55, Math.min(1.85, 1 + attributeBonus + metricBonus + moralePenalty + healthPenalty)).toFixed(2),
  );
}

function scaleEffect(effect: MetricEffect, multiplier: number): MetricEffect {
  if (effect.delta <= 0 || effect.metric === "cash") return { ...effect };
  const scaled = Math.round(effect.delta * multiplier);
  return { ...effect, delta: PERCENT_METRICS.has(effect.metric) ? Math.min(100, scaled) : scaled };
}

export function calculateActionPreview(game: GameState, actionId: ActionId): ActionPreview {
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
    summary: [...action.visibleSummary],
  };
}

export function applyActionEffects(game: GameState, actionId: ActionId): GameState {
  const preview = calculateActionPreview(game, actionId);
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
