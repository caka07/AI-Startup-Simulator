import { events } from "../data/events";
import type { Condition, GameEvent, GameState } from "../types";
import { applyMetricDelta } from "./clamp";

export function matchesCondition(game: GameState, condition: Condition): boolean {
  const value = game.metrics[condition.metric];
  if (condition.op === ">=") return value >= condition.value;
  if (condition.op === ">") return value > condition.value;
  if (condition.op === "<=") return value <= condition.value;
  if (condition.op === "<") return value < condition.value;
  return value === condition.value;
}

export function matchesAll(game: GameState, trigger: Condition[]): boolean {
  return trigger.every((condition) => matchesCondition(game, condition));
}

export function getEligibleEvents(game: GameState): GameEvent[] {
  return events.filter((event) => matchesAll(game, event.trigger));
}

export function resolveEventChoice(game: GameState, event: GameEvent, choiceId: string): GameState {
  const choice = event.choices.find((item) => item.id === choiceId);
  if (!choice) return game;

  const metrics = choice.effects.reduce(
    (nextMetrics, effect) => applyMetricDelta(nextMetrics, effect.metric, effect.delta),
    game.metrics,
  );

  return {
    ...game,
    metrics,
    log: [...game.log, `${event.title}：${choice.log}`],
  };
}
