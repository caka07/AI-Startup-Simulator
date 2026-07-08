import type {
  AttributePresetId,
  BackgroundId,
  FounderAttributeId,
  FounderAttributes,
  MetricEffect,
  TrackId,
} from "../types";

export const ATTRIBUTE_IDS: FounderAttributeId[] = [
  "tech",
  "sales",
  "fundraising",
  "management",
  "ethics",
  "stamina",
  "hype",
  "luck",
];

export const ATTRIBUTE_LABELS: Record<FounderAttributeId, string> = {
  tech: "技术",
  sales: "销售",
  fundraising: "融资",
  management: "管理",
  ethics: "伦理",
  stamina: "体力",
  hype: "声量",
  luck: "运气",
};

export const TARGET_ATTRIBUTE_TOTAL = 30;

export interface FounderBackgroundProfile {
  id: BackgroundId;
  label: string;
  description: string;
  specialty: string;
  attributes: FounderAttributes;
  metricEffects: MetricEffect[];
}

export interface AttributeEffect {
  attribute: FounderAttributeId;
  delta: number;
}

export interface FounderTrackProfile {
  id: TrackId;
  label: string;
  description: string;
  focus: string;
  attributeEffects: AttributeEffect[];
  metricEffects: MetricEffect[];
}

export interface AttributePresetProfile {
  id: AttributePresetId;
  label: string;
  description: string;
  attributeEffects: AttributeEffect[];
  metricEffects: MetricEffect[];
}

export const backgroundProfiles: FounderBackgroundProfile[] = [
  {
    id: "ex-bigtech-pm",
    label: "大厂产品经理",
    description: "会写路线图，也知道怎么把半成品包装成季度胜利。",
    specialty: "产品质量 +5，PMF +3，管理 +，技术不是最强",
    attributes: { tech: 3, sales: 3, fundraising: 4, management: 3, ethics: 3, stamina: 3, hype: 2, luck: 2 },
    metricEffects: [
      { metric: "productQuality", delta: 5 },
      { metric: "pmf", delta: 3 },
      { metric: "techDebt", delta: 1 },
    ],
  },
  {
    id: "former-llm-researcher",
    label: "前大模型研究员",
    description: "论文、Benchmark、GPU 报价单都看得懂，销售电话会消耗灵魂。",
    specialty: "模型能力 +9，声誉 +3，销售和管理偏弱",
    attributes: { tech: 5, sales: 2, fundraising: 2, management: 2, ethics: 4, stamina: 3, hype: 2, luck: 4 },
    metricEffects: [
      { metric: "modelPower", delta: 9 },
      { metric: "reputation", delta: 3 },
      { metric: "productQuality", delta: -1 },
    ],
  },
  {
    id: "serial-founder",
    label: "连续创业者",
    description: "融资叙事熟练，知道每个投资人点头时脑子里在算什么。",
    specialty: "估值 +400 万，市场热度 +5，创始人股权 -3",
    attributes: { tech: 3, sales: 4, fundraising: 5, management: 3, ethics: 2, stamina: 3, hype: 3, luck: 1 },
    metricEffects: [
      { metric: "valuation", delta: 4_000_000 },
      { metric: "marketHeat", delta: 5 },
      { metric: "founderEquity", delta: -3 },
    ],
  },
  {
    id: "overseas-phd",
    label: "海外博士",
    description: "跨境合规、英文 Pitch、海外客户都不陌生，国内地推起步较慢。",
    specialty: "全球化 +10，模型能力 +4，PMF -2",
    attributes: { tech: 5, sales: 2, fundraising: 3, management: 2, ethics: 4, stamina: 3, hype: 2, luck: 3 },
    metricEffects: [
      { metric: "globalReadiness", delta: 10 },
      { metric: "modelPower", delta: 4 },
      { metric: "pmf", delta: -2 },
    ],
  },
  {
    id: "open-source-maintainer",
    label: "开源维护者",
    description: "社区相信你，客户还在问合同抬头写谁。",
    specialty: "声誉 +8，技术债 -3，商业化慢半拍",
    attributes: { tech: 5, sales: 2, fundraising: 2, management: 3, ethics: 5, stamina: 3, hype: 2, luck: 2 },
    metricEffects: [
      { metric: "reputation", delta: 8 },
      { metric: "techDebt", delta: -3 },
      { metric: "mrr", delta: -20_000 },
    ],
  },
  {
    id: "failed-incubation-team",
    label: "失败孵化团队",
    description: "踩过坑，也带着一堆前公司遗留阴影重新开局。",
    specialty: "现金 +80 万，士气 -6，合规风险 +3",
    attributes: { tech: 3, sales: 3, fundraising: 3, management: 3, ethics: 3, stamina: 4, hype: 2, luck: 3 },
    metricEffects: [
      { metric: "cash", delta: 800_000 },
      { metric: "morale", delta: -6 },
      { metric: "complianceRisk", delta: 3 },
    ],
  },
  {
    id: "rich-kid-founder",
    label: "资源型创始人",
    description: "第一批客户和天使轮很近，第一场舆论事故也很近。",
    specialty: "现金 +150 万，融资 +，声誉风险更高",
    attributes: { tech: 2, sales: 4, fundraising: 5, management: 2, ethics: 2, stamina: 3, hype: 4, luck: 2 },
    metricEffects: [
      { metric: "cash", delta: 1_500_000 },
      { metric: "marketHeat", delta: 4 },
      { metric: "reputation", delta: -3 },
    ],
  },
  {
    id: "indie-hacker",
    label: "独立开发者",
    description: "能一个人把原型搓出来，但组织和销售会逐渐追上来讨债。",
    specialty: "产品质量 +3，现金 +40 万，管理压力更早出现",
    attributes: { tech: 4, sales: 2, fundraising: 2, management: 2, ethics: 3, stamina: 5, hype: 2, luck: 4 },
    metricEffects: [
      { metric: "productQuality", delta: 3 },
      { metric: "cash", delta: 400_000 },
      { metric: "boardPressure", delta: 2 },
    ],
  },
];

