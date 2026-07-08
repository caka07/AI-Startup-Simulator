import { EMPLOYEE_ROLE_IDS, FACTION_IDS, INVESTOR_IDS, MARKET_IDS, METRIC_IDS } from "../constants";
import type { GameState } from "../types";
import { applyEndingResolution, evaluateEndingResolution } from "./endings";
import { syncRunway } from "./runway";

const SAVE_KEY = "ai-startup-simulator-save-v1";
const FOUNDER_ATTRIBUTE_IDS = ["tech", "sales", "fundraising", "management", "ethics", "stamina", "hype", "luck"];
const EMPLOYEE_LEVELS = ["junior", "mid", "senior", "lead", "cxo"];

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasFiniteNumberKeys(value: unknown, keys: readonly string[]): boolean {
  if (!isRecord(value)) return false;
  return keys.every((key) => Number.isFinite(value[key]));
}

function normalizeFactionRelations(value: unknown): GameState["factionRelations"] | null {
  if (!isRecord(value)) return null;
  const normalized = {} as GameState["factionRelations"];
  for (const id of FACTION_IDS) {
    const relation = value[id];
    if (relation === undefined) {
      normalized[id] = 0;
    } else if (typeof relation === "number" && Number.isFinite(relation)) {
      normalized[id] = relation;
    } else {
      return null;
    }
  }
  return normalized;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function hasValidEmployees(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  return value.every((employee) => {
    if (!isRecord(employee)) return false;
    return (
      typeof employee.id === "string" &&
      typeof employee.name === "string" &&
      typeof employee.role === "string" &&
      EMPLOYEE_ROLE_IDS.includes(employee.role as (typeof EMPLOYEE_ROLE_IDS)[number]) &&
      typeof employee.level === "string" &&
      EMPLOYEE_LEVELS.includes(employee.level) &&
      Number.isFinite(employee.ability) &&
      Number.isFinite(employee.salary) &&
      Number.isFinite(employee.options) &&
      Number.isFinite(employee.loyalty) &&
      Number.isFinite(employee.ambition) &&
      Number.isFinite(employee.fatigue) &&
      Number.isFinite(employee.scarcity) &&
      isStringArray(employee.tags)
    );
  });
}

function hasValidMarkets(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return MARKET_IDS.every((id) => {
    const market = value[id];
    return (
      isRecord(market) &&
      market.id === id &&
      typeof market.unlocked === "boolean" &&
      Number.isFinite(market.revenueShare) &&
      Number.isFinite(market.localization)
    );
  });
}

function parseSavedGame(value: unknown): GameState | null {
  if (!isRecord(value)) return null;
  const resolvedEventIds = value.resolvedEventIds;
  const normalizedResolvedEventIds =
    resolvedEventIds === undefined ? [] : isStringArray(resolvedEventIds) ? resolvedEventIds : null;
  if (!normalizedResolvedEventIds) return null;
  const completedEndings = value.completedEndings;
  const normalizedCompletedEndings =
    completedEndings === undefined ? [] : isStringArray(completedEndings) ? completedEndings : null;
  if (!normalizedCompletedEndings) return null;
  const normalizedFactionRelations = normalizeFactionRelations(value.factionRelations);
  if (!normalizedFactionRelations) return null;
  const normalizedCompanyName =
    typeof value.companyName === "string" && value.companyName.trim().length > 0
      ? value.companyName
      : isRecord(value.founder) && typeof value.founder.name === "string"
        ? `${value.founder.name} AI`
        : null;
  if (!normalizedCompanyName) return null;

  if (
    !Number.isFinite(value.seed) ||
    !Number.isFinite(value.year) ||
    ![1, 2, 3, 4].includes(value.quarter as number) ||
    !isRecord(value.founder) ||
    typeof value.founder.name !== "string" ||
    typeof value.founder.backgroundId !== "string" ||
    typeof value.founder.trackId !== "string" ||
    !hasFiniteNumberKeys(value.founder.attributes, FOUNDER_ATTRIBUTE_IDS) ||
    !hasFiniteNumberKeys(value.metrics, METRIC_IDS) ||
    !hasValidEmployees(value.employees) ||
    !hasValidMarkets(value.markets) ||
    !hasFiniteNumberKeys(value.investorRelations, INVESTOR_IDS) ||
    !isStringArray(value.completedAchievements) ||
    !isStringArray(value.log) ||
    (value.endingId !== null && typeof value.endingId !== "string")
  ) {
    return null;
  }

  return {
    ...(value as unknown as GameState),
    companyName: normalizedCompanyName,
    completedEndings: normalizedCompletedEndings,
    resolvedEventIds: normalizedResolvedEventIds,
    factionRelations: normalizedFactionRelations,
  };
}

function removeSavedGame(storage: Storage) {
  try {
    storage.removeItem(SAVE_KEY);
  } catch {
    // Ignore unavailable storage.
  }
}

export function saveGame(game: GameState) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(game));
  } catch {
    // Ignore unavailable storage.
  }
}

export function loadGame(): GameState | null {
  const storage = getStorage();
  if (!storage) return null;
  let raw: string | null;
  try {
    raw = storage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
  if (raw === null) return null;
  try {
    const game = parseSavedGame(JSON.parse(raw));
    if (!game) removeSavedGame(storage);
    if (!game) return null;
    const synced = syncRunway(game);
    return evaluateEndingResolution(synced).terminalEnding ? applyEndingResolution(synced) : synced;
  } catch {
    removeSavedGame(storage);
    return null;
  }
}

export function clearGame() {
  const storage = getStorage();
  if (!storage) return;
  removeSavedGame(storage);
}
