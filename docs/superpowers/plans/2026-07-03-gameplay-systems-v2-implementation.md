# Gameplay Systems V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 AI 创业模拟器升级为“开局差异明确、季度决策更密、数据逻辑可解释、成就和榜单更有追求”的完整可玩版本。

**Architecture:** 规则逻辑放在 `src/game/engine/*`，配置数据放在 `src/game/data/*`，React 组件只负责选择、展示和调用引擎。先扩展类型和纯函数，再接入季度推进，最后补 UI、文档和整体验证。

**Tech Stack:** TypeScript, React 19, Vite, Vitest, Testing Library, lucide-react。

---

## File Structure

- Modify: `src/game/types.ts`
  - 扩展开局预设、动作分类、创始人动作、季度提交结构、排行榜分类、员工单人操作类型。
- Modify: `src/game/data/founderProfiles.ts`
  - 让创业身份、赛道、属性预设都能影响属性和初始指标；移除固定 24 点限制。
- Create: `src/game/engine/founderStart.ts`
  - 提供 `deriveFounderAttributes()`、`deriveFounderMetricEffects()`、`attributeTotal()`。
- Modify: `src/game/engine/createGame.ts`
  - 应用身份、赛道、预设三层开局效果。
- Modify: `src/game/data/actions.ts`
  - 将公司动作改成带分类、风险、成本、效率权重、可见效果摘要的数据结构。
- Create: `src/game/data/founderActions.ts`
  - 定义创始人季度动作，例如深度工作、路演社交、度假、心理咨询、公开演讲。
- Create: `src/game/engine/actionEffects.ts`
  - 计算动作预览和实际效果，统一处理属性、PMF、ARR、士气、风险对效率的影响。
- Modify: `src/game/engine/actions.ts`
  - 改为调用 `actionEffects`，保留 `applyAction(game, id)` 对旧测试兼容。
- Modify: `src/game/engine/employeeOperations.ts`
  - 新增 `applyEmployeeOperationToEmployee()`，员工操作变为每名员工 0 或 1 次。
- Modify: `src/game/engine/turn.ts`
  - 支持 `TurnSubmission`：2 个公司动作、可购买额外公司动作、1 个创始人动作、每员工操作。
- Modify: `src/game/engine/events.ts`
  - 增加高概率触发门控、风险加权、确定性随机。
- Modify: `src/game/data/events.ts`
  - 增补与造假、全球化、团队、巨头、融资相关事件。
- Modify: `src/game/data/achievements.ts`
  - 扩充到至少 45 个成就，其中隐藏成就至少 15 个。
- Modify: `src/game/data/endings.ts`
  - 让美股 IPO、港股 IPO、现金流冠军、落魄结局的条件更完整。
- Modify: `src/game/engine/leaderboard.ts`
  - 支持综合、模型能力、商业化、全球化四类榜单、玩家入榜阈值、公司详情。
- Modify: `src/game/ui/CreateFounder.tsx`
  - 中文热血玩法说明；展示身份、赛道、预设的属性和指标影响；不再要求 24 点。
- Modify: `src/game/ui/ActionPanel.tsx`
  - 展示动作具体增益、成本、风险；支持花现金购买额外动作。
- Modify: `src/game/ui/EmployeeOperationPanel.tsx`
  - 每名员工独立选择操作，操作非必选。
- Modify: `src/game/ui/Dashboard.tsx`
  - 给关键 English 指标提供明显 hover/focus 解释。
- Modify: `src/game/ui/LeaderboardPanel.tsx`
  - 增加榜单分类切换和公司详情抽屉/面板。
- Modify: `src/game/ui/AchievementsModal.tsx`
  - 显示全部成就解锁状态；隐藏成就显示名字，条件显示 `???`。
- Modify: `src/App.tsx`
  - 保存新的季度选择状态，调用新 `advanceGameTurn()`。
- Modify: `src/styles.css`
  - 配合新控件、排行榜详情、tooltip、动作摘要和 SpaceX 风格视觉。
- Create: `docs/US_IPO_ONEPAGE.md`
  - 写一条可复现的美股上市路线，包括开局、每阶段目标、关键动作和结局条件。
- Modify/Create tests under `tests/game/*.test.ts`
  - 覆盖新开局、新动作效率、新季度推进、事件概率、成就规模、榜单规则。
- Modify: `src/App.test.tsx`
  - 覆盖开局页、动作摘要、成就按钮、员工非必选操作等核心 UI。

---

## Task 1: Startup Profile Contract

**Files:**
- Modify: `src/game/types.ts`
- Modify: `src/game/data/founderProfiles.ts`
- Create: `src/game/engine/founderStart.ts`
- Modify: `src/game/engine/createGame.ts`
- Test: `tests/game/createGame.test.ts`

- [ ] **Step 1: Write the failing tests**

Add these cases to `tests/game/createGame.test.ts`:

```ts
it("combines background, track, and preset into final founder attributes", () => {
  const researcherModel = createNewGame({
    seed: 42,
    founderName: "沈一",
    backgroundId: "former-llm-researcher",
    trackId: "foundation-model",
    presetId: "researcher",
  });
  const salesAgent = createNewGame({
    seed: 42,
    founderName: "沈一",
    backgroundId: "ex-bigtech-pm",
    trackId: "local-life-agent",
    presetId: "rainmaker",
  });

  expect(researcherModel.founder.attributes.tech).toBeGreaterThan(salesAgent.founder.attributes.tech);
  expect(salesAgent.founder.attributes.sales).toBeGreaterThan(researcherModel.founder.attributes.sales);
  expect(researcherModel.metrics.modelPower).toBeGreaterThan(salesAgent.metrics.modelPower);
  expect(salesAgent.metrics.mrr).toBeGreaterThan(researcherModel.metrics.mrr);
});

it("allows strong starts above the old 24 point total", () => {
  const game = createNewGame({
    seed: 42,
    founderName: "超配创始人",
    backgroundId: "serial-founder",
    trackId: "finance-ai",
    presetId: "rainmaker",
  });
  const total = Object.values(game.founder.attributes).reduce((sum, value) => sum + value, 0);

  expect(total).toBeGreaterThan(24);
  expect(game.metrics.arr).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/game/createGame.test.ts
```

Expected: FAIL because `NewGameInput` has no `presetId` and no three-layer profile derivation exists.

- [ ] **Step 3: Extend the type contract**

In `src/game/types.ts`, replace `NewGameInput` with this shape and add the preset id type near `BackgroundId` and `TrackId`:

```ts
export type AttributePresetId = "operator" | "researcher" | "rainmaker" | "global";

export interface NewGameInput {
  seed: number;
  founderName: string;
  backgroundId: BackgroundId;
  trackId: TrackId;
  presetId?: AttributePresetId;
  attributes?: FounderAttributes;
}
```

The optional `presetId` keeps current call sites compiling while the start UI is migrated; `createNewGame()` defaults it to `operator`. The optional `attributes` keeps custom slider support without requiring the UI to own profile math.

- [ ] **Step 4: Add attribute and metric effects to profiles**

In `src/game/data/founderProfiles.ts`, add this helper contract after `FounderBackgroundProfile`:

```ts
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
```

Then update each track with `attributeEffects`. Use this mapping:

