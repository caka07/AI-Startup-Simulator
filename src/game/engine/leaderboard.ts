import type { FactionId, GameState, LeaderboardCategory, LeaderboardCategoryId } from "../types";

export interface LeaderboardRow {
  id: FactionId | "player";
  name: string;
  focus: string;
  score: number;
  rank: number;
  delta: number;
}

export interface LeaderboardCompanyDetail {
  id: FactionId | "player";
  name: string;
  region: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  mood: string;
}

export interface LeaderboardResult {
  categoryId: LeaderboardCategoryId;
  rows: LeaderboardRow[];
  playerScore: number;
  playerRank: number;
  playerRankLabel: string;
  length: number;
  map: LeaderboardRow[]["map"];
  findIndex: LeaderboardRow[]["findIndex"];
  some: LeaderboardRow[]["some"];
  [Symbol.iterator]: () => ArrayIterator<LeaderboardRow>;
}

interface Competitor {
  id: FactionId;
  name: string;
  focus: string;
  baseScore: number;
  categoryScores: Record<LeaderboardCategoryId, number>;
  trend: number;
  heatSensitivity: number;
  globalSensitivity: number;
  region: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  mood: string;
}

const COMPETITORS: Competitor[] = [
  {
    id: "openmind",
    name: "OpenMind",
    focus: "前沿模型",
    baseScore: 93,
    categoryScores: { overall: 93, model: 97, commercial: 86, global: 92 },
    trend: 0.8,
    heatSensitivity: 0.04,
    globalSensitivity: 0.08,
    region: "美国 / 全球",
    description: "以闭源前沿模型、生态分发和企业接口保持综合榜首压力。",
    strengths: ["前沿模型", "开发者生态", "企业 API"],
    weaknesses: ["监管审查", "推理成本"],
    mood: "高压扩张",
  },
  {
    id: "deepduck",
    name: "DeepDuck",
    focus: "开源低价模型",
    baseScore: 83,
    categoryScores: { overall: 83, model: 91, commercial: 72, global: 78 },
    trend: 1.4,
    heatSensitivity: 0.16,
    globalSensitivity: 0.04,
    region: "中国 / 开源社区",
    description: "凭借开源模型和低价推理快速扩大开发者影响力。",
    strengths: ["开源心智", "低推理成本", "社区传播"],
    weaknesses: ["商业化节奏", "企业服务深度"],
    mood: "锋芒正盛",
  },
  {
    id: "byteplanet",
    name: "BytePlanet",
    focus: "流量与 Agent 分发",
    baseScore: 86,
    categoryScores: { overall: 86, model: 78, commercial: 92, global: 84 },
    trend: 0.7,
    heatSensitivity: 0.1,
    globalSensitivity: 0.02,
    region: "中国 / 全球内容平台",
    description: "依靠流量入口和 Agent 分发能力将模型能力包装成高频产品。",
    strengths: ["分发效率", "用户增长", "商业闭环"],
    weaknesses: ["基础模型口碑", "跨境监管"],
    mood: "流量强攻",
  },
  {
    id: "cloudsoft",
    name: "CloudSoft",
    focus: "企业云生态",
    baseScore: 84,
    categoryScores: { overall: 84, model: 82, commercial: 94, global: 88 },
    trend: 0.6,
    heatSensitivity: 0.03,
    globalSensitivity: 0.04,
    region: "美国 / 企业云",
    description: "通过云合同、办公套件和企业 Copilot 产品巩固商业化排名。",
    strengths: ["企业客户", "云生态", "高续约率"],
    weaknesses: ["创新速度", "组织包袱"],
    mood: "稳健压制",
  },
  {
    id: "green-furnace",
    name: "Green Furnace",
    focus: "算力供给",
    baseScore: 80,
    categoryScores: { overall: 80, model: 84, commercial: 79, global: 81 },
    trend: 0.5,
    heatSensitivity: 0.07,
    globalSensitivity: 0.02,
    region: "美国 / 全球算力网络",
    description: "围绕 GPU、数据中心和能源协议影响前沿模型训练节奏。",
    strengths: ["算力供给", "硬件生态", "议价能力"],
    weaknesses: ["供应周期", "能源成本"],
    mood: "供给紧绷",
  },
  {
    id: "moralmachine",
    name: "MoralMachine",
    focus: "安全与监管",
    baseScore: 78,
    categoryScores: { overall: 78, model: 80, commercial: 70, global: 86 },
    trend: 0.4,
    heatSensitivity: 0.02,
    globalSensitivity: 0.06,
    region: "欧洲 / 安全联盟",
    description: "以模型安全、合规评测和政府合作占据全球化榜单位置。",
    strengths: ["合规能力", "安全评测", "公共部门关系"],
    weaknesses: ["商业规模", "产品速度"],
    mood: "谨慎推进",
  },
  {
    id: "tencentacle",
    name: "Tencentacle",
    focus: "社交与游戏入口",
    baseScore: 77,
    categoryScores: { overall: 77, model: 74, commercial: 85, global: 76 },
    trend: 0.4,
    heatSensitivity: 0.08,
    globalSensitivity: 0.02,
    region: "中国 / 社交娱乐",
    description: "把 AI 能力嵌入社交、内容和游戏场景，擅长把流量转成收入。",
    strengths: ["社交入口", "游戏场景", "支付网络"],
    weaknesses: ["模型差异化", "组织协同"],
    mood: "稳中加码",
  },
  {
    id: "alicloud-temple",
    name: "AliCloud Temple",
    focus: "政企云与行业方案",
    baseScore: 76,
    categoryScores: { overall: 76, model: 76, commercial: 88, global: 79 },
    trend: 0.3,
    heatSensitivity: 0.05,
    globalSensitivity: 0.03,
    region: "中国 / 亚太云市场",
    description: "在政企云、行业解决方案和亚太出海客户中推进 AI 落地。",
    strengths: ["行业方案", "云基础设施", "政企渠道"],
    weaknesses: ["品牌全球化", "前沿模型声量"],
    mood: "耐心经营",
  },
  {
    id: "oasis-models",
    name: "Oasis Models",
    focus: "主权 AI 与本地化模型",
    baseScore: 75,
    categoryScores: { overall: 75, model: 77, commercial: 74, global: 90 },
    trend: 0.6,
    heatSensitivity: 0.04,
    globalSensitivity: 0.09,
    region: "中东 / 主权 AI 市场",
    description: "以主权 AI、阿语本地化模型和政府级合规部署切入全球化竞争。",
    strengths: ["本地化模型", "主权基金支持", "政府客户"],
    weaknesses: ["开发者生态", "通用产品化"],
    mood: "耐心追赶",
  },
];