export const trackProfiles: FounderTrackProfile[] = [
  {
    id: "foundation-model",
    label: "基础模型",
    description: "最烧钱，也最容易让人相信你能改变世界。",
    focus: "模型能力 +6，算力成本 +5，市场热度 +4",
    attributeEffects: [
      { attribute: "tech", delta: 2 },
      { attribute: "fundraising", delta: 1 },
      { attribute: "stamina", delta: -1 },
    ],
    metricEffects: [
      { metric: "modelPower", delta: 6 },
      { metric: "computeCost", delta: 5 },
      { metric: "marketHeat", delta: 4 },
    ],
  },
  {
    id: "ai-agent",
    label: "AI Agent",
    description: "把模型塞进流程里，让客户以为他们买的是未来。",
    focus: "PMF +3，产品质量 +2，技术债 +3",
    attributeEffects: [
      { attribute: "sales", delta: 1 },
      { attribute: "management", delta: 1 },
      { attribute: "tech", delta: 1 },
    ],
    metricEffects: [
      { metric: "pmf", delta: 3 },
      { metric: "productQuality", delta: 2 },
      { metric: "techDebt", delta: 3 },
    ],
  },
  {
    id: "ai-coding",
    label: "AI 编程",
    description: "开发者爱得快，也走得快，性能和体验都要硬。",
    focus: "产品质量 +4，模型能力 +3，市场热度 +2",
    attributeEffects: [
      { attribute: "tech", delta: 1 },
      { attribute: "sales", delta: 1 },
      { attribute: "stamina", delta: 1 },
    ],
    metricEffects: [
      { metric: "productQuality", delta: 4 },
      { metric: "modelPower", delta: 3 },
      { metric: "marketHeat", delta: 2 },
    ],
  },
  {
    id: "enterprise-knowledge",
    label: "企业知识库",
    description: "慢、重、合同长，但一旦接入就很难拔掉。",
    focus: "PMF +5，ARR +30 万，产品质量 +3",
    attributeEffects: [
      { attribute: "sales", delta: 1 },
      { attribute: "management", delta: 1 },
      { attribute: "ethics", delta: 1 },
    ],
    metricEffects: [
      { metric: "pmf", delta: 5 },
      { metric: "arr", delta: 300_000 },
      { metric: "productQuality", delta: 3 },
    ],
  },
  {
    id: "ai-education",
    label: "AI 教育",
    description: "续费看效果，增长看渠道，家长看焦虑。",
    focus: "PMF +4，市场热度 +3，合规风险 +2",
    attributeEffects: [
      { attribute: "sales", delta: 1 },
      { attribute: "ethics", delta: 1 },
      { attribute: "hype", delta: 1 },
    ],
    metricEffects: [
      { metric: "pmf", delta: 4 },
      { metric: "marketHeat", delta: 3 },
      { metric: "complianceRisk", delta: 2 },
    ],
  },
  {
    id: "ai-companion",
    label: "AI 陪伴",
    description: "用户粘性很高，舆论和伦理风险也不会迟到。",
    focus: "MRR +6 万，市场热度 +4，合规风险 +5",
    attributeEffects: [
      { attribute: "hype", delta: 2 },
      { attribute: "ethics", delta: -1 },
      { attribute: "stamina", delta: 1 },
    ],
    metricEffects: [
      { metric: "mrr", delta: 60_000 },
      { metric: "marketHeat", delta: 4 },
      { metric: "complianceRisk", delta: 5 },
    ],
  },
  {
    id: "ai-hardware",
    label: "AI 硬件",
    description: "供应链、库存、模型、渠道一起上桌。",
    focus: "声誉 +4，现金 -60 万，产品质量 +2",
    attributeEffects: [
      { attribute: "management", delta: 2 },
      { attribute: "stamina", delta: 1 },
      { attribute: "luck", delta: -1 },
    ],
    metricEffects: [
      { metric: "reputation", delta: 4 },
      { metric: "cash", delta: -600_000 },
      { metric: "productQuality", delta: 2 },
    ],
  },
  {
    id: "ai-security",
    label: "AI 安全",
    description: "客户少说废话，但会问非常具体的合规问题。",
    focus: "合规风险 -5，全球化 +3，PMF +2",
    attributeEffects: [
      { attribute: "ethics", delta: 2 },
      { attribute: "tech", delta: 1 },
      { attribute: "hype", delta: -1 },
    ],
    metricEffects: [
      { metric: "complianceRisk", delta: -5 },
      { metric: "globalReadiness", delta: 3 },
      { metric: "pmf", delta: 2 },
    ],
  },
  {
    id: "medical-ai",
    label: "医疗 AI",
    description: "壁垒高、周期长、审批慢，活下来就有护城河。",
    focus: "声誉 +3，合规风险 +7，产品质量 +3",
    attributeEffects: [
      { attribute: "ethics", delta: 2 },
      { attribute: "management", delta: 1 },
      { attribute: "stamina", delta: -1 },
    ],
    metricEffects: [
      { metric: "reputation", delta: 3 },
      { metric: "complianceRisk", delta: 7 },
      { metric: "productQuality", delta: 3 },
    ],
  },
  {
    id: "finance-ai",
    label: "金融 AI",
    description: "预算充足，审计更充足，采购会把你训练成另一个人。",
    focus: "ARR +40 万，合规风险 +5，毛利率 +2",
    attributeEffects: [
      { attribute: "sales", delta: 1 },
      { attribute: "fundraising", delta: 1 },
      { attribute: "ethics", delta: 1 },
    ],
    metricEffects: [
      { metric: "arr", delta: 400_000 },
      { metric: "complianceRisk", delta: 5 },
      { metric: "grossMargin", delta: 2 },
    ],
  },
  {
    id: "manufacturing-ai",
    label: "制造业 AI",
    description: "毛利没那么性感，但客户的问题是真实到硌手。",
    focus: "PMF +4，毛利率 +3，全球化 +2",
    attributeEffects: [
      { attribute: "management", delta: 2 },
      { attribute: "sales", delta: 1 },
      { attribute: "hype", delta: -1 },
    ],
    metricEffects: [
      { metric: "pmf", delta: 4 },
      { metric: "grossMargin", delta: 3 },
      { metric: "globalReadiness", delta: 2 },
    ],
  },
  {
    id: "local-life-agent",
    label: "本地生活 Agent",
    description: "流量、地推、履约全都要，模型只是入场券。",
    focus: "MRR +5 万，PMF +3，产品质量 +2",
    attributeEffects: [
      { attribute: "sales", delta: 2 },
      { attribute: "management", delta: 1 },
      { attribute: "tech", delta: -1 },
    ],
    metricEffects: [
      { metric: "mrr", delta: 50_000 },
      { metric: "pmf", delta: 3 },
      { metric: "productQuality", delta: 2 },
    ],
  },
];