```ts
foundation-model: tech +2, fundraising +1, stamina -1
ai-agent: product influence through sales +1, management +1, tech +1
ai-coding: tech +1, sales +1, stamina +1
enterprise-knowledge: sales +1, management +1, ethics +1
ai-education: sales +1, ethics +1, hype +1
ai-companion: hype +2, ethics -1, stamina +1
ai-hardware: management +2, stamina +1, luck -1
ai-security: ethics +2, tech +1, hype -1
medical-ai: ethics +2, management +1, stamina -1
finance-ai: sales +1, fundraising +1, ethics +1
manufacturing-ai: management +2, sales +1, hype -1
local-life-agent: sales +2, management +1, tech -1
```

Change `attributePresets` to `AttributePresetProfile[]` and give each preset both attribute and metric effects:

```ts
operator: management +2, sales +1, stamina +1; pmf +2, morale +3
researcher: tech +3, ethics +1, sales -1; modelPower +5, reputation +2
rainmaker: fundraising +3, hype +2, ethics -1; valuation +3000000, marketHeat +5, boardPressure +2
global: globalReadiness +6 through metricEffects; tech +1, stamina +1, ethics +1, sales +1
```

- [ ] **Step 5: Create founder start engine**

Create `src/game/engine/founderStart.ts`:

```ts
import {
  ATTRIBUTE_IDS,
  attributePresets,
  findBackgroundProfile,
  findTrackProfile,
  type AttributeEffect,
} from "../data/founderProfiles";
import type { AttributePresetId, FounderAttributes, MetricEffect, NewGameInput } from "../types";

function applyAttributeEffects(attributes: FounderAttributes, effects: AttributeEffect[]): FounderAttributes {
  return effects.reduce(
    (next, effect) => ({
      ...next,
      [effect.attribute]: Math.max(1, Math.min(10, next[effect.attribute] + effect.delta)),
    }),
    attributes,
  );
}

export function findAttributePreset(id: AttributePresetId) {
  return attributePresets.find((preset) => preset.id === id);
}

export function deriveFounderAttributes(input: NewGameInput): FounderAttributes {
  if (input.attributes) return input.attributes;
  const background = findBackgroundProfile(input.backgroundId);
  const track = findTrackProfile(input.trackId);
  const preset = findAttributePreset(input.presetId ?? "operator");
  const base = background?.attributes ?? Object.fromEntries(ATTRIBUTE_IDS.map((id) => [id, 3])) as FounderAttributes;
  return applyAttributeEffects(applyAttributeEffects(base, track?.attributeEffects ?? []), preset?.attributeEffects ?? []);
}

export function deriveFounderMetricEffects(input: NewGameInput): MetricEffect[] {
  const background = findBackgroundProfile(input.backgroundId);
  const track = findTrackProfile(input.trackId);
  const preset = findAttributePreset(input.presetId ?? "operator");
  return [...(background?.metricEffects ?? []), ...(track?.metricEffects ?? []), ...(preset?.metricEffects ?? [])];
}

export function attributeTotal(attributes: FounderAttributes): number {
  return Object.values(attributes).reduce((total, value) => total + value, 0);
}
```

- [ ] **Step 6: Apply derived profiles in createGame**

In `src/game/engine/createGame.ts`, replace `createProfiledMetrics()` with:

```ts
function createProfiledMetrics(input: NewGameInput): CompanyMetrics {
  return applyEffects(createInitialMetrics(), deriveFounderMetricEffects(input));
}
```

Import `deriveFounderAttributes` and `deriveFounderMetricEffects`, and set founder attributes like this:

```ts
const attributes = deriveFounderAttributes(input);

founder: {
  name: input.founderName,
  backgroundId: input.backgroundId,
  trackId: input.trackId,
  attributes,
},
```

- [ ] **Step 7: Run tests and commit**

Run:

```bash
npm test -- tests/game/createGame.test.ts
npm test -- tests/game/constants.test.ts tests/game/validation.test.ts
```

Expected: PASS.

Commit:

```bash
git add src/game/types.ts src/game/data/founderProfiles.ts src/game/engine/founderStart.ts src/game/engine/createGame.ts tests/game/createGame.test.ts
git commit -m "feat: derive founder starts from identity track and preset"
```

---

## Task 2: Action Effect Engine

**Files:**
- Modify: `src/game/types.ts`
- Modify: `src/game/data/actions.ts`
- Create: `src/game/engine/actionEffects.ts`
- Modify: `src/game/engine/actions.ts`
- Test: `tests/game/actions.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/game/actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { applyAction } from "../../src/game/engine/actions";
import { calculateActionPreview } from "../../src/game/engine/actionEffects";

function gameWith(attrs = {}) {
  const game = createNewGame({
    seed: 77,
    founderName: "动作测试",
    backgroundId: "former-llm-researcher",
    trackId: "foundation-model",
    presetId: "researcher",
  });
  return {
    ...game,
    founder: { ...game.founder, attributes: { ...game.founder.attributes, ...attrs } },
  };
}

describe("actionEffects", () => {
  it("makes research actions scale with tech and model context", () => {
    const weak = calculateActionPreview(gameWith({ tech: 2 }), "train-model");
    const strong = calculateActionPreview(gameWith({ tech: 9 }), "train-model");

    expect(strong.effects.find((effect) => effect.metric === "modelPower")?.delta).toBeGreaterThan(
      weak.effects.find((effect) => effect.metric === "modelPower")?.delta ?? 0,
    );
    expect(strong.summary.join(" ")).toContain("模型能力");
  });

  it("keeps cash costs from being amplified as positive efficiency", () => {
    const preview = calculateActionPreview(gameWith({ tech: 9 }), "train-model");

    expect(preview.effects.find((effect) => effect.metric === "cash")?.delta).toBe(-500_000);
  });

  it("applies risky shortcuts with upside and compliance risk", () => {
    const next = applyAction(gameWith({ hype: 8, ethics: 2 }), "academic-fraud");

    expect(next.metrics.reputation).toBeGreaterThan(gameWith().metrics.reputation);
    expect(next.metrics.complianceRisk).toBeGreaterThan(gameWith().metrics.complianceRisk);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/game/actions.test.ts
```

Expected: FAIL because `calculateActionPreview()` and new action ids do not exist.

- [ ] **Step 3: Expand action types**

In `src/game/types.ts`, extend `ActionId`:

```ts
export type ActionId =
  | "build-product"
  | "train-model"
  | "sell"
  | "fundraise"
  | "hire"
  | "retain"
  | "govern-compliance"
  | "expand-global"
  | "pr-launch"
  | "cut-costs"
  | "publish-paper"
  | "buy-compute"
  | "open-source-model"
  | "security-audit"
  | "poach-researcher"
  | "academic-fraud"
  | "gray-data-deal"
  | "inflate-arr";

export type ActionCategory = "research" | "product" | "commercial" | "finance" | "people" | "global" | "risk";

export interface ActionEfficiencyRule {
  attributes?: Partial<Record<FounderAttributeId, number>>;
  metrics?: Partial<Record<MetricId, number>>;
}

export interface PlayerAction extends NamedContent<ActionId> {
  category: ActionCategory;
  risk: "low" | "medium" | "high" | "extreme";
  effects: MetricEffect[];
  healthCost: number;
  efficiency: ActionEfficiencyRule;
  visibleSummary: string[];
}

export interface ActionPreview {
  actionId: ActionId;
  efficiencyMultiplier: number;
  effects: MetricEffect[];
  summary: string[];
}
```

- [ ] **Step 4: Update action data**

