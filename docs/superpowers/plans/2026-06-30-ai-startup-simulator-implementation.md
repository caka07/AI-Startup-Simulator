# AI Startup Simulator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first playable local Web version of the black-humor AI startup simulator, with self-consistent behavior, data thresholds, employee operations, financing rules, achievements, and endings.

**Architecture:** Use a deterministic TypeScript game engine made of pure functions, with React as a thin UI layer. All game content is stored as typed data tables and validated by automated tests before the app renders it, so behavior, event triggers, achievements, and endings cannot drift apart silently.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, localStorage.

---

## Scope Check

The full design contains 160 events, 80 achievements, and 36 endings. The first playable slice will keep the complete 12-year lifecycle and the core rules, but ship with 40 events, 20 achievements, and 12 endings. This makes one complete game loop testable without blocking on full content writing.

The implementation must optimize for self-consistency:

- Every metric mutation goes through clamped helper functions.
- Every event, achievement, and ending references only declared metric IDs, employee role IDs, market IDs, investor IDs, and faction IDs.
- Financing, employee departure, IPO, and ending logic are pure functions with unit tests around threshold behavior.
- Randomness uses a seeded RNG so simulations can be reproduced.
- UI components display engine state; they do not duplicate game rules.

## File Structure

Create this structure inside `/Users/bytedance/Downloads/ai-startup-simulator`:

```text
ai-startup-simulator/
  package.json
  index.html
  vite.config.ts
  vitest.config.ts
  tsconfig.json
  src/
    main.tsx
    App.tsx
    styles.css
    game/
      types.ts
      constants.ts
      balance.ts
      data/
        backgrounds.ts
        tracks.ts
        factions.ts
        investors.ts
        employeeRoles.ts
        actions.ts
        events.ts
        achievements.ts
        endings.ts
      engine/
        rng.ts
        clamp.ts
        createGame.ts
        actions.ts
        finance.ts
        employees.ts
        events.ts
        achievements.ts
        endings.ts
        validation.ts
        advance.ts
      ui/
        CreateFounder.tsx
        Dashboard.tsx
        ActionPanel.tsx
        EventCard.tsx
        EmployeePanel.tsx
        FinancingPanel.tsx
        AnnualReport.tsx
        GameOver.tsx
  tests/
    game/
      validation.test.ts
      createGame.test.ts
      advance.test.ts
      finance.test.ts
      employees.test.ts
      events.test.ts
      achievements.test.ts
      endings.test.ts
```

Responsibility boundaries:

- `src/game/types.ts`: Shared domain types and IDs.
- `src/game/constants.ts`: Declared metric IDs, roles, markets, action IDs, and ending priority constants.
- `src/game/balance.ts`: Numeric thresholds and balance knobs.
- `src/game/data/*`: Static content tables only.
- `src/game/engine/*`: Pure game logic only.
- `src/game/ui/*`: React components only; no duplicated business rules.
- `tests/game/*`: Unit tests for consistency and threshold behavior.

## Task 1: Scaffold The App And Test Harness

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `tsconfig.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

- [ ] **Step 1: Create the project metadata**

Create `package.json`:

```json
{
  "name": "ai-startup-simulator",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^7.0.0",
    "typescript": "^5.8.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^25.0.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Add TypeScript and Vite config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "tests"]
}
```

Create `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

- [ ] **Step 3: Add the minimal React shell**

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI 创业模拟器</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Create `src/App.tsx`:

```tsx
export function App() {
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">2026 / 中国 AI 创业者 / 12 年生命周期</p>
        <h1>AI 创业模拟器</h1>
        <p>从 Demo 到敲钟，或从敲钟到进厂。</p>
      </section>
    </main>
  );
}
```

Create `src/styles.css`:

```css
:root {
  color: #e8ecef;
  background: #101214;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background:
    radial-gradient(circle at 16% 12%, rgba(22, 163, 74, 0.16), transparent 28%),
    linear-gradient(135deg, #101214 0%, #171a1f 48%, #111827 100%);
}

button,
input,
select {
  font: inherit;
}

.app-shell {
  width: min(1180px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 28px 0;
}

.hero-panel {
  border: 1px solid rgba(232, 236, 239, 0.16);
  border-radius: 8px;
  padding: 24px;
  background: rgba(16, 18, 20, 0.84);
}

.eyebrow {
  margin: 0 0 8px;
  color: #8fbfa0;
  font-size: 0.88rem;
}

h1 {
  margin: 0 0 8px;
  font-size: clamp(2rem, 4vw, 4rem);
  letter-spacing: 0;
}

p {
  line-height: 1.6;
}
```

- [ ] **Step 4: Install and verify**

Run:

```bash
npm install
npm run build
```

Expected:

```text
vite build completes
```

- [ ] **Step 5: Commit**

Run:

```bash
git add package.json index.html vite.config.ts vitest.config.ts tsconfig.json src/main.tsx src/App.tsx src/styles.css
git commit -m "chore: scaffold ai startup simulator"
```

If the directory is not a git repository, run `git init` first, then repeat the commit command.

## Task 2: Define Domain Types And Balance Constants

**Files:**
- Create: `src/game/types.ts`
- Create: `src/game/constants.ts`
- Create: `src/game/balance.ts`
- Test: `tests/game/createGame.test.ts`

- [ ] **Step 1: Write the failing type-facing test**

Create `tests/game/createGame.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";

describe("createNewGame", () => {
  it("creates a 2026 Q1 company with clamped metrics and founder equity", () => {
    const game = createNewGame({
      seed: 42,
      founderName: "沈一",
      backgroundId: "ex-bigtech-pm",
      trackId: "ai-agent",
      attributes: {
        tech: 4,
        sales: 7,
        fundraising: 6,
        management: 4,
        ethics: 4,
        stamina: 5,
        hype: 7,
        luck: 3,
      },
    });

    expect(game.year).toBe(2026);
    expect(game.quarter).toBe(1);
    expect(game.metrics.founderEquity).toBe(100);
    expect(game.metrics.arr).toBe(0);
    expect(game.metrics.pmf).toBeGreaterThanOrEqual(0);
    expect(game.metrics.pmf).toBeLessThanOrEqual(100);
    expect(game.log[0]).toContain("沈一创办了公司");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/game/createGame.test.ts
```

Expected:

```text
FAIL tests/game/createGame.test.ts
Cannot find module '../../src/game/engine/createGame'
```

- [ ] **Step 3: Create domain types**

Create `src/game/types.ts`:

```ts
export type Quarter = 1 | 2 | 3 | 4;

export type MetricId =
  | "cash"
  | "runway"
  | "arr"
  | "mrr"
  | "pmf"
  | "modelPower"
  | "productQuality"
  | "computeSupply"
  | "computeCost"
  | "grossMargin"
  | "techDebt"
  | "reputation"
  | "morale"
  | "complianceRisk"
  | "globalReadiness"
  | "boardPressure"
  | "founderHealth"
  | "founderEquity"
  | "valuation"
  | "marketHeat";

export type CompanyMetrics = Record<MetricId, number>;

export type FounderAttributeId =
  | "tech"
  | "sales"
  | "fundraising"
  | "management"
  | "ethics"
  | "stamina"
  | "hype"
  | "luck";

export type FounderAttributes = Record<FounderAttributeId, number>;

export type BackgroundId =
  | "ex-bigtech-pm"
  | "former-llm-researcher"
  | "serial-founder"
  | "overseas-phd"
  | "open-source-maintainer"
  | "failed-incubation-team"
  | "rich-kid-founder"
  | "indie-hacker";

export type TrackId =
  | "foundation-model"
  | "ai-agent"
  | "ai-coding"
  | "enterprise-knowledge"
  | "ai-education"
  | "ai-companion"
  | "ai-hardware"
  | "ai-security"
  | "medical-ai"
  | "finance-ai"
  | "manufacturing-ai"
  | "local-life-agent";

export type MarketId = "china" | "sea" | "middle-east" | "europe" | "us";

export type FactionId =
  | "deepduck"
  | "openmind"
  | "moralmachine"
  | "green-furnace"
  | "cloudsoft"
  | "byteplanet"
  | "tencentacle"
  | "alicloud-temple";

export type InvestorId =
  | "alice-chen"
  | "old-zhou"
  | "maya-cloud"
  | "victor-furnace"
  | "omar-oasis"
  | "ms-lin"
  | "kevin-founder"
  | "grace-ma"
  | "leo-banker"
  | "nora-open"
  | "byteplanet-capital"
  | "hard-term-capital";

export type EmployeeRoleId =
  | "researcher"
  | "engineer"
  | "product-manager"
  | "sales"
  | "compliance"
  | "finance"
  | "cfo"
  | "overseas-bd";

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
  | "cut-costs";

export type AchievementId = string;
export type EndingId = string;
export type EventId = string;

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRoleId;
  level: "junior" | "mid" | "senior" | "lead" | "cxo";
  ability: number;
  salary: number;
  options: number;
  loyalty: number;
  ambition: number;
  fatigue: number;
  scarcity: number;
  tags: string[];
}

export interface FounderProfile {
  name: string;
  backgroundId: BackgroundId;
  trackId: TrackId;
  attributes: FounderAttributes;
}

export interface MarketState {
  id: MarketId;
  unlocked: boolean;
  revenueShare: number;
  localization: number;
}

export interface GameState {
  seed: number;
  year: number;
  quarter: Quarter;
  founder: FounderProfile;
  metrics: CompanyMetrics;
  employees: Employee[];
  markets: Record<MarketId, MarketState>;
  investorRelations: Record<InvestorId, number>;
  factionRelations: Record<FactionId, number>;
  completedAchievements: AchievementId[];
  endingId: EndingId | null;
  log: string[];
}

export interface NewGameInput {
  seed: number;
  founderName: string;
  backgroundId: BackgroundId;
  trackId: TrackId;
  attributes: FounderAttributes;
}

export interface MetricEffect {
  metric: MetricId;
  delta: number;
}

export interface Condition {
  metric: MetricId;
  op: ">=" | ">" | "<=" | "<" | "===";
  value: number;
}
```

- [ ] **Step 4: Create constants and balance values**

Create `src/game/constants.ts`:

```ts
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
```

Create `src/game/balance.ts`:

```ts
export const BALANCE = {
  startYear: 2026,
  maxYears: 12,
  founderAttributeBudget: 24,
  exchangeRateUsdCny: 7,
  runway: {
    comfortable: 18,
    normalFundraise: 12,
    pressured: 6,
    deathSpiral: 3,
  },
  arr: {
    firstInvoice: 1_000_000,
    seriesA: 10_000_000,
    seriesB: 50_000_000,
    seriesC: 200_000_000,
    hkIpo: 500_000_000,
    usIpo: 700_000_000,
  },
  pmf: {
    broken: 30,
    weak: 40,
    real: 60,
    strong: 70,
    categoryDefining: 85,
  },
  compliance: {
    safe: 30,
    risky: 50,
    blocksIpo: 60,
    emergency: 80,
    shutdown: 90,
  },
  morale: {
    stable: 50,
    risky: 35,
    crisis: 20,
  },
  founderEquity: {
    normalVc: 30,
    boardThreat: 20,
    employeeCeo: 10,
  },
};
```

- [ ] **Step 5: Create clamping and new game implementation**

Create `src/game/engine/clamp.ts`:

```ts
import { PERCENT_METRICS } from "../constants";
import type { CompanyMetrics, MetricId } from "../types";

export function clampMetric(metric: MetricId, value: number): number {
  if (PERCENT_METRICS.has(metric)) {
    return Math.min(100, Math.max(0, Math.round(value)));
  }
  return Math.max(0, Math.round(value));
}

export function applyMetricDelta(metrics: CompanyMetrics, metric: MetricId, delta: number): CompanyMetrics {
  return {
    ...metrics,
    [metric]: clampMetric(metric, metrics[metric] + delta),
  };
}
```

Create `src/game/engine/createGame.ts`:

```ts
import { FACTION_IDS, INVESTOR_IDS, MARKET_IDS } from "../constants";
import type { CompanyMetrics, GameState, MarketState, NewGameInput } from "../types";

function createInitialMetrics(): CompanyMetrics {
  return {
    cash: 3_000_000,
    runway: 12,
    arr: 0,
    mrr: 0,
    pmf: 25,
    modelPower: 25,
    productQuality: 25,
    computeSupply: 35,
    computeCost: 20,
    grossMargin: 35,
    techDebt: 15,
    reputation: 30,
    morale: 60,
    complianceRisk: 20,
    globalReadiness: 10,
    boardPressure: 0,
    founderHealth: 85,
    founderEquity: 100,
    valuation: 10_000_000,
    marketHeat: 55,
  };
}

function createMarkets(): Record<string, MarketState> {
  return Object.fromEntries(
    MARKET_IDS.map((id) => [
      id,
      {
        id,
        unlocked: id === "china",
        revenueShare: id === "china" ? 100 : 0,
        localization: id === "china" ? 100 : 0,
      },
    ]),
  );
}

export function createNewGame(input: NewGameInput): GameState {
  return {
    seed: input.seed,
    year: 2026,
    quarter: 1,
    founder: {
      name: input.founderName,
      backgroundId: input.backgroundId,
      trackId: input.trackId,
      attributes: input.attributes,
    },
    metrics: createInitialMetrics(),
    employees: [],
    markets: createMarkets() as GameState["markets"],
    investorRelations: Object.fromEntries(INVESTOR_IDS.map((id) => [id, 0])) as GameState["investorRelations"],
    factionRelations: Object.fromEntries(FACTION_IDS.map((id) => [id, 0])) as GameState["factionRelations"],
    completedAchievements: [],
    endingId: null,
    log: [`${input.founderName}创办了公司，投资人说这个方向“空间很大”。`],
  };
}
```

- [ ] **Step 6: Run test to verify it passes**

Run:

```bash
npm test -- tests/game/createGame.test.ts
```

Expected:

```text
PASS tests/game/createGame.test.ts
```

- [ ] **Step 7: Commit**

Run:

```bash
git add src/game/types.ts src/game/constants.ts src/game/balance.ts src/game/engine/clamp.ts src/game/engine/createGame.ts tests/game/createGame.test.ts
git commit -m "feat: add simulator domain model"
```

## Task 3: Add Static Content Tables And Validation

**Files:**
- Create: `src/game/data/factions.ts`
- Create: `src/game/data/investors.ts`
- Create: `src/game/data/employeeRoles.ts`
- Create: `src/game/data/actions.ts`
- Create: `src/game/data/events.ts`
- Create: `src/game/data/achievements.ts`
- Create: `src/game/data/endings.ts`
- Create: `src/game/engine/validation.ts`
- Test: `tests/game/validation.test.ts`

- [ ] **Step 1: Write validation tests**

