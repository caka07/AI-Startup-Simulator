import type { FounderAction } from "../types";

export const founderActions = [
  {
    id: "deep-work",
    name: "闭关深度工作",
    description: "创始人亲自啃最硬的技术债。",
    effects: [
      { metric: "productQuality", delta: 2 },
      { metric: "techDebt", delta: -2 },
      { metric: "founderHealth", delta: -5 },
    ],
    attributeEffects: { tech: 0.2, stamina: -0.1 },
  },
  {
    id: "investor-dinner",
    name: "投资人饭局",
    description: "用晚饭交换下一轮的可能性和胃酸。",
    effects: [
      { metric: "marketHeat", delta: 3 },
      { metric: "boardPressure", delta: 2 },
      { metric: "founderHealth", delta: -3 },
    ],
    attributeEffects: { fundraising: 0.2, hype: 0.1 },
  },
  {
    id: "customer-roadtrip",
    name: "客户一线拜访",
    description: "把路线图从会议室拖到真实工位上。",
    effects: [
      { metric: "pmf", delta: 3 },
      { metric: "mrr", delta: 30_000 },
      { metric: "founderHealth", delta: -4 },
    ],
    attributeEffects: { sales: 0.2, management: 0.1 },
  },
  {
    id: "take-vacation",
    name: "强制休假",
    description: "不解决增长，但解决创始人快没了的问题。",
    effects: [
      { metric: "founderHealth", delta: 12 },
      { metric: "morale", delta: 2 },
      { metric: "boardPressure", delta: 1 },
    ],
    attributeEffects: { stamina: 0.1 },
  },
  {
    id: "public-thread",
    name: "公开长文造势",
    description: "把复杂问题写成所有人都想转发的判断句。",
    effects: [
      { metric: "reputation", delta: 4 },
      { metric: "marketHeat", delta: 3 },
      { metric: "founderHealth", delta: -2 },
    ],
    attributeEffects: { hype: 0.2 },
  },
  {
    id: "therapy",
    name: "心理咨询",
    description: "承认自己不是无限算力。",
    effects: [
      { metric: "founderHealth", delta: 8 },
      { metric: "morale", delta: 1 },
      { metric: "cash", delta: -30_000 },
    ],
    attributeEffects: { management: 0.1, ethics: 0.1 },
  },
] satisfies FounderAction[];
