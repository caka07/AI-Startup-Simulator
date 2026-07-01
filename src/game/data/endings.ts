import type { Ending } from "../types";

export const endings = [
  {
    id: "cashflow-break",
    name: "Cashflow Break",
    description: "Payroll arrives before receivables, and optimism is not legal tender.",
    priority: 10,
    trigger: [{ metric: "runway", op: "<=", value: 0 }],
  },
  {
    id: "regulatory-shutdown",
    name: "Regulatory Shutdown",
    description: "A compliance shortcut becomes a public lesson in administrative power.",
    priority: 20,
    trigger: [{ metric: "complianceRisk", op: ">=", value: 95 }],
  },
  {
    id: "founder-health-collapse",
    name: "Founder Health Collapse",
    description: "The founder finally becomes the bottleneck the calendar had been warning about.",
    priority: 30,
    trigger: [{ metric: "founderHealth", op: "<=", value: 0 }],
  },
  {
    id: "open-source-crushed",
    name: "Open-Source Crushed",
    description: "DeepDuck ships free weights, and your paid moat evaporates into GitHub stars.",
    priority: 40,
    trigger: [
      { metric: "modelPower", op: "<=", value: 20 },
      { metric: "productQuality", op: "<=", value: 30 },
    ],
  },
  {
    id: "giant-free-feature",
    name: "Giant Free Feature",
    description: "A platform giant bundles your core feature for free and calls it ecosystem support.",
    priority: 50,
    trigger: [
      { metric: "pmf", op: "<=", value: 25 },
      { metric: "reputation", op: "<=", value: 25 },
    ],
  },
  {
    id: "acquired-by-giant",
    name: "Acquired By Giant",
    description: "The exit deck says strategic synergy; the team says vesting cliff.",
    priority: 60,
    trigger: [
      { metric: "valuation", op: ">=", value: 200_000_000 },
      { metric: "boardPressure", op: ">=", value: 70 },
    ],
  },
  {
    id: "hk-ipo",
    name: "HK IPO",
    description: "The company lists in Hong Kong with real revenue and very rehearsed answers.",
    priority: 70,
    trigger: [
      { metric: "arr", op: ">=", value: 80_000_000 },
      { metric: "complianceRisk", op: "<=", value: 35 },
    ],
  },
  {
    id: "us-ipo",
    name: "US IPO",
    description: "The roadshow survives data questions, geopolitics, and three versions of the S-1.",
    priority: 80,
    trigger: [
      { metric: "arr", op: ">=", value: 150_000_000 },
      { metric: "globalReadiness", op: ">=", value: 75 },
    ],
  },
  {
    id: "cashflow-champion",
    name: "Cashflow Champion",
    description: "The company funds itself, confusing VCs who only prepared dilution jokes.",
    priority: 90,
    trigger: [
      { metric: "grossMargin", op: ">=", value: 55 },
      { metric: "runway", op: ">=", value: 24 },
    ],
  },
  {
    id: "paper-billionaire",
    name: "Paper Billionaire",
    description: "The founder is rich on paper and poor in liquidity, sleep, and free weekends.",
    priority: 100,
    trigger: [
      { metric: "valuation", op: ">=", value: 1_000_000_000 },
      { metric: "founderEquity", op: ">=", value: 30 },
    ],
  },
  {
    id: "professional-ceo-replaced-founder",
    name: "Professional CEO Replaced Founder",
    description: "The board thanks the founder for vision and gives someone else the office.",
    priority: 110,
    trigger: [
      { metric: "boardPressure", op: ">=", value: 85 },
      { metric: "founderEquity", op: "<=", value: 25 },
    ],
  },
  {
    id: "lifestyle-company",
    name: "Lifestyle Company",
    description: "It never becomes a unicorn, but customers pay and nobody says blitzscale anymore.",
    priority: 120,
    trigger: [
      { metric: "arr", op: ">=", value: 5_000_000 },
      { metric: "founderHealth", op: ">=", value: 70 },
    ],
  },
] satisfies Ending[];
