import { describe, expect, it } from "vitest";
import { actions } from "../data/actions";
import { events } from "../data/events";
import { founderActions } from "../data/founderActions";
import type { MetricEffect, MetricId } from "../types";
import { calculateActionPreview } from "./actionEffects";
import { createNewGame } from "./createGame";
import { calculateEventChance } from "./events";
import { deriveRunway, estimateMonthlyBurn } from "./runway";

const BAD_WHEN_HIGH = new Set<MetricId>(["computeCost", "techDebt", "complianceRisk", "boardPressure"]);

function isBenefit(effect: MetricEffect): boolean {
  if (effect.delta === 0) return false;
  const higherIsGood = !BAD_WHEN_HIGH.has(effect.metric);
  return (effect.delta > 0) === higherIsGood;
}

function isCost(effect: MetricEffect): boolean {
  if (effect.delta === 0) return false;
  return !isBenefit(effect);
}

function baseGame() {
  return createNewGame({
    seed: 20260702,
    founderName: "nobody",
    companyName: "nobody",
    backgroundId: "ex-bigtech-pm",
    trackId: "ai-agent",
    attributes: { tech: 5, sales: 5, fundraising: 5, management: 5, ethics: 5, stamina: 5, hype: 5, luck: 5 },
  });
}

describe("simulation logic", () => {
  it("makes technical debt an operational drag instead of a cosmetic metric", () => {
    const healthy = baseGame();
    const indebted = {
      ...healthy,
      metrics: {
        ...healthy.metrics,
        techDebt: 85,
      },
    };

    const healthyPreview = calculateActionPreview(healthy, "build-product");
    const indebtedPreview = calculateActionPreview(indebted, "build-product");
    const healthyProductGain = healthyPreview.effects.find((effect) => effect.metric === "productQuality")?.delta ?? 0;
    const indebtedProductGain = indebtedPreview.effects.find((effect) => effect.metric === "productQuality")?.delta ?? 0;

    expect(indebtedProductGain).toBeLessThan(healthyProductGain);
    expect(calculateEventChance(indebted)).toBeGreaterThan(calculateEventChance(healthy));
    expect(estimateMonthlyBurn(indebted.metrics, indebted.employees)).toBeGreaterThan(
      estimateMonthlyBurn(healthy.metrics, healthy.employees),
    );
  });

  it("lets the player deliberately trade MRR down for healthier customers", () => {
    const action = actions.find((item) => item.id === "prune-bad-customers");

    expect(action).toBeDefined();
    expect(action?.effects.some((effect) => effect.metric === "mrr" && effect.delta < 0)).toBe(true);
    expect(action?.effects.some((effect) => effect.metric === "grossMargin" && effect.delta > 0)).toBe(true);
    expect(action?.effects.some((effect) => effect.metric === "pmf" && effect.delta > 0)).toBe(true);
  });

  it("scales beneficial reductions such as paying down technical debt", () => {
    const weakOperator = {
      ...baseGame(),
      founder: {
        ...baseGame().founder,
        attributes: { tech: 1, sales: 5, fundraising: 5, management: 1, ethics: 5, stamina: 5, hype: 5, luck: 5 },
      },
    };
    const strongOperator = {
      ...baseGame(),
      founder: {
        ...baseGame().founder,
        attributes: { tech: 10, sales: 5, fundraising: 5, management: 10, ethics: 5, stamina: 8, hype: 5, luck: 5 },
      },
    };

    const weakDebtReduction = calculateActionPreview(weakOperator, "pay-tech-debt").effects.find(
      (effect) => effect.metric === "techDebt",
    )?.delta;
    const strongDebtReduction = calculateActionPreview(strongOperator, "pay-tech-debt").effects.find(
      (effect) => effect.metric === "techDebt",
    )?.delta;

    expect(strongDebtReduction).toBeLessThan(weakDebtReduction ?? 0);
  });

  it("keeps every company action and event choice as an explicit tradeoff", () => {
    for (const action of actions) {
      const effects = [...action.effects, { metric: "founderHealth", delta: -action.healthCost } satisfies MetricEffect];
      expect(effects.some(isBenefit), `${action.id} should have at least one benefit`).toBe(true);
      expect(effects.some(isCost), `${action.id} should have at least one cost`).toBe(true);
    }

    for (const event of events) {
      for (const choice of event.choices) {
        expect(choice.effects.some(isBenefit), `${event.id}/${choice.id} should have at least one benefit`).toBe(true);
        expect(choice.effects.some(isCost), `${event.id}/${choice.id} should have at least one cost`).toBe(true);
      }
    }
  });

  it("keeps every mutable metric reachable from both directions", () => {
    const allEffects: MetricEffect[] = [];
    for (const action of actions) {
      allEffects.push(...action.effects, { metric: "founderHealth", delta: -action.healthCost });
    }
    for (const action of founderActions) {
      allEffects.push(...action.effects);
    }
    for (const event of events) {
      for (const choice of event.choices) {
        allEffects.push(...choice.effects);
      }
    }
    const mutableMetrics = [
      "cash",
      "arr",
      "mrr",
      "pmf",
      "modelPower",
      "productQuality",
      "computeSupply",
      "computeCost",
      "grossMargin",
      "techDebt",
      "reputation",
      "morale",
      "complianceRisk",
      "globalReadiness",
      "boardPressure",
      "founderHealth",
      "founderEquity",
      "valuation",
      "marketHeat",
    ] satisfies MetricId[];

    for (const metric of mutableMetrics) {
      expect(allEffects.some((effect) => effect.metric === metric && effect.delta > 0), `${metric} should be raisable`).toBe(
        true,
      );
      expect(allEffects.some((effect) => effect.metric === metric && effect.delta < 0), `${metric} should be lowerable`).toBe(
        true,
      );
    }
  });

  it("makes global readiness valuable but not free to carry", () => {
    const local = baseGame();
    const globalized = {
      ...local,
      metrics: {
        ...local.metrics,
        globalReadiness: 90,
      },
    };

    expect(estimateMonthlyBurn(globalized.metrics, globalized.employees)).toBeGreaterThan(
      estimateMonthlyBurn(local.metrics, local.employees),
    );
    expect(deriveRunway(globalized.metrics, globalized.employees)).toBeLessThan(deriveRunway(local.metrics, local.employees));
  });
});
