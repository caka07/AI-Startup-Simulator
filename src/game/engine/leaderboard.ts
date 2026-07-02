import type { FactionId, GameState } from "../types";

export interface LeaderboardRow {
  id: FactionId | "player";
  name: string;
  focus: string;
  score: number;
  rank: number;
  delta: number;
}

interface Competitor {
  id: FactionId;
  name: string;
  focus: string;
  baseScore: number;
  trend: number;
  heatSensitivity: number;
  globalSensitivity: number;
}

const COMPETITORS: Competitor[] = [
  {
    id: "openmind",
    name: "OpenMind",
    focus: "前沿模型",
    baseScore: 93,
    trend: 0.8,
    heatSensitivity: 0.04,
    globalSensitivity: 0.08,
  },
  {
    id: "deepduck",
    name: "DeepDuck",
    focus: "开源低价模型",
    baseScore: 83,
    trend: 1.4,
    heatSensitivity: 0.16,
    globalSensitivity: 0.04,
  },
  {
    id: "byteplanet",
    name: "BytePlanet",
    focus: "流量与 Agent 分发",
    baseScore: 86,
    trend: 0.7,
    heatSensitivity: 0.1,
    globalSensitivity: 0.02,
  },
  {
    id: "cloudsoft",
    name: "CloudSoft",
    focus: "企业云生态",
    baseScore: 84,
    trend: 0.6,
    heatSensitivity: 0.03,
    globalSensitivity: 0.04,
  },
  {
    id: "green-furnace",
    name: "Green Furnace",
    focus: "算力供给",
    baseScore: 80,
    trend: 0.5,
    heatSensitivity: 0.07,
    globalSensitivity: 0.02,
  },
  {
    id: "moralmachine",
    name: "MoralMachine",
    focus: "安全与监管",
    baseScore: 78,
    trend: 0.4,
    heatSensitivity: 0.02,
    globalSensitivity: 0.06,
  },
  {
    id: "tencentacle",
    name: "Tencentacle",
    focus: "社交与游戏入口",
    baseScore: 77,
    trend: 0.4,
    heatSensitivity: 0.08,
    globalSensitivity: 0.02,
  },
  {
    id: "alicloud-temple",
    name: "AliCloud Temple",
    focus: "政企云与行业方案",
    baseScore: 76,
    trend: 0.3,
    heatSensitivity: 0.05,
    globalSensitivity: 0.03,
  },
];

function phase(game: GameState): number {
  return (game.year - 2026) * 4 + (game.quarter - 1);
}

function revenueScore(arr: number): number {
  return Math.log10(1 + arr / 1_000_000) * 8;
}

function playerScore(game: GameState): number {
  return Math.round(
    18 +
      game.metrics.modelPower * 0.24 +
      game.metrics.productQuality * 0.2 +
      game.metrics.pmf * 0.12 +
      game.metrics.globalReadiness * 0.12 +
      game.metrics.reputation * 0.1 +
      game.metrics.marketHeat * 0.06 +
      revenueScore(game.metrics.arr),
  );
}

function competitorScore(game: GameState, competitor: Competitor): number {
  const currentPhase = phase(game);
  const relation = game.factionRelations[competitor.id] ?? 0;
  const score =
    competitor.baseScore +
    currentPhase * competitor.trend * 0.18 +
    (game.metrics.marketHeat - 55) * competitor.heatSensitivity +
    (game.metrics.globalReadiness - 10) * competitor.globalSensitivity +
    relation * 0.05;
  return Math.round(score);
}

function competitorDelta(game: GameState, competitor: Competitor): number {
  const heatMove = game.metrics.marketHeat >= 70 ? competitor.heatSensitivity * 10 : 0;
  const openSourceMove = competitor.id === "deepduck" && game.metrics.modelPower <= 55 ? 2 : 0;
  return Math.round(competitor.trend + heatMove + openSourceMove - 1);
}

export function getLeaderboard(game: GameState): LeaderboardRow[] {
  const rows: Array<Omit<LeaderboardRow, "rank">> = [
    ...COMPETITORS.map((competitor) => ({
      id: competitor.id,
      name: competitor.name,
      focus: competitor.focus,
      score: competitorScore(game, competitor),
      delta: competitorDelta(game, competitor),
    })),
    {
      id: "player" as const,
      name: game.founder.name,
      focus: "玩家公司",
      score: playerScore(game),
      delta: game.metrics.arr > 0 ? Math.max(0, Math.round(revenueScore(game.metrics.arr) / 3)) : 0,
    },
  ];

  return rows
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name))
    .map((row, index) => ({ ...row, rank: index + 1 }));
}
