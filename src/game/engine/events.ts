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

export function pickNextEvent(game: GameState): GameEvent | null {
  if (game.endingId) return null;
  const resolvedIds = new Set(game.resolvedEventIds);
  const candidates = getEligibleEvents(game).filter((event) => !resolvedIds.has(event.id));
  if (candidates.length === 0) return null;
  const offset = Math.abs(game.seed + game.year * 4 + game.quarter * 17 + game.resolvedEventIds.length * 31);
  return candidates[offset % candidates.length];
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
    resolvedEventIds: game.resolvedEventIds.includes(event.id)
      ? game.resolvedEventIds
      : [...game.resolvedEventIds, event.id],
    log: [...game.log, `${event.title}：${choice.log}`],
  };
}
