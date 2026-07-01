import type { ActionId, GameState, Quarter } from "../types";
import { applyAction } from "./actions";

function nextQuarter(year: number, quarter: Quarter): { year: number; quarter: Quarter } {
  if (quarter === 4) return { year: year + 1, quarter: 1 };
  return { year, quarter: (quarter + 1) as Quarter };
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

  const period = nextQuarter(next.year, next.quarter);
  return {
    ...next,
    year: period.year,
    quarter: period.quarter,
  };
}