export function getLeaderboardCategories(): LeaderboardCategory[] {
  return [
    { id: "overall", label: "综合", description: "模型、商业化、全球化和声誉的综合排名。" },
    { id: "model", label: "模型能力", description: "前沿能力、算力和技术声誉排名。" },
    { id: "commercial", label: "商业化", description: "ARR、PMF、毛利率和客户质量排名。" },
    { id: "global", label: "全球化", description: "海外准备度、合规和跨境收入潜力排名。" },
  ];
}

function phase(game: GameState): number {
  return (game.year - 2026) * 4 + (game.quarter - 1);
}

function revenueScore(arr: number): number {
  return Math.log10(1 + arr / 1_000_000) * 8;
}

function commercialRevenueScore(arr: number): number {
  return Math.min(100, revenueScore(arr) * 5);
}

function complianceScore(game: GameState): number {
  return Math.max(0, 100 - game.metrics.complianceRisk);
}

function playerScore(game: GameState, categoryId: LeaderboardCategoryId): number {
  const revenue = commercialRevenueScore(game.metrics.arr);
  const categoryScores: Record<LeaderboardCategoryId, number> = {
    overall:
      18 +
      game.metrics.modelPower * 0.22 +
      game.metrics.productQuality * 0.18 +
      game.metrics.pmf * 0.12 +
      game.metrics.globalReadiness * 0.1 +
      game.metrics.reputation * 0.1 +
      game.metrics.marketHeat * 0.05 +
      revenue * 0.18,
    model:
      12 +
      game.metrics.modelPower * 0.42 +
      game.metrics.computeSupply * 0.16 +
      game.metrics.reputation * 0.14 +
      game.metrics.productQuality * 0.12 +
      Math.max(0, 100 - game.metrics.techDebt) * 0.08,
    commercial:
      12 +
      revenue * 0.38 +
      game.metrics.pmf * 0.22 +
      game.metrics.productQuality * 0.16 +
      game.metrics.grossMargin * 0.1 +
      game.metrics.reputation * 0.08 +
      game.metrics.modelPower * 0.06,
    global:
      10 +
      game.metrics.globalReadiness * 0.42 +
      complianceScore(game) * 0.16 +
      revenue * 0.16 +
      game.metrics.reputation * 0.14 +
      game.metrics.productQuality * 0.08,
  };
  return Math.round(categoryScores[categoryId]);
}

