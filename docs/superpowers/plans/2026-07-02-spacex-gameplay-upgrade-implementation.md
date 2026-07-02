# SpaceX Gameplay Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the AI startup simulator into a Chinese, SpaceX-styled mission-control game with differentiated founders, employee quarterly operations, a simulated AI leaderboard, visible achievement conditions, and stronger event cadence.

**Architecture:** Keep deterministic game behavior in `src/game/engine/*` and content in `src/game/data/*`; React components only render state and call engine helpers. Avoid adding persistent randomness: new names and rankings derive from `GameState.seed`, current metrics, and employee count, so old saves stay stable.

**Tech Stack:** React, TypeScript, Vite, Vitest, React Testing Library, CSS modules via `src/styles.css`, lucide-react icons.

---

## File Structure

- Create `src/game/data/founderProfiles.ts`: Chinese background/track labels, descriptions, attribute presets, and metric effects.
- Modify `src/game/engine/createGame.ts`: apply background and track effects to initial metrics.
- Modify `src/game/engine/employees.ts`: deterministic Chinese/English employee name generation.
- Create `src/game/engine/employeeOperations.ts`: apply one employee operation per quarter.
- Create `src/game/engine/leaderboard.ts`: deterministic simulated AI company leaderboard.
- Modify `src/game/data/achievements.ts` and `src/game/types.ts`: add display fields, Chinese names, visible/hidden conditions.
- Modify `src/game/engine/events.ts` and `src/App.tsx`: expose event rotation helper and avoid first-event starvation.
- Modify `src/game/data/actions.ts`, `src/game/data/employeeRoles.ts`: Chinese labels and descriptions.
- Create `src/game/ui/EmployeeOperationPanel.tsx`, `src/game/ui/LeaderboardPanel.tsx`, `src/game/ui/AchievementsModal.tsx`.
- Modify `src/game/ui/CreateFounder.tsx`, `ActionPanel.tsx`, `Dashboard.tsx`, `AnnualReport.tsx`, `EmployeePanel.tsx`, `FinancingPanel.tsx`, `EventCard.tsx`: Chinese UI, new panels, tooltips.
- Modify `src/styles.css`: SpaceX-style dark mission-control visual system.
- Add tests in `tests/game/*` and update `src/App.test.tsx`.

---

### Task 1: Founder Profiles And Initial State

**Files:**
- Create: `src/game/data/founderProfiles.ts`
- Modify: `src/game/engine/createGame.ts`
- Modify: `src/game/ui/CreateFounder.tsx`
- Test: `tests/game/createGame.test.ts`

- [ ] **Step 1: Write failing tests**

Add tests proving two founder backgrounds/tracks produce different initial metrics:

```ts
it("applies background and track effects to initial metrics", () => {
  const researcher = createNewGame({
    seed: 42,
    founderName: "沈一",
    backgroundId: "former-llm-researcher",
    trackId: "foundation-model",
    attributes: { tech: 5, sales: 2, fundraising: 2, management: 2, ethics: 4, stamina: 3, hype: 2, luck: 4 },
  });
  const pm = createNewGame({
    seed: 42,
    founderName: "沈一",
    backgroundId: "ex-bigtech-pm",
    trackId: "enterprise-knowledge",
    attributes: { tech: 3, sales: 3, fundraising: 4, management: 3, ethics: 3, stamina: 3, hype: 3, luck: 2 },
  });

  expect(researcher.metrics.modelPower).toBeGreaterThan(pm.metrics.modelPower);
  expect(pm.metrics.productQuality).toBeGreaterThan(researcher.metrics.productQuality);
});
```

- [ ] **Step 2: Run red**

Run: `npm test -- tests/game/createGame.test.ts`
Expected: FAIL because no profile effects are applied.

- [ ] **Step 3: Implement profile data and effects**

Create profile data with Chinese labels/descriptions and metric effects. In `createNewGame`, merge `createInitialMetrics()` with profile effects via `applyMetricDelta`.

- [ ] **Step 4: Update founder creation UI**

Render Founder Briefing instructions, selectable profile cards, track cards, and preset cards from `founderProfiles.ts`. Keep total attribute points at 24 and ensure all visible copy is Chinese.

- [ ] **Step 5: Run green**

Run: `npm test -- tests/game/createGame.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/game/data/founderProfiles.ts src/game/engine/createGame.ts src/game/ui/CreateFounder.tsx tests/game/createGame.test.ts
git commit -m "feat: differentiate founder starts"
```

---

### Task 2: Deterministic Employees And Employee Operations

