import type { ActionId, GameState } from "../types";
import { applyActionEffects } from "./actionEffects";

export function applyAction(game: GameState, action: ActionId): GameState {
  return applyActionEffects(game, action);
}
