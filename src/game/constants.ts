import type { ActionId, EmployeeRoleId, FactionId, InvestorId, MarketId, MetricId } from "./types";

export const METRIC_IDS: MetricId[] = [
  "cash",
  "runway",
  "arr",
  "mrr",
  "pmf",
  "modelPower",
  "productQuality",
  "computeSupply",
  "computeCost",
  "grossMargin",
  "techDebt",
  "reputation",
  "morale",
  "complianceRisk",
  "globalReadiness",
  "boardPressure",
  "founderHealth",
  "founderEquity",
  "valuation",
  "marketHeat",
];

export const PERCENT_METRICS = new Set<MetricId>([
  "pmf",
  "modelPower",
  "productQuality",
  "computeSupply",
  "computeCost",
  "grossMargin",
  "techDebt",
  "reputation",
  "morale",
  "complianceRisk",
  "globalReadiness",
  "boardPressure",
  "founderHealth",
  "founderEquity",
  "marketHeat",
]);

export const MARKET_IDS: MarketId[] = ["china", "sea", "middle-east", "europe", "us"];

export const ACTION_IDS: ActionId[] = [
  "build-product",
  "train-model",
  "sell",
  "fundraise",
  "hire",
  "retain",
  "govern-compliance",
  "expand-global",
  "pr-launch",
  "cut-costs",
  "publish-paper",
  "buy-compute",
  "open-source-model",
  "security-audit",
  "poach-researcher",
  "pay-tech-debt",
  "prune-bad-customers",
  "buyback-shares",
  "academic-fraud",
  "gray-data-deal",
  "inflate-arr",
];

export const EMPLOYEE_ROLE_IDS: EmployeeRoleId[] = [
  "researcher",
  "engineer",
  "product-manager",
  "sales",
  "compliance",
  "finance",
  "cfo",
  "overseas-bd",
];

export const FACTION_IDS: FactionId[] = [
  "deepduck",
  "openmind",
  "moralmachine",
  "green-furnace",
  "cloudsoft",
  "byteplanet",
  "tencentacle",
  "alicloud-temple",
  "oasis-models",
];

export const INVESTOR_IDS: InvestorId[] = [
  "alice-chen",
  "old-zhou",
  "maya-cloud",
  "victor-furnace",
  "omar-oasis",
  "ms-lin",
  "kevin-founder",
  "grace-ma",
  "leo-banker",
  "nora-open",
  "byteplanet-capital",
  "hard-term-capital",
];

export const EXTRA_COMPANY_ACTION_COST = 750_000;

export function extraCompanyActionCost(employeeCount: number, extraIndex: number): number {
  const growthFactor = Math.max(3, 10 - Math.floor(employeeCount / 3));
  return Math.round(EXTRA_COMPANY_ACTION_COST * growthFactor ** extraIndex);
}

export function totalExtraCompanyActionCost(employeeCount: number, extraCount: number): number {
  return Array.from({ length: extraCount }).reduce<number>(
    (total, _item, index) => total + extraCompanyActionCost(employeeCount, index),
    0,
  );
}