export const attributePresets: AttributePresetProfile[] = [
  {
    id: "operator",
    label: "经营型",
    description: "融资、管理、销售均衡，适合稳扎稳打活到下一轮。",
    attributeEffects: [
      { attribute: "management", delta: 2 },
      { attribute: "sales", delta: 1 },
      { attribute: "stamina", delta: 1 },
    ],
    metricEffects: [
      { metric: "pmf", delta: 2 },
      { metric: "morale", delta: 3 },
    ],
  },
  {
    id: "researcher",
    label: "技术型",
    description: "模型和伦理更强，商业化会被迫补课。",
    attributeEffects: [
      { attribute: "tech", delta: 3 },
      { attribute: "ethics", delta: 1 },
      { attribute: "sales", delta: -1 },
    ],
    metricEffects: [
      { metric: "modelPower", delta: 5 },
      { metric: "reputation", delta: 2 },
    ],
  },
  {
    id: "rainmaker",
    label: "融资型",
    description: "会讲故事、会找钱，但产品债会在夜里敲门。",
    attributeEffects: [
      { attribute: "fundraising", delta: 3 },
      { attribute: "hype", delta: 2 },
      { attribute: "ethics", delta: -1 },
    ],
    metricEffects: [
      { metric: "valuation", delta: 3_000_000 },
      { metric: "marketHeat", delta: 5 },
      { metric: "boardPressure", delta: 2 },
    ],
  },
  {
    id: "global",
    label: "全球化",
    description: "技术和耐力偏强，适合从中国打到海外。",
    attributeEffects: [
      { attribute: "tech", delta: 1 },
      { attribute: "stamina", delta: 1 },
      { attribute: "ethics", delta: 1 },
      { attribute: "sales", delta: 1 },
    ],
    metricEffects: [{ metric: "globalReadiness", delta: 6 }],
  },
];

export function findBackgroundProfile(id: BackgroundId): FounderBackgroundProfile | undefined {
  return backgroundProfiles.find((profile) => profile.id === id);
}

export function findTrackProfile(id: TrackId): FounderTrackProfile | undefined {
  return trackProfiles.find((profile) => profile.id === id);
}
