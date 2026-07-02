import { actions } from "../data/actions";
import type { ActionId, GameState, MetricEffect } from "../types";
import { applyMetricDelta } from "./clamp";

const ACTION_EFFECTS = Object.fromEntries(
  actions.map((action) => [
    action.id,
    [...action.effects, { metric: "founderHealth", delta: -action.healthCost }],
  ]),
) as Record<ActionId, MetricEffect[]>;
const ACTION_NAMES = Object.fromEntries(actions.map((action) => [action.id, action.name])) as Record<ActionId, string>;

export function applyAction(game: GameState, action: ActionId): GameState {
  const effects = ACTION_EFFECTS[action];
  const metrics = effects.reduce(
    (nextMetrics, effect) => applyMetricDelta(nextMetrics, effect.metric, effect.delta),
    game.metrics,
  );

  return {
    ...game,
    metrics,
    log: [...game.log, `执行行动：${ACTION_NAMES[action]}`],
  };
}