In `src/game/data/actions.ts`, keep existing action ids but add the new fields and actions. Use these minimum visible summaries:

```ts
"build-product": ["产品质量↑", "PMF↑", "技术债↑"]
"train-model": ["模型能力↑", "算力成本↑", "现金↓"]
"sell": ["MRR↑", "ARR↑", "士气小幅↓"]
"fundraise": ["现金↑", "估值↑", "创始人股权↓", "董事会压力↑"]
"hire": ["新增员工", "Runway↓", "能力池↑"]
"retain": ["士气↑", "现金↓", "股权小幅↓"]
"govern-compliance": ["合规风险↓", "全球化准备↑", "推进速度小幅↓"]
"expand-global": ["全球化准备↑", "ARR↑", "合规风险↑"]
"pr-launch": ["声誉↑", "市场热度↑", "董事会压力↑"]
"cut-costs": ["Runway↑", "现金↑", "士气↓"]
"publish-paper": ["模型能力↑", "声誉↑", "PMF小幅↓"]
"buy-compute": ["算力供给↑", "现金↓", "算力成本↓"]
"open-source-model": ["声誉↑", "模型能力↑", "商业化承压"]
"security-audit": ["合规风险↓", "声誉↑", "现金↓"]
"poach-researcher": ["模型能力↑", "现金↓", "士气风险↑"]
"academic-fraud": ["声誉短期↑", "融资叙事↑", "合规风险大幅↑"]
"gray-data-deal": ["模型能力↑", "现金↓", "合规风险↑"]
"inflate-arr": ["ARR表面↑", "估值↑", "审计风险↑"]
```

Give each action `efficiency.attributes` that matches its intent:

```ts
train-model: tech 0.13, stamina 0.04
sell: sales 0.12, hype 0.05
fundraise: fundraising 0.14, hype 0.08, luck 0.04
build-product: tech 0.06, management 0.06, sales 0.04
govern-compliance: ethics 0.12, management 0.06
expand-global: sales 0.06, management 0.06, stamina 0.04
academic-fraud: hype 0.15, ethics -0.12, luck 0.05
```

- [ ] **Step 5: Create effect calculator**

Create `src/game/engine/actionEffects.ts`:

```ts
import { actions } from "../data/actions";
import type { ActionId, ActionPreview, GameState, MetricEffect, PlayerAction } from "../types";
import { applyMetricDelta } from "./clamp";

const PERCENT_METRICS = new Set(["pmf", "modelPower", "productQuality", "computeSupply", "grossMargin", "techDebt", "reputation", "morale", "complianceRisk", "globalReadiness", "boardPressure", "founderHealth", "founderEquity", "marketHeat"]);

export function findAction(actionId: ActionId): PlayerAction {
  const action = actions.find((item) => item.id === actionId);
  if (!action) throw new Error(`Unknown action: ${actionId}`);
  return action;
}

function efficiencyMultiplier(game: GameState, action: PlayerAction): number {
  const attributeBonus = Object.entries(action.efficiency.attributes ?? {}).reduce((total, [id, weight]) => {
    const value = game.founder.attributes[id as keyof typeof game.founder.attributes];
    return total + (value - 3) * (weight ?? 0);
  }, 0);
  const metricBonus = Object.entries(action.efficiency.metrics ?? {}).reduce((total, [id, weight]) => {
    const value = game.metrics[id as keyof typeof game.metrics];
    return total + ((value - 50) / 50) * (weight ?? 0);
  }, 0);
  const moralePenalty = game.metrics.morale < 35 ? -0.12 : 0;
  const healthPenalty = game.metrics.founderHealth < 30 ? -0.1 : 0;
  return Number(Math.max(0.55, Math.min(1.85, 1 + attributeBonus + metricBonus + moralePenalty + healthPenalty)).toFixed(2));
}

function scaleEffect(effect: MetricEffect, multiplier: number): MetricEffect {
  if (effect.delta <= 0) return effect;
  if (effect.metric === "cash") return effect;
  const scaled = PERCENT_METRICS.has(effect.metric)
    ? Math.round(effect.delta * multiplier)
    : Math.round(effect.delta * multiplier);
  return { ...effect, delta: scaled };
}

export function calculateActionPreview(game: GameState, actionId: ActionId): ActionPreview {
  const action = findAction(actionId);
  const multiplier = efficiencyMultiplier(game, action);
  const effects = [...action.effects, { metric: "founderHealth", delta: -action.healthCost }].map((effect) =>
    scaleEffect(effect, multiplier),
  );
  return {
    actionId,
    efficiencyMultiplier: multiplier,
    effects,
    summary: action.visibleSummary,
  };
}

export function applyActionEffects(game: GameState, actionId: ActionId): GameState {
  const preview = calculateActionPreview(game, actionId);
  const action = findAction(actionId);
  return {
    ...game,
    metrics: preview.effects.reduce(
      (metrics, effect) => applyMetricDelta(metrics, effect.metric, effect.delta),
      game.metrics,
    ),
    log: [...game.log, `执行行动：${action.name}（效率 x${preview.efficiencyMultiplier}）`],
  };
}
```

- [ ] **Step 6: Wire actions engine**

In `src/game/engine/actions.ts`, reduce it to:

```ts
import type { ActionId, GameState } from "../types";
import { applyActionEffects } from "./actionEffects";

export function applyAction(game: GameState, action: ActionId): GameState {
  return applyActionEffects(game, action);
}
```

- [ ] **Step 7: Replace brittle turn expectations**

In `tests/game/turn.test.ts`, replace the exact metric assertions in `matches App semantics for a combined fundraise and hire turn` with relational assertions:

```ts
const game = createTurnGame();
const next = advanceGameTurn(game, ["fundraise", "hire"]);

expect(next.year).toBe(2026);
expect(next.quarter).toBe(2);
expect(next.employees).toHaveLength(1);
expect(next.employees[0].role).toBe("researcher");
expect(next.metrics.cash).toBeGreaterThan(game.metrics.cash);
expect(next.metrics.founderEquity).toBeLessThan(game.metrics.founderEquity);
expect(next.metrics.founderHealth).toBeLessThan(game.metrics.founderHealth);
expect(next.metrics.boardPressure).toBeGreaterThan(game.metrics.boardPressure);
```

- [ ] **Step 8: Run tests and commit**

Run:

```bash
npm test -- tests/game/actions.test.ts tests/game/turn.test.ts
```

Expected: PASS.

Commit:

```bash
git add src/game/types.ts src/game/data/actions.ts src/game/engine/actionEffects.ts src/game/engine/actions.ts tests/game/actions.test.ts tests/game/turn.test.ts
git commit -m "feat: add attribute-scaled action effects"
```

---

## Task 3: Founder Actions And Dense Quarter Submission

**Files:**
- Modify: `src/game/types.ts`
- Create: `src/game/data/founderActions.ts`
- Create: `src/game/engine/founderActions.ts`
- Modify: `src/game/engine/employeeOperations.ts`
- Modify: `src/game/engine/advance.ts`
- Modify: `src/game/engine/turn.ts`
- Test: `tests/game/turn.test.ts`
- Test: `tests/game/employeeOperations.test.ts`

- [ ] **Step 1: Write failing quarter tests**

Add to `tests/game/turn.test.ts`:

```ts
it("supports two company actions plus a paid extra action and founder action", () => {
  const game = createTurnGame();
  const next = advanceGameTurn(game, {
    companyActions: ["build-product", "sell"],
    extraCompanyAction: "train-model",
    founderAction: "take-vacation",
    employeeOperations: [],
  });

  expect(next.quarter).toBe(2);
  expect(next.metrics.cash).toBeLessThan(game.metrics.cash);
  expect(next.metrics.productQuality).toBeGreaterThan(game.metrics.productQuality);
  expect(next.metrics.founderHealth).toBeGreaterThanOrEqual(game.metrics.founderHealth - 4);
  expect(next.log.join(" ")).toContain("额外公司动作");
  expect(next.log.join(" ")).toContain("创始人动作");
});

it("keeps employee operations optional", () => {
  const hired = advanceGameTurn(createTurnGame(), { companyActions: ["hire", "build-product"], employeeOperations: [] });
  const next = advanceGameTurn(hired, { companyActions: ["sell", "build-product"], employeeOperations: [] });

  expect(next.employees).toHaveLength(1);
  expect(next.quarter).toBe(3);
});
```

- [ ] **Step 2: Write failing per-employee tests**

Add to `tests/game/employeeOperations.test.ts`:

```ts
it("applies operations to the selected employee only", () => {
  const one = advanceGameTurn(createTurnGame(), { companyActions: ["hire", "build-product"], employeeOperations: [] });
  const two = advanceGameTurn(one, { companyActions: ["hire", "sell"], employeeOperations: [] });
  const first = two.employees[0];
  const second = two.employees[1];

  const next = advanceGameTurn(two, {
    companyActions: ["sell", "build-product"],
    employeeOperations: [{ employeeId: first.id, operationId: "vacation" }],
  });

  expect(next.employees.find((employee) => employee.id === first.id)?.fatigue).toBeLessThan(first.fatigue);
  expect(next.employees.find((employee) => employee.id === second.id)?.fatigue).toBe(second.fatigue);
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
npm test -- tests/game/turn.test.ts tests/game/employeeOperations.test.ts
```

Expected: FAIL because `advanceGameTurn()` still expects an `ActionId[]` and one global employee operation.

- [ ] **Step 4: Add turn and founder action types**

In `src/game/types.ts`, add:

```ts
export type FounderActionId =
  | "deep-work"
  | "investor-dinner"
  | "customer-roadtrip"
  | "take-vacation"
  | "public-thread"
  | "therapy";

export interface FounderAction extends NamedContent<FounderActionId> {
  effects: MetricEffect[];
  attributeEffects: Partial<Record<FounderAttributeId, number>>;
}

export interface EmployeeOperationAssignment {
  employeeId: string;
  operationId: EmployeeOperationId;
}

export interface TurnSubmission {
  companyActions: ActionId[];
  extraCompanyAction?: ActionId | null;
  founderAction?: FounderActionId | null;
  employeeOperations?: EmployeeOperationAssignment[];
}
```

- [ ] **Step 5: Create founder actions**

Create `src/game/data/founderActions.ts`:

```ts
import type { FounderAction } from "../types";

export const founderActions = [
  {
    id: "deep-work",
    name: "闭关深度工作",
    description: "创始人亲自啃最硬的技术债。",
    effects: [{ metric: "productQuality", delta: 2 }, { metric: "techDebt", delta: -2 }, { metric: "founderHealth", delta: -5 }],
    attributeEffects: { tech: 0.2, stamina: -0.1 },
  },
  {
    id: "investor-dinner",
    name: "投资人饭局",
    description: "用晚饭交换下一轮的可能性和胃酸。",
    effects: [{ metric: "marketHeat", delta: 3 }, { metric: "boardPressure", delta: 2 }, { metric: "founderHealth", delta: -3 }],
    attributeEffects: { fundraising: 0.2, hype: 0.1 },
  },
  {
    id: "customer-roadtrip",
    name: "客户一线拜访",
    description: "把路线图从会议室拖到真实工位上。",
    effects: [{ metric: "pmf", delta: 3 }, { metric: "mrr", delta: 30_000 }, { metric: "founderHealth", delta: -4 }],
    attributeEffects: { sales: 0.2, management: 0.1 },
  },
  {
    id: "take-vacation",
    name: "强制休假",
    description: "不解决增长，但解决创始人快没了的问题。",
    effects: [{ metric: "founderHealth", delta: 12 }, { metric: "morale", delta: 2 }, { metric: "boardPressure", delta: 1 }],
    attributeEffects: { stamina: 0.1 },
  },
  {
    id: "public-thread",
    name: "公开长文造势",
    description: "把复杂问题写成所有人都想转发的判断句。",
    effects: [{ metric: "reputation", delta: 4 }, { metric: "marketHeat", delta: 3 }, { metric: "founderHealth", delta: -2 }],
    attributeEffects: { hype: 0.2 },
  },
  {
    id: "therapy",
    name: "心理咨询",
    description: "承认自己不是无限算力。",
    effects: [{ metric: "founderHealth", delta: 8 }, { metric: "morale", delta: 1 }, { metric: "cash", delta: -30_000 }],
    attributeEffects: { management: 0.1, ethics: 0.1 },
  },
] satisfies FounderAction[];
```

- [ ] **Step 6: Implement founder action engine**

Create `src/game/engine/founderActions.ts`:

```ts
import { founderActions } from "../data/founderActions";
import type { FounderActionId, FounderAttributes, GameState } from "../types";
import { applyMetricDelta } from "./clamp";

function clampAttribute(value: number): number {
  return Math.max(1, Math.min(10, Number(value.toFixed(1))));
}

function applyAttributeDelta(attributes: FounderAttributes, key: keyof FounderAttributes, delta: number): FounderAttributes {
  return { ...attributes, [key]: clampAttribute(attributes[key] + delta) };
}

export function applyFounderAction(game: GameState, actionId: FounderActionId): GameState {
  const action = founderActions.find((item) => item.id === actionId);
  if (!action) return game;
  const metrics = action.effects.reduce((next, effect) => applyMetricDelta(next, effect.metric, effect.delta), game.metrics);
  const attributes = Object.entries(action.attributeEffects).reduce(
    (next, [key, delta]) => applyAttributeDelta(next, key as keyof FounderAttributes, delta ?? 0),
    game.founder.attributes,
  );
  return {
    ...game,
    metrics,
    founder: { ...game.founder, attributes },
    log: [...game.log, `创始人动作：${action.name}`],
  };
}
```

- [ ] **Step 7: Implement per-employee operation entrypoint**

In `src/game/engine/employeeOperations.ts`, keep `applyEmployeeOperation()` for compatibility and add:

