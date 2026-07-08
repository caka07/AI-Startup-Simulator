import { EMPLOYEE_ROLE_IDS, extraCompanyActionCost } from "../constants";
import { actions as playerActions } from "../data/actions";
import type { ActionId, EmployeeOperationId, GameEvent, GameState, InvestorId, TurnSubmission } from "../types";
import { advanceQuarterClock } from "./advance";
import { unlockAchievements } from "./achievements";
import { applyMetricDelta } from "./clamp";
import { applyEndingResolution } from "./endings";
import { hireEmployee } from "./employees";
import { applyEmployeeOperation, applyEmployeeOperationToEmployee } from "./employeeOperations";
import { resolveEventChoice } from "./events";
import { executeFundraise } from "./finance";
import { applyAction } from "./actions";
import { applyFounderAction } from "./founderActions";
import { syncRunway } from "./runway";

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
  const withRunway = syncRunway(game);
  const withAchievements = unlockAchievements(withRunway);
  return applyEndingResolution(withAchievements);
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

function applyCompanyActions(game: GameState, actions: ActionId[], investorId?: InvestorId | null): GameState {
  const uniqueActions = Array.from(new Set(actions));
  const includesFundraise = uniqueActions.includes("fundraise");
  const includesHire = uniqueActions.includes("hire");
  const genericActions = uniqueActions.filter((id) => id !== "fundraise" && id !== "hire");
  let next = genericActions.reduce((current, actionId) => applyAction(current, actionId), game);
  if (includesHire) {
    next = applyAction(next, "hire");
    const role = EMPLOYEE_ROLE_IDS[next.employees.length % EMPLOYEE_ROLE_IDS.length];
    next = hireEmployee(next, role);
  }
  if (includesFundraise) {
    next = applyActionHealthCost(next, "fundraise");
    next = executeFundraise(next, investorId);
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
  const paidExtras = submission.extraCompanyActions ?? (submission.extraCompanyAction ? [submission.extraCompanyAction] : []);
  let next = applyCompanyActions(game, companyActions, submission.investorId);
  let hasFundraisedThisQuarter = companyActions.includes("fundraise");

  for (const [index, paidExtra] of paidExtras.entries()) {
    if (paidExtra === "fundraise" && hasFundraisedThisQuarter) continue;
    const cost = extraCompanyActionCost(next.employees.length, index);
    if (next.metrics.cash < cost) continue;
    next = {
      ...next,
      metrics: applyMetricDelta(next.metrics, "cash", -cost),
      log: [...next.log, `第 ${index + 1} 次额外公司动作：现金 -${Math.round(cost / 10_000)} 万。`],
    };
    next = applyCompanyActions(next, [paidExtra], submission.investorId);
    if (paidExtra === "fundraise") hasFundraisedThisQuarter = true;
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