function competitorScore(game: GameState, competitor: Competitor, categoryId: LeaderboardCategoryId): number {
  const currentPhase = phase(game);
  const relation = game.factionRelations[competitor.id] ?? 0;
  const score =
    competitor.categoryScores[categoryId] +
    currentPhase * competitor.trend * 0.18 +
    (game.metrics.marketHeat - 55) * competitor.heatSensitivity +
    (game.metrics.globalReadiness - 10) * competitor.globalSensitivity +
    relation * 0.45;
  return Math.round(score);
}

function competitorDelta(game: GameState, competitor: Competitor): number {
  const heatMove = game.metrics.marketHeat >= 70 ? competitor.heatSensitivity * 10 : 0;
  const openSourceMove = competitor.id === "deepduck" && game.metrics.modelPower <= 55 ? 2 : 0;
  return Math.round(competitor.trend + heatMove + openSourceMove - 1);
}

function playerRankLabel(rank: number): string {
  if (rank <= 20) {
    return "TOP 20";
  }
  if (rank <= 50) {
    return "TOP 50";
  }
  return "TOP 50 外";
}

function thresholdRank(score: number, computedRank: number): number {
  if (score < 55) {
    return 51;
  }
  if (score < 68) {
    return 50;
  }
  if (score < 78) {
    return 20;
  }
  return computedRank;
}

function rankRows(rows: Array<Omit<LeaderboardRow, "rank">>): LeaderboardRow[] {
  return rows
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name))
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function makeLeaderboardResult(
  categoryId: LeaderboardCategoryId,
  rows: LeaderboardRow[],
  score: number,
  rank: number,
): LeaderboardResult {
  return {
    categoryId,
    rows,
    playerScore: score,
    playerRank: rank,
    playerRankLabel: rank <= 9 ? `#${rank}` : playerRankLabel(rank),
    get length() {
      return rows.length;
    },
    map: rows.map.bind(rows),
    findIndex: rows.findIndex.bind(rows),
    some: rows.some.bind(rows),
    [Symbol.iterator]: rows[Symbol.iterator].bind(rows),
  };
}

export function getLeaderboard(game: GameState, categoryId: LeaderboardCategoryId = "overall"): LeaderboardResult {
  const competitorRows: Array<Omit<LeaderboardRow, "rank">> = COMPETITORS.map((competitor) => ({
    id: competitor.id,
    name: competitor.name,
    focus: competitor.focus,
    score: competitorScore(game, competitor, categoryId),
    delta: competitorDelta(game, competitor),
  }));
  const score = playerScore(game, categoryId);
  const playerRow: Omit<LeaderboardRow, "rank"> = {
    id: "player" as const,
    name: game.companyName,
    focus: "玩家公司",
    score,
    delta: game.metrics.arr > 0 ? Math.max(0, Math.round(revenueScore(game.metrics.arr) / 3)) : 0,
  };
  const rankedWithPlayer = rankRows([...competitorRows, playerRow]);
  const computedPlayerRank = rankedWithPlayer.find((row) => row.id === "player")?.rank ?? 51;
  const playerRank = thresholdRank(score, computedPlayerRank);
  const visibleRows =
    playerRank <= 9
      ? rankedWithPlayer.filter((row) => row.rank <= 9)
      : rankRows(competitorRows).slice(0, 9);

  return makeLeaderboardResult(categoryId, visibleRows, score, playerRank);
}

export function getLeaderboardCompanyDetail(game: GameState, id: FactionId | "player"): LeaderboardCompanyDetail | null {
  if (id === "player") {
    return {
      id,
      name: game.companyName,
      region: "中国 / 全球扩张中",
      description: `${game.companyName} 正在用 ARR、模型能力和全球化准备度争夺入榜资格。`,
      strengths: [`ARR ${Math.round(game.metrics.arr / 10_000)} 万`, `模型能力 ${Math.round(game.metrics.modelPower)}%`],
      weaknesses: [`合规风险 ${Math.round(game.metrics.complianceRisk)}%`, `董事会压力 ${Math.round(game.metrics.boardPressure)}%`],
      mood: game.metrics.runway <= 6 ? "现金焦虑" : "仍在推进",
    };
  }

  const competitor = COMPETITORS.find((candidate) => candidate.id === id);
  if (!competitor) {
    return null;
  }

  return {
    id: competitor.id,
    name: competitor.name,
    region: competitor.region,
    description: competitor.description,
    strengths: [...competitor.strengths],
    weaknesses: [...competitor.weaknesses],
    mood: competitor.mood,
  };
}