Create `tests/game/validation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { achievements } from "../../src/game/data/achievements";
import { endings } from "../../src/game/data/endings";
import { events } from "../../src/game/data/events";
import { validateContent } from "../../src/game/engine/validation";

describe("content validation", () => {
  it("ships the first playable slice content counts", () => {
    expect(events).toHaveLength(40);
    expect(achievements).toHaveLength(20);
    expect(endings).toHaveLength(12);
  });

  it("rejects content that references unknown metrics or ids", () => {
    const result = validateContent();
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("keeps endings ordered from most forced to most optional", () => {
    const priorities = endings.map((ending) => ending.priority);
    const sorted = [...priorities].sort((a, b) => a - b);
    expect(priorities).toEqual(sorted);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/game/validation.test.ts
```

Expected:

```text
FAIL tests/game/validation.test.ts
Cannot find module '../../src/game/data/achievements'
```

- [ ] **Step 3: Create content shape types**

Append these interfaces to `src/game/types.ts`:

```ts
export interface NamedContent<TId extends string = string> {
  id: TId;
  name: string;
  description: string;
}

export interface Faction extends NamedContent<FactionId> {
  role: string;
  pressure: string;
}

export interface Investor extends NamedContent<InvestorId> {
  type: string;
  likes: string[];
  hates: string[];
  termStyle: "friendly" | "normal" | "pressure" | "predatory";
}

export interface EmployeeRole extends NamedContent<EmployeeRoleId> {
  salaryBase: number;
  strengths: MetricEffect[];
  risks: string[];
}

export interface PlayerAction extends NamedContent<ActionId> {
  effects: MetricEffect[];
  healthCost: number;
}

export interface GameEventChoice {
  id: string;
  label: string;
  effects: MetricEffect[];
  log: string;
}

export interface GameEvent {
  id: EventId;
  title: string;
  category: "funding" | "employee" | "giant" | "customer" | "regulation" | "tech" | "pr" | "global" | "health";
  trigger: Condition[];
  choices: GameEventChoice[];
}

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  trigger: Condition[];
}

export interface Ending {
  id: EndingId;
  name: string;
  description: string;
  priority: number;
  trigger: Condition[];
}
```

- [ ] **Step 4: Create first-slice content tables**

Create static tables with these exact IDs and counts:

`src/game/data/factions.ts` must export 8 factions: `deepduck`, `openmind`, `moralmachine`, `green-furnace`, `cloudsoft`, `byteplanet`, `tencentacle`, `alicloud-temple`.

`src/game/data/investors.ts` must export 12 investors: `alice-chen`, `old-zhou`, `maya-cloud`, `victor-furnace`, `omar-oasis`, `ms-lin`, `kevin-founder`, `grace-ma`, `leo-banker`, `nora-open`, `byteplanet-capital`, `hard-term-capital`.

`src/game/data/employeeRoles.ts` must export 8 roles: `researcher`, `engineer`, `product-manager`, `sales`, `compliance`, `finance`, `cfo`, `overseas-bd`.

`src/game/data/actions.ts` must export 10 actions: `build-product`, `train-model`, `sell`, `fundraise`, `hire`, `retain`, `govern-compliance`, `expand-global`, `pr-launch`, `cut-costs`.

`src/game/data/events.ts` must export 40 events. Include at least these trigger archetypes:

```ts
[
  "investor-moat-question",
  "impossible-enterprise-contract",
  "deepduck-open-source-shock",
  "core-researcher-triple-offer",
  "board-suggests-professional-ceo",
  "green-furnace-waitlist",
  "byteplanet-traffic-trial",
  "cloudsoft-pluginization",
  "moralmachine-safety-review",
  "sales-promised-private-deployment",
  "cfo-finds-recognition-risk",
  "overseas-bd-asks-for-budget",
  "eu-customer-asks-data-lineage",
  "middle-east-poc-marathon",
  "us-investor-asks-global-story",
  "employee-options-underwater",
  "founder-health-warning",
  "demo-crashes-at-conference",
  "viral-pr-with-no-retention",
  "customer-prepayment-offer"
]
```

The remaining 20 event IDs can be content variants, but each must have at least one trigger and two choices.

`src/game/data/achievements.ts` must export 20 achievements:

```ts
[
  "hello-demo",
  "first-invoice",
  "angel-arrives",
  "seed-player",
  "million-mrr",
  "ten-million-arr",
  "series-a-graduate",
  "series-b-expansion",
  "unicorn-skin",
  "gpu-ticket",
  "first-overseas-order",
  "hundred-million-arr",
  "gross-margin-positive",
  "cfo-hired",
  "audit-ready",
  "bell-ringer",
  "ppt-before-product",
  "cloud-credit-rich",
  "employees-more-than-users",
  "open-source-backstab-survivor"
]
```

`src/game/data/endings.ts` must export 12 endings:

```ts
[
  "cashflow-break",
  "regulatory-shutdown",
  "founder-health-collapse",
  "open-source-crushed",
  "giant-free-feature",
  "acquired-by-giant",
  "hk-ipo",
  "us-ipo",
  "cashflow-champion",
  "paper-billionaire",
  "professional-ceo-replaced-founder",
  "lifestyle-company"
]
```

- [ ] **Step 5: Implement content validation**

Create `src/game/engine/validation.ts`:

```ts
import {
  ACTION_IDS,
  EMPLOYEE_ROLE_IDS,
  FACTION_IDS,
  INVESTOR_IDS,
  METRIC_IDS,
} from "../constants";
import { achievements } from "../data/achievements";
import { employeeRoles } from "../data/employeeRoles";
import { endings } from "../data/endings";
import { events } from "../data/events";
import { factions } from "../data/factions";
import { investors } from "../data/investors";
import type { Achievement, Condition, Ending, GameEvent, MetricEffect } from "../types";

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateUniqueIds(label: string, ids: string[], errors: string[]) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) errors.push(`${label} has duplicate id: ${id}`);
    seen.add(id);
  }
}

function validateCondition(owner: string, condition: Condition, errors: string[]) {
  if (!METRIC_IDS.includes(condition.metric)) {
    errors.push(`${owner} references unknown metric: ${condition.metric}`);
  }
}

function validateEffect(owner: string, effect: MetricEffect, errors: string[]) {
  if (!METRIC_IDS.includes(effect.metric)) {
    errors.push(`${owner} mutates unknown metric: ${effect.metric}`);
  }
}

function validateTriggeredContent(owner: string, items: Array<GameEvent | Achievement | Ending>, errors: string[]) {
  for (const item of items) {
    if (item.trigger.length === 0) errors.push(`${owner}/${item.id} has no trigger`);
    item.trigger.forEach((condition) => validateCondition(`${owner}/${item.id}`, condition, errors));
  }
}

export function validateContent(): ValidationResult {
  const errors: string[] = [];

  validateUniqueIds("factions", factions.map((item) => item.id), errors);
  validateUniqueIds("investors", investors.map((item) => item.id), errors);
  validateUniqueIds("employeeRoles", employeeRoles.map((item) => item.id), errors);
  validateUniqueIds("events", events.map((item) => item.id), errors);
  validateUniqueIds("achievements", achievements.map((item) => item.id), errors);
  validateUniqueIds("endings", endings.map((item) => item.id), errors);

  for (const faction of factions) {
    if (!FACTION_IDS.includes(faction.id)) errors.push(`unknown faction id: ${faction.id}`);
  }
  for (const investor of investors) {
    if (!INVESTOR_IDS.includes(investor.id)) errors.push(`unknown investor id: ${investor.id}`);
  }
  for (const role of employeeRoles) {
    if (!EMPLOYEE_ROLE_IDS.includes(role.id)) errors.push(`unknown employee role id: ${role.id}`);
    role.strengths.forEach((effect) => validateEffect(`employeeRoles/${role.id}`, effect, errors));
  }
  for (const action of ACTION_IDS) {
    if (!action) errors.push("empty action id");
  }

  validateTriggeredContent("events", events, errors);
  validateTriggeredContent("achievements", achievements, errors);
  validateTriggeredContent("endings", endings, errors);

  for (const event of events) {
    if (event.choices.length < 2) errors.push(`events/${event.id} has fewer than two choices`);
    for (const choice of event.choices) {
      choice.effects.forEach((effect) => validateEffect(`events/${event.id}/${choice.id}`, effect, errors));
    }
  }

  return { valid: errors.length === 0, errors };
}
```

