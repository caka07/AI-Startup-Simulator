import { beforeEach, describe, expect, it } from "vitest";
import { createNewGame } from "../../src/game/engine/createGame";
import { clearGame, loadGame, saveGame } from "../../src/game/engine/persistence";
import { advanceGameTurn } from "../../src/game/engine/turn";
import { validateContent } from "../../src/game/engine/validation";
import type { GameState } from "../../src/game/types";

const SAVE_KEY = "ai-startup-simulator-save-v1";

function installMemoryStorage(): Storage {
  const values = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: storage,
  });
  return storage;
}

function installThrowingStorage(overrides: Partial<Storage>): Storage {
  const storage = {
    get length() {
      return 0;
    },
    clear: () => undefined,
    getItem: () => null,
    key: () => null,
    removeItem: () => undefined,
    setItem: () => undefined,
    ...overrides,
  } as Storage;
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: storage,
  });
  return storage;
}

function createSmokeGame() {
  return createNewGame({
    seed: 20260630,
    founderName: "压力测试创始人",
    backgroundId: "serial-founder",
    trackId: "ai-agent",
    attributes: { tech: 5, sales: 6, fundraising: 7, management: 4, ethics: 3, stamina: 4, hype: 6, luck: 3 },
  });
}

describe("12-year smoke simulation", () => {
  it("can run a full game without invalid metrics or content errors", () => {
    const validation = validateContent();
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);

    let game = createSmokeGame();

    const policy = [
      ["build-product", "sell"],
      ["fundraise", "hire"],
      ["train-model", "build-product"],
      ["govern-compliance", "expand-global"],
    ] as const;

    for (let i = 0; i < 48 && !game.endingId; i += 1) {
      game = advanceGameTurn(game, [...policy[i % policy.length]]);
      for (const value of Object.values(game.metrics)) {
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
      }
    }

    expect(game.year).toBeLessThanOrEqual(2038);
  });
});

describe("game persistence", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = installMemoryStorage();
  });

  it("round-trips a saved game state", () => {
    const game = createSmokeGame();

    saveGame(game);

    expect(loadGame()).toEqual(game);
  });

  it("removes corrupt saved JSON and returns null", () => {
    storage.setItem(SAVE_KEY, "{not-json");

    expect(loadGame()).toBeNull();
    expect(storage.getItem(SAVE_KEY)).toBeNull();
  });

  it("removes empty saved values and returns null", () => {
    storage.setItem(SAVE_KEY, "");

    expect(loadGame()).toBeNull();
    expect(storage.getItem(SAVE_KEY)).toBeNull();
  });

  it("removes invalid saved game shapes and returns null", () => {
    storage.setItem(SAVE_KEY, JSON.stringify({}));

    expect(loadGame()).toBeNull();
    expect(storage.getItem(SAVE_KEY)).toBeNull();
  });

  it("normalizes valid saves that predate resolved event persistence", () => {
    const legacyGame = createSmokeGame();
    const { resolvedEventIds: _resolvedEventIds, ...legacySave } = legacyGame as GameState & {
      resolvedEventIds?: string[];
    };
    storage.setItem(SAVE_KEY, JSON.stringify(legacySave));

    expect(loadGame()).toEqual({ ...legacyGame, resolvedEventIds: [] });
  });

  it("clears saved game state", () => {
    saveGame(createSmokeGame());

    clearGame();

    expect(loadGame()).toBeNull();
  });

  it("does not throw when browser storage writes fail", () => {
    installThrowingStorage({
      setItem: () => {
        throw new Error("quota exceeded");
      },
    });

    expect(() => saveGame(createSmokeGame())).not.toThrow();
  });

  it("returns null when browser storage reads fail", () => {
    installThrowingStorage({
      getItem: () => {
        throw new Error("storage blocked");
      },
    });

    expect(loadGame()).toBeNull();
  });

  it("does not throw when browser storage removes fail", () => {
    installThrowingStorage({
      removeItem: () => {
        throw new Error("storage blocked");
      },
    });

    expect(() => clearGame()).not.toThrow();
  });
});
