import { describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { advanceGameTurn } from "../../src/game/engine/turn";

function createTurnGame() {
  return createNewGame({
    seed: 20260630,
    founderName: "回合测试创始人",
    backgroundId: "serial-founder",
    trackId: "ai-agent",
    attributes: { tech: 5, sales: 6, fundraising: 7, management: 4, ethics: 3, stamina: 4, hype: 6, luck: 3 },
  });
}

describe("advanceGameTurn", () => {
  it("matches App semantics for a combined fundraise and hire turn", () => {
    const next = advanceGameTurn(createTurnGame(), ["fundraise", "hire"]);

    expect(next.year).toBe(2026);
    expect(next.quarter).toBe(2);
    expect(next.employees).toHaveLength(1);
    expect(next.employees[0].role).toBe("researcher");
    expect(next.metrics.cash).toBe(4_052_000);
    expect(next.metrics.founderEquity).toBe(85);
    expect(next.metrics.founderHealth).toBe(78);
    expect(next.metrics.boardPressure).toBe(10);
  });
});
