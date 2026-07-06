import type { Ending } from "../types";

export const endings = [
  {
    id: "cashflow-break",
    name: "现金流断裂",
    description: "工资先于回款到来，而乐观不是法定货币。",
    priority: 10,
    trigger: [{ metric: "runway", op: "<=", value: 0 }],
  },
  {
    id: "regulatory-shutdown",
    name: "监管叫停",
    description: "一次合规捷径变成了行政力量公开课。",
    priority: 20,
    trigger: [{ metric: "complianceRisk", op: ">=", value: 95 }],
  },
  {
    id: "founder-health-collapse",
    name: "创始人健康崩盘",
    description: "日历早就提醒过，创始人终会变成最大瓶颈。",
    priority: 30,
    trigger: [{ metric: "founderHealth", op: "<=", value: 0 }],
  },
  {
    id: "open-source-crushed",
    name: "被开源碾碎",
    description: "DeepDuck 发布免费权重，你的付费护城河蒸发成 GitHub Star。",
    priority: 40,
    trigger: [
      { metric: "modelPower", op: "<=", value: 20 },
      { metric: "productQuality", op: "<=", value: 30 },
    ],
  },
  {
    id: "giant-free-feature",
    name: "巨头免费功能",
    description: "平台巨头把你的核心功能免费打包，并称之为生态支持。",
    priority: 50,
    trigger: [
      { metric: "pmf", op: "<=", value: 25 },
      { metric: "reputation", op: "<=", value: 25 },
    ],
  },
  {
    id: "acquired-by-giant",
    name: "被巨头收购",
    description: "退出材料写着战略协同，团队嘴里只有归属期悬崖。",
    priority: 60,
    trigger: [
      { metric: "valuation", op: ">=", value: 200_000_000 },
      { metric: "boardPressure", op: ">=", value: 70 },
    ],
  },
  {
    id: "professional-ceo-replaced-founder",
    name: "职业 CEO 接管",
    description: "董事会感谢创始人的愿景，然后把办公室给了别人。",
    priority: 65,
    trigger: [
      { metric: "boardPressure", op: ">=", value: 85 },
      { metric: "founderEquity", op: "<=", value: 25 },
    ],
  },
  {
    id: "hk-ipo",
    name: "港股 IPO",
    description: "公司带着真实收入和排练过很多遍的答案在香港上市。",
    priority: 70,
    trigger: [
      { metric: "arr", op: ">=", value: 80_000_000 },
      { metric: "complianceRisk", op: "<=", value: 40 },
      { metric: "grossMargin", op: ">=", value: 45 },
      { metric: "valuation", op: ">=", value: 800_000_000 },
    ],
  },
  {
    id: "us-ipo",
    name: "美股 IPO",
    description: "路演穿过数据问题、地缘政治和三版 S-1。",
    priority: 80,
    trigger: [
      { metric: "arr", op: ">=", value: 150_000_000 },
      { metric: "globalReadiness", op: ">=", value: 75 },
      { metric: "complianceRisk", op: "<=", value: 35 },
      { metric: "founderHealth", op: ">", value: 40 },
      { metric: "grossMargin", op: ">=", value: 50 },
      { metric: "valuation", op: ">=", value: 2_000_000_000 },
    ],
  },
  {
    id: "cashflow-champion",
    name: "现金流冠军",
    description: "公司能自我造血，让只准备了稀释笑话的 VC 陷入沉默。",
    priority: 90,
    trigger: [
      { metric: "grossMargin", op: ">=", value: 55 },
      { metric: "runway", op: ">=", value: 24 },
    ],
  },
  {
    id: "paper-billionaire",
    name: "纸面富豪",
    description: "创始人在纸面上很富，在流动性、睡眠和周末上很穷。",
    priority: 100,
    trigger: [
      { metric: "valuation", op: ">=", value: 1_000_000_000 },
      { metric: "founderEquity", op: ">=", value: 30 },
    ],
  },
  {
    id: "lifestyle-company",
    name: "生活方式公司",
    description: "它从未成为独角兽，但客户付钱，也没人再说闪电扩张。",
    priority: 120,
    trigger: [
      { metric: "arr", op: ">=", value: 5_000_000 },
      { metric: "founderHealth", op: ">=", value: 70 },
    ],
  },
] satisfies Ending[];
