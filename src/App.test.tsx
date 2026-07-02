import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";
import { createNewGame } from "./game/engine/createGame";
import { getEligibleEvents } from "./game/engine/events";
import { hireEmployee } from "./game/engine/employees";
import { loadGame, saveGame } from "./game/engine/persistence";
import { advanceGameTurn } from "./game/engine/turn";
import type { GameState } from "./game/types";

import "@testing-library/jest-dom/vitest";

describe("App", () => {
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

  function createSavedGame(overrides: Partial<GameState> = {}) {
    return {
      ...createNewGame({
        seed: 20260630,
        founderName: "存档创始人",
        backgroundId: "serial-founder",
        trackId: "ai-agent",
        attributes: { tech: 5, sales: 6, fundraising: 7, management: 4, ethics: 3, stamina: 4, hype: 6, luck: 3 },
      }),
      ...overrides,
    };
  }

  beforeEach(() => {
    installMemoryStorage();
  });

  function startGame() {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "开始创业" }));
  }

  function metricCell(label: string) {
    const labelNode = screen.getByText(label);
    const cell = labelNode.closest(".metric-cell");
    if (!cell) throw new Error(`Missing metric cell for ${label}`);
    return within(cell as HTMLElement);
  }

  it("starts a new game from the default founder setup", () => {
    render(<App />);

    expect(screen.getByLabelText("创始人姓名")).toHaveValue("沈一");
    expect(
      within(screen.getByRole("region", { name: "创业身份" })).getByRole("button", { name: /大厂产品经理/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(screen.getByRole("region", { name: "创业赛道" })).getByRole("button", { name: /AI Agent/ }),
    ).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "开始创业" }));

    expect(screen.getByRole("heading", { name: "2026 Q1" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "本季度动作" })).toBeInTheDocument();
    expect(loadGame()?.founder.name).toBe("沈一");
  });

  it("requires exactly two actions and resets selected actions after advancing", () => {
    startGame();

    const submit = screen.getByRole("button", { name: "推进季度" });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox", { name: /Build Product/ }));
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox", { name: /Train Model/ }));
    expect(submit).toBeEnabled();

    fireEvent.click(submit);

    expect(screen.getByRole("heading", { name: "2026 Q2" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Build Product/ })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Train Model/ })).not.toBeChecked();
    expect(loadGame()?.quarter).toBe(2);
  });

  it("returns to the action flow after resolving one event when multiple events are eligible", () => {
    startGame();

    fireEvent.click(screen.getByRole("checkbox", { name: /Sell/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Build Product/ }));
    fireEvent.click(screen.getByRole("button", { name: "推进季度" }));

    expect(screen.getByRole("heading", { name: "Sales Promised Private Deployment" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Renegotiate to cloud" }));

    expect(screen.getByRole("heading", { name: "本季度动作" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Enterprise Churn Scare" })).not.toBeInTheDocument();
    expect(loadGame()?.metrics.grossMargin).toBe(39);
  });

  it("does not show a resolved event again on the next quarter", () => {
    startGame();

    fireEvent.click(screen.getByRole("checkbox", { name: /Sell/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Build Product/ }));
    fireEvent.click(screen.getByRole("button", { name: "推进季度" }));
    fireEvent.click(screen.getByRole("button", { name: "Renegotiate to cloud" }));

    fireEvent.click(screen.getByRole("checkbox", { name: /Build Product/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Train Model/ }));
    fireEvent.click(screen.getByRole("button", { name: "推进季度" }));

    expect(screen.queryByRole("heading", { name: "Sales Promised Private Deployment" })).not.toBeInTheDocument();
  });

  it("routes Fundraise through the financing engine", () => {
    startGame();

    fireEvent.click(screen.getByRole("checkbox", { name: /Fundraise/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Build Product/ }));
    fireEvent.click(screen.getByRole("button", { name: "推进季度" }));

    expect(metricCell("现金").getByText("¥450万")).toBeInTheDocument();
    expect(metricCell("创始人股权").getByText("85%")).toBeInTheDocument();
    expect(metricCell("创始人健康").getByText("77%")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Investor Asks Where The Moat Is" })).not.toBeInTheDocument();
  });

  it("creates a real employee when Hire is submitted with Fundraise", () => {
    startGame();

    fireEvent.click(screen.getByRole("checkbox", { name: /Hire/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Fundraise/ }));
    fireEvent.click(screen.getByRole("button", { name: "推进季度" }));

    const employeeRow = screen.getByRole("row", { name: /Researcher/ });
    expect(within(employeeRow).getByText("Researcher")).toBeInTheDocument();
    expect(within(employeeRow).getAllByText(/\d+%/).length).toBeGreaterThanOrEqual(3);
  });

  it("requires one employee operation when the company has employees", () => {
    const withEmployee = hireEmployee(createSavedGame(), "engineer");
    saveGame({
      ...withEmployee,
      resolvedEventIds: getEligibleEvents(withEmployee).map((event) => event.id),
    });
    render(<App />);

    expect(screen.getByRole("heading", { name: "员工季度操作" })).toBeInTheDocument();
    const submit = screen.getByRole("button", { name: "推进季度" });

    fireEvent.click(screen.getByRole("checkbox", { name: /Build Product/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Sell/ }));
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /加薪留人/ }));
    expect(submit).toBeEnabled();

    fireEvent.click(submit);
    expect(loadGame()?.log.some((entry) => entry.includes("员工操作"))).toBe(true);
  });

  it("opens an achievement panel with visible progress and hidden conditions", () => {
    saveGame(createSavedGame());

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "成就" }));

    expect(screen.getByRole("dialog", { name: "成就" })).toBeInTheDocument();
    expect(screen.getAllByText("???").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/MRR/).length).toBeGreaterThan(0);
  });

  it("loads a saved active game and can reset it during play", () => {
    saveGame(createSavedGame({ year: 2027, quarter: 3 }));

    render(<App />);

    expect(screen.getByRole("heading", { name: "2027 Q3" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "重置存档" }));

    expect(screen.getByRole("heading", { name: "创始人简报" })).toBeInTheDocument();
    expect(loadGame()).toBeNull();
  });

  it("renders a saved ended game and can reset it from game over", () => {
    saveGame(createSavedGame({ endingId: "cashflow-break" }));

    render(<App />);

    expect(screen.getByRole("heading", { name: "Cashflow Break" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "重置存档" }));

    expect(screen.getByRole("heading", { name: "创始人简报" })).toBeInTheDocument();
    expect(loadGame()).toBeNull();
  });

  it("restores a pending event prompt from a saved game after reload", () => {
    saveGame(advanceGameTurn(createSavedGame(), ["sell", "build-product"]));

    render(<App />);

    expect(screen.getByRole("heading", { name: "Sales Promised Private Deployment" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "本季度动作" })).not.toBeInTheDocument();
  });

  it("shows the action panel when a saved eligible event was already resolved", () => {
    const saved = advanceGameTurn(createSavedGame(), ["sell", "build-product"]);
    const resolvedEventIds = getEligibleEvents(saved).map((event) => event.id);
    expect(resolvedEventIds).toContain("sales-promised-private-deployment");
    saveGame({
      ...saved,
      resolvedEventIds,
    });

    render(<App />);

    expect(screen.queryByRole("heading", { name: "Sales Promised Private Deployment" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "本季度动作" })).toBeInTheDocument();
  });
});
