import { actions } from "../data/actions";
import type { ActionId, GameState, MetricEffect } from "../types";
import { applyMetricDelta } from "./clamp";

const ACTION_EFFECTS = Object.fromEntries(
  actions.map((action) => [
    action.id,
    [...action.effects, { metric: "founderHealth", delta: -action.healthCost }],
  ]),
) as Record<ActionId, MetricEffect[]>;

export function applyAction(game: GameState, action: ActionId): GameState {
  const effects = ACTION_EFFECTS[action];
  const metrics = effects.reduce(
    (nextMetrics, effect) => applyMetricDelta(nextMetrics, effect.metric, effect.delta),
    game.metrics,
  );

  return {
    ...game,
    metrics,
    log: [...game.log, `执行行动：${action}`],
  };
}
