import { BALANCE } from "../balance";
import { investors } from "../data/investors";
import type { GameState, InvestorId } from "../types";
import { applyMetricDelta } from "./clamp";
import { deriveRunway, syncRunway } from "./runway";

export type FundingRound =
  | "angel"
  | "seed"
  | "pre-a"
  | "series-a"
  | "series-b"
  | "series-c"
  | "strategic"
  | "venture-debt"
  | "pre-ipo";

export interface FundraisingEvaluation {
  score: number;
  availableRounds: FundingRound[];
  valuation: number;
  termStyle: "friendly" | "normal" | "pressure" | "predatory";
  suggestedAmount: number;
  dilution: number;
  investorId: InvestorId | null;
  investorName: string | null;
}

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function availableRounds(game: GameState): FundingRound[] {
  const { arr, pmf, grossMargin } = game.metrics;
  const rounds: FundingRound[] = ["angel"];
  if (pmf >= 35) rounds.push("seed");
  if (arr >= 5_000_000 && pmf >= 50) rounds.push("pre-a");
  if (arr >= BALANCE.arr.seriesA && pmf >= BALANCE.pmf.real) rounds.push("series-a");
  if (arr >= BALANCE.arr.seriesB && pmf >= BALANCE.pmf.strong) rounds.push("series-b");
  if (arr >= BALANCE.arr.seriesC && grossMargin >= 40) rounds.push("series-c");
  if (arr >= 30_000_000 || game.metrics.modelPower >= 70) rounds.push("strategic");
  if (arr >= 50_000_000 && grossMargin >= 45) rounds.push("venture-debt");
  if (arr >= BALANCE.arr.hkIpo && grossMargin >= 45) rounds.push("pre-ipo");
  return rounds;
}

function effectiveRunway(game: GameState): number {
  return deriveRunway(game.metrics, game.employees);
}

function baseTermStyle(game: GameState, runway: number): FundraisingEvaluation["termStyle"] {
  if (runway < BALANCE.runway.deathSpiral) return "predatory";
  if (runway < BALANCE.runway.pressured || game.metrics.complianceRisk > 60) return "pressure";
  if (game.metrics.marketHeat > 75 && runway >= 12) return "friendly";
  return "normal";
}

function selectedInvestor(investorId?: InvestorId | null) {
  if (!investorId) return null;
  return investors.find((investor) => investor.id === investorId) ?? null;
}

export function evaluateFundraising(game: GameState, investorId?: InvestorId | null): FundraisingEvaluation {
  const investor = selectedInvestor(investorId);
  const rounds = availableRounds(game);
  const runway = effectiveRunway(game);
  const growthStory = game.metrics.pmf + game.metrics.reputation + game.metrics.marketHeat;
  const riskPenalty = game.metrics.complianceRisk + Math.max(0, 6 - runway) * 8;
  const investorRelationship = investor ? game.investorRelations[investor.id] ?? 0 : 0;
  const score = clampScore(
    game.founder.attributes.fundraising * 6 + growthStory / 2 + investorRelationship * 0.6 - riskPenalty / 2,
  );
  const revenueMultiple = game.metrics.grossMargin >= 55 ? 12 : game.metrics.grossMargin >= 35 ? 8 : 4;
  const technologyPremium = game.metrics.modelPower >= 75 ? 80_000_000 : game.metrics.modelPower >= 55 ? 30_000_000 : 0;
  const runwayDiscount = runway < 6 ? 0.75 : 1;
  const complianceDiscount = game.metrics.complianceRisk > 60 ? 0.8 : 1;
  const discountedValuation = Math.round((game.metrics.arr * revenueMultiple + technologyPremium) * runwayDiscount * complianceDiscount);
  const valuation = Math.max(10_000_000, discountedValuation);
  const style = investor?.termStyle ?? baseTermStyle(game, runway);
  const termDilution = style === "friendly" ? 10 : style === "normal" ? 15 : style === "pressure" ? 22 : 35;
  const dilution = Math.min(termDilution, game.metrics.founderEquity);
  const suggestedAmount = Math.round(valuation * (dilution / 100));

  return {
    score,
    availableRounds: rounds,
    valuation,
    termStyle: style,
    suggestedAmount,
    dilution,
    investorId: investor?.id ?? null,
    investorName: investor?.name ?? null,
  };
}

export function executeFundraise(game: GameState, investorId?: InvestorId | null): GameState {
  const evaluation = evaluateFundraising(game, investorId);
  const actualDilution = evaluation.dilution;
  if (actualDilution <= 0) {
    return syncRunway({
      ...game,
      log: [...game.log, "融资失败：创始人股权已经见底，投资人只愿意发朋友圈表示支持。"],
    });
  }
  const cashRaised = Math.round(evaluation.valuation * (actualDilution / 100));
  const metrics = applyMetricDelta(
    applyMetricDelta(
      applyMetricDelta(game.metrics, "cash", cashRaised),
      "founderEquity",
      -actualDilution,
    ),
    "boardPressure",
    evaluation.termStyle === "friendly" ? 5 : evaluation.termStyle === "normal" ? 10 : 18,
  );

  return syncRunway({
    ...game,
    metrics: {
      ...metrics,
      valuation: evaluation.valuation,
    },
    log: [
      ...game.log,
      `完成融资${evaluation.investorName ? `（${evaluation.investorName} 领投）` : ""}：估值 ${Math.round(evaluation.valuation / 10_000)} 万，稀释 ${actualDilution}%。`,
    ],
  });
}
