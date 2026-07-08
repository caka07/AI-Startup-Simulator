import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";
import { createNewGame } from "./game/engine/createGame";
import { getEligibleEvents } from "./game/engine/events";
import { hireEmployee } from "./game/engine/employees";
import { deriveFounderAttributes } from "./game/engine/founderStart";
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
        companyName: "存档智能",
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

  function makeFounderOverBudget() {
    fireEvent.change(screen.getByLabelText("管理"), { target: { value: "9" } });
  }

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

  function currentEventPanel() {
    const eyebrow = screen.getByText(/突发事件/);
    const panel = eyebrow.closest("section");
    if (!panel) throw new Error("Missing event panel");
    return within(panel as HTMLElement);
  }

  function panelByHeading(name: string) {
    const heading = screen.getByRole("heading", { name });
    const panel = heading.closest("section");
    if (!panel) throw new Error(`Missing panel for ${name}`);
    return within(panel as HTMLElement);
  }

  function resolveCurrentEvent(choiceIndex = 0): string {
    const panel = currentEventPanel();
    const title = panel.getByRole("heading").textContent ?? "";
    const choices = panel.getAllByRole("button");
    fireEvent.click(choices[choiceIndex]);
    return title;
  }

  it("starts a new game from the default founder setup", () => {
    render(<App />);

    expect(screen.getByLabelText("创始人姓名")).toHaveValue("nobody");
    expect(screen.getByLabelText("公司名称")).toHaveValue("nobody");
    expect(
      within(screen.getByRole("region", { name: "创业身份" })).getByRole("button", { name: /大厂产品经理/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(screen.getByRole("region", { name: "创业赛道" })).getByRole("button", { name: /AI Agent/ }),
    ).toHaveAttribute("aria-pressed", "true");

    expect(screen.getByText("属性总和 30")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始创业" })).toBeEnabled();
    makeFounderOverBudget();
    expect(screen.getByRole("button", { name: "开始创业" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("管理"), { target: { value: "6" } });
    fireEvent.change(screen.getByLabelText("公司名称"), { target: { value: "火星账本" } });
    fireEvent.click(screen.getByRole("button", { name: "开始创业" }));

    expect(screen.getByRole("heading", { name: "2026 Q1" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "本季度动作" })).toBeInTheDocument();
    expect(loadGame()?.founder.name).toBe("nobody");
    expect(loadGame()?.companyName).toBe("火星账本");
  });

  it("starts with attributes derived from identity track and preset", () => {
    render(<App />);

    fireEvent.click(within(screen.getByRole("region", { name: "创业身份" })).getByRole("button", { name: /海外博士/ }));
    fireEvent.click(within(screen.getByRole("region", { name: "创业赛道" })).getByRole("button", { name: /金融 AI/ }));
    fireEvent.click(within(screen.getByRole("group", { name: "属性预设" })).getByRole("button", { name: /技术型/ }));
    fireEvent.click(screen.getByRole("button", { name: "开始创业" }));

    expect(loadGame()?.founder.attributes).toEqual(
      deriveFounderAttributes({
        seed: 20260702,
        founderName: "nobody",
        backgroundId: "overseas-phd",
        trackId: "finance-ai",
        presetId: "researcher",
      }),
    );
  });

  it("keeps selected preset metric effects after attribute customization", () => {
    render(<App />);

    fireEvent.click(within(screen.getByRole("group", { name: "属性预设" })).getByRole("button", { name: /全球化/ }));
    fireEvent.change(screen.getByLabelText("管理"), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "开始创业" }));

    const saved = loadGame();
    expect(saved?.founder.attributes.management).toBe(4);
    expect(saved?.metrics.globalReadiness).toBe(16);
    expect(saved?.metrics.pmf).toBe(31);
  });

  it("requires exactly two actions and resets selected actions after advancing", () => {
    startGame();

    const submit = screen.getByRole("button", { name: "推进季度" });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox", { name: /研发产品/ }));
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox", { name: /训练模型/ }));
    expect(submit).toBeEnabled();

    fireEvent.click(submit);

    expect(screen.getByRole("heading", { name: "2026 Q2" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /研发产品/ })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: /训练模型/ })).not.toBeChecked();
    expect(loadGame()?.quarter).toBe(2);
  });

  it("renders company action controls in Chinese", () => {
    startGame();

    expect(screen.getByRole("checkbox", { name: /研发产品/ })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: /Build Product/ })).not.toBeInTheDocument();
  });

  it("shows Chinese play instructions and does not require a 24 point total", () => {
    render(<App />);

    expect(screen.getByText(/从一间会议室打到全球榜单/)).toBeInTheDocument();
    expect(screen.getByText(/上市不是结局，现金流才是氧气/)).toBeInTheDocument();
    expect(screen.queryByText(/属性点 .*\/24/)).not.toBeInTheDocument();
    expect(screen.getByText(/属性总和小于等于 30/)).toBeInTheDocument();
    expect(screen.queryByText(/后门|盯住|无双模式/)).not.toBeInTheDocument();
  });

  it("shows action trends and paid extra action controls after game start", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /开始创业/ }));

    const actionPanel = panelByHeading("本季度动作");
    expect(actionPanel.getAllByText(/模型能力↑/).length).toBeGreaterThan(0);
    expect(actionPanel.queryByText(/模型能力 \+\d+/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /增加额外动作/ })).toBeInTheDocument();
    expect(screen.getByText(/创始人动作会在公司动作后结算/)).toBeInTheDocument();
    expect(actionPanel.getByRole("button", { name: /强制休假/ })).toHaveAttribute("aria-pressed", "false");
    expect(actionPanel.getAllByText(/创始人健康↑/).length).toBeGreaterThan(0);
    expect(actionPanel.queryByText(/创始人健康 \+12/)).not.toBeInTheDocument();
    expect(actionPanel.getByRole("button", { name: /平稳度过/ })).toBeInTheDocument();
    expect(actionPanel.queryByRole("combobox", { name: "创始人本季度动作" })).not.toBeInTheDocument();
  });

  it("renders the active game as a mission bridge instead of a plain report grid", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /开始创业/ }));

    expect(screen.getByRole("region", { name: "任务舰桥" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "操作甲板" })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "情报舱" })).toBeInTheDocument();
    expect(screen.getByLabelText("任务态势")).toBeInTheDocument();
    expect(screen.getByText("现金流氧气")).toBeInTheDocument();
    expect(screen.getByText("健康心率")).toBeInTheDocument();
  });

  it("lets the founder choose a quarterly founder action", () => {
    saveGame({
      ...createSavedGame(),
      metrics: { ...createSavedGame().metrics, founderHealth: 50 },
      resolvedEventIds: getEligibleEvents(createSavedGame()).map((event) => event.id),
    });
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /强制休假/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /研发产品/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /冲销售/ }));
    fireEvent.click(screen.getByRole("button", { name: "推进季度" }));

    expect(loadGame()?.log.some((entry) => entry.includes("创始人动作：强制休假"))).toBe(true);
    expect(loadGame()?.metrics.founderHealth).toBeGreaterThan(50);
  });

  it("keeps employee operations optional after hiring", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /开始创业/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /^招聘$/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /^研发产品$/ }));
    fireEvent.click(screen.getByRole("button", { name: /推进季度/ }));
    if (screen.queryByText(/突发事件/)) {
      resolveCurrentEvent();
    }

    expect(screen.getByText(/可选/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: /^研发产品$/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /^训练模型$/ }));
    expect(screen.getByRole("button", { name: /推进季度/ })).toBeEnabled();
  });

  it("returns to the action flow after resolving one event when multiple events are eligible", () => {
    startGame();

    fireEvent.click(screen.getByRole("checkbox", { name: /冲销售/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /研发产品/ }));
    fireEvent.click(screen.getByRole("button", { name: "推进季度" }));

    expect(screen.queryByRole("heading", { name: "本季度动作" })).not.toBeInTheDocument();
    resolveCurrentEvent();

    expect(screen.getByRole("heading", { name: "本季度动作" })).toBeInTheDocument();
    expect(loadGame()?.resolvedEventIds.length).toBeGreaterThan(0);
  });

  it("does not show a resolved event again on the next quarter", () => {
    startGame();

    fireEvent.click(screen.getByRole("checkbox", { name: /冲销售/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /研发产品/ }));
    fireEvent.click(screen.getByRole("button", { name: "推进季度" }));
    const resolvedTitle = resolveCurrentEvent();

    fireEvent.click(screen.getByRole("checkbox", { name: /研发产品/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /训练模型/ }));
    fireEvent.click(screen.getByRole("button", { name: "推进季度" }));

    expect(screen.queryByRole("heading", { name: resolvedTitle })).not.toBeInTheDocument();
  });

  it("routes Fundraise through the financing engine", () => {
    startGame();

    fireEvent.click(screen.getByRole("checkbox", { name: /融资/ }));
    const investorSelection = screen.getByRole("region", { name: "投资人选择" });
    expect(within(investorSelection).getByText(/选择本轮领投/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "推进季度" })).toBeDisabled();
    expect(within(investorSelection).queryByRole("button", { name: /自动匹配/ })).not.toBeInTheDocument();
    fireEvent.click(within(investorSelection).getByRole("button", { name: /Kevin Founder/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /研发产品/ }));
    expect(screen.getByRole("button", { name: "推进季度" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "推进季度" }));

    expect(metricCell("现金").getByText("¥400万")).toBeInTheDocument();
    expect(metricCell("创始人股权").getByText("90%")).toBeInTheDocument();
    expect(metricCell("创始人健康").getByText("77%")).toBeInTheDocument();
    expect(loadGame()?.log.some((entry) => entry.includes("Kevin Founder"))).toBe(true);
    expect(screen.queryByRole("heading", { name: "投资人追问护城河" })).not.toBeInTheDocument();
  });

  it("creates a real employee when Hire is submitted with Fundraise", () => {
    startGame();

    fireEvent.click(screen.getByRole("checkbox", { name: /^招聘$/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /^融资$/ }));
    fireEvent.click(screen.getByRole("button", { name: "推进季度" }));

    const employeeRow = screen.getByRole("row", { name: /研究员/ });
    expect(within(employeeRow).getByText("研究员")).toBeInTheDocument();
    expect(within(employeeRow).getAllByText(/\d+%/).length).toBeGreaterThanOrEqual(3);
  });

  it("keeps employee operation optional when the company has employees", () => {
    const withEmployee = hireEmployee(createSavedGame(), "engineer");
    saveGame({
      ...withEmployee,
      resolvedEventIds: getEligibleEvents(withEmployee).map((event) => event.id),
    });
    render(<App />);

    expect(screen.getByRole("heading", { name: "员工季度操作" })).toBeInTheDocument();
    expect(screen.getAllByText("工程师").length).toBeGreaterThan(0);
    expect(screen.queryByText("engineer")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: /员工操作/ })).not.toBeInTheDocument();
    expect(panelByHeading("员工季度操作").getAllByRole("button", { name: /平稳度过/ }).length).toBeGreaterThan(0);
    const submit = screen.getByRole("button", { name: "推进季度" });

    fireEvent.click(screen.getByRole("checkbox", { name: /研发产品/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /冲销售/ }));
    expect(submit).toBeEnabled();

    fireEvent.click(screen.getAllByRole("button", { name: /加薪留人/ })[0]);
    expect(submit).toBeEnabled();

    fireEvent.click(submit);
    expect(loadGame()?.log.some((entry) => entry.includes("员工操作"))).toBe(true);
  });

  it("shows localized financing term labels", () => {
    saveGame(createSavedGame());

    render(<App />);

    expect(screen.getAllByText("常规条款").length).toBeGreaterThan(0);
    expect(screen.getByText("Kevin Founder")).toBeInTheDocument();
    expect(screen.getByText(/看重创始人健康/)).toBeInTheDocument();
    expect(screen.queryByText("normal")).not.toBeInTheDocument();
  });

  it("opens an achievement panel with visible progress and hidden conditions", () => {
    saveGame(createSavedGame());

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "成就" }));

    expect(screen.getByRole("dialog", { name: "成就" })).toBeInTheDocument();
    expect(screen.getAllByText(/解锁条件：？？？/).length).toBeGreaterThan(0);
    expect(screen.getByText("静默期邪教徒")).toBeInTheDocument();
    expect(screen.getByText(/解锁条件：月度经常性收入高于 0/)).toBeInTheDocument();
    expect(screen.queryByText(/>=|<=|===|>|</)).not.toBeInTheDocument();
  });

  it("uses custom metric tooltips and shows the company in the leaderboard", () => {
    saveGame(createSavedGame({ companyName: "霜火智能" }));

    render(<App />);

    expect(screen.getByText("排行榜")).toBeInTheDocument();
    expect(screen.queryByText("AI 公司排行榜")).not.toBeInTheDocument();
    expect(screen.getAllByText("霜火智能").length).toBeGreaterThan(0);

    const runwayLabel = screen.getByText("Runway");
    expect(runwayLabel).toHaveAttribute("data-tooltip", expect.stringContaining("公司现金还能支撑"));
    expect(runwayLabel).not.toHaveAttribute("title");
    expect(screen.getByRole("button", { name: /健康建议/ })).toHaveAttribute(
      "data-tooltip",
      expect.stringContaining("强制休假"),
    );
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

    expect(screen.getByRole("heading", { name: "现金流断裂" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "重置存档" }));

    expect(screen.getByRole("heading", { name: "创始人简报" })).toBeInTheDocument();
    expect(loadGame()).toBeNull();
  });

  it("recalculates runway from cash when loading an old active save", () => {
    saveGame(createSavedGame({ metrics: { ...createSavedGame().metrics, cash: 0, runway: 12 } }));

    render(<App />);

    expect(screen.getByRole("heading", { name: "现金流断裂" })).toBeInTheDocument();
    expect(loadGame()?.metrics.runway).toBe(0);
    expect(loadGame()?.endingId).toBe("cashflow-break");
  });

  it("shows a milestone settlement page without stopping play", () => {
    saveGame({
      ...createSavedGame({
        metrics: {
          ...createSavedGame().metrics,
          arr: 90_000_000,
          grossMargin: 52,
          complianceRisk: 25,
          globalReadiness: 60,
          founderHealth: 70,
          valuation: 900_000_000,
        },
      }),
      resolvedEventIds: getEligibleEvents(createSavedGame()).map((event) => event.id),
    });
    render(<App />);

    fireEvent.click(screen.getByRole("checkbox", { name: /研发产品/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /治理合规/ }));
    fireEvent.click(screen.getByRole("button", { name: "推进季度" }));

    expect(screen.getByRole("dialog", { name: /阶段结局/ })).toBeInTheDocument();
    expect(screen.getByText(/港股 IPO MVP 结算页/)).toBeInTheDocument();
    expect(loadGame()?.completedEndings).toContain("hk-ipo");
    expect(loadGame()?.endingId).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "继续创业" }));
    expect(screen.getByRole("heading", { name: "本季度动作" })).toBeInTheDocument();
  });

  it("restores a pending event prompt from a saved game after reload", () => {
    saveGame(advanceGameTurn(createSavedGame({ seed: 6 }), ["sell", "build-product"]));

    render(<App />);

    expect(screen.getByText(/突发事件/)).toBeInTheDocument();
    expect(screen.queryByText(/触发信号/)).not.toBeInTheDocument();
    expect(currentEventPanel().getAllByText(/趋势：/).length).toBeGreaterThan(0);
    expect(currentEventPanel().queryByText(/增加 \d|减少 \d/)).not.toBeInTheDocument();
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

    expect(screen.getByRole("heading", { name: "本季度动作" })).toBeInTheDocument();
  });
});
