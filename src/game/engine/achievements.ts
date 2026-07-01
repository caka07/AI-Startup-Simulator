import { achievements } from "../data/achievements";
import type { GameState } from "../types";
import { matchesAll } from "./events";

export function unlockAchievements(game: GameState): GameState {
  const unlocked = new Set(game.completedAchievements);
  const log = [...game.log];

  for (const achievement of achievements) {
    if (!unlocked.has(achievement.id) && matchesAll(game, achievement.trigger)) {
      unlocked.add(achievement.id);
      log.push(`解锁成就：${achievement.name}`);
    }
  }

  return {
    ...game,
    completedAchievements: [...unlocked],
    log,
  };
}
