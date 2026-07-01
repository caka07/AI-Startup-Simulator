import { endings } from "../data/endings";
import type { Ending, GameState } from "../types";
import { matchesAll } from "./events";

function hasUsRevenue(game: GameState): boolean {
  return game.markets.us.unlocked && game.markets.us.revenueShare >= 40;
}

function qualifiesForUsIpo(game: GameState, ending: Ending): boolean {
  return hasUsRevenue(game) && game.metrics.complianceRisk <= 35 && matchesAll(game, ending.trigger);
}

export function evaluateEnding(game: GameState): Ending | null {
  const usIpo = endings.find((ending) => ending.id === "us-ipo");
  const usIpoMatches = usIpo ? qualifiesForUsIpo(game, usIpo) : false;

  for (const ending of endings) {
    if (ending.id === "us-ipo") continue;
    if (!matchesAll(game, ending.trigger)) continue;
    if (ending.id === "hk-ipo" && usIpo && usIpoMatches) return usIpo;
    return ending;
  }

  return usIpo && usIpoMatches ? usIpo : null;
}