```ts
export function applyEmployeeOperationToEmployee(
  game: GameState,
  employeeId: string,
  operationId: EmployeeOperationId,
): GameState {
  const target = game.employees.find((employee) => employee.id === employeeId);
  if (!target) return game;

  if (operationId === "raise-salary") {
    return appendLog(retainEmployee(game, target.id, "raise-salary"), `员工操作：给 ${target.name} 加薪留人。`);
  }

  if (operationId === "refresh-options") {
    const retained = retainEmployee(game, target.id, "refresh-options");
    return appendLog(
      applyEffects(retained, [{ metric: "founderEquity", delta: -1 }, { metric: "boardPressure", delta: 1 }]),
      `员工操作：给 ${target.name} 刷新期权池。`,
    );
  }

  if (operationId === "vacation") {
    const retained = retainEmployee(game, target.id, "vacation");
    return appendLog(
      applyEffects(retained, [{ metric: "morale", delta: 2 }, { metric: "productQuality", delta: -1 }]),
      `员工操作：让 ${target.name} 放假修整。`,
    );
  }

  if (operationId === "layoff") {
    return appendLog(
      applyEffects(
        { ...game, employees: game.employees.filter((employee) => employee.id !== target.id) },
        [{ metric: "cash", delta: Math.round(target.salary * 0.35) }, { metric: "runway", delta: 1 }, { metric: "morale", delta: -8 }, { metric: "reputation", delta: -4 }],
      ),
      `员工操作：裁掉 ${target.name} 止血。`,
    );
  }

  return appendLog(
    applyEffects(
      updateEmployee(game, target.id, (employee) => ({
        ...employee,
        fatigue: clampPercent(employee.fatigue + 18),
        loyalty: clampPercent(employee.loyalty - 12),
        ambition: clampPercent(employee.ambition + 5),
      })),
      [{ metric: "productQuality", delta: 3 }, { metric: "modelPower", delta: 2 }, { metric: "morale", delta: 1 }, { metric: "founderHealth", delta: -4 }],
    ),
    `员工操作：对 ${target.name} 进行 PUA 激励。`,
  );
}
```

- [ ] **Step 8: Update turn engine**

In `src/game/engine/turn.ts`, add a normalizer:

```ts
const EXTRA_ACTION_COST = 750_000;

function normalizeTurnSubmission(
  input: ActionId[] | TurnSubmission,
  employeeOperationId?: EmployeeOperationId,
): TurnSubmission {
  if (Array.isArray(input)) {
    return { companyActions: input, employeeOperations: [] };
  }
  return input;
}
```

Then make `advanceGameTurn()` signature:

```ts
export function advanceGameTurn(
  game: GameState,
  input: ActionId[] | TurnSubmission,
  employeeOperationId?: EmployeeOperationId,
): GameState
```

In `src/game/engine/advance.ts`, export a clock-only helper and keep `advanceQuarter()` compatible:

```ts
export function advanceQuarterClock(game: GameState): GameState {
  const period = nextQuarter(game.year, game.quarter);
  return {
    ...game,
    year: period.year,
    quarter: period.quarter,
  };
}

export function advanceQuarter(game: GameState, actions: ActionId[]): GameState {
  const selected = actions.slice(0, 2);
  let next: GameState = {
    ...game,
    metrics: { ...game.metrics },
    log: [...game.log],
  };

  for (const action of selected) {
    next = applyAction(next, action);
  }

  return advanceQuarterClock(next);
}
```

In `src/game/engine/turn.ts`, create a helper that applies company actions without changing `year` or `quarter`:

```ts
function applyCompanyActions(game: GameState, actions: ActionId[]): GameState {
  const includesFundraise = actions.includes("fundraise");
  const genericActions = actions.filter((id) => id !== "fundraise");
  let next = genericActions.reduce((current, actionId) => applyAction(current, actionId), game);
  if (actions.includes("hire")) {
    const role = EMPLOYEE_ROLE_IDS[next.employees.length % EMPLOYEE_ROLE_IDS.length];
    next = hireEmployee(next, role);
  }
  if (includesFundraise) {
    next = executeFundraise(next);
  }
  return next;
}
```

Use this processing order inside `advanceGameTurn()`:

```ts
const submission = normalizeTurnSubmission(input, employeeOperationId);
const companyActions = submission.companyActions.slice(0, 2);
const paidExtra = submission.extraCompanyAction;
let next = applyCompanyActions(game, companyActions);
if (paidExtra) {
  next = { ...next, metrics: applyMetricDelta(next.metrics, "cash", -EXTRA_ACTION_COST), log: [...next.log, "购买额外公司动作：现金 -75 万。"] };
  next = applyCompanyActions(next, [paidExtra]);
}
if (submission.founderAction) next = applyFounderAction(next, submission.founderAction);
for (const assignment of submission.employeeOperations ?? []) {
  next = applyEmployeeOperationToEmployee(next, assignment.employeeId, assignment.operationId);
}
next = advanceQuarterClock(next);
```

Import `advanceQuarterClock` from `src/game/engine/advance.ts`. The final quarter clock must move exactly once per submitted turn.

- [ ] **Step 9: Run tests and commit**

Run:

```bash
npm test -- tests/game/turn.test.ts tests/game/employeeOperations.test.ts
```

Expected: PASS.

Commit:

```bash
git add src/game/types.ts src/game/data/founderActions.ts src/game/engine/founderActions.ts src/game/engine/employeeOperations.ts src/game/engine/advance.ts src/game/engine/turn.ts tests/game/turn.test.ts tests/game/employeeOperations.test.ts
git commit -m "feat: add founder and per-employee quarter actions"
```

---

## Task 4: High-Frequency Events

**Files:**
- Modify: `src/game/engine/events.ts`
- Modify: `src/game/data/events.ts`
- Test: `tests/game/events.test.ts`

- [ ] **Step 1: Write failing event probability tests**

Add to `tests/game/events.test.ts`:

```ts
it("exposes a high trigger chance when risk and heat are high", () => {
  const game = gameWithMetrics({ marketHeat: 82, complianceRisk: 70, boardPressure: 55, founderHealth: 35 });

  expect(calculateEventChance(game)).toBeGreaterThanOrEqual(0.75);
});

it("can deterministically skip or trigger an eligible event by quarter", () => {
  const game = gameWithMetrics({ valuation: 25_000_000, arr: 800_000, reputation: 40, marketHeat: 70 });
  const first = shouldTriggerEvent(game);
  const second = shouldTriggerEvent({ ...game, quarter: 2 });

  expect(typeof first).toBe("boolean");
  expect([first, second]).toContain(true);
});

it("keeps event selection null when chance gate fails", () => {
  const quiet = gameWithMetrics({ marketHeat: 30, complianceRisk: 5, boardPressure: 0, founderHealth: 90 });
  const event = pickNextEvent({ ...quiet, seed: 9999 });

  expect(event === null || getEligibleEvents(quiet).map((item) => item.id).includes(event.id)).toBe(true);
});
```

Import `calculateEventChance` and `shouldTriggerEvent` from `events.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/game/events.test.ts
```

Expected: FAIL because event chance helpers do not exist.

- [ ] **Step 3: Add deterministic chance gate**

In `src/game/engine/events.ts`, add:

```ts
function quarterRoll(game: GameState): number {
  const raw = Math.abs(Math.sin(game.seed * 12.9898 + game.year * 78.233 + game.quarter * 37.719 + game.resolvedEventIds.length * 19.19));
  return raw - Math.floor(raw);
}

export function calculateEventChance(game: GameState): number {
  const riskBonus = game.metrics.complianceRisk >= 60 ? 0.12 : game.metrics.complianceRisk >= 35 ? 0.06 : 0;
  const heatBonus = game.metrics.marketHeat >= 75 ? 0.1 : game.metrics.marketHeat >= 60 ? 0.06 : 0;
  const boardBonus = game.metrics.boardPressure >= 50 ? 0.08 : 0;
  const healthBonus = game.metrics.founderHealth <= 40 ? 0.08 : 0;
  const quietBonus = game.resolvedEventIds.length === 0 ? 0.08 : 0;
  return Math.min(0.88, 0.6 + riskBonus + heatBonus + boardBonus + healthBonus + quietBonus);
}

export function shouldTriggerEvent(game: GameState): boolean {
  if (game.endingId) return false;
  return quarterRoll(game) <= calculateEventChance(game);
}
```

