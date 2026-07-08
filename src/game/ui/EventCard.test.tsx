import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EventCard } from "./EventCard";
import type { GameEvent } from "../types";

import "@testing-library/jest-dom/vitest";

describe("EventCard", () => {
  const event: GameEvent = {
    id: "sales-promised-private-deployment",
    title: "Sales promised private deployment",
    category: "customer",
    trigger: [{ metric: "arr", op: ">=", value: 500_000 }],
    choices: [
      {
        id: "staff-war-room",
        label: "Staff war room",
        effects: [
          { metric: "arr", delta: 400_000 },
          { metric: "founderHealth", delta: -6 },
        ],
        log: "客户把需求写进合同，团队把周末写进日历。",
      },
    ],
  };

  it("explains the event context and each choice effect without exposing trigger syntax", () => {
    const onChoose = vi.fn();

    render(<EventCard event={event} onChoose={onChoose} />);

    expect(screen.queryByText(/触发信号/)).not.toBeInTheDocument();
    expect(screen.queryByText(/ARR >= 500000/)).not.toBeInTheDocument();
    expect(screen.getByText(/客户那边突然把你的路线图、现金流和团队耐心一起塞进会议室/)).toBeInTheDocument();

    const choice = screen.getByRole("button", { name: /组建交付战情室/ });
    expect(within(choice).getByText(/趋势：/)).toBeInTheDocument();
    expect(within(choice).getByText(/年度经常性收入↑/)).toBeInTheDocument();
    expect(within(choice).getByText(/创始人健康↓/)).toBeInTheDocument();
    expect(within(choice).queryByText(/增加 40 万|减少 6/)).not.toBeInTheDocument();

    fireEvent.click(choice);
    expect(onChoose).toHaveBeenCalledWith("staff-war-room");
  });
});
