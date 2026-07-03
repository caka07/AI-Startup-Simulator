import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CreateFounder } from "./CreateFounder";

import "@testing-library/jest-dom/vitest";

describe("CreateFounder", () => {
  it("submits the selected real attribute preset id", () => {
    const onStart = vi.fn();

    render(<CreateFounder onStart={onStart} />);
    fireEvent.click(screen.getByRole("button", { name: /融资型/ }));
    fireEvent.click(screen.getByRole("button", { name: "开始创业" }));

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        presetId: "rainmaker",
      }),
    );
  });
});
