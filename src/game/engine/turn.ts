import { EMPLOYEE_ROLE_IDS } from "../constants";
import { actions as playerActions } from "../data/actions";
import type { ActionId, GameEvent, GameState } from "../types";
import { advanceQuarter } from "./advance";
import { unlockAchievements } from "./achievements";
import { applyMetricDelta } from "./clamp";
import { evaluateEnding } from "./endings";
import { hireEmployee } from "./employees";
import { resolveEventChoice } from "./events";
import { executeFundraise } from "./finance";

const ACTION_HEALTH_COSTS = Object.fromEntries(
  playerActions.map((action) => [action.id, action.healthCost]),
) as Record<ActionId, number>;

function applyActionHealthCost(game: GameState, actionId: ActionId): GameState {
  return {
    ...game,
    metrics: applyMetricDelta(game.metrics, "founderHealth", -ACTION_HEALTH_COSTS[actionId]),
  };
}

function finalizeTurn(game: GameState): GameState {
  const withAchievements = unlockAchievements(game);
  const ending = evaluateEnding(withAchievements);
  return ending ? { ...withAchievements, endingId: ending.id } : withAchievements;
}

export function advanceGameTurn(game: GameState, actions: ActionId[]): GameState {
  const includesFundraise = actions.includes("fundraise");
  const genericActions = actions.filter((id) => id !== "fundraise");
  let next = advanceQuarter(game, genericActions);
  if (actions.includes("hire")) {
    const role = EMPLOYEE_ROLE_IDS[next.employees.length % EMPLOYEE_ROLE_IDS.length];
    next = hireEmployee(next, role);
  }
  if (includesFundraise) {
    next = applyActionHealthCost(next, "fundraise");
    next = executeFundraise(next);
  }
  return finalizeTurn(next);
}

export function resolveGameEventChoice(game: GameState, event: GameEvent, choiceId: string): GameState {
  const next = resolveEventChoice(game, event, choiceId);
  return next === game ? game : finalizeTurn(next);
}
