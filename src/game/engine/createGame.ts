import { BALANCE } from "../balance";
import { FACTION_IDS, INVESTOR_IDS, MARKET_IDS } from "../constants";
import type { CompanyMetrics, GameState, MarketState, MetricEffect, NewGameInput } from "../types";
import { applyMetricDelta } from "./clamp";
import { createInitialEmployees } from "./employees";
import { deriveFounderAttributes, deriveFounderMetricEffects } from "./founderStart";
import { syncRunway } from "./runway";

function createInitialMetrics(): CompanyMetrics {
  return {
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
  };
}

function createMarkets(): Record<string, MarketState> {
  return Object.fromEntries(
    MARKET_IDS.map((id) => [
      id,
      {
        id,
        unlocked: id === "china",
        revenueShare: id === "china" ? 100 : 0,
        localization: id === "china" ? 100 : 0,
      },
    ]),
  );
}

function applyEffects(metrics: CompanyMetrics, effects: MetricEffect[]): CompanyMetrics {
  return effects.reduce((nextMetrics, effect) => applyMetricDelta(nextMetrics, effect.metric, effect.delta), metrics);
}

function createProfiledMetrics(input: NewGameInput): CompanyMetrics {
  return applyEffects(createInitialMetrics(), deriveFounderMetricEffects(input));
}

export function createNewGame(input: NewGameInput): GameState {
  const attributes = deriveFounderAttributes(input);
  const companyName = input.companyName?.trim() || `${input.founderName} AI`;

  const game: GameState = {
    seed: input.seed,
    companyName,
    year: BALANCE.startYear,
    quarter: 1,
    founder: {
      name: input.founderName,
      backgroundId: input.backgroundId,
      trackId: input.trackId,
      attributes,
    },
    metrics: createProfiledMetrics(input),
    employees: [],
    markets: createMarkets() as GameState["markets"],
    investorRelations: Object.fromEntries(INVESTOR_IDS.map((id) => [id, 0])) as GameState["investorRelations"],
    factionRelations: Object.fromEntries(FACTION_IDS.map((id) => [id, 0])) as GameState["factionRelations"],
    completedAchievements: [],
    completedEndings: [],
    resolvedEventIds: [],
    endingId: null,
    log: [`${input.founderName}创办了${companyName}，投资人说这个方向“空间很大”。`],
  };

  return syncRunway({
    ...game,
    employees: createInitialEmployees(game),
    log: [...game.log, "两名早期员工加入创始团队：一个负责把模型变强，一个负责把服务跑稳。"],
  });
}
