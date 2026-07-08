import { describe, expect, it } from "vitest";
import { achievements } from "../../src/game/data/achievements";
import { actions } from "../../src/game/data/actions";
import { employeeRoles } from "../../src/game/data/employeeRoles";
import { endings } from "../../src/game/data/endings";
import { events } from "../../src/game/data/events";
import { factions } from "../../src/game/data/factions";
import { investors } from "../../src/game/data/investors";
import { validateContent, validateContentTables } from "../../src/game/engine/validation";
import type { Achievement, EmployeeRole, Ending, Faction, GameEvent, Investor, MetricEffect, PlayerAction } from "../../src/game/types";

function contentTables(): {
  achievements: Achievement[];
  actions: PlayerAction[];
  employeeRoles: EmployeeRole[];
  endings: Ending[];
  events: GameEvent[];
  factions: Faction[];
  investors: Investor[];
} {
  return {
    achievements: structuredClone(achievements) as Achievement[],
    actions: structuredClone(actions) as PlayerAction[],
    employeeRoles: structuredClone(employeeRoles) as EmployeeRole[],
    endings: structuredClone(endings) as Ending[],
    events: structuredClone(events) as GameEvent[],
    factions: structuredClone(factions) as Faction[],
    investors: structuredClone(investors) as Investor[],
  };
}

