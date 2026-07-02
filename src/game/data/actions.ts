import type { PlayerAction } from "../types";

export const actions = [
  {
    id: "build-product",
    name: "研发产品",
    description: "把不性感但客户会续费的流程真正做完。",
    effects: [
      { metric: "productQuality", delta: 5 },
      { metric: "pmf", delta: 3 },
      { metric: "techDebt", delta: 2 },
    ],
    healthCost: 3,
  },
  {
    id: "train-model",
    name: "训练模型",
    description: "烧掉 GPU 点数，让 Benchmark 幻灯片没那么尴尬。",
    effects: [
      { metric: "modelPower", delta: 6 },
      { metric: "computeCost", delta: 4 },
      { metric: "cash", delta: -500_000 },
    ],
    healthCost: 4,
  },
  {
    id: "sell",
    name: "冲销售",
    description: "把介绍、饭局和焦虑转换成发票。",
    effects: [
      { metric: "mrr", delta: 80_000 },
      { metric: "arr", delta: 800_000 },
      { metric: "morale", delta: -1 },
    ],
    healthCost: 3,
  },
  {
    id: "fundraise",
    name: "融资",
    description: "把同一个必然成功的故事讲到有人打钱。",
    effects: [
      { metric: "cash", delta: 3_000_000 },
      { metric: "valuation", delta: 5_000_000 },
      { metric: "founderEquity", delta: -6 },
      { metric: "boardPressure", delta: 4 },
    ],
    healthCost: 5,
  },
  {
    id: "hire",
    name: "招聘",
    description: "增加人才、工资单，以及新的争论方式。",
    effects: [
      { metric: "productQuality", delta: 3 },
      { metric: "modelPower", delta: 2 },
      { metric: "runway", delta: -1 },
    ],
    healthCost: 2,
  },
  {
    id: "retain",
    name: "稳住团队",
    description: "花钱和注意力，让团队暂时停止更新简历。",
    effects: [
      { metric: "morale", delta: 7 },
      { metric: "founderEquity", delta: -2 },
      { metric: "cash", delta: -300_000 },
    ],
    healthCost: 2,
  },
  {
    id: "govern-compliance",
    name: "治理合规",
    description: "在监管替你写产品路线图之前，先把制度写好。",
    effects: [
      { metric: "complianceRisk", delta: -8 },
      { metric: "globalReadiness", delta: 4 },
      { metric: "productQuality", delta: -1 },
    ],
    healthCost: 2,
  },
  {
    id: "expand-global",
    name: "全球扩张",
    description: "本地化、出差，然后发现每个市场都有不同的不可能要求。",
    effects: [
      { metric: "globalReadiness", delta: 7 },
      { metric: "arr", delta: 600_000 },
      { metric: "complianceRisk", delta: 3 },
    ],
    healthCost: 4,
  },
  {
    id: "pr-launch",
    name: "公关发布",
    description: "买来注意力，并祈祷产品扛得住。",
    effects: [
      { metric: "reputation", delta: 7 },
      { metric: "marketHeat", delta: 4 },
      { metric: "boardPressure", delta: 2 },
    ],
    healthCost: 3,
  },
  {
    id: "cut-costs",
    name: "削减成本",
    description: "用让所有人偷偷刷招聘软件的方式延长 Runway。",
    effects: [
      { metric: "runway", delta: 3 },
      { metric: "cash", delta: 500_000 },
      { metric: "morale", delta: -8 },
      { metric: "productQuality", delta: -2 },
    ],
    healthCost: 2,
  },
] satisfies PlayerAction[];