**Files:**
- Modify: `src/game/types.ts`
- Modify: `src/game/engine/employees.ts`
- Create: `src/game/engine/employeeOperations.ts`
- Modify: `src/game/engine/turn.ts`
- Create: `src/game/ui/EmployeeOperationPanel.tsx`
- Modify: `src/App.tsx`, `src/game/ui/ActionPanel.tsx`, `src/game/ui/EmployeePanel.tsx`
- Test: `tests/game/employees.test.ts`, `tests/game/employeeOperations.test.ts`, `tests/game/turn.test.ts`

- [ ] **Step 1: Write failing tests**

Add tests for deterministic names and operation effects:

```ts
it("generates stable mixed employee names from seed and hire order", () => {
  const firstRun = hireEmployee(game(), "researcher");
  const secondRun = hireEmployee(game(), "researcher");
  expect(firstRun.employees[0].name).toBe(secondRun.employees[0].name);
  expect(firstRun.employees[0].name).not.toBe("Researcher 1");
});

it("pua incentive raises output but increases fatigue and departure risk", () => {
  const hired = hireEmployee(game(), "engineer");
  const next = applyEmployeeOperation(hired, "pua-incentive");
  expect(next.metrics.productQuality).toBeGreaterThan(hired.metrics.productQuality);
  expect(next.employees[0].fatigue).toBeGreaterThan(hired.employees[0].fatigue);
});
```

- [ ] **Step 2: Run red**

Run: `npm test -- tests/game/employees.test.ts tests/game/employeeOperations.test.ts tests/game/turn.test.ts`
Expected: FAIL because employee operations and name generator do not exist.

- [ ] **Step 3: Implement employee operation engine**

Add `EmployeeOperationId` and `applyEmployeeOperation(game, operationId)`. Implement:
- `raise-salary`: target highest departure risk, spend cash, raise loyalty.
- `refresh-options`: target highest departure risk, dilute founder, raise loyalty.
- `pua-incentive`: increase product/model output, increase fatigue, reduce loyalty/health.
- `vacation`: reduce fatigue, improve morale, small runway/cash cost.
- `layoff`: remove highest cash-pressure employee, add short runway/cash relief, reduce morale/reputation.

- [ ] **Step 4: Wire turn pipeline**

Change `advanceGameTurn(game, actions, employeeOperationId?)` so the employee operation applies after company actions and before achievement/ending evaluation.

- [ ] **Step 5: Render employee operation UI**

Add a panel with five Chinese operation choices. `ActionPanel` submit stays disabled when employees exist and no employee operation is selected; no employees shows a recruitment hint.

- [ ] **Step 6: Run green**

Run: `npm test -- tests/game/employees.test.ts tests/game/employeeOperations.test.ts tests/game/turn.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/game/types.ts src/game/engine/employees.ts src/game/engine/employeeOperations.ts src/game/engine/turn.ts src/game/ui/EmployeeOperationPanel.tsx src/App.tsx src/game/ui/ActionPanel.tsx src/game/ui/EmployeePanel.tsx tests/game/employees.test.ts tests/game/employeeOperations.test.ts tests/game/turn.test.ts
git commit -m "feat: add employee quarter operations"
```

---

### Task 3: Leaderboard And Achievement Display Metadata

**Files:**
- Create: `src/game/engine/leaderboard.ts`
- Create: `src/game/ui/LeaderboardPanel.tsx`
- Create: `src/game/ui/AchievementsModal.tsx`
- Modify: `src/game/data/achievements.ts`
- Modify: `src/game/types.ts`
- Modify: `src/App.tsx`, `src/game/ui/AnnualReport.tsx`
- Test: `tests/game/leaderboard.test.ts`, `tests/game/achievements.test.ts`, `src/App.test.tsx`

- [ ] **Step 1: Write failing tests**

Add tests for player rank movement and hidden conditions:

```ts
it("moves the player upward when metrics become frontier-grade", () => {
  const early = getLeaderboard(gameWithMetrics({ arr: 0, modelPower: 25, productQuality: 25 }));
  const strong = getLeaderboard(gameWithMetrics({ arr: 80_000_000, modelPower: 82, productQuality: 78, globalReadiness: 65 }));
  expect(strong.findIndex((row) => row.id === "player")).toBeLessThan(early.findIndex((row) => row.id === "player"));
});

it("keeps hidden achievement conditions as question marks", () => {
  const hidden = achievements.find((achievement) => achievement.hiddenCondition);
  expect(hidden?.conditionText).toBe("???");
});
```

- [ ] **Step 2: Run red**

Run: `npm test -- tests/game/leaderboard.test.ts tests/game/achievements.test.ts src/App.test.tsx`
Expected: FAIL because leaderboard and achievement display metadata do not exist.

- [ ] **Step 3: Implement leaderboard**

Create deterministic rows for DeepDuck, OpenMind, MoralMachine, Green Furnace, CloudSoft, BytePlanet, Tencentacle, AliCloud Temple, and player. Sort by score descending; include rank delta, focus label, and score.

