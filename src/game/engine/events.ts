import { events } from "../data/events";
import type { Condition, GameEvent, GameState } from "../types";
import { applyMetricDelta } from "./clamp";

const EVENT_BASE_CHANCE = 0.6;
const EVENT_CHANCE_CAP = 0.88;
const EVENT_RISK_BONUS_HIGH = 0.12;
const EVENT_RISK_BONUS_MEDIUM = 0.06;
const EVENT_HEAT_BONUS_HIGH = 0.1;
const EVENT_HEAT_BONUS_MEDIUM = 0.06;
const EVENT_BOARD_BONUS = 0.08;
const EVENT_HEALTH_BONUS = 0.08;
const EVENT_QUIET_BONUS = 0.08;
const HASH_SEED = 0x811c9dc5;
const HASH_MIX_A = 0x85ebca6b;
const HASH_MIX_B = 0xc2b2ae35;
const UINT32_RANGE = 0x100000000;

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

function mixHash(hash: number, value: number): number {
  let next = (hash ^ (value >>> 0)) >>> 0;
  next = Math.imul(next, HASH_MIX_A) >>> 0;
  next ^= next >>> 13;
  next = Math.imul(next, HASH_MIX_B) >>> 0;
  return (next ^ (next >>> 16)) >>> 0;
}

function quarterRoll(game: GameState): number {
  let hash = HASH_SEED;
  hash = mixHash(hash, game.seed);
  hash = mixHash(hash, game.year);
  hash = mixHash(hash, game.quarter);
  hash = mixHash(hash, game.resolvedEventIds.length);
  return hash / UINT32_RANGE;
}

export function calculateEventChance(game: GameState): number {
  const riskBonus =
    game.metrics.complianceRisk >= 60
      ? EVENT_RISK_BONUS_HIGH
      : game.metrics.complianceRisk >= 35
        ? EVENT_RISK_BONUS_MEDIUM
        : 0;
  const heatBonus =
    game.metrics.marketHeat >= 75
      ? EVENT_HEAT_BONUS_HIGH
      : game.metrics.marketHeat >= 60
        ? EVENT_HEAT_BONUS_MEDIUM
        : 0;
  const boardBonus = game.metrics.boardPressure >= 50 ? EVENT_BOARD_BONUS : 0;
  const healthBonus = game.metrics.founderHealth <= 40 ? EVENT_HEALTH_BONUS : 0;
  const quietBonus = game.resolvedEventIds.length === 0 ? EVENT_QUIET_BONUS : 0;
  return Math.min(EVENT_CHANCE_CAP, EVENT_BASE_CHANCE + riskBonus + heatBonus + boardBonus + healthBonus + quietBonus);
}

export function shouldTriggerEvent(game: GameState): boolean {
  if (game.endingId) return false;
  return quarterRoll(game) <= calculateEventChance(game);
}

export function pickNextEvent(game: GameState): GameEvent | null {
  if (!shouldTriggerEvent(game)) return null;
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
