import { EMPLOYEE_ROLE_IDS, EXTRA_COMPANY_ACTION_COST } from "../constants";
import { actions as playerActions } from "../data/actions";
import type { ActionId, EmployeeOperationId, GameEvent, GameState, TurnSubmission } from "../types";
import { advanceQuarterClock } from "./advance";
import { unlockAchievements } from "./achievements";
import { applyMetricDelta } from "./clamp";
import { evaluateEnding } from "./endings";
import { hireEmployee } from "./employees";
import { applyEmployeeOperation, applyEmployeeOperationToEmployee } from "./employeeOperations";
import { resolveEventChoice } from "./events";
import { executeFundraise } from "./finance";
import { applyAction } from "./actions";
import { applyFounderAction } from "./founderActions";

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

function normalizeTurnSubmission(
  input: ActionId[] | TurnSubmission,
  employeeOperationId?: EmployeeOperationId,
): TurnSubmission {
  if (Array.isArray(input)) {
    return { companyActions: input, employeeOperations: [] };
  }
  return input;
}

function applyCompanyActions(game: GameState, actions: ActionId[]): GameState {
  const includesFundraise = actions.includes("fundraise");
  const genericActions = actions.filter((id) => id !== "fundraise");
  let next = genericActions.reduce((current, actionId) => applyAction(current, actionId), game);
  if (actions.includes("hire")) {
    const role = EMPLOYEE_ROLE_IDS[next.employees.length % EMPLOYEE_ROLE_IDS.length];
    next = hireEmployee(next, role);
  }
  if (includesFundraise) {
    next = applyActionHealthCost(next, "fundraise");
    next = executeFundraise(next);
  }
  return next;
}

export function advanceGameTurn(
  game: GameState,
  input: ActionId[] | TurnSubmission,
  employeeOperationId?: EmployeeOperationId,
): GameState {
  const submission = normalizeTurnSubmission(input, employeeOperationId);
  const companyActions = submission.companyActions.slice(0, 2);
  const paidExtra = submission.extraCompanyAction;
  let next = applyCompanyActions(game, companyActions);

  if (paidExtra && next.metrics.cash >= EXTRA_COMPANY_ACTION_COST) {
    next = {
      ...next,
      metrics: applyMetricDelta(next.metrics, "cash", -EXTRA_COMPANY_ACTION_COST),
      log: [...next.log, "购买额外公司动作：现金 -75 万。"],
    };
    next = applyCompanyActions(next, [paidExtra]);
  }

  if (submission.founderAction) {
    next = applyFounderAction(next, submission.founderAction);
  }

  for (const assignment of submission.employeeOperations ?? []) {
    next = applyEmployeeOperationToEmployee(next, assignment.employeeId, assignment.operationId);
  }

  if (Array.isArray(input) && employeeOperationId) {
    next = applyEmployeeOperation(next, employeeOperationId);
  }

  next = advanceQuarterClock(next);
  return finalizeTurn(next);
}

export function resolveGameEventChoice(game: GameState, event: GameEvent, choiceId: string): GameState {
  const next = resolveEventChoice(game, event, choiceId);
  return next === game ? game : finalizeTurn(next);
}