- [ ] **Step 6: Run validation tests**

Run:

```bash
npm test -- tests/game/validation.test.ts
```

Expected:

```text
PASS tests/game/validation.test.ts
```

- [ ] **Step 7: Commit**

Run:

```bash
git add src/game/data src/game/engine/validation.ts src/game/types.ts tests/game/validation.test.ts
git commit -m "feat: add validated simulator content tables"
```

## Task 4: Implement Deterministic RNG And Quarterly Advance

**Files:**
- Create: `src/game/engine/rng.ts`
- Create: `src/game/engine/advance.ts`
- Modify: `src/game/engine/createGame.ts`
- Test: `tests/game/advance.test.ts`

- [ ] **Step 1: Write failing advance tests**

Create `tests/game/advance.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { advanceQuarter } from "../../src/game/engine/advance";

const input = {
  seed: 99,
  founderName: "林舟",
  backgroundId: "former-llm-researcher" as const,
  trackId: "foundation-model" as const,
  attributes: {
    tech: 8,
    sales: 3,
    fundraising: 4,
    management: 3,
    ethics: 5,
    stamina: 5,
    hype: 3,
    luck: 2,
  },
};

describe("advanceQuarter", () => {
  it("advances quarter and year correctly", () => {
    let game = createNewGame(input);
    game = advanceQuarter(game, ["build-product", "train-model"]);
    expect(game.year).toBe(2026);
    expect(game.quarter).toBe(2);

    game = advanceQuarter(game, ["build-product", "sell"]);
    game = advanceQuarter(game, ["build-product", "sell"]);
    game = advanceQuarter(game, ["build-product", "sell"]);
    expect(game.year).toBe(2027);
    expect(game.quarter).toBe(1);
  });

  it("keeps percent metrics clamped after actions", () => {
    let game = createNewGame(input);
    for (let i = 0; i < 20; i += 1) {
      game = advanceQuarter(game, ["train-model", "pr-launch"]);
    }
    expect(game.metrics.modelPower).toBeLessThanOrEqual(100);
    expect(game.metrics.reputation).toBeLessThanOrEqual(100);
    expect(game.metrics.founderHealth).toBeGreaterThanOrEqual(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/game/advance.test.ts
```

Expected:

```text
FAIL tests/game/advance.test.ts
Cannot find module '../../src/game/engine/advance'
```

- [ ] **Step 3: Implement deterministic RNG**

Create `src/game/engine/rng.ts`:

```ts
export interface Rng {
  seed: number;
  next(): number;
  int(min: number, max: number): number;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  return {
    seed,
    next() {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 0x100000000;
    },
    int(min: number, max: number) {
      const low = Math.ceil(min);
      const high = Math.floor(max);
      return Math.floor(this.next() * (high - low + 1)) + low;
    },
  };
}
```

- [ ] **Step 4: Implement quarterly advance**

Create `src/game/engine/advance.ts`:

```ts
import type { ActionId, GameState, Quarter } from "../types";
import { applyAction } from "./actions";

function nextQuarter(year: number, quarter: Quarter): { year: number; quarter: Quarter } {
  if (quarter === 4) return { year: year + 1, quarter: 1 };
  return { year, quarter: (quarter + 1) as Quarter };
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

  const period = nextQuarter(next.year, next.quarter);
  return {
    ...next,
    year: period.year,
    quarter: period.quarter,
  };
}
```

- [ ] **Step 5: Implement action effects**

Create `src/game/engine/actions.ts`:

```ts
import type { ActionId, GameState, MetricEffect } from "../types";
import { applyMetricDelta } from "./clamp";

const ACTION_EFFECTS: Record<ActionId, MetricEffect[]> = {
  "build-product": [
    { metric: "productQuality", delta: 7 },
    { metric: "pmf", delta: 4 },
    { metric: "techDebt", delta: 3 },
    { metric: "cash", delta: -600_000 },
    { metric: "founderHealth", delta: -3 },
  ],
  "train-model": [
    { metric: "modelPower", delta: 7 },
    { metric: "computeSupply", delta: -6 },
    { metric: "computeCost", delta: 5 },
    { metric: "cash", delta: -900_000 },
    { metric: "founderHealth", delta: -4 },
  ],
  sell: [
    { metric: "arr", delta: 800_000 },
    { metric: "mrr", delta: 70_000 },
    { metric: "cash", delta: 200_000 },
    { metric: "founderHealth", delta: -2 },
  ],
  fundraise: [
    { metric: "reputation", delta: 2 },
    { metric: "boardPressure", delta: 3 },
    { metric: "founderHealth", delta: -5 },
  ],
  hire: [
    { metric: "cash", delta: -500_000 },
    { metric: "morale", delta: 2 },
    { metric: "founderHealth", delta: -2 },
  ],
  retain: [
    { metric: "cash", delta: -350_000 },
    { metric: "morale", delta: 8 },
    { metric: "founderHealth", delta: -1 },
  ],
  "govern-compliance": [
    { metric: "complianceRisk", delta: -10 },
    { metric: "cash", delta: -400_000 },
    { metric: "productQuality", delta: -1 },
  ],
  "expand-global": [
    { metric: "globalReadiness", delta: 8 },
    { metric: "complianceRisk", delta: 4 },
    { metric: "cash", delta: -700_000 },
  ],
  "pr-launch": [
    { metric: "reputation", delta: 8 },
    { metric: "marketHeat", delta: 2 },
    { metric: "founderHealth", delta: -3 },
  ],
  "cut-costs": [
    { metric: "cash", delta: 600_000 },
    { metric: "morale", delta: -8 },
    { metric: "productQuality", delta: -2 },
    { metric: "founderHealth", delta: -2 },
  ],
};

export function applyAction(game: GameState, action: ActionId): GameState {
  const effects = ACTION_EFFECTS[action];
  const metrics = effects.reduce(
    (nextMetrics, effect) => applyMetricDelta(nextMetrics, effect.metric, effect.delta),
    game.metrics,
  );

  return {
    ...game,
    metrics,
    log: [...game.log, `执行行动：${action}`],
  };
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm test -- tests/game/advance.test.ts tests/game/createGame.test.ts
```

Expected:

```text
PASS tests/game/advance.test.ts
PASS tests/game/createGame.test.ts
```

- [ ] **Step 7: Commit**

Run:

```bash
git add src/game/engine/rng.ts src/game/engine/advance.ts src/game/engine/actions.ts tests/game/advance.test.ts
git commit -m "feat: advance simulator by quarter"
```

## Task 5: Implement Financing Rules

**Files:**
- Create: `src/game/engine/finance.ts`
- Test: `tests/game/finance.test.ts`

- [ ] **Step 1: Write financing threshold tests**

