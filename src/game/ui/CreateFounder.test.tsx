import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CreateFounder } from "./CreateFounder";

import "@testing-library/jest-dom/vitest";

describe("CreateFounder", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("submits the selected real attribute preset id", () => {
    const onStart = vi.fn();

    render(<CreateFounder onStart={onStart} />);
    fireEvent.click(screen.getByRole("button", { name: /融资型/ }));
    fireEvent.change(screen.getByLabelText("管理"), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "开始创业" }));

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        presetId: "rainmaker",
      }),
    );
  });

  it("allows totals up to 30 and rejects totals above 30", () => {
    const onStart = vi.fn();

    render(<CreateFounder onStart={onStart} />);

    expect(screen.getByText("属性总和 30")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始创业" })).toBeEnabled();

    fireEvent.change(screen.getByLabelText("公司名称"), { target: { value: "星舰智能" } });
    fireEvent.change(screen.getByLabelText("管理"), { target: { value: "9" } });
    expect(screen.getByText("属性总和 33")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始创业" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText("管理"), { target: { value: "6" } });
    expect(screen.getByText("属性总和 30")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始创业" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "开始创业" }));

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        companyName: "星舰智能",
      }),
    );
  });

  it("unlocks god mode after hovering the start control for ten seconds", () => {
    vi.useFakeTimers();
    const onStart = vi.fn();

    render(<CreateFounder onStart={onStart} />);

    fireEvent.mouseEnter(screen.getByTestId("start-button-zone"));
    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(screen.queryByText(/后门|盯住|无双模式/)).not.toBeInTheDocument();
    expect(screen.getByText("属性总和 80")).toBeInTheDocument();
    expect(screen.getByLabelText("技术")).toHaveValue("10");

    fireEvent.click(screen.getByRole("button", { name: "开始创业" }));

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({ tech: 10, luck: 10 }),
      }),
    );
  });

  it("opens a mission archive from the start screen instead of a wiki", () => {
    render(<CreateFounder onStart={vi.fn()} />);

    expect(screen.queryByText(/玩法 Wiki/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "打开任务档案" }));

    expect(screen.getByRole("dialog", { name: "任务档案" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "AI 创业任务档案" })).toBeInTheDocument();
    expect(screen.getAllByText(/创始人季度动作/).length).toBeGreaterThan(0);
    expect(screen.getByText(/美股 IPO 可行路线/)).toBeInTheDocument();
    expect(screen.getByText(/2026 Q1/)).toBeInTheDocument();
    expect(screen.getByText(/公司动作详解/)).toBeInTheDocument();
    expect(screen.getByText(/成就清单/)).toBeInTheDocument();
    expect(screen.getByText(/结局条件/)).toBeInTheDocument();
    expect(screen.getAllByText(/学术造假/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/美股 IPO/).length).toBeGreaterThan(0);
  });

  it("renders a richer launch-console hero instead of plain instruction cards", () => {
    render(<CreateFounder onStart={vi.fn()} />);

    expect(screen.getByRole("region", { name: "启动控制台" })).toBeInTheDocument();
    expect(screen.getByText("MISSION CLOCK")).toBeInTheDocument();
    expect(screen.getByText("15 年")).toBeInTheDocument();
    expect(screen.getByText("上市不是结局，现金流才是氧气")).toBeInTheDocument();
    expect(screen.getAllByText(/Q[1-4]/).length).toBeGreaterThanOrEqual(4);
  });

  it("reveals hidden achievement conditions inside the mission archive", () => {
    render(<CreateFounder onStart={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "打开任务档案" }));

    expect(screen.getAllByText(/解锁条件：？？？/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: "窥探条件" })[0]);

    expect(screen.getByText(/解锁条件：估值大于等于 20 亿/)).toBeInTheDocument();
  });
});