Change `pickNextEvent()`:

```ts
if (!shouldTriggerEvent(game)) return null;
```

- [ ] **Step 4: Add more event data**

In `src/game/data/events.ts`, add events with these ids and triggers:

```ts
"audit-finds-inflated-arr": complianceRisk >= 55, arr >= 5000000
"paper-replication-crisis": reputation >= 65, complianceRisk >= 45
"overseas-data-residency": globalReadiness >= 45, arr >= 3000000
"star-researcher-poached": modelPower >= 55, marketHeat >= 65
"gpu-supply-squeeze": computeCost >= 40
"enterprise-security-review": arr >= 2000000, complianceRisk >= 30
"founder-burnout-rumor": founderHealth <= 35
"giant-launches-free-agent": pmf <= 45, marketHeat >= 60
```

Each event must have 2 choices, and each choice must apply concrete metric deltas with a log string.

- [ ] **Step 5: Run tests and commit**

Run:

```bash
npm test -- tests/game/events.test.ts
```

Expected: PASS.

Commit:

```bash
git add src/game/engine/events.ts src/game/data/events.ts tests/game/events.test.ts
git commit -m "feat: raise random event pressure"
```

---

## Task 5: Achievements And Endings Expansion

**Files:**
- Modify: `src/game/data/achievements.ts`
- Modify: `src/game/data/endings.ts`
- Modify: `src/game/ui/AchievementsModal.tsx`
- Test: `tests/game/achievements.test.ts`
- Test: `tests/game/endings.test.ts`

- [ ] **Step 1: Write failing achievement scale tests**

Add to `tests/game/achievements.test.ts`:

```ts
it("ships a large achievement set with many hidden goals", () => {
  const hidden = achievements.filter((achievement) => achievement.hiddenCondition);

  expect(achievements.length).toBeGreaterThanOrEqual(45);
  expect(hidden.length).toBeGreaterThanOrEqual(15);
  expect(new Set(achievements.map((achievement) => achievement.id)).size).toBe(achievements.length);
});

it("keeps hidden achievement names visible but conditions secret", () => {
  const hidden = achievements.find((achievement) => achievement.id === "ipo-quiet-period-cultist");

  expect(hidden?.name).toBe("静默期邪教徒");
  expect(hidden?.conditionText).toBe("???");
});
```

- [ ] **Step 2: Write failing US IPO ending test**

Add to `tests/game/endings.test.ts`:

```ts
it("requires global readiness, clean compliance, founder health, and public-scale ARR for US IPO", () => {
  const game = gameWithMetrics({
    arr: 160_000_000,
    globalReadiness: 80,
    complianceRisk: 25,
    founderHealth: 55,
    grossMargin: 58,
    valuation: 2_500_000_000,
  });

  expect(evaluateEnding(game)?.id).toBe("us-ipo");
  expect(evaluateEnding(gameWithMetrics({ arr: 160_000_000, globalReadiness: 80, complianceRisk: 55, founderHealth: 55 }))?.id).not.toBe("us-ipo");
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
npm test -- tests/game/achievements.test.ts tests/game/endings.test.ts
```

Expected: FAIL because achievement counts and IPO conditions are not expanded.

- [ ] **Step 4: Expand achievements**

In `src/game/data/achievements.ts`, append enough entries to reach at least 45. Include these hidden achievements exactly:

```ts
"ipo-quiet-period-cultist": 静默期邪教徒, hidden, valuation >= 2000000000, complianceRisk <= 30
"s1-footnote-survivor": S-1 脚注幸存者, hidden, globalReadiness >= 80, grossMargin >= 55
"fake-it-bill-it": 先造势后收款, hidden, arr >= 20000000, productQuality < 45
"academic-bubble": 学术泡泡, hidden, reputation >= 80, pmf < 35
"gray-dataset-king": 灰色数据之王, hidden, modelPower >= 75, complianceRisk >= 70
"burnout-monk": 燃尽修士, hidden, founderHealth <= 15, runway >= 6
"boardroom-hostage": 董事会人质, hidden, boardPressure >= 90, founderEquity <= 35
"global-paperwork-emperor": 全球文件皇帝, hidden, globalReadiness >= 90, complianceRisk <= 20
"gross-margin-miracle": 毛利奇迹, hidden, grossMargin >= 70, computeCost <= 25
"deepduck-duelist": DeepDuck 决斗者, hidden, modelPower >= 85, reputation >= 75
"pua-productivity-cult": 产能邪教, hidden, morale <= 20, productQuality >= 70
"layoff-speedrun": 裁员速通, hidden, runway >= 18, morale <= 25
"no-sleep-demo-day": 无眠 Demo Day, hidden, founderHealth <= 25, marketHeat >= 80
"paper-unicorn": 纸面独角兽加强版, hidden, valuation >= 1000000000, arr < 10000000
"cashflow-heretic": 现金流异端, hidden, runway >= 30, founderEquity >= 70
```

Visible achievements should cover ARR, MRR, PMF, modelPower, productQuality, globalReadiness, complianceRisk, morale, runway, founderHealth, founderEquity, grossMargin, valuation.

- [ ] **Step 5: Update ending conditions**

In `src/game/data/endings.ts`, update `us-ipo` trigger:

```ts
trigger: [
  { metric: "arr", op: ">=", value: 150_000_000 },
  { metric: "globalReadiness", op: ">=", value: 75 },
  { metric: "complianceRisk", op: "<=", value: 35 },
  { metric: "founderHealth", op: ">", value: 40 },
  { metric: "grossMargin", op: ">=", value: 50 },
  { metric: "valuation", op: ">=", value: 2_000_000_000 },
]
```

Update `hk-ipo` trigger:

```ts
arr >= 80_000_000, complianceRisk <= 40, grossMargin >= 45, valuation >= 800_000_000
```

Add or adjust failure endings so high risk and low health can beat success by priority:

```ts
regulatory-shutdown priority 20, complianceRisk >= 95
founder-health-collapse priority 30, founderHealth <= 0
professional-ceo-replaced-founder priority 65, boardPressure >= 85 and founderEquity <= 25
```

- [ ] **Step 6: Run tests and commit**

Run:

```bash
npm test -- tests/game/achievements.test.ts tests/game/endings.test.ts
```

Expected: PASS.

Commit:

```bash
git add src/game/data/achievements.ts src/game/data/endings.ts src/game/ui/AchievementsModal.tsx tests/game/achievements.test.ts tests/game/endings.test.ts
git commit -m "feat: expand achievements and stricter endings"
```

---

## Task 6: Multi-Category Leaderboard

**Files:**
- Modify: `src/game/types.ts`
- Modify: `src/game/engine/leaderboard.ts`
- Test: `tests/game/leaderboard.test.ts`

- [ ] **Step 1: Write failing leaderboard tests**

Add to `tests/game/leaderboard.test.ts`:

