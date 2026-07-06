import { describe, expect, it } from "vitest";
import {
  ACTION_IDS,
  EMPLOYEE_ROLE_IDS,
  FACTION_IDS,
  INVESTOR_IDS,
  MARKET_IDS,
  METRIC_IDS,
} from "../../src/game/constants";

function expectExactDuplicateFreeIds(actual: string[], expected: string[]): void {
  expect(actual).toEqual(expected);
  expect(new Set(actual).size).toBe(actual.length);
}

describe("game constants", () => {
  it("defines exact duplicate-free metric ids", () => {
    expectExactDuplicateFreeIds(METRIC_IDS, [
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
    ]);
  });

  it("defines exact duplicate-free market ids", () => {
    expectExactDuplicateFreeIds(MARKET_IDS, ["china", "sea", "middle-east", "europe", "us"]);
  });

  it("defines exact duplicate-free action ids", () => {
    expectExactDuplicateFreeIds(ACTION_IDS, [
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
      "academic-fraud",
      "gray-data-deal",
      "inflate-arr",
    ]);
  });

  it("defines exact duplicate-free employee role ids", () => {
    expectExactDuplicateFreeIds(EMPLOYEE_ROLE_IDS, [
      "researcher",
      "engineer",
      "product-manager",
      "sales",
      "compliance",
      "finance",
      "cfo",
      "overseas-bd",
    ]);
  });

  it("defines exact duplicate-free faction ids", () => {
    expectExactDuplicateFreeIds(FACTION_IDS, [
      "deepduck",
      "openmind",
      "moralmachine",
      "green-furnace",
      "cloudsoft",
      "byteplanet",
      "tencentacle",
      "alicloud-temple",
      "oasis-models",
    ]);
  });

  it("defines exact duplicate-free investor ids", () => {
    expectExactDuplicateFreeIds(INVESTOR_IDS, [
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
    ]);
  });
});
