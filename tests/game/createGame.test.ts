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

    expect(game.year).toBe(2026);
    expect(game.quarter).toBe(1);
    expect(game.metrics).toEqual({
      cash: 3_000_000,
      runway: 12,
      arr: 0,
      mrr: 0,
      pmf: 25,
      modelPower: 25,
      productQuality: 25,
      computeSupply: 35,
      computeCost: 20,
      grossMargin: 35,
      techDebt: 15,
      reputation: 30,
      morale: 60,
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
    expect(game.endingId).toBeNull();
    expect(game.log[0]).toContain("沈一创办了公司");
  });
});
