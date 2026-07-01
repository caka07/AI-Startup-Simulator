import {
  ACTION_IDS,
  EMPLOYEE_ROLE_IDS,
  FACTION_IDS,
  INVESTOR_IDS,
  METRIC_IDS,
} from "../constants";
import { achievements } from "../data/achievements";
import { actions } from "../data/actions";
import { employeeRoles } from "../data/employeeRoles";
import { endings } from "../data/endings";
import { events } from "../data/events";
import { factions } from "../data/factions";
import { investors } from "../data/investors";
import { createNewGame } from "./createGame";
import type {
  Achievement,
  Condition,
  EmployeeRole,
  Ending,
  Faction,
  GameEvent,
  Investor,
  PlayerAction,
  MetricEffect,
} from "../types";

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface ContentTables {
  achievements: Achievement[];
  actions: PlayerAction[];
  employeeRoles: EmployeeRole[];
  endings: Ending[];
  events: GameEvent[];
  factions: Faction[];
  investors: Investor[];
}

const REQUIRED_EVENT_IDS = [
  "investor-moat-question",
  "impossible-enterprise-contract",
  "deepduck-open-source-shock",
  "core-researcher-triple-offer",
  "board-suggests-professional-ceo",
  "green-furnace-waitlist",
  "byteplanet-traffic-trial",
  "cloudsoft-pluginization",
  "moralmachine-safety-review",
  "sales-promised-private-deployment",
  "cfo-finds-recognition-risk",
  "overseas-bd-asks-for-budget",
  "eu-customer-asks-data-lineage",
  "middle-east-poc-marathon",
  "us-investor-asks-global-story",
  "employee-options-underwater",
  "founder-health-warning",
  "demo-crashes-at-conference",
  "viral-pr-with-no-retention",
  "customer-prepayment-offer",
  "gpu-invoice-sticker-shock",
  "regulator-visits-office",
  "procurement-demands-local-deployment",
  "model-benchmark-leak",
  "openmind-price-cut",
  "campus-recruiting-backfires",
  "finance-flags-burn-multiple",
  "big-bank-security-review",
  "founder-podcast-goes-viral",
  "dataset-consent-complaint",
  "cloud-credit-expiration",
  "local-government-demo-day",
  "enterprise-churn-scare",
  "competitor-poaches-sales-lead",
  "pricing-page-ridiculed",
  "ai-agent-runs-amok",
  "board-demands-ai-native-margin",
  "sea-reseller-wants-exclusivity",
  "policy-team-wants-red-team",
  "customer-asks-source-code-escrow",
];

const REQUIRED_ACHIEVEMENT_IDS = [
  "hello-demo",
  "first-invoice",
  "angel-arrives",
  "seed-player",
  "million-mrr",
  "ten-million-arr",
  "series-a-graduate",
  "series-b-expansion",
  "unicorn-skin",
  "gpu-ticket",
  "first-overseas-order",
  "hundred-million-arr",
  "gross-margin-positive",
  "cfo-hired",
  "audit-ready",
  "bell-ringer",
  "ppt-before-product",
  "cloud-credit-rich",
  "employees-more-than-users",
  "open-source-backstab-survivor",
];

const REQUIRED_ENDING_IDS = [
  "cashflow-break",
  "regulatory-shutdown",
  "founder-health-collapse",
  "open-source-crushed",
  "giant-free-feature",
  "acquired-by-giant",
  "hk-ipo",
  "us-ipo",
  "cashflow-champion",
  "paper-billionaire",
  "professional-ceo-replaced-founder",
  "lifestyle-company",
];

const ALLOWED_CONDITION_OPERATORS = [">=", ">", "<=", "<", "==="];

