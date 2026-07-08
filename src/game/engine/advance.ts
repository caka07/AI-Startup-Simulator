import type { ActionId, GameState, Quarter } from "../types";
import { applyAction } from "./actions";
import { syncRunway } from "./runway";

function nextQuarter(year: number, quarter: Quarter): { year: number; quarter: Quarter } {
  if (quarter === 4) return { year: year + 1, quarter: 1 };
  return { year, quarter: (quarter + 1) as Quarter };
}

export function advanceQuarterClock(game: GameState): GameState {
  const period = nextQuarter(game.year, game.quarter);
  return {
    ...game,
    year: period.year,
    quarter: period.quarter,
  };
}

export function advanceQuarter(game: GameState, actions: ActionId[]): GameState {
  const selected = actions.slice(0, 2);
  let next: GameState = {
    ...game,
    metrics: { ...game.metrics },
    log: [...game.log],
  };

  for (const action of selected) {
    next = applyAction(next, action);
  }

  return advanceQuarterClock(syncRunway(next));
}
