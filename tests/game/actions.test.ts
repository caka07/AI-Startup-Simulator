import { describe, expect, it } from "vitest";
import { actions } from "../../src/game/data/actions";
import { createNewGame } from "../../src/game/engine/createGame";
import { applyAction } from "../../src/game/engine/actions";
import { calculateActionPreview } from "../../src/game/engine/actionEffects";

function gameWith(attrs = {}) {
  const game = createNewGame({
    seed: 77,
    founderName: "动作测试",
    backgroundId: "former-llm-researcher",
    trackId: "foundation-model",
    presetId: "researcher",
  });
  return {
    ...game,
    founder: { ...game.founder, attributes: { ...game.founder.attributes, ...attrs } },
  };
}

describe("actionEffects", () => {
  it("makes research actions scale with tech and model context", () => {
    const weak = calculateActionPreview(gameWith({ tech: 2 }), "train-model");
    const strong = calculateActionPreview(gameWith({ tech: 9 }), "train-model");

    expect(strong.effects.find((effect) => effect.metric === "modelPower")?.delta).toBeGreaterThan(
      weak.effects.find((effect) => effect.metric === "modelPower")?.delta ?? 0,
    );
    expect(strong.summary.join(" ")).toContain("模型能力");
  });

  it("keeps cash costs from being amplified as positive efficiency", () => {
    const preview = calculateActionPreview(gameWith({ tech: 9 }), "train-model");

    expect(preview.effects.find((effect) => effect.metric === "cash")?.delta).toBe(-500_000);
  });

  it("applies risky shortcuts with upside and compliance risk", () => {
    const next = applyAction(gameWith({ hype: 8, ethics: 2 }), "academic-fraud");

    expect(next.metrics.reputation).toBeGreaterThan(gameWith().metrics.reputation);
    expect(next.metrics.complianceRisk).toBeGreaterThan(gameWith().metrics.complianceRisk);
  });

  it("returns preview effects and summary without sharing action data references", () => {
    const action = actions.find((item) => item.id === "train-model");
    if (!action) throw new Error("Missing train-model action");
    const originalCashDelta = action.effects.find((effect) => effect.metric === "cash")?.delta;
    const originalSummary = [...action.visibleSummary];

    try {
      const preview = calculateActionPreview(gameWith({ tech: 9 }), "train-model");
      const cashEffect = preview.effects.find((effect) => effect.metric === "cash");
      if (!cashEffect) throw new Error("Missing cash preview effect");

      cashEffect.delta = -1;
      preview.summary[0] = "mutated summary";

      expect(action.effects.find((effect) => effect.metric === "cash")?.delta).toBe(originalCashDelta);
      expect(action.visibleSummary).toEqual(originalSummary);
    } finally {
      const cashEffect = action.effects.find((effect) => effect.metric === "cash");
      if (cashEffect && originalCashDelta !== undefined) cashEffect.delta = originalCashDelta;
      action.visibleSummary.splice(0, action.visibleSummary.length, ...originalSummary);
    }
  });
});