Create `tests/game/finance.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { evaluateFundraising, executeFundraise } from "../../src/game/engine/finance";

function baseGame() {
  return createNewGame({
    seed: 7,
    founderName: "赵路",
    backgroundId: "serial-founder",
    trackId: "ai-coding",
    attributes: {
      tech: 5,
      sales: 5,
      fundraising: 8,
      management: 4,
      ethics: 3,
      stamina: 4,
      hype: 6,
      luck: 3,
    },
  });
}

describe("finance", () => {
  it("discounts valuation when runway is below six months", () => {
    const game = baseGame();
    const healthy = evaluateFundraising({
      ...game,
      metrics: { ...game.metrics, runway: 12, arr: 12_000_000, pmf: 65 },
    });
    const pressured = evaluateFundraising({
      ...game,
      metrics: { ...game.metrics, runway: 4, arr: 12_000_000, pmf: 65 },
    });

    expect(pressured.valuation).toBeLessThan(healthy.valuation);
    expect(pressured.termStyle).not.toBe("friendly");
  });

  it("unlocks Series A only with ARR and PMF", () => {
    const noPmf = evaluateFundraising({
      ...baseGame(),
      metrics: { ...baseGame().metrics, arr: 12_000_000, pmf: 45 },
    });
    const ready = evaluateFundraising({
      ...baseGame(),
      metrics: { ...baseGame().metrics, arr: 12_000_000, pmf: 65 },
    });

    expect(noPmf.availableRounds).not.toContain("series-a");
    expect(ready.availableRounds).toContain("series-a");
  });

  it("fundraising dilutes founder equity and increases board pressure", () => {
    const game = baseGame();
    const next = executeFundraise({
      ...game,
      metrics: { ...game.metrics, arr: 12_000_000, pmf: 65, runway: 10 },
    });

    expect(next.metrics.cash).toBeGreaterThan(game.metrics.cash);
    expect(next.metrics.founderEquity).toBeLessThan(game.metrics.founderEquity);
    expect(next.metrics.boardPressure).toBeGreaterThan(game.metrics.boardPressure);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/game/finance.test.ts
```

Expected:

```text
FAIL tests/game/finance.test.ts
Cannot find module '../../src/game/engine/finance'
```

- [ ] **Step 3: Implement financing evaluation**

Create `src/game/engine/finance.ts`:

```ts
import { BALANCE } from "../balance";
import type { GameState } from "../types";
import { applyMetricDelta, clampMetric } from "./clamp";

export type FundingRound =
  | "angel"
  | "seed"
  | "pre-a"
  | "series-a"
  | "series-b"
  | "series-c"
  | "strategic"
  | "venture-debt"
  | "pre-ipo";

export interface FundraisingEvaluation {
  score: number;
  availableRounds: FundingRound[];
  valuation: number;
  termStyle: "friendly" | "normal" | "pressure" | "predatory";
  suggestedAmount: number;
  dilution: number;
}

function availableRounds(game: GameState): FundingRound[] {
  const { arr, pmf, grossMargin } = game.metrics;
  const rounds: FundingRound[] = ["angel"];
  if (pmf >= 35) rounds.push("seed");
  if (arr >= 5_000_000 && pmf >= 50) rounds.push("pre-a");
  if (arr >= BALANCE.arr.seriesA && pmf >= BALANCE.pmf.real) rounds.push("series-a");
  if (arr >= BALANCE.arr.seriesB && pmf >= BALANCE.pmf.strong) rounds.push("series-b");
  if (arr >= BALANCE.arr.seriesC && grossMargin >= 40) rounds.push("series-c");
  if (arr >= 30_000_000 || game.metrics.modelPower >= 70) rounds.push("strategic");
  if (arr >= 50_000_000 && grossMargin >= 45) rounds.push("venture-debt");
  if (arr >= BALANCE.arr.hkIpo && grossMargin >= 45) rounds.push("pre-ipo");
  return rounds;
}

function termStyle(game: GameState): FundraisingEvaluation["termStyle"] {
  if (game.metrics.runway < BALANCE.runway.deathSpiral) return "predatory";
  if (game.metrics.runway < BALANCE.runway.pressured || game.metrics.complianceRisk > 60) return "pressure";
  if (game.metrics.marketHeat > 75 && game.metrics.runway >= 12) return "friendly";
  return "normal";
}

export function evaluateFundraising(game: GameState): FundraisingEvaluation {
  const rounds = availableRounds(game);
  const growthStory = game.metrics.pmf + game.metrics.reputation + game.metrics.marketHeat;
  const riskPenalty = game.metrics.complianceRisk + Math.max(0, 6 - game.metrics.runway) * 8;
  const score = clampMetric("reputation", game.founder.attributes.fundraising * 6 + growthStory / 2 - riskPenalty / 2);
  const revenueMultiple = game.metrics.grossMargin >= 55 ? 12 : game.metrics.grossMargin >= 35 ? 8 : 4;
  const technologyPremium = game.metrics.modelPower >= 75 ? 80_000_000 : game.metrics.modelPower >= 55 ? 30_000_000 : 0;
  const runwayDiscount = game.metrics.runway < 6 ? 0.75 : 1;
  const complianceDiscount = game.metrics.complianceRisk > 60 ? 0.8 : 1;
  const valuation = Math.round(Math.max(10_000_000, game.metrics.arr * revenueMultiple + technologyPremium) * runwayDiscount * complianceDiscount);
  const style = termStyle(game);
  const dilution = style === "friendly" ? 10 : style === "normal" ? 15 : style === "pressure" ? 22 : 35;
  const suggestedAmount = Math.round(valuation * (dilution / 100));

  return {
    score,
    availableRounds: rounds,
    valuation,
    termStyle: style,
    suggestedAmount,
    dilution,
  };
}

export function executeFundraise(game: GameState): GameState {
  const evaluation = evaluateFundraising(game);
  const metrics = applyMetricDelta(
    applyMetricDelta(
      applyMetricDelta(game.metrics, "cash", evaluation.suggestedAmount),
      "founderEquity",
      -evaluation.dilution,
    ),
    "boardPressure",
    evaluation.termStyle === "friendly" ? 5 : evaluation.termStyle === "normal" ? 10 : 18,
  );

  return {
    ...game,
    metrics: {
      ...metrics,
      valuation: evaluation.valuation,
      runway: clampMetric("runway", metrics.runway + 12),
    },
    log: [
      ...game.log,
      `完成融资：估值 ${Math.round(evaluation.valuation / 10_000)} 万，稀释 ${evaluation.dilution}%。`,
    ],
  };
}
```

- [ ] **Step 4: Run financing tests**

Run:

```bash
npm test -- tests/game/finance.test.ts
```

Expected:

```text
PASS tests/game/finance.test.ts
```

- [ ] **Step 5: Commit**

Run:

```bash
git add src/game/engine/finance.ts tests/game/finance.test.ts
git commit -m "feat: model funding windows and dilution"
```

## Task 6: Implement Employee Operations And Departure Risk

**Files:**
- Create: `src/game/engine/employees.ts`
- Test: `tests/game/employees.test.ts`

- [ ] **Step 1: Write employee behavior tests**

