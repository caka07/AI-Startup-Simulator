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
import type { Achievement, Condition, Ending, GameEvent, MetricEffect } from "../types";

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateUniqueIds(label: string, ids: string[], errors: string[]) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) errors.push(`${label} has duplicate id: ${id}`);
    seen.add(id);
  }
}

function validateCondition(owner: string, condition: Condition, errors: string[]) {
  if (!METRIC_IDS.includes(condition.metric)) {
    errors.push(`${owner} references unknown metric: ${condition.metric}`);
  }
}

function validateEffect(owner: string, effect: MetricEffect, errors: string[]) {
  if (!METRIC_IDS.includes(effect.metric)) {
    errors.push(`${owner} mutates unknown metric: ${effect.metric}`);
  }
}

function validateTriggeredContent(owner: string, items: Array<GameEvent | Achievement | Ending>, errors: string[]) {
  for (const item of items) {
    if (item.trigger.length === 0) errors.push(`${owner}/${item.id} has no trigger`);
    item.trigger.forEach((condition) => validateCondition(`${owner}/${item.id}`, condition, errors));
  }
}

export function validateContent(): ValidationResult {
  const errors: string[] = [];

  validateUniqueIds(
    "factions",
    factions.map((item) => item.id),
    errors,
  );
  validateUniqueIds(
    "investors",
    investors.map((item) => item.id),
    errors,
  );
  validateUniqueIds(
    "employeeRoles",
    employeeRoles.map((item) => item.id),
    errors,
  );
  validateUniqueIds(
    "actions",
    actions.map((item) => item.id),
    errors,
  );
  validateUniqueIds(
    "events",
    events.map((item) => item.id),
    errors,
  );
  validateUniqueIds(
    "achievements",
    achievements.map((item) => item.id),
    errors,
  );
  validateUniqueIds(
    "endings",
    endings.map((item) => item.id),
    errors,
  );

  for (const faction of factions) {
    if (!FACTION_IDS.includes(faction.id)) errors.push(`unknown faction id: ${faction.id}`);
  }
  for (const investor of investors) {
    if (!INVESTOR_IDS.includes(investor.id)) errors.push(`unknown investor id: ${investor.id}`);
  }
  for (const role of employeeRoles) {
    if (!EMPLOYEE_ROLE_IDS.includes(role.id)) errors.push(`unknown employee role id: ${role.id}`);
    role.strengths.forEach((effect) => validateEffect(`employeeRoles/${role.id}`, effect, errors));
  }
  for (const action of actions) {
    if (!ACTION_IDS.includes(action.id)) errors.push(`unknown action id: ${action.id}`);
    action.effects.forEach((effect) => validateEffect(`actions/${action.id}`, effect, errors));
  }
  for (const action of ACTION_IDS) {
    if (!action) errors.push("empty action id");
  }

  validateTriggeredContent("events", events, errors);
  validateTriggeredContent("achievements", achievements, errors);
  validateTriggeredContent("endings", endings, errors);

  for (const event of events) {
    if (event.choices.length < 2) errors.push(`events/${event.id} has fewer than two choices`);
    for (const choice of event.choices) {
      choice.effects.forEach((effect) => validateEffect(`events/${event.id}/${choice.id}`, effect, errors));
    }
  }

  return { valid: errors.length === 0, errors };
}
