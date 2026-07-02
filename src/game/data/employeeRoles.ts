import type { EmployeeRole } from "../types";

export const employeeRoles = [
  {
    id: "researcher",
    name: "研究员",
    description: "提升模型质量，同时悄悄收到更有钱公司的猎头私信。",
    salaryBase: 900_000,
    strengths: [
      { metric: "modelPower", delta: 6 },
      { metric: "reputation", delta: 2 },
    ],
    risks: ["flight risk", "paper-first instincts"],
  },
  {
    id: "engineer",
    name: "工程师",
    description: "把 Notebook 变成服务，再把服务变成值班表。",
    salaryBase: 650_000,
    strengths: [
      { metric: "productQuality", delta: 5 },
      { metric: "techDebt", delta: -3 },
    ],
    risks: ["burnout", "platform sprawl"],
  },
  {
    id: "product-manager",
    name: "产品经理",
    description: "把创始人预言翻译成客户可能看得懂的需求。",
    salaryBase: 520_000,
    strengths: [
      { metric: "pmf", delta: 5 },
      { metric: "productQuality", delta: 2 },
    ],
    risks: ["roadmap theater", "meeting inflation"],
  },
  {
    id: "sales",
    name: "销售",
    description: "找到预算负责人，偶尔卖出工程团队只在梦里见过的功能。",
    salaryBase: 480_000,
    strengths: [
      { metric: "mrr", delta: 30_000 },
      { metric: "arr", delta: 300_000 },
    ],
    risks: ["overpromising", "discount addiction"],
  },
  {
    id: "compliance",
    name: "合规",
    description: "在监管帮你上新闻之前，先把流程补上。",
    salaryBase: 500_000,
    strengths: [
      { metric: "complianceRisk", delta: -6 },
      { metric: "globalReadiness", delta: 3 },
    ],
    risks: ["slower launches", "policy pileup"],
  },
  {
    id: "finance",
    name: "财务",
    description: "解释为什么确认收入和银行现金在灵魂上不是一回事。",
    salaryBase: 450_000,
    strengths: [
      { metric: "runway", delta: 1 },
      { metric: "grossMargin", delta: 3 },
    ],
    risks: ["spreadsheet vetoes", "morale drag"],
  },
  {
    id: "cfo",
    name: "CFO",
    description: "把混乱变成董事会材料，以及经得起尽调的发票。",
    salaryBase: 1_200_000,
    strengths: [
      { metric: "boardPressure", delta: -6 },
      { metric: "valuation", delta: 2_000_000 },
    ],
    risks: ["professional CEO whispers", "process tax"],
  },
  {
    id: "overseas-bd",
    name: "海外 BD",
    description: "住在飞机上，本地化 Demo，并发现每个国家都有采购陷阱。",
    salaryBase: 700_000,
    strengths: [
      { metric: "globalReadiness", delta: 6 },
      { metric: "arr", delta: 500_000 },
    ],
    risks: ["travel burn", "compliance exposure"],
  },
] satisfies EmployeeRole[];