Create `tests/game/employees.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { calculateDepartureRisk, hireEmployee, retainEmployee } from "../../src/game/engine/employees";

function game() {
  return createNewGame({
    seed: 13,
    founderName: "周见",
    backgroundId: "open-source-maintainer",
    trackId: "ai-coding",
    attributes: {
      tech: 7,
      sales: 3,
      fundraising: 3,
      management: 4,
      ethics: 7,
      stamina: 4,
      hype: 3,
      luck: 3,
    },
  });
}

describe("employees", () => {
  it("hires role cards instead of only increasing headcount", () => {
    const next = hireEmployee(game(), "researcher");
    expect(next.employees).toHaveLength(1);
    expect(next.employees[0].role).toBe("researcher");
    expect(next.metrics.cash).toBeLessThan(game().metrics.cash);
  });

  it("departure risk increases when morale is low and employee is tired", () => {
    const hired = hireEmployee(game(), "researcher");
    const employee = { ...hired.employees[0], fatigue: 90, loyalty: 20 };
    const calmRisk = calculateDepartureRisk({ ...hired, metrics: { ...hired.metrics, morale: 75 } }, employee);
    const crisisRisk = calculateDepartureRisk({ ...hired, metrics: { ...hired.metrics, morale: 20 } }, employee);
    expect(crisisRisk).toBeGreaterThan(calmRisk);
  });

  it("retention spends cash and increases loyalty", () => {
    const hired = hireEmployee(game(), "engineer");
    const employeeId = hired.employees[0].id;
    const retained = retainEmployee(hired, employeeId, "refresh-options");
    expect(retained.metrics.cash).toBeLessThan(hired.metrics.cash);
    expect(retained.employees[0].loyalty).toBeGreaterThan(hired.employees[0].loyalty);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/game/employees.test.ts
```

Expected:

```text
FAIL tests/game/employees.test.ts
Cannot find module '../../src/game/engine/employees'
```

- [ ] **Step 3: Implement employee operations**

Create `src/game/engine/employees.ts`:

```ts
import type { Employee, EmployeeRoleId, GameState } from "../types";
import { applyMetricDelta, clampMetric } from "./clamp";

const ROLE_BASE: Record<EmployeeRoleId, { salary: number; ability: number; tags: string[] }> = {
  researcher: { salary: 900_000, ability: 72, tags: ["论文脑"] },
  engineer: { salary: 700_000, ability: 68, tags: ["野生全栈"] },
  "product-manager": { salary: 620_000, ability: 62, tags: ["路线图召唤师"] },
  sales: { salary: 580_000, ability: 65, tags: ["销售狼"] },
  compliance: { salary: 650_000, ability: 64, tags: ["合规洁癖"] },
  finance: { salary: 620_000, ability: 62, tags: ["表格护法"] },
  cfo: { salary: 1_500_000, ability: 80, tags: ["上市语言包"] },
  "overseas-bd": { salary: 950_000, ability: 70, tags: ["时差战士"] },
};

export type RetentionMove = "raise-salary" | "refresh-options" | "promote" | "vacation";

export function hireEmployee(game: GameState, role: EmployeeRoleId): GameState {
  const base = ROLE_BASE[role];
  const employee: Employee = {
    id: `${role}-${game.employees.length + 1}`,
    name: `员工${game.employees.length + 1}`,
    role,
    level: role === "cfo" ? "cxo" : "mid",
    ability: base.ability,
    salary: base.salary,
    options: role === "cfo" ? 2 : 0.3,
    loyalty: 55,
    ambition: 55,
    fatigue: 15,
    scarcity: role === "researcher" || role === "cfo" ? 85 : 55,
    tags: base.tags,
  };

  return {
    ...game,
    employees: [...game.employees, employee],
    metrics: applyMetricDelta(game.metrics, "cash", -Math.round(base.salary / 2)),
    log: [...game.log, `招聘了${role}，HR 说这位候选人“非常匹配早期团队”。`],
  };
}

export function calculateDepartureRisk(game: GameState, employee: Employee): number {
  const salaryGap = employee.salary < ROLE_BASE[employee.role].salary * 0.85 ? 18 : 0;
  const moralePenalty = game.metrics.morale < 20 ? 30 : game.metrics.morale < 35 ? 18 : game.metrics.morale < 50 ? 8 : 0;
  const poachingPressure = employee.role === "researcher" && game.metrics.modelPower > 70 ? 22 : 0;
  const underwaterOptions = game.metrics.valuation < 20_000_000 && employee.options > 0.5 ? 15 : 0;
  return clampMetric(
    "reputation",
    20 +
      employee.fatigue / 3 +
      salaryGap +
      underwaterOptions +
      moralePenalty +
      employee.ambition / 4 +
      poachingPressure -
      employee.loyalty / 2 -
      game.metrics.reputation / 5,
  );
}

export function retainEmployee(game: GameState, employeeId: string, move: RetentionMove): GameState {
  const cost = move === "raise-salary" ? 400_000 : move === "refresh-options" ? 250_000 : move === "promote" ? 120_000 : 80_000;
  const loyaltyGain = move === "raise-salary" ? 12 : move === "refresh-options" ? 18 : move === "promote" ? 10 : 6;
  const fatigueDelta = move === "vacation" ? -20 : 0;

  return {
    ...game,
    metrics: applyMetricDelta(game.metrics, "cash", -cost),
    employees: game.employees.map((employee) =>
      employee.id === employeeId
        ? {
            ...employee,
            loyalty: clampMetric("reputation", employee.loyalty + loyaltyGain),
            fatigue: clampMetric("reputation", employee.fatigue + fatigueDelta),
            options: move === "refresh-options" ? employee.options + 0.2 : employee.options,
          }
        : employee,
    ),
    log: [...game.log, `对${employeeId}执行留人动作：${move}`],
  };
}
```

- [ ] **Step 4: Run employee tests**

Run:

```bash
npm test -- tests/game/employees.test.ts
```

Expected:

```text
PASS tests/game/employees.test.ts
```

- [ ] **Step 5: Commit**

Run:

```bash
git add src/game/engine/employees.ts tests/game/employees.test.ts
git commit -m "feat: add employee cards and retention mechanics"
```

## Task 7: Implement Events, Achievements, And Endings

**Files:**
- Create: `src/game/engine/events.ts`
- Create: `src/game/engine/achievements.ts`
- Create: `src/game/engine/endings.ts`
- Test: `tests/game/events.test.ts`
- Test: `tests/game/achievements.test.ts`
- Test: `tests/game/endings.test.ts`

- [ ] **Step 1: Write event and outcome tests**

Create `tests/game/events.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { getEligibleEvents, resolveEventChoice } from "../../src/game/engine/events";

describe("events", () => {
  it("surfaces DeepDuck shock only when model moat is vulnerable", () => {
    const game = createNewGame({
      seed: 1,
      founderName: "杜川",
      backgroundId: "former-llm-researcher",
      trackId: "foundation-model",
      attributes: { tech: 8, sales: 3, fundraising: 5, management: 3, ethics: 4, stamina: 5, hype: 4, luck: 2 },
    });

    const eligible = getEligibleEvents({
      ...game,
      metrics: { ...game.metrics, modelPower: 65, computeCost: 70, pmf: 45 },
    });

    expect(eligible.map((event) => event.id)).toContain("deepduck-open-source-shock");
  });

  it("event choices apply metric effects through clamps", () => {
    const game = createNewGame({
      seed: 1,
      founderName: "杜川",
      backgroundId: "former-llm-researcher",
      trackId: "foundation-model",
      attributes: { tech: 8, sales: 3, fundraising: 5, management: 3, ethics: 4, stamina: 5, hype: 4, luck: 2 },
    });
    const event = getEligibleEvents({
      ...game,
      metrics: { ...game.metrics, modelPower: 65, computeCost: 70, pmf: 45 },
    }).find((item) => item.id === "deepduck-open-source-shock")!;

    const next = resolveEventChoice(game, event, event.choices[0].id);
    expect(next.log.at(-1)).toContain(event.title);
  });
});
```

