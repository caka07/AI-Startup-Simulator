import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { achievements } from "../../src/game/data/achievements";
import { unlockAchievements } from "../../src/game/engine/achievements";
import type { GameState, NewGameInput } from "../../src/game/types";

const input: NewGameInput = {
  seed: 2,
  founderName: "Morgan",
  backgroundId: "serial-founder",
  trackId: "enterprise-knowledge",
  attributes: { tech: 4, sales: 7, fundraising: 7, management: 4, ethics: 3, stamina: 4, hype: 5, luck: 2 },
};

function gameWithMetrics(metrics: Partial<GameState["metrics"]> = {}): GameState {
  const game = createNewGame(input);
  return {
    ...game,
    metrics: {
      ...game.metrics,
      ...metrics,
    },
  };
}

describe("achievements", () => {
  it("unlocks ten-million-arr when ARR reaches the threshold", () => {
    const game = gameWithMetrics({ arr: 10_000_000 });

    const next = unlockAchievements(game);

    expect(next.completedAchievements).toContain("ten-million-arr");
    expect(next.log.some((entry) => entry.includes("千万 ARR"))).toBe(true);
    expect(game.completedAchievements).toEqual([]);
  });

  it("does not duplicate achievement ids or logs when run twice", () => {
    const game = gameWithMetrics({ arr: 10_000_000 });

    const first = unlockAchievements(game);
    const second = unlockAchievements(first);

    expect(second.completedAchievements.filter((id) => id === "ten-million-arr")).toHaveLength(1);
    expect(second.log.filter((entry) => entry.includes("千万 ARR"))).toHaveLength(1);
  });

  it("exposes visible condition text while keeping hidden achievement conditions secret", () => {
    const visible = achievements.find((achievement) => achievement.id === "first-invoice");
    const hidden = achievements.find(
      (achievement) => "hiddenCondition" in achievement && achievement.hiddenCondition === true,
    );

    expect(visible && "conditionText" in visible ? visible.conditionText : undefined).toEqual(
      expect.stringContaining("MRR"),
    );
    expect(hidden).toBeDefined();
    expect(hidden && "conditionText" in hidden ? hidden.conditionText : undefined).toBe("???");
  });

  it("ships a large achievement set with many hidden goals", () => {
    const hidden = achievements.filter((achievement) => achievement.hiddenCondition);

    expect(achievements.length).toBeGreaterThanOrEqual(45);
    expect(hidden.length).toBeGreaterThanOrEqual(15);
    expect(new Set(achievements.map((achievement) => achievement.id)).size).toBe(achievements.length);
  });

  it("keeps hidden achievement names visible but conditions secret", () => {
    const hidden = achievements.find((achievement) => achievement.id === "ipo-quiet-period-cultist");

    expect(hidden?.name).toBe("静默期邪教徒");
    expect(hidden?.conditionText).toBe("???");
  });
});
