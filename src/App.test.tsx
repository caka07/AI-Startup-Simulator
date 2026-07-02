import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

import "@testing-library/jest-dom/vitest";

describe("App", () => {
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
    expect(screen.getByLabelText("创业背景")).toHaveValue("ex-bigtech-pm");
    expect(screen.getByLabelText("创业赛道")).toHaveValue("ai-agent");

    fireEvent.click(screen.getByRole("button", { name: "开始创业" }));

    expect(screen.getByRole("heading", { name: "2026 Q1" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "本季度动作" })).toBeInTheDocument();
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

    const employeeRow = screen.getByRole("row", { name: /Researcher 1/ });
    expect(within(employeeRow).getByText("Researcher")).toBeInTheDocument();
    expect(within(employeeRow).getAllByText(/\d+%/).length).toBeGreaterThanOrEqual(3);
  });
});