Create `tests/game/achievements.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { unlockAchievements } from "../../src/game/engine/achievements";

describe("achievements", () => {
  it("unlocks ARR achievements only when thresholds are met", () => {
    const game = createNewGame({
      seed: 2,
      founderName: "陈野",
      backgroundId: "serial-founder",
      trackId: "enterprise-knowledge",
      attributes: { tech: 4, sales: 7, fundraising: 7, management: 4, ethics: 3, stamina: 4, hype: 5, luck: 2 },
    });
    const next = unlockAchievements({
      ...game,
      metrics: { ...game.metrics, arr: 10_000_000 },
    });
    expect(next.completedAchievements).toContain("ten-million-arr");
  });
});
```

Create `tests/game/endings.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { evaluateEnding } from "../../src/game/engine/endings";

describe("endings", () => {
  it("prioritizes forced failure over prestige endings", () => {
    const game = createNewGame({
      seed: 3,
      founderName: "王界",
      backgroundId: "serial-founder",
      trackId: "ai-agent",
      attributes: { tech: 5, sales: 6, fundraising: 7, management: 4, ethics: 3, stamina: 4, hype: 6, luck: 2 },
    });
    const ending = evaluateEnding({
      ...game,
      metrics: { ...game.metrics, cash: 0, arr: 800_000_000, grossMargin: 60, complianceRisk: 20 },
    });
    expect(ending?.id).toBe("cashflow-break");
  });

  it("unlocks US IPO only with global revenue and clean compliance", () => {
    const game = createNewGame({
      seed: 4,
      founderName: "秦远",
      backgroundId: "overseas-phd",
      trackId: "ai-coding",
      attributes: { tech: 7, sales: 4, fundraising: 6, management: 4, ethics: 5, stamina: 4, hype: 4, luck: 2 },
    });
    const ending = evaluateEnding({
      ...game,
      year: 2038,
      metrics: { ...game.metrics, arr: 800_000_000, grossMargin: 60, complianceRisk: 20, globalReadiness: 85 },
      markets: {
        ...game.markets,
        us: { ...game.markets.us, unlocked: true, revenueShare: 45, localization: 80 },
      },
    });
    expect(ending?.id).toBe("us-ipo");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- tests/game/events.test.ts tests/game/achievements.test.ts tests/game/endings.test.ts
```

Expected:

```text
FAIL tests/game/events.test.ts
FAIL tests/game/achievements.test.ts
FAIL tests/game/endings.test.ts
```

- [ ] **Step 3: Implement condition evaluation and events**

Create `src/game/engine/events.ts`:

```ts
import type { Condition, GameEvent, GameState } from "../types";
import { events } from "../data/events";
import { applyMetricDelta } from "./clamp";

export function matchesCondition(game: GameState, condition: Condition): boolean {
  const value = game.metrics[condition.metric];
  if (condition.op === ">=") return value >= condition.value;
  if (condition.op === ">") return value > condition.value;
  if (condition.op === "<=") return value <= condition.value;
  if (condition.op === "<") return value < condition.value;
  return value === condition.value;
}

export function matchesAll(game: GameState, trigger: Condition[]): boolean {
  return trigger.every((condition) => matchesCondition(game, condition));
}

export function getEligibleEvents(game: GameState): GameEvent[] {
  return events.filter((event) => matchesAll(game, event.trigger));
}

export function resolveEventChoice(game: GameState, event: GameEvent, choiceId: string): GameState {
  const choice = event.choices.find((item) => item.id === choiceId);
  if (!choice) return game;

  const metrics = choice.effects.reduce(
    (nextMetrics, effect) => applyMetricDelta(nextMetrics, effect.metric, effect.delta),
    game.metrics,
  );

  return {
    ...game,
    metrics,
    log: [...game.log, `${event.title}：${choice.log}`],
  };
}
```

- [ ] **Step 4: Implement achievements and endings**

Create `src/game/engine/achievements.ts`:

```ts
import { achievements } from "../data/achievements";
import type { GameState } from "../types";
import { matchesAll } from "./events";

export function unlockAchievements(game: GameState): GameState {
  const unlocked = new Set(game.completedAchievements);
  const log = [...game.log];

  for (const achievement of achievements) {
    if (!unlocked.has(achievement.id) && matchesAll(game, achievement.trigger)) {
      unlocked.add(achievement.id);
      log.push(`解锁成就：${achievement.name}`);
    }
  }

  return {
    ...game,
    completedAchievements: [...unlocked],
    log,
  };
}
```

Create `src/game/engine/endings.ts`:

```ts
import { endings } from "../data/endings";
import type { Ending, GameState } from "../types";
import { matchesAll } from "./events";

function hasUsRevenue(game: GameState): boolean {
  return game.markets.us.unlocked && game.markets.us.revenueShare >= 40;
}

export function evaluateEnding(game: GameState): Ending | null {
  for (const ending of endings) {
    if (ending.id === "us-ipo" && !hasUsRevenue(game)) continue;
    if (matchesAll(game, ending.trigger)) return ending;
  }
  return null;
}
```

- [ ] **Step 5: Run outcome tests**

Run:

```bash
npm test -- tests/game/events.test.ts tests/game/achievements.test.ts tests/game/endings.test.ts
```

Expected:

```text
PASS tests/game/events.test.ts
PASS tests/game/achievements.test.ts
PASS tests/game/endings.test.ts
```

- [ ] **Step 6: Commit**

Run:

```bash
git add src/game/engine/events.ts src/game/engine/achievements.ts src/game/engine/endings.ts tests/game/events.test.ts tests/game/achievements.test.ts tests/game/endings.test.ts
git commit -m "feat: add event achievements and ending rules"
```

## Task 8: Wire Engine Into A Playable React UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Create: `src/game/ui/CreateFounder.tsx`
- Create: `src/game/ui/Dashboard.tsx`
- Create: `src/game/ui/ActionPanel.tsx`
- Create: `src/game/ui/EventCard.tsx`
- Create: `src/game/ui/EmployeePanel.tsx`
- Create: `src/game/ui/FinancingPanel.tsx`
- Create: `src/game/ui/AnnualReport.tsx`
- Create: `src/game/ui/GameOver.tsx`

- [ ] **Step 1: Create the app state flow**

Modify `src/App.tsx` so the UI has three modes: create founder, play, game over.

