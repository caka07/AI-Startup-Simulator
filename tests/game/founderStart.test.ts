import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { deriveFounderAttributes } from "../../src/game/engine/founderStart";
import type { FounderAttributes } from "../../src/game/types";

describe("founder startup profile derivation", () => {
  it("derives exact final attributes from background, track, and preset effects", () => {
    expect(
      deriveFounderAttributes({
        seed: 42,
        founderName: "沈一",
        backgroundId: "former-llm-researcher",
        trackId: "foundation-model",
        presetId: "researcher",
      }),
    ).toEqual({
      tech: 10,
      sales: 1,
      fundraising: 3,
      management: 2,
      ethics: 5,
      stamina: 2,
      hype: 2,
      luck: 4,
    });
  });

  it("defaults missing presetId to operator metric effects", () => {
    const game = createNewGame({
      seed: 42,
      founderName: "沈一",
      backgroundId: "ex-bigtech-pm",
      trackId: "ai-agent",
    });

    expect(game.metrics.pmf).toBe(33);
    expect(game.metrics.morale).toBe(63);
  });

  it("keeps provided custom attributes unchanged while applying preset metric effects", () => {
    const customAttributes: FounderAttributes = {
      tech: 4,
      sales: 7,
      fundraising: 6,
      management: 4,
      ethics: 4,
      stamina: 5,
      hype: 7,
      luck: 3,
    };

    const game = createNewGame({
      seed: 42,
      founderName: "沈一",
      backgroundId: "ex-bigtech-pm",
      trackId: "ai-agent",
      presetId: "rainmaker",
      attributes: customAttributes,
    });

    expect(game.founder.attributes).toEqual(customAttributes);
    expect(game.metrics.valuation).toBe(13_000_000);
    expect(game.metrics.marketHeat).toBe(60);
    expect(game.metrics.boardPressure).toBe(2);
  });

  it("clamps derived attributes to the 1 through 10 range", () => {
    const attributes = deriveFounderAttributes({
      seed: 42,
      founderName: "沈一",
      backgroundId: "former-llm-researcher",
      trackId: "foundation-model",
      presetId: "researcher",
    });

    expect(Math.min(...Object.values(attributes))).toBeGreaterThanOrEqual(1);
    expect(Math.max(...Object.values(attributes))).toBeLessThanOrEqual(10);
    expect(attributes.tech).toBe(10);
    expect(attributes.sales).toBe(1);
  });
});
