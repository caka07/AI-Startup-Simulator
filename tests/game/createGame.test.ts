import { describe, expect, it } from "vitest";
import { FACTION_IDS, INVESTOR_IDS, MARKET_IDS } from "../../src/game/constants";
import { createNewGame } from "../../src/game/engine/createGame";

describe("createNewGame", () => {
  it("creates a 2026 Q1 company with the full initial state contract", () => {
    const game = createNewGame({
      seed: 42,
      founderName: "沈一",
      backgroundId: "ex-bigtech-pm",
      trackId: "ai-agent",
      attributes: {
        tech: 4,
        sales: 7,
        fundraising: 6,
        management: 4,
        ethics: 4,
        stamina: 5,
        hype: 7,
        luck: 3,
      },
    });

    expect(game.seed).toBe(42);
    expect(game.year).toBe(2026);
    expect(game.quarter).toBe(1);
    expect(game.founder).toEqual({
      name: "沈一",
      backgroundId: "ex-bigtech-pm",
      trackId: "ai-agent",
      attributes: {
        tech: 4,
        sales: 7,
        fundraising: 6,
        management: 4,
        ethics: 4,
        stamina: 5,
        hype: 7,
        luck: 3,
      },
    });
    expect(game.metrics).toEqual({
      cash: 3_000_000,
      runway: 12,
      arr: 0,
      mrr: 0,
      pmf: 33,
      modelPower: 25,
      productQuality: 32,
      computeSupply: 35,
      computeCost: 20,
      grossMargin: 35,
      techDebt: 19,
      reputation: 30,
      morale: 63,
      complianceRisk: 20,
      globalReadiness: 10,
      boardPressure: 0,
      founderHealth: 85,
      founderEquity: 100,
      valuation: 10_000_000,
      marketHeat: 55,
    });
    expect(game.employees).toEqual([]);
    expect(Object.keys(game.markets)).toEqual(MARKET_IDS);
    expect(game.markets.china).toEqual({
      id: "china",
      unlocked: true,
      revenueShare: 100,
      localization: 100,
    });
    expect(game.markets.sea).toEqual({
      id: "sea",
      unlocked: false,
      revenueShare: 0,
      localization: 0,
    });
    expect(game.markets["middle-east"]).toEqual({
      id: "middle-east",
      unlocked: false,
      revenueShare: 0,
      localization: 0,
    });
    expect(game.markets.europe).toEqual({
      id: "europe",
      unlocked: false,
      revenueShare: 0,
      localization: 0,
    });
    expect(game.markets.us).toEqual({
      id: "us",
      unlocked: false,
      revenueShare: 0,
      localization: 0,
    });
    expect(Object.keys(game.investorRelations)).toEqual(INVESTOR_IDS);
    expect(game.investorRelations).toEqual(Object.fromEntries(INVESTOR_IDS.map((id) => [id, 0])));
    expect(Object.keys(game.factionRelations)).toEqual(FACTION_IDS);
    expect(game.factionRelations).toEqual(Object.fromEntries(FACTION_IDS.map((id) => [id, 0])));
    expect(game.completedAchievements).toEqual([]);
    expect(game.resolvedEventIds).toEqual([]);
    expect(game.endingId).toBeNull();
    expect(game.log[0]).toContain("沈一创办了公司");
  });

  it("applies background and track effects to initial metrics", () => {
    const researcher = createNewGame({
      seed: 42,
      founderName: "沈一",
      backgroundId: "former-llm-researcher",
      trackId: "foundation-model",
      attributes: {
        tech: 5,
        sales: 2,
        fundraising: 2,
        management: 2,
        ethics: 4,
        stamina: 3,
        hype: 2,
        luck: 4,
      },
    });
    const pm = createNewGame({
      seed: 42,
      founderName: "沈一",
      backgroundId: "ex-bigtech-pm",
      trackId: "enterprise-knowledge",
      attributes: {
        tech: 3,
        sales: 3,
        fundraising: 4,
        management: 3,
        ethics: 3,
        stamina: 3,
        hype: 3,
        luck: 2,
      },
    });

    expect(researcher.metrics.modelPower).toBeGreaterThan(pm.metrics.modelPower);
    expect(pm.metrics.productQuality).toBeGreaterThan(researcher.metrics.productQuality);
    expect(pm.metrics.arr).toBeGreaterThan(researcher.metrics.arr);
  });

  it("combines background, track, and preset into final founder attributes", () => {
    const researcherModel = createNewGame({
      seed: 42,
      founderName: "沈一",
      backgroundId: "former-llm-researcher",
      trackId: "foundation-model",
      presetId: "researcher",
    });
    const salesAgent = createNewGame({
      seed: 42,
      founderName: "沈一",
      backgroundId: "ex-bigtech-pm",
      trackId: "local-life-agent",
      presetId: "rainmaker",
    });

    expect(researcherModel.founder.attributes.tech).toBeGreaterThan(salesAgent.founder.attributes.tech);
    expect(salesAgent.founder.attributes.sales).toBeGreaterThan(researcherModel.founder.attributes.sales);
    expect(researcherModel.metrics.modelPower).toBeGreaterThan(salesAgent.metrics.modelPower);
    expect(salesAgent.metrics.mrr).toBeGreaterThan(researcherModel.metrics.mrr);
  });

  it("allows strong starts above the old 24 point total", () => {
    const game = createNewGame({
      seed: 42,
      founderName: "超配创始人",
      backgroundId: "serial-founder",
      trackId: "finance-ai",
      presetId: "rainmaker",
    });
    const total = Object.values(game.founder.attributes).reduce((sum, value) => sum + value, 0);

    expect(total).toBeGreaterThan(24);
    expect(game.metrics.arr).toBeGreaterThan(0);
  });
});
