import { founderActions } from "../data/founderActions";
import type { FounderActionId, FounderAttributes, GameState } from "../types";
import { applyMetricDelta } from "./clamp";

function clampAttribute(value: number): number {
  return Math.max(1, Math.min(10, Number(value.toFixed(1))));
}

function applyAttributeDelta(attributes: FounderAttributes, key: keyof FounderAttributes, delta: number): FounderAttributes {
  return { ...attributes, [key]: clampAttribute(attributes[key] + delta) };
}

export function applyFounderAction(game: GameState, actionId: FounderActionId): GameState {
  const action = founderActions.find((item) => item.id === actionId);
  if (!action) return game;
  const metrics = action.effects.reduce((next, effect) => applyMetricDelta(next, effect.metric, effect.delta), game.metrics);
  const attributes = Object.entries(action.attributeEffects).reduce(
    (next, [key, delta]) => applyAttributeDelta(next, key as keyof FounderAttributes, delta ?? 0),
    game.founder.attributes,
  );
  return {
    ...game,
    metrics,
    founder: { ...game.founder, attributes },
    log: [...game.log, `创始人动作：${action.name}`],
  };
}
