import { BALANCE } from "../balance";
import { endings } from "../data/endings";
import type { Ending, GameState } from "../types";
import { matchesAll } from "./events";

export interface EndingResolution {
  milestoneEndings: Ending[];
  terminalEnding: Ending | null;
}

function orderedEndings(): Ending[] {
  return [...endings].sort((left, right) => left.priority - right.priority);
}

export function findEnding(id: string): Ending | undefined {
  return endings.find((ending) => ending.id === id);
}

export function isTerminalEndingId(id: string): boolean {
  return findEnding(id)?.terminal ?? false;
}

function hasCompletedEnding(game: GameState, ending: Ending): boolean {
  return game.completedEndings.includes(ending.id);
}

function matchesEnding(game: GameState, ending: Ending): boolean {
  if (ending.timeLimitYears !== undefined) {
    return game.year >= BALANCE.startYear + ending.timeLimitYears;
  }
  return matchesAll(game, ending.trigger);
}

export function evaluateEndingResolution(game: GameState): EndingResolution {
  const matching = orderedEndings().filter((ending) => matchesEnding(game, ending));
  const terminalEnding = matching.find((ending) => ending.terminal) ?? null;
  const milestoneEndings = matching.filter((ending) => !ending.terminal && !hasCompletedEnding(game, ending));

  return { milestoneEndings, terminalEnding };
}

function appendUnique<T>(values: T[], nextValues: T[]): T[] {
  const next = [...values];
  for (const value of nextValues) {
    if (!next.includes(value)) next.push(value);
  }
  return next;
}

export function applyEndingResolution(game: GameState): GameState {
  const resolution = evaluateEndingResolution(game);
  const newMilestoneIds = resolution.milestoneEndings.map((ending) => ending.id);
  const terminalId = resolution.terminalEnding?.id;
  const completedEndings = appendUnique(
    game.completedEndings,
    terminalId ? [...newMilestoneIds, terminalId] : newMilestoneIds,
  );
  const milestoneLog = resolution.milestoneEndings.map(
    (ending) => `阶段结局：${ending.name}。${ending.description}`,
  );

  if (!resolution.terminalEnding) {
    if (milestoneLog.length === 0) return game;
    return {
      ...game,
      completedEndings,
      log: [...game.log, ...milestoneLog],
    };
  }

  return {
    ...game,
    completedEndings,
    endingId: resolution.terminalEnding.id,
    log: [
      ...game.log,
      ...milestoneLog,
      `终止结局：${resolution.terminalEnding.name}。${resolution.terminalEnding.settlementTitle ?? resolution.terminalEnding.description}`,
    ],
  };
}

export function evaluateEnding(game: GameState): Ending | null {
  const resolution = evaluateEndingResolution(game);
  return resolution.terminalEnding ?? resolution.milestoneEndings[0] ?? null;
}