```tsx
import { useMemo, useState } from "react";
import type { ActionId, GameEvent, GameState, NewGameInput } from "./game/types";
import { createNewGame } from "./game/engine/createGame";
import { advanceQuarter } from "./game/engine/advance";
import { getEligibleEvents, resolveEventChoice } from "./game/engine/events";
import { unlockAchievements } from "./game/engine/achievements";
import { evaluateEnding } from "./game/engine/endings";
import { CreateFounder } from "./game/ui/CreateFounder";
import { Dashboard } from "./game/ui/Dashboard";
import { ActionPanel } from "./game/ui/ActionPanel";
import { EventCard } from "./game/ui/EventCard";
import { EmployeePanel } from "./game/ui/EmployeePanel";
import { FinancingPanel } from "./game/ui/FinancingPanel";
import { AnnualReport } from "./game/ui/AnnualReport";
import { GameOver } from "./game/ui/GameOver";

export function App() {
  const [game, setGame] = useState<GameState | null>(null);

  const currentEvent = useMemo<GameEvent | null>(() => {
    if (!game || game.endingId) return null;
    return getEligibleEvents(game)[0] ?? null;
  }, [game]);

  function start(input: NewGameInput) {
    setGame(createNewGame(input));
  }

  function applyTurn(actions: ActionId[]) {
    if (!game) return;
    let next = advanceQuarter(game, actions);
    next = unlockAchievements(next);
    const ending = evaluateEnding(next);
    if (ending) next = { ...next, endingId: ending.id };
    setGame(next);
  }

  function chooseEvent(choiceId: string) {
    if (!game || !currentEvent) return;
    setGame(resolveEventChoice(game, currentEvent, choiceId));
  }

  if (!game) return <CreateFounder onStart={start} />;
  if (game.endingId) return <GameOver game={game} />;

  return (
    <main className="app-shell">
      <Dashboard game={game} />
      <div className="game-grid">
        <section className="main-column">
          {currentEvent ? <EventCard event={currentEvent} onChoose={chooseEvent} /> : <ActionPanel onSubmit={applyTurn} />}
          <AnnualReport game={game} />
        </section>
        <aside className="side-column">
          <EmployeePanel game={game} />
          <FinancingPanel game={game} />
        </aside>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Create founder screen**

Create `src/game/ui/CreateFounder.tsx` with controls for founder name, background, track, and the eight attributes. Use fixed presets first; add custom sliders only after the preset flow works.

Required behavior:

- Default founder name: `沈一`
- Default background: `ex-bigtech-pm`
- Default track: `ai-agent`
- Default attributes sum to 24.
- Start button calls `onStart(input)`.

- [ ] **Step 3: Create dashboard and action panel**

Create `Dashboard.tsx` to show:

- Year and quarter.
- Cash, runway, ARR, valuation.
- PMF, modelPower, productQuality, grossMargin, complianceRisk, morale, founderHealth, founderEquity.

Create `ActionPanel.tsx` to let the player select exactly two actions each quarter. Disable submit until two actions are selected.

- [ ] **Step 4: Create event, employee, financing, annual, and game-over panels**

Required display:

- `EventCard`: title, category, trigger flavor text, choice buttons.
- `EmployeePanel`: employees, role, loyalty, fatigue, visible departure risk.
- `FinancingPanel`: available rounds, estimated valuation, term style, dilution.
- `AnnualReport`: latest 12 log lines and completed achievements.
- `GameOver`: ending ID, ending description, final metrics, completed achievements.

- [ ] **Step 5: Style for dense readable play**

Modify `src/styles.css` with:

- Stable grid layout for desktop.
- Single-column mobile layout.
- 8px border radius or less.
- No nested cards.
- Clear status colors for risk and success.
- No negative letter spacing.
- No viewport-scaled font sizes.

- [ ] **Step 6: Run build**

Run:

```bash
npm run build
```

Expected:

```text
vite build completes without TypeScript errors
```

- [ ] **Step 7: Commit**

Run:

```bash
git add src/App.tsx src/styles.css src/game/ui
git commit -m "feat: add playable simulator interface"
```

## Task 9: Add Persistence And Self-Consistency Smoke Tests

**Files:**
- Create: `src/game/engine/persistence.ts`
- Modify: `src/App.tsx`
- Create: `tests/game/smoke.test.ts`

- [ ] **Step 1: Add deterministic 12-year smoke test**

Create `tests/game/smoke.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { advanceQuarter } from "../../src/game/engine/advance";
import { unlockAchievements } from "../../src/game/engine/achievements";
import { evaluateEnding } from "../../src/game/engine/endings";
import { validateContent } from "../../src/game/engine/validation";

describe("12-year smoke simulation", () => {
  it("can run a full game without invalid metrics or content errors", () => {
    expect(validateContent().valid).toBe(true);

    let game = createNewGame({
      seed: 20260630,
      founderName: "压力测试创始人",
      backgroundId: "serial-founder",
      trackId: "ai-agent",
      attributes: { tech: 5, sales: 6, fundraising: 7, management: 4, ethics: 3, stamina: 4, hype: 6, luck: 3 },
    });

    const policy = [
      ["build-product", "sell"],
      ["fundraise", "hire"],
      ["train-model", "build-product"],
      ["govern-compliance", "expand-global"],
    ] as const;

    for (let i = 0; i < 48 && !game.endingId; i += 1) {
      game = advanceQuarter(game, [...policy[i % policy.length]]);
      game = unlockAchievements(game);
      const ending = evaluateEnding(game);
      if (ending) game = { ...game, endingId: ending.id };
      for (const value of Object.values(game.metrics)) {
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
      }
    }

    expect(game.year).toBeLessThanOrEqual(2038);
  });
});
```

- [ ] **Step 2: Implement persistence helpers**

Create `src/game/engine/persistence.ts`:

```ts
import type { GameState } from "../types";

const SAVE_KEY = "ai-startup-simulator-save-v1";

export function saveGame(game: GameState) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(game));
}

export function loadGame(): GameState | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    localStorage.removeItem(SAVE_KEY);
    return null;
  }
}

export function clearGame() {
  localStorage.removeItem(SAVE_KEY);
}
```

- [ ] **Step 3: Wire persistence into App**

Modify `src/App.tsx`:

- On initial render, call `loadGame()`.
- After each state transition, call `saveGame(next)`.
- Add a reset button that calls `clearGame()` and returns to create screen.

- [ ] **Step 4: Run tests and build**

Run:

```bash
npm test
npm run build
```

Expected:

```text
All tests pass
vite build completes
```

- [ ] **Step 5: Commit**

Run:

```bash
git add src/game/engine/persistence.ts src/App.tsx tests/game/smoke.test.ts
git commit -m "feat: persist and smoke test complete runs"
```

## Task 10: Final Verification And Local Run

**Files:**
- Modify only if verification finds defects.

- [ ] **Step 1: Run full verification**

Run:

```bash
npm test
npm run build
```

Expected:

```text
All tests pass
vite build completes
```

- [ ] **Step 2: Start the dev server**

Run:

```bash
npm run dev
```

Expected:

```text
Local: http://127.0.0.1:5173/
```

- [ ] **Step 3: Manual playthrough**

Open `http://127.0.0.1:5173/` and verify:

- Create founder screen starts a game.
- Quarter advances after selecting two actions.
- Metrics change in the dashboard.
- At least one event appears when its trigger is satisfied.
- Employee panel shows role cards and risk values.
- Financing panel changes as ARR, PMF, runway, and compliance change.
- Achievements unlock at visible thresholds.
- A forced failure ending can occur when cash reaches 0.
- UI remains readable at desktop width and mobile width.

- [ ] **Step 4: Commit any verification fixes**

Run:

```bash
git add src tests
git commit -m "fix: polish first playable simulator slice"
```

Skip this commit only if no files changed during verification.

## Self-Review Notes

Spec coverage:

- Initial add points, founder background, and track selection are covered by Tasks 2 and 8.
- China-origin startup with global expansion is covered by market IDs, `globalReadiness`, and Task 8 UI. Detailed regional event depth remains content expansion, not engine risk.
- Financing windows, valuation pressure, dilution, runway discounts, and founder control are covered by Task 5.
- Employee operations, retention, fatigue, loyalty, and departure risk are covered by Task 6.
- Events, achievements, and endings are covered by Tasks 3 and 7.
- Self-consistency is covered by content validation in Task 3 and smoke simulation in Task 9.

Known first-slice limits:

- First playable content uses 8 giant factions, 12 investors, 8 employee roles, 40 events, 20 achievements, and 12 endings.
- The data schema supports the larger design capacity from the spec, so expanding content should require adding rows and passing validation rather than rewriting the engine.

Placeholder scan:

- No placeholder markers, incomplete paths, or undefined task dependencies are intentionally left in this plan.

Type consistency:

- Shared IDs are declared in `src/game/types.ts` and `src/game/constants.ts`.
- Engine functions referenced by tests are created in the same or earlier tasks.
- UI imports only engine functions and domain types defined before Task 8.
