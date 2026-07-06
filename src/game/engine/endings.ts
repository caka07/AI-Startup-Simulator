import { endings } from "../data/endings";
import type { Ending, GameState } from "../types";
import { matchesAll } from "./events";

export function evaluateEnding(game: GameState): Ending | null {
  const usIpo = endings.find((ending) => ending.id === "us-ipo");
  const usIpoMatches = usIpo ? matchesAll(game, usIpo.trigger) : false;
  const orderedEndings = [...endings].sort((left, right) => left.priority - right.priority);

  for (const ending of orderedEndings) {
    if (ending.id === "us-ipo") continue;
    if (!matchesAll(game, ending.trigger)) continue;
    if (ending.id === "hk-ipo" && usIpo && usIpoMatches) return usIpo;
    return ending;
  }

  return usIpo && usIpoMatches ? usIpo : null;
}