```ts
import { getLeaderboard, getLeaderboardCategories, getLeaderboardCompanyDetail } from "../../src/game/engine/leaderboard";

it("keeps the player outside top rankings until company has enough signal", () => {
  const early = getLeaderboard(gameWithMetrics(), "overall");

  expect(early.rows.some((row) => row.id === "player")).toBe(false);
  expect(early.playerRankLabel).toContain("TOP 50 外");
});

it("supports model, commercial, and global ranking categories", () => {
  expect(getLeaderboardCategories().map((category) => category.id)).toEqual(["overall", "model", "commercial", "global"]);

  const strong = getLeaderboard(
    gameWithMetrics({ arr: 150_000_000, modelPower: 90, productQuality: 80, globalReadiness: 85, reputation: 80, pmf: 75 }),
    "commercial",
  );

  expect(strong.rows.some((row) => row.id === "player")).toBe(true);
});

it("returns company detail for simulated giants and player", () => {
  const game = gameWithMetrics({ arr: 80_000_000, modelPower: 82, globalReadiness: 65 });
  const detail = getLeaderboardCompanyDetail(game, "deepduck");

  expect(detail?.name).toBe("DeepDuck");
  expect(detail?.description).toContain("开源");
  expect(getLeaderboardCompanyDetail(game, "player")?.description).toContain(game.founder.name);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/game/leaderboard.test.ts
```

Expected: FAIL because category functions and player visibility thresholds do not exist.

- [ ] **Step 3: Add leaderboard types**

In `src/game/types.ts`, add:

```ts
export type LeaderboardCategoryId = "overall" | "model" | "commercial" | "global";

export interface LeaderboardCategory {
  id: LeaderboardCategoryId;
  label: string;
  description: string;
}
```

- [ ] **Step 4: Implement category engine**

In `src/game/engine/leaderboard.ts`, export:

```ts
export function getLeaderboardCategories(): LeaderboardCategory[] {
  return [
    { id: "overall", label: "综合", description: "模型、商业化、全球化和声誉的综合排名。" },
    { id: "model", label: "模型能力", description: "前沿能力、算力和技术声誉排名。" },
    { id: "commercial", label: "商业化", description: "ARR、PMF、毛利率和客户质量排名。" },
    { id: "global", label: "全球化", description: "海外准备度、合规和跨境收入潜力排名。" },
  ];
}
```

Change `getLeaderboard(game)` to `getLeaderboard(game, categoryId = "overall")` and return:

```ts
{
  categoryId,
  rows,
  playerScore,
  playerRank,
  playerRankLabel,
}
```

Player rank thresholds:

```ts
score < 55 -> TOP 50 外
55 <= score < 68 -> TOP 50
68 <= score < 78 -> TOP 20
score >= 78 -> can enter visible top 9
```

Visible rows:

```ts
top nine simulated companies sorted by category score;
if playerRank <= 9, include player in sorted visible rows;
if playerRank > 9, do not include player and expose playerRankLabel for UI ellipsis.
```

- [ ] **Step 5: Add company detail**

In `leaderboard.ts`, define competitor details with `description`, `region`, `strengths`, `weaknesses`, and `mood`. Export:

```ts
export function getLeaderboardCompanyDetail(game: GameState, id: FactionId | "player") {
  if (id === "player") {
    return {
      id,
      name: game.founder.name,
      region: "中国 / 全球扩张中",
      description: `${game.founder.name} 正在用 ARR、模型能力和全球化准备度争夺入榜资格。`,
      strengths: [`ARR ${Math.round(game.metrics.arr / 10_000)} 万`, `模型能力 ${Math.round(game.metrics.modelPower)}%`],
      weaknesses: [`合规风险 ${Math.round(game.metrics.complianceRisk)}%`, `董事会压力 ${Math.round(game.metrics.boardPressure)}%`],
      mood: game.metrics.runway <= 6 ? "现金焦虑" : "仍在推进",
    };
  }
  return COMPETITORS.find((competitor) => competitor.id === id) ?? null;
}
```

- [ ] **Step 6: Run tests and commit**

Run:

```bash
npm test -- tests/game/leaderboard.test.ts
```

Expected: PASS.

Commit:

```bash
git add src/game/types.ts src/game/engine/leaderboard.ts tests/game/leaderboard.test.ts
git commit -m "feat: add multi-category AI leaderboard"
```

---

## Task 7: Core UI Wiring

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/game/ui/CreateFounder.tsx`
- Modify: `src/game/ui/ActionPanel.tsx`
- Modify: `src/game/ui/EmployeeOperationPanel.tsx`
- Modify: `src/game/ui/Dashboard.tsx`
- Modify: `src/game/ui/LeaderboardPanel.tsx`
- Modify: `src/game/ui/AchievementsModal.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Write failing UI tests**

Add to `src/App.test.tsx`:

```ts
it("shows Chinese play instructions and does not require a 24 point total", () => {
  render(<App />);

  expect(screen.getByText(/从一间会议室打到全球榜单/)).toBeInTheDocument();
  expect(screen.queryByText(/属性点 .*\/24/)).not.toBeInTheDocument();
});

it("shows action gains and paid extra action controls after game start", async () => {
  render(<App />);
  await userEvent.click(screen.getByRole("button", { name: /开始创业/ }));

  expect(screen.getByText(/模型能力↑/)).toBeInTheDocument();
  expect(screen.getByRole("checkbox", { name: /购买额外公司动作/ })).toBeInTheDocument();
});

it("keeps employee operations optional after hiring", async () => {
  render(<App />);
  await userEvent.click(screen.getByRole("button", { name: /开始创业/ }));
  await userEvent.click(screen.getByLabelText(/招聘/));
  await userEvent.click(screen.getByLabelText(/研发产品/));
  await userEvent.click(screen.getByRole("button", { name: /推进季度/ }));

  expect(screen.getByText(/可选/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /推进季度/ })).toBeEnabled();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL because the UI still shows old 24 point logic, no summaries, and employee operation is required.

- [ ] **Step 3: Update CreateFounder**

In `src/game/ui/CreateFounder.tsx`:

- Remove `TARGET_ATTRIBUTE_TOTAL` import and total equality gate.
- Add `presetId` to submit payload.
- Show final total as `属性总和 {total}` with no denominator.
- Show cards with `profile.specialty`, `track.focus`, and preset metric effects rendered as Chinese text.
- Replace the current gameplay copy with:

```tsx
<p>
  每个季度你要同时处理公司动作、创始人状态和员工去留。模型能力会让你冲上榜单，PMF 和 ARR 决定能不能活成上市公司，Runway 会提醒你梦想按月扣费。
</p>
<p>
  可以稳扎稳打，也可以学术造假、灰色数据、ARR 注水。捷径会让数字变漂亮，也会把监管、审计和董事会请进会议室。
</p>
```

- [ ] **Step 4: Update ActionPanel**

Change props:

```ts
interface ActionPanelProps {
  game: GameState;
  onSubmit: (submission: TurnSubmission) => void;
  employeeOperations: EmployeeOperationAssignment[];
}
```

Use `calculateActionPreview(game, action.id)` for each card. Render:

```tsx
<small>{action.description}</small>
<ul className="effect-list">
  {preview.summary.map((line) => <li key={line}>{line}</li>)}
</ul>
<em className="status-pill neutral">效率 x{preview.efficiencyMultiplier}</em>
```

Add an extra action checkbox:

```tsx
<label className="extra-action-toggle">
  <input type="checkbox" checked={extraEnabled} onChange={(event) => setExtraEnabled(event.target.checked)} />
  购买额外公司动作（现金 -75 万）