function validateExactIds(label: string, ids: string[], requiredIds: readonly string[], errors: string[]) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) errors.push(`${label} has duplicate id: ${id}`);
    seen.add(id);
  }

  for (const requiredId of requiredIds) {
    if (!seen.has(requiredId)) errors.push(`${label} is missing required id: ${requiredId}`);
  }
  for (const id of seen) {
    if (!requiredIds.includes(id)) errors.push(`${label} has unknown id: ${id}`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validateCondition(owner: string, condition: unknown, errors: string[]) {
  if (!isRecord(condition)) {
    errors.push(`${owner} has malformed trigger condition`);
    return;
  }
  const metric = condition.metric;
  const op = condition.op;
  const value = condition.value;
  if (typeof metric !== "string" || !(METRIC_IDS as readonly string[]).includes(metric)) {
    errors.push(`${owner} references unknown metric: ${condition.metric}`);
  }
  if (typeof op !== "string" || !ALLOWED_CONDITION_OPERATORS.includes(op)) {
    errors.push(`${owner} uses invalid operator: ${condition.op}`);
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    errors.push(`${owner} has non-finite condition value`);
  }
}

function validateEffect(owner: string, effect: unknown, errors: string[]) {
  if (!isRecord(effect)) {
    errors.push(`${owner} has malformed effect`);
    return;
  }
  const metric = effect.metric;
  const delta = effect.delta;
  if (typeof metric !== "string" || !(METRIC_IDS as readonly string[]).includes(metric)) {
    errors.push(`${owner} mutates unknown metric: ${effect.metric}`);
  }
  if (typeof delta !== "number" || !Number.isFinite(delta)) {
    errors.push(`${owner} has non-finite effect delta`);
  }
}

function validateEffectList(owner: string, label: string, effects: unknown, errors: string[]) {
  if (!Array.isArray(effects)) {
    errors.push(`${owner} has missing or invalid ${label}`);
    return;
  }
  effects.forEach((effect) => validateEffect(owner, effect, errors));
}

function validateTriggeredContent(owner: string, items: Array<GameEvent | Achievement | Ending>, errors: string[]) {
  for (const item of items) {
    if (!Array.isArray(item.trigger)) {
      errors.push(`${owner}/${item.id} has missing or invalid trigger`);
      continue;
    }
    if (item.trigger.length === 0) errors.push(`${owner}/${item.id} has no trigger`);
    item.trigger.forEach((condition) => validateCondition(`${owner}/${item.id}`, condition, errors));
  }
}

function conditionMatches(condition: unknown, metrics: Record<string, number>): boolean {
  if (!isRecord(condition)) return false;
  const metric = condition.metric;
  const conditionValue = condition.value;
  if (typeof metric !== "string" || typeof conditionValue !== "number") return false;

  const value = metrics[metric];
  switch (condition.op) {
    case ">=":
      return value >= conditionValue;
    case ">":
      return value > conditionValue;
    case "<=":
      return value <= conditionValue;
    case "<":
      return value < conditionValue;
    case "===":
      return value === conditionValue;
    default:
      return false;
  }
}

function triggerMatches(trigger: unknown[], metrics: Record<string, number>): boolean {
  return trigger.length > 0 && trigger.every((condition) => conditionMatches(condition, metrics));
}

function validateNotInitiallyTriggered(owner: string, items: Array<GameEvent | Achievement | Ending>, errors: string[]) {
  const initialMetrics = createNewGame({
    seed: 1,
    founderName: "Validation Founder",
    backgroundId: "ex-bigtech-pm",
    trackId: "ai-agent",
    attributes: {
      tech: 5,
      sales: 5,
      fundraising: 5,
      management: 5,
      ethics: 5,
      stamina: 5,
      hype: 5,
      luck: 5,
    },
  }).metrics;

  for (const item of items) {
    if (!Array.isArray(item.trigger)) continue;
    if (triggerMatches(item.trigger, initialMetrics)) {
      errors.push(`${owner}/${item.id} trigger is true for a new game`);
    }
  }
}

export function validateContentTables(tables: ContentTables): ValidationResult {
  const errors: string[] = [];

  validateExactIds(
    "factions",
    tables.factions.map((item) => item.id),
    FACTION_IDS,
    errors,
  );
  validateExactIds(
    "investors",
    tables.investors.map((item) => item.id),
    INVESTOR_IDS,
    errors,
  );
  validateExactIds(
    "employeeRoles",
    tables.employeeRoles.map((item) => item.id),
    EMPLOYEE_ROLE_IDS,
    errors,
  );
  validateExactIds(
    "actions",
    tables.actions.map((item) => item.id),
    ACTION_IDS,
    errors,
  );
  validateExactIds(
    "events",
    tables.events.map((item) => item.id),
    REQUIRED_EVENT_IDS,
    errors,
  );
  validateExactIds(
    "achievements",
    tables.achievements.map((item) => item.id),
    REQUIRED_ACHIEVEMENT_IDS,
    errors,
  );
  validateExactIds(
    "endings",
    tables.endings.map((item) => item.id),
    REQUIRED_ENDING_IDS,
    errors,
  );

  for (const role of tables.employeeRoles) {
    validateEffectList(`employeeRoles/${role.id}`, "strengths", role.strengths, errors);
  }
  for (const action of tables.actions) {
    validateEffectList(`actions/${action.id}`, "effects", action.effects, errors);
  }

  validateTriggeredContent("events", tables.events, errors);
  validateTriggeredContent("achievements", tables.achievements, errors);
  validateTriggeredContent("endings", tables.endings, errors);
  validateNotInitiallyTriggered("events", tables.events, errors);
  validateNotInitiallyTriggered("achievements", tables.achievements, errors);
  validateNotInitiallyTriggered("endings", tables.endings, errors);

  for (const event of tables.events) {
    if (!Array.isArray(event.choices)) {
      errors.push(`events/${event.id} has missing or invalid choices`);
      continue;
    }
    if (event.choices.length < 2) errors.push(`events/${event.id} has fewer than two choices`);
    const choiceIds = new Set<string>();
    for (const choice of event.choices) {
      if (!isRecord(choice)) {
        errors.push(`events/${event.id} has malformed choice`);
        continue;
      }
      const choiceId = choice.id;
      const choiceOwner = typeof choiceId === "string" && choiceId.length > 0 ? choiceId : "choice";
      if (typeof choiceId !== "string" || choiceId.length === 0) {
        errors.push(`events/${event.id} has invalid choice id`);
      } else {
        if (choiceIds.has(choiceId)) errors.push(`events/${event.id} has duplicate choice id: ${choiceId}`);
        choiceIds.add(choiceId);
      }
      if (typeof choice.label !== "string" || choice.label.length === 0) {
        errors.push(`events/${event.id}/${choiceOwner} has invalid choice label`);
      }
      if (typeof choice.log !== "string" || choice.log.length === 0) {
        errors.push(`events/${event.id}/${choiceOwner} has invalid choice log`);
      }
      validateEffectList(`events/${event.id}/${choiceOwner}`, "effects", choice.effects, errors);
    }
  }

  for (let index = 0; index < tables.endings.length; index += 1) {
    const ending = tables.endings[index];
    if (!Number.isFinite(ending.priority)) errors.push(`endings/${ending.id} has non-finite priority`);
    if (index > 0 && ending.priority < tables.endings[index - 1].priority) {
      errors.push(`endings/${ending.id} priority is out of order`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateContent(): ValidationResult {
  return validateContentTables({
    achievements,
    actions,
    employeeRoles,
    endings,
    events,
    factions,
    investors,
  });
}
