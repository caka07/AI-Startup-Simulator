import type { PlayerAction } from "../types";

export const actions = [
  {
    id: "build-product",
    name: "Build Product",
    description: "Ship less glamorous workflows that customers actually renew.",
    effects: [
      { metric: "productQuality", delta: 5 },
      { metric: "pmf", delta: 3 },
      { metric: "techDebt", delta: 2 },
    ],
    healthCost: 3,
  },
  {
    id: "train-model",
    name: "Train Model",
    description: "Spend GPU credits to make the benchmark slide less embarrassing.",
    effects: [
      { metric: "modelPower", delta: 6 },
      { metric: "computeCost", delta: 4 },
      { metric: "cash", delta: -500_000 },
    ],
    healthCost: 4,
  },
  {
    id: "sell",
    name: "Sell",
    description: "Convert introductions, dinners, and anxiety into invoices.",
    effects: [
      { metric: "mrr", delta: 80_000 },
      { metric: "arr", delta: 800_000 },
      { metric: "morale", delta: -1 },
    ],
    healthCost: 3,
  },
  {
    id: "fundraise",
    name: "Fundraise",
    description: "Tell the same inevitable story until someone wires money.",
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
    name: "Hire",
    description: "Add talent, payroll, and new ways to disagree in Slack.",
    effects: [
      { metric: "productQuality", delta: 3 },
      { metric: "modelPower", delta: 2 },
      { metric: "runway", delta: -1 },
    ],
    healthCost: 2,
  },
  {
    id: "retain",
    name: "Retain",
    description: "Spend cash and attention so the team stops updating resumes.",
    effects: [
      { metric: "morale", delta: 7 },
      { metric: "founderEquity", delta: -2 },
      { metric: "cash", delta: -300_000 },
    ],
    healthCost: 2,
  },
  {
    id: "govern-compliance",
    name: "Govern Compliance",
    description: "Write policies before a regulator writes your product roadmap.",
    effects: [
      { metric: "complianceRisk", delta: -8 },
      { metric: "globalReadiness", delta: 4 },
      { metric: "productQuality", delta: -1 },
    ],
    healthCost: 2,
  },
  {
    id: "expand-global",
    name: "Expand Global",
    description: "Localize, travel, and learn that every market has a different impossible requirement.",
    effects: [
      { metric: "globalReadiness", delta: 7 },
      { metric: "arr", delta: 600_000 },
      { metric: "complianceRisk", delta: 3 },
    ],
    healthCost: 4,
  },
  {
    id: "pr-launch",
    name: "PR Launch",
    description: "Buy attention and hope the product survives it.",
    effects: [
      { metric: "reputation", delta: 7 },
      { metric: "marketHeat", delta: 4 },
      { metric: "boardPressure", delta: 2 },
    ],
    healthCost: 3,
  },
  {
    id: "cut-costs",
    name: "Cut Costs",
    description: "Extend runway by making everyone refresh job boards in private.",
    effects: [
      { metric: "runway", delta: 3 },
      { metric: "cash", delta: 500_000 },
      { metric: "morale", delta: -8 },
      { metric: "productQuality", delta: -2 },
    ],
    healthCost: 2,
  },
] satisfies PlayerAction[];