- [ ] **Step 4: Extend achievements**

Add Chinese `name`, `description`, `conditionText`, `tier`, and `hiddenCondition` fields. Keep unlock triggers unchanged.

- [ ] **Step 5: Render leaderboard and modal**

Add `LeaderboardPanel` to the side column and an “成就” button that opens `AchievementsModal`. Show all achievements, unlocked state, condition text, and `???` for hidden achievements.

- [ ] **Step 6: Run green**

Run: `npm test -- tests/game/leaderboard.test.ts tests/game/achievements.test.ts src/App.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/game/engine/leaderboard.ts src/game/ui/LeaderboardPanel.tsx src/game/ui/AchievementsModal.tsx src/game/data/achievements.ts src/game/types.ts src/App.tsx src/game/ui/AnnualReport.tsx tests/game/leaderboard.test.ts tests/game/achievements.test.ts src/App.test.tsx
git commit -m "feat: add leaderboard and achievement modal"
```

---

### Task 4: Event Cadence And Chinese Content

**Files:**
- Modify: `src/game/engine/events.ts`
- Modify: `src/App.tsx`
- Modify: `src/game/data/actions.ts`
- Modify: `src/game/data/employeeRoles.ts`
- Modify: `src/game/ui/EventCard.tsx`, `Dashboard.tsx`, `FinancingPanel.tsx`
- Test: `tests/game/events.test.ts`, `src/App.test.tsx`

- [ ] **Step 1: Write failing tests**

Add a test that event selection skips resolved events and rotates eligible categories:

```ts
it("selects an unresolved eligible event instead of always returning the first candidate", () => {
  const game = gameWithMetrics({ valuation: 25_000_000, mrr: 300_000 });
  const first = pickNextEvent(game);
  const resolved = { ...game, resolvedEventIds: [first!.id] };
  const second = pickNextEvent(resolved);
  expect(second?.id).not.toBe(first?.id);
});
```

- [ ] **Step 2: Run red**

Run: `npm test -- tests/game/events.test.ts src/App.test.tsx`
Expected: FAIL because `pickNextEvent` does not exist and UI still exposes English labels.

- [ ] **Step 3: Implement event picker**

Export `pickNextEvent(game)` from `events.ts`, filtering resolved events and using a deterministic offset based on year, quarter, and seed.

- [ ] **Step 4: Localize visible content**

Change action names/descriptions, employee role names/descriptions, event category labels, financing labels, and dashboard tooltips to Chinese. Keep ARR/MRR/PMF/Runway/Gross Margin as English labels with `title`.

- [ ] **Step 5: Run green**

Run: `npm test -- tests/game/events.test.ts src/App.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/game/engine/events.ts src/App.tsx src/game/data/actions.ts src/game/data/employeeRoles.ts src/game/ui/EventCard.tsx src/game/ui/Dashboard.tsx src/game/ui/FinancingPanel.tsx tests/game/events.test.ts src/App.test.tsx
git commit -m "feat: improve events and Chinese copy"
```

---

### Task 5: SpaceX Visual System And Browser Verification

**Files:**
- Modify: `src/styles.css`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write UI smoke assertions**

Ensure app renders Chinese core controls:

```ts
expect(screen.getByRole("heading", { name: /Founder Briefing|创始人简报/ })).toBeInTheDocument();
expect(screen.getByRole("button", { name: /开始创业/ })).toBeInTheDocument();
```

- [ ] **Step 2: Run red/green as needed**

Run: `npm test -- src/App.test.tsx`
Expected after UI edits: PASS.

- [ ] **Step 3: Replace CSS palette**

Update `src/styles.css` to a dark SpaceX-inspired mission-control palette: near-black backgrounds, white/cool-gray text, red/green/amber status tones, hard-edged 6-8px controls, dense responsive grids.

- [ ] **Step 4: Full verification**

Run:

```bash
npm test
npm run build
```

Expected: all tests pass and Vite build exits 0.

- [ ] **Step 5: Browser verification**

Start dev server with `npm run dev -- --host 127.0.0.1`, open the local URL in the in-app browser, and verify desktop/mobile screenshots show non-overlapping Chinese UI, achievement modal, leaderboard, and employee operation panel.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/styles.css src/App.test.tsx
git commit -m "style: apply mission control interface"
```

---

## Self-Review

- Spec coverage: founder differentiation, Chinese UI, random names, leaderboard, achievements, event cadence, employee operations, initial instructions, and SpaceX visual style each map to a task.
- Placeholder scan: no task contains open placeholders for future behavior.
- Type consistency: new ids are `EmployeeOperationId`, new engine functions are `applyEmployeeOperation`, `getLeaderboard`, and `pickNextEvent`.
