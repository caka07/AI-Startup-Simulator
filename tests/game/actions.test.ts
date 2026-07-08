import { describe, expect, it } from "vitest";
import { actions } from "../../src/game/data/actions";
import { employeeRoles } from "../../src/game/data/employeeRoles";
import { events } from "../../src/game/data/events";
import { attributePresets, backgroundProfiles, trackProfiles } from "../../src/game/data/founderProfiles";
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

  it("normalizes cash when calculating compute-purchase efficiency", () => {
    const lowCash = { ...gameWith(), metrics: { ...gameWith().metrics, cash: 200_000 } };
    const highCash = { ...gameWith(), metrics: { ...gameWith().metrics, cash: 20_000_000 } };

    const lowPreview = calculateActionPreview(lowCash, "buy-compute");
    const highPreview = calculateActionPreview(highCash, "buy-compute");

    expect(highPreview.efficiencyMultiplier).toBeGreaterThan(lowPreview.efficiencyMultiplier);
    expect(highPreview.efficiencyMultiplier - lowPreview.efficiencyMultiplier).toBeLessThan(0.2);
  });

  it("makes team health and loyalty affect company action efficiency", () => {
    const healthyTeam = gameWith({
      tech: 5,
    });
    const exhaustedTeam = {
      ...healthyTeam,
      employees: healthyTeam.employees.map((employee) => ({
        ...employee,
        ability: 35,
        loyalty: 20,
        fatigue: 95,
      })),
    };

    const healthyPreview = calculateActionPreview(healthyTeam, "build-product");
    const exhaustedPreview = calculateActionPreview(exhaustedTeam, "build-product");

    expect(healthyPreview.efficiencyMultiplier).toBeGreaterThan(exhaustedPreview.efficiencyMultiplier);
    expect(healthyPreview.effects.find((effect) => effect.metric === "productQuality")?.delta).toBeGreaterThan(
      exhaustedPreview.effects.find((effect) => effect.metric === "productQuality")?.delta ?? 0,
    );
  });

  it("previews fundraise and hire from their actual execution effects", () => {
    const game = gameWith();
    const fundraise = calculateActionPreview(game, "fundraise");
    const hire = calculateActionPreview(game, "hire");

    expect(fundraise.effects.find((effect) => effect.metric === "cash")?.delta).toBe(1_500_000);
    expect(fundraise.summary.join(" ")).toContain("现金 +150万");
    expect(hire.effects.find((effect) => effect.metric === "cash")?.delta).toBeLessThan(0);
    expect(hire.summary.join(" ")).toContain("现金");
  });

  it("previews selected investor terms for fundraise", () => {
    const game = gameWith();
    const defaultPreview = calculateActionPreview(game, "fundraise");
    const friendlyPreview = calculateActionPreview(game, "fundraise", { investorId: "kevin-founder" });

    const defaultEquity = defaultPreview.effects.find((effect) => effect.metric === "founderEquity")?.delta ?? 0;
    const friendlyEquity = friendlyPreview.effects.find((effect) => effect.metric === "founderEquity")?.delta ?? 0;
    const defaultCash = defaultPreview.effects.find((effect) => effect.metric === "cash")?.delta ?? 0;
    const friendlyCash = friendlyPreview.effects.find((effect) => effect.metric === "cash")?.delta ?? 0;

    expect(friendlyEquity).toBeGreaterThan(defaultEquity);
    expect(friendlyCash).toBeLessThan(defaultCash);
  });

  it("keeps runway as a derived metric without direct content deltas", () => {
    const directRunwaySources = [
      ...actions.flatMap((action) => action.effects.map((effect) => `actions/${action.id}/${effect.metric}`)),
      ...events.flatMap((event) =>
        event.choices.flatMap((choice) => choice.effects.map((effect) => `events/${event.id}/${choice.id}/${effect.metric}`)),
      ),
      ...employeeRoles.flatMap((role) => role.strengths.map((effect) => `employeeRoles/${role.id}/${effect.metric}`)),
      ...backgroundProfiles.flatMap((profile) =>
        profile.metricEffects.map((effect) => `backgroundProfiles/${profile.id}/${effect.metric}`),
      ),
      ...trackProfiles.flatMap((profile) => profile.metricEffects.map((effect) => `trackProfiles/${profile.id}/${effect.metric}`)),
      ...attributePresets.flatMap((profile) => profile.metricEffects.map((effect) => `attributePresets/${profile.id}/${effect.metric}`)),
    ].filter((source) => source.endsWith("/runway"));

    expect(directRunwaySources).toEqual([]);
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