</label>
```

When enabled, allow selecting a third action as `extraCompanyAction`; otherwise only 2 company actions.

- [ ] **Step 5: Update EmployeeOperationPanel**

Change props:

```ts
interface EmployeeOperationPanelProps {
  game: GameState;
  assignments: EmployeeOperationAssignment[];
  onChange: (assignments: EmployeeOperationAssignment[]) => void;
}
```

For every employee render a compact row with a select:

```tsx
<select
  aria-label={`${employee.name} 员工操作`}
  value={assignment?.operationId ?? ""}
  onChange={(event) => updateAssignment(employee.id, event.target.value as EmployeeOperationId | "")}
>
  <option value="">本季度不操作</option>
  {employeeOperations.map((operation) => (
    <option key={operation.id} value={operation.id}>{operation.name}</option>
  ))}
</select>
```

- [ ] **Step 6: Update Dashboard tooltips**

In `src/game/ui/Dashboard.tsx`, make every English metric label use `tabIndex={0}` and `aria-label`:

```tsx
<span className="metric-label" title={metric.tooltip} tabIndex={metric.tooltip ? 0 : -1} aria-label={metric.tooltip ?? metric.label}>
  {metric.label}
</span>
```

Add tooltips for `MRR`, `PMF`, `ARR`, `Runway`, `Gross Margin`, `Board Pressure`, `Global Readiness`.

- [ ] **Step 7: Update leaderboard and achievements UI**

In `LeaderboardPanel.tsx`:

- Add category segmented buttons from `getLeaderboardCategories()`.
- Use `getLeaderboard(game, categoryId).rows`.
- Add an ellipsis row when `playerRank > 9`: `... {playerRankLabel}`.
- Store `selectedCompanyId` and render details from `getLeaderboardCompanyDetail(game, id)` on row click.

In `AchievementsModal.tsx`:

- Keep all achievements visible.
- For locked hidden achievements, render `achievement.conditionText`, which is `???`.
- Add count text `已解锁 X / Y`.

- [ ] **Step 8: Update App state**

In `src/App.tsx`:

```ts
const [employeeAssignments, setEmployeeAssignments] = useState<EmployeeOperationAssignment[]>([]);
```

Reset it inside `saveAndSetGame()`.

Change `applyTurn`:

```ts
function applyTurn(submission: TurnSubmission) {
  if (!game) return;
  const next = advanceGameTurn(game, {
    ...submission,
    employeeOperations: employeeAssignments,
  });
  saveAndSetGame(next, pickNextEvent(next));
}
```

Pass `game`, `employeeAssignments`, and `setEmployeeAssignments` into panels.

- [ ] **Step 9: Run UI tests and commit**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: PASS.

Commit:

```bash
git add src/App.tsx src/game/ui/CreateFounder.tsx src/game/ui/ActionPanel.tsx src/game/ui/EmployeeOperationPanel.tsx src/game/ui/Dashboard.tsx src/game/ui/LeaderboardPanel.tsx src/game/ui/AchievementsModal.tsx src/App.test.tsx
git commit -m "feat: wire gameplay v2 interface"
```

---

## Task 8: US IPO OnePage And Regression

**Files:**
- Create: `docs/US_IPO_ONEPAGE.md`
- Modify: `src/styles.css`
- Test: all test files

- [ ] **Step 1: Create OnePage**

Create `docs/US_IPO_ONEPAGE.md` with this structure:

```md
# AI 创业模拟器：美股 IPO OnePage

## 目标结局

美股 IPO 需要同时满足：

- ARR >= 1.5 亿
- Global Readiness >= 75
- Compliance Risk <= 35
- Founder Health > 40
- Gross Margin >= 50
- Valuation >= 20 亿

## 推荐开局

- 创业身份：海外博士
- 创业赛道：企业知识库或金融 AI
- 属性预设：全球化

## 阶段路线

2026-2027：研发产品、冲销售、治理合规，目标 PMF >= 45、ARR >= 500 万。

2028-2029：融资、招聘、全球扩张、Security Audit，目标 ARR >= 3000 万、Global Readiness >= 50、Compliance Risk <= 35。

2030-2032：买算力、训练模型、企业销售、CFO 到岗，目标 ARR >= 8000 万、Gross Margin >= 50、Valuation >= 8 亿。

2033-2035：全球扩张、治理合规、客户拜访、创始人休假穿插，目标 ARR >= 1.5 亿、Global Readiness >= 75、Founder Health > 40。

## 操作原则

- 每季度 2 个公司动作优先保证一个增长动作和一个风险控制动作。
- 现金大于 800 万且 Runway 大于 9 个月时，可以购买额外公司动作。
- 员工疲劳高于 65 时优先放假或加薪，避免关键角色被挖。
- 学术造假、灰色数据、ARR 注水只适合冲隐藏成就，不适合 IPO 路线。
```

- [ ] **Step 2: Tighten SpaceX visual CSS**

In `src/styles.css`, keep the existing SpaceX direction and ensure these classes exist:

```css
.effect-list { margin: 8px 0 0; padding-left: 18px; color: var(--muted); font-size: 0.82rem; }
.extra-action-toggle { display: flex; align-items: center; gap: 8px; border-top: 1px solid var(--border); padding-top: 12px; }
.metric-label[title] { cursor: help; text-decoration: underline dotted rgba(255,255,255,0.28); text-underline-offset: 3px; }
.leaderboard-tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.leaderboard-detail { border-top: 1px solid var(--border); padding-top: 12px; }
.employee-assignment-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(160px, 220px); gap: 10px; align-items: center; }
```

Check mobile width at `390px`; no text should overlap.

- [ ] **Step 3: Run full verification**

Run:

```bash
npm test
npm run build
```

Expected: all tests PASS and build exits 0.

- [ ] **Step 4: Commit**

Commit:

```bash
git add docs/US_IPO_ONEPAGE.md src/styles.css
git commit -m "docs: add US IPO playbook"
```

---

## Self-Review Checklist

- Spec coverage:
  - 开局身份、赛道、预设共同影响属性和指标：Task 1。
  - 属性不再固定 24 且可成长：Task 1 and Task 3 founder actions。
  - 动作具体增益可见且数据逻辑更合理：Task 2 and Task 7。
  - 员工每人每季度可选操作，且非必选：Task 3 and Task 7。
  - 本季度动作可花现金额外选择：Task 3 and Task 7。
  - 创始人监控和度假等动作：Task 3。
  - 随机事件概率提高：Task 4。
  - 成就更多，隐藏条件保密但名字可见：Task 5 and Task 7。
  - 多维排行榜、入榜阈值、公司详情：Task 6 and Task 7。
  - 剑走偏锋动作：Task 2 and Task 4。
  - 美股上市示例路线 OnePage：Task 8。
  - 中文 UI 和关键指标解释：Task 7。
  - SpaceX 配色维持：Task 8。

- Placeholder scan:
  - The plan contains no empty implementation markers, no unnamed tasks, and no vague edge-case instructions.

- Type consistency:
  - `NewGameInput.presetId` is introduced before `CreateFounder` and tests use it.
  - `TurnSubmission`, `FounderActionId`, and `EmployeeOperationAssignment` are introduced before `advanceGameTurn()` and UI wiring use them.
  - `calculateActionPreview()` is introduced before `ActionPanel` consumes it.
  - `getLeaderboard(game, categoryId)` and `getLeaderboardCompanyDetail()` are introduced before `LeaderboardPanel` consumes them.
