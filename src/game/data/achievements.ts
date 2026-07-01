import type { Achievement } from "../types";

export const achievements = [
  {
    id: "hello-demo",
    name: "Hello, Demo",
    description: "The first demo runs long enough for a screenshot and a group chat rumor.",
    trigger: [{ metric: "productQuality", op: ">=", value: 30 }],
  },
  {
    id: "first-invoice",
    name: "First Invoice",
    description: "Someone pays before asking whether the model is deterministic.",
    trigger: [{ metric: "mrr", op: ">", value: 0 }],
  },
  {
    id: "angel-arrives",
    name: "Angel Arrives",
    description: "An operator angel wires money and advice in equal quantities.",
    trigger: [{ metric: "cash", op: ">=", value: 4_000_000 }],
  },
  {
    id: "seed-player",
    name: "Seed Player",
    description: "The seed round closes, and the board deck becomes a recurring chore.",
    trigger: [{ metric: "valuation", op: ">=", value: 20_000_000 }],
  },
  {
    id: "million-mrr",
    name: "Million MRR",
    description: "Monthly recurring revenue reaches a number screenshots were invented for.",
    trigger: [{ metric: "mrr", op: ">=", value: 1_000_000 }],
  },
  {
    id: "ten-million-arr",
    name: "Ten Million ARR",
    description: "Procurement teams now waste your time at enterprise scale.",
    trigger: [{ metric: "arr", op: ">=", value: 10_000_000 }],
  },
  {
    id: "series-a-graduate",
    name: "Series A Graduate",
    description: "The company graduates from possibility to expensive expectations.",
    trigger: [{ metric: "valuation", op: ">=", value: 80_000_000 }],
  },
  {
    id: "series-b-expansion",
    name: "Series B Expansion",
    description: "Growth capital arrives with hiring plans and a calendar full of operating reviews.",
    trigger: [{ metric: "valuation", op: ">=", value: 250_000_000 }],
  },
  {
    id: "unicorn-skin",
    name: "Unicorn Skin",
    description: "The valuation says unicorn; the finance team says please read the preference stack.",
    trigger: [{ metric: "valuation", op: ">=", value: 1_000_000_000 }],
  },
  {
    id: "gpu-ticket",
    name: "GPU Ticket",
    description: "You secure enough compute to make the infra team both proud and terrified.",
    trigger: [{ metric: "computeSupply", op: ">=", value: 70 }],
  },
  {
    id: "first-overseas-order",
    name: "First Overseas Order",
    description: "A foreign customer signs, then asks for a data residency appendix.",
    trigger: [{ metric: "globalReadiness", op: ">=", value: 35 }],
  },
  {
    id: "hundred-million-arr",
    name: "Hundred Million ARR",
    description: "Revenue reaches the scale where every mistake gets a committee.",
    trigger: [{ metric: "arr", op: ">=", value: 100_000_000 }],
  },
  {
    id: "gross-margin-positive",
    name: "Gross Margin Positive",
    description: "Inference no longer eats the whole invoice, only a concerning portion.",
    trigger: [{ metric: "grossMargin", op: ">", value: 0 }],
  },
  {
    id: "cfo-hired",
    name: "CFO Hired",
    description: "Someone in the company can now say revenue recognition without laughing.",
    trigger: [{ metric: "boardPressure", op: "<=", value: 20 }],
  },
  {
    id: "audit-ready",
    name: "Audit Ready",
    description: "The auditors find records, controls, and only moderate despair.",
    trigger: [{ metric: "complianceRisk", op: "<=", value: 15 }],
  },
  {
    id: "bell-ringer",
    name: "Bell Ringer",
    description: "The listing ceremony is shorter than the lockup anxiety.",
    trigger: [{ metric: "valuation", op: ">=", value: 2_000_000_000 }],
  },
  {
    id: "ppt-before-product",
    name: "PPT Before Product",
    description: "The deck trends before the product works, a classic financing efficiency.",
    trigger: [
      { metric: "reputation", op: ">=", value: 75 },
      { metric: "productQuality", op: "<", value: 35 },
    ],
  },
  {
    id: "cloud-credit-rich",
    name: "Cloud Credit Rich",
    description: "The balance sheet has credits, coupons, and almost no free architecture choices.",
    trigger: [{ metric: "computeSupply", op: ">=", value: 80 }],
  },
  {
    id: "employees-more-than-users",
    name: "Employees More Than Users",
    description: "The org chart scales faster than the funnel.",
    trigger: [
      { metric: "morale", op: "<=", value: 35 },
      { metric: "pmf", op: "<", value: 30 },
    ],
  },
  {
    id: "open-source-backstab-survivor",
    name: "Open-Source Backstab Survivor",
    description: "A cheaper model drops and you somehow do not become a migration guide.",
    trigger: [
      { metric: "modelPower", op: ">=", value: 55 },
      { metric: "productQuality", op: ">=", value: 50 },
    ],
  },
] satisfies Achievement[];
