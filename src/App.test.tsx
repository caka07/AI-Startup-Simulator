import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

import "@testing-library/jest-dom/vitest";

describe("App", () => {
  it("renders the simulator shell", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "AI 创业模拟器" }),
    ).toBeInTheDocument();
  });
});
