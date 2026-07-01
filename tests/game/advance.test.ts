import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { advanceQuarter } from "../../src/game/engine/advance";

const input = {
  seed: 99,
  founderName: "林舟",
  backgroundId: "former-llm-researcher" as const,
  trackId: "foundation-model" as const,
  attributes: {
    tech: 8,
    sales: 3,
    fundraising: 4,
    management: 3,
    ethics: 5,
    stamina: 5,
    hype: 3,
    luck: 2,
  },
};

describe("advanceQuarter", () => {
  it("advances quarter and year correctly", () => {
    let game = createNewGame(input);
    game = advanceQuarter(game, ["build-product", "train-model"]);
    expect(game.year).toBe(2026);
    expect(game.quarter).toBe(2);

    game = advanceQuarter(game, ["build-product", "sell"]);
    game = advanceQuarter(game, ["build-product", "sell"]);
    game = advanceQuarter(game, ["build-product", "sell"]);
    expect(game.year).toBe(2027);
    expect(game.quarter).toBe(1);
  });

  it("keeps percent metrics clamped after actions", () => {
    let game = createNewGame(input);
    for (let i = 0; i < 20; i += 1) {
      game = advanceQuarter(game, ["train-model", "pr-launch"]);
    }
    expect(game.metrics.modelPower).toBeLessThanOrEqual(100);
    expect(game.metrics.reputation).toBeLessThanOrEqual(100);
    expect(game.metrics.founderHealth).toBeGreaterThanOrEqual(0);
  });
});
