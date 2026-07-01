import { BALANCE } from "../balance";
import type { GameState } from "../types";
import { applyMetricDelta, clampMetric } from "./clamp";

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

function termStyle(game: GameState): FundraisingEvaluation["termStyle"] {
  if (game.metrics.runway < BALANCE.runway.deathSpiral) return "predatory";
  if (game.metrics.runway < BALANCE.runway.pressured || game.metrics.complianceRisk > 60) return "pressure";
  if (game.metrics.marketHeat > 75 && game.metrics.runway >= 12) return "friendly";
  return "normal";
}

export function evaluateFundraising(game: GameState): FundraisingEvaluation {
  const rounds = availableRounds(game);
  const growthStory = game.metrics.pmf + game.metrics.reputation + game.metrics.marketHeat;
  const riskPenalty = game.metrics.complianceRisk + Math.max(0, 6 - game.metrics.runway) * 8;
  const score = clampScore(game.founder.attributes.fundraising * 6 + growthStory / 2 - riskPenalty / 2);
  const revenueMultiple = game.metrics.grossMargin >= 55 ? 12 : game.metrics.grossMargin >= 35 ? 8 : 4;
  const technologyPremium = game.metrics.modelPower >= 75 ? 80_000_000 : game.metrics.modelPower >= 55 ? 30_000_000 : 0;
  const runwayDiscount = game.metrics.runway < 6 ? 0.75 : 1;
  const complianceDiscount = game.metrics.complianceRisk > 60 ? 0.8 : 1;
  const discountedValuation = Math.round((game.metrics.arr * revenueMultiple + technologyPremium) * runwayDiscount * complianceDiscount);
  const valuation = Math.max(10_000_000, discountedValuation);
  const style = termStyle(game);
  const dilution = style === "friendly" ? 10 : style === "normal" ? 15 : style === "pressure" ? 22 : 35;
  const suggestedAmount = Math.round(valuation * (dilution / 100));

  return {
    score,
    availableRounds: rounds,
    valuation,
    termStyle: style,
    suggestedAmount,
    dilution,
  };
}

export function executeFundraise(game: GameState): GameState {
  const evaluation = evaluateFundraising(game);
  const actualDilution = Math.min(evaluation.dilution, game.metrics.founderEquity);
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

  return {
    ...game,
    metrics: {
      ...metrics,
      valuation: evaluation.valuation,
      runway: clampMetric("runway", metrics.runway + 12),
    },
    log: [
      ...game.log,
      `完成融资：估值 ${Math.round(evaluation.valuation / 10_000)} 万，稀释 ${actualDilution}%。`,
    ],
  };
}