describe("content validation", () => {
  it("ships the first playable slice content counts", () => {
    expect(events).toHaveLength(50);
    expect(achievements).toHaveLength(47);
    expect(endings).toHaveLength(18);
  });

  it("accepts shipped content without validation errors", () => {
    const result = validateContent();
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("accepts the current content tables through the pure validator", () => {
    expect(validateContentTables(contentTables()).valid).toBe(true);
  });

  it("keeps endings ordered from most forced to most optional", () => {
    const priorities = endings.map((ending) => ending.priority);
    const sorted = [...priorities].sort((a, b) => a - b);
    expect(priorities).toEqual(sorted);
  });

  it("rejects missing required ids", () => {
    const tables = contentTables();
    tables.actions = tables.actions.filter((action) => action.id !== "sell");

    expect(validateContentTables(tables).errors).toContain("actions is missing required id: sell");
  });

  it("rejects duplicate ids", () => {
    const tables = contentTables();
    tables.events.push(structuredClone(tables.events[0]));

    expect(validateContentTables(tables).errors).toContain("events has duplicate id: investor-moat-question");
  });

  it("rejects unknown metrics in triggers and effects", () => {
    const tables = contentTables();
    tables.achievements[0].trigger[0].metric = "not-a-metric" as Achievement["trigger"][number]["metric"];
    tables.events[0].choices[0].effects.push({ metric: "bad-effect", delta: 1 } as unknown as MetricEffect);

    const errors = validateContentTables(tables).errors;
    expect(errors).toContain("achievements/hello-demo references unknown metric: not-a-metric");
    expect(errors).toContain("events/investor-moat-question/show-enterprise-workflows mutates unknown metric: bad-effect");
  });

  it("rejects events with fewer than two choices", () => {
    const tables = contentTables();
    tables.events[0].choices = [tables.events[0].choices[0]];

    expect(validateContentTables(tables).errors).toContain("events/investor-moat-question has fewer than two choices");
  });

  it("rejects event and achievement triggers that are true for a new game", () => {
    const tables = contentTables();
    tables.events[0].trigger = [{ metric: "cash", op: ">=", value: 3_000_000 }];
    tables.achievements[0].trigger = [{ metric: "runway", op: "===", value: 12 }];

    const errors = validateContentTables(tables).errors;
    expect(errors).toContain("events/investor-moat-question trigger is true for a new game");
    expect(errors).toContain("achievements/hello-demo trigger is true for a new game");
  });

  it("rejects ending triggers that are true for a new game", () => {
    const tables = contentTables();
    tables.endings[0].trigger = [{ metric: "cash", op: ">=", value: 3_000_000 }];

    const result = validateContentTables(tables);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("endings/cashflow-break trigger is true for a new game");
  });

  it("rejects missing trigger fields without throwing", () => {
    const tables = contentTables();
    delete (tables.achievements[0] as Partial<Achievement>).trigger;

    expect(() => validateContentTables(tables)).not.toThrow();
    const result = validateContentTables(tables);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("achievements/hello-demo has missing or invalid trigger");
  });

  it("rejects malformed trigger members without throwing", () => {
    const tables = contentTables();
    tables.events[0].trigger.push(null as unknown as GameEvent["trigger"][number]);

    expect(() => validateContentTables(tables)).not.toThrow();
    const result = validateContentTables(tables);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("events/investor-moat-question has malformed trigger condition");
  });

  it("rejects invalid trigger operators", () => {
    const tables = contentTables();
    tables.events[0].trigger[0].op = "==" as GameEvent["trigger"][number]["op"];

    const result = validateContentTables(tables);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("events/investor-moat-question uses invalid operator: ==");
  });

  it("rejects missing event choices without throwing", () => {
    const tables = contentTables();
    delete (tables.events[0] as Partial<GameEvent>).choices;

    expect(() => validateContentTables(tables)).not.toThrow();
    const result = validateContentTables(tables);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("events/investor-moat-question has missing or invalid choices");
  });

  it("rejects malformed event choice members without throwing", () => {
    const tables = contentTables();
    tables.events[0].choices.push(null as unknown as GameEvent["choices"][number]);

    expect(() => validateContentTables(tables)).not.toThrow();
    const result = validateContentTables(tables);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("events/investor-moat-question has malformed choice");
  });

  it("rejects malformed event choice fields", () => {
    const tables = contentTables();
    tables.events[0].choices[0] = {
      id: 123,
      label: null,
      log: undefined,
      effects: [],
    } as unknown as GameEvent["choices"][number];

    const result = validateContentTables(tables);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("events/investor-moat-question has invalid choice id");
    expect(result.errors).toContain("events/investor-moat-question/choice has invalid choice label");
    expect(result.errors).toContain("events/investor-moat-question/choice has invalid choice log");
  });

  it("rejects missing employee role strengths without throwing", () => {
    const tables = contentTables();
    delete (tables.employeeRoles[0] as Partial<EmployeeRole>).strengths;

    expect(() => validateContentTables(tables)).not.toThrow();
    const result = validateContentTables(tables);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("employeeRoles/researcher has missing or invalid strengths");
  });

  it("rejects missing action effects without throwing", () => {
    const tables = contentTables();
    delete (tables.actions[0] as Partial<PlayerAction>).effects;

    expect(() => validateContentTables(tables)).not.toThrow();
    const result = validateContentTables(tables);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("actions/build-product has missing or invalid effects");
  });

  it("rejects missing action metadata without throwing", () => {
    const tables = contentTables();
    delete (tables.actions[0] as Partial<PlayerAction>).efficiency;
    delete (tables.actions[0] as Partial<PlayerAction>).visibleSummary;

    expect(() => validateContentTables(tables)).not.toThrow();
    const result = validateContentTables(tables);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("actions/build-product has missing or invalid efficiency");
    expect(result.errors).toContain("actions/build-product has missing or invalid visibleSummary");
  });

  it("rejects malformed action metadata", () => {
    const tables = contentTables();
    tables.actions[0].category = "chaos" as PlayerAction["category"];
    tables.actions[0].risk = "unsafe" as PlayerAction["risk"];
    tables.actions[0].healthCost = Number.NaN;
    tables.actions[0].visibleSummary = ["", "产品质量↑"];

    const result = validateContentTables(tables);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("actions/build-product has invalid category: chaos");
    expect(result.errors).toContain("actions/build-product has invalid risk: unsafe");
    expect(result.errors).toContain("actions/build-product has non-finite healthCost");
    expect(result.errors).toContain("actions/build-product has invalid visibleSummary item");
  });

  it("rejects invalid action efficiency keys and weights", () => {
    const tables = contentTables();
    tables.actions[0].efficiency = {
      attributes: { tech: Number.NaN, shadow: 0.5 } as PlayerAction["efficiency"]["attributes"],
      metrics: { cash: Number.POSITIVE_INFINITY, mystery: 0.2 } as PlayerAction["efficiency"]["metrics"],
    };

    const errors = validateContentTables(tables).errors;
    expect(errors).toContain("actions/build-product references unknown efficiency attribute: shadow");
    expect(errors).toContain("actions/build-product has non-finite efficiency attribute weight: tech");
    expect(errors).toContain("actions/build-product references unknown efficiency metric: mystery");
    expect(errors).toContain("actions/build-product has non-finite efficiency metric weight: cash");
  });

  it("rejects missing event choice effects without throwing", () => {
    const tables = contentTables();
    delete (tables.events[0].choices[0] as Partial<GameEvent["choices"][number]>).effects;

    expect(() => validateContentTables(tables)).not.toThrow();
    const result = validateContentTables(tables);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("events/investor-moat-question/show-enterprise-workflows has missing or invalid effects");
  });

  it("rejects malformed effect members without throwing", () => {
    const tables = contentTables();
    tables.actions[0].effects.push(null as unknown as MetricEffect);

    expect(() => validateContentTables(tables)).not.toThrow();
    const result = validateContentTables(tables);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("actions/build-product has malformed effect");
  });

  it("rejects duplicate choice ids and non-finite numbers", () => {
    const tables = contentTables();
    tables.events[0].choices[1].id = tables.events[0].choices[0].id;
    tables.events[0].trigger[0].value = Number.NaN;
    tables.events[0].choices[0].effects[0].delta = Number.POSITIVE_INFINITY;

    const errors = validateContentTables(tables).errors;
    expect(errors).toContain("events/investor-moat-question has duplicate choice id: show-enterprise-workflows");
    expect(errors).toContain("events/investor-moat-question has non-finite condition value");
    expect(errors).toContain("events/investor-moat-question/show-enterprise-workflows has non-finite effect delta");
  });
});
