import { describe, expect, it } from "vitest";
import { founderActions } from "../../src/game/data/founderActions";
import { createNewGame } from "../../src/game/engine/createGame";
import { applyFounderAction } from "../../src/game/engine/founderActions";

function game() {
  return createNewGame({
    seed: 20260703,
    founderName: "创始人动作测试",
    backgroundId: "former-llm-researcher",
    trackId: "ai-coding",
    attributes: {
      tech: 9.95,
      sales: 5,
      fundraising: 5,
      management: 5,
      ethics: 5,
      stamina: 1.05,
      hype: 5,
      luck: 5,
    },
  });
}

describe("founder actions", () => {
  it("defines all founder action choices", () => {
    expect(founderActions.map((action) => action.id)).toEqual([
      "deep-work",
      "investor-dinner",
      "customer-roadtrip",
      "take-vacation",
      "public-thread",
      "therapy",
    ]);
  });

  it("applies metrics, attribute deltas, clamping, and log output", () => {
    const original = game();

    const next = applyFounderAction(original, "deep-work");

    expect(next.metrics.productQuality).toBe(original.metrics.productQuality + 2);
    expect(next.metrics.techDebt).toBe(original.metrics.techDebt - 2);
    expect(next.metrics.founderHealth).toBe(original.metrics.founderHealth - 5);
    expect(next.founder.attributes.tech).toBe(10);
    expect(next.founder.attributes.stamina).toBe(1);
    expect(next.log.at(-1)).toBe("创始人动作：闭关深度工作");
  });
});
