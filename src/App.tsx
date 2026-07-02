import { useState } from "react";
import type { ActionId, GameEvent, GameState, NewGameInput } from "./game/types";
import { EMPLOYEE_ROLE_IDS } from "./game/constants";
import { actions as playerActions } from "./game/data/actions";
import { createNewGame } from "./game/engine/createGame";
import { advanceQuarter } from "./game/engine/advance";
import { getEligibleEvents, resolveEventChoice } from "./game/engine/events";
import { unlockAchievements } from "./game/engine/achievements";
import { evaluateEnding } from "./game/engine/endings";
import { hireEmployee } from "./game/engine/employees";
import { executeFundraise } from "./game/engine/finance";
import { applyMetricDelta } from "./game/engine/clamp";
import { CreateFounder } from "./game/ui/CreateFounder";
import { Dashboard } from "./game/ui/Dashboard";
import { ActionPanel } from "./game/ui/ActionPanel";
import { EventCard } from "./game/ui/EventCard";
import { EmployeePanel } from "./game/ui/EmployeePanel";
import { FinancingPanel } from "./game/ui/FinancingPanel";
import { AnnualReport } from "./game/ui/AnnualReport";
import { GameOver } from "./game/ui/GameOver";

const ACTION_HEALTH_COSTS = Object.fromEntries(
  playerActions.map((action) => [action.id, action.healthCost]),
) as Record<ActionId, number>;

function applyActionHealthCost(game: GameState, actionId: ActionId): GameState {
  return {
    ...game,
    metrics: applyMetricDelta(game.metrics, "founderHealth", -ACTION_HEALTH_COSTS[actionId]),
  };
}

export function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [resolvedEventIds, setResolvedEventIds] = useState<Set<string>>(() => new Set());

  function pickActiveEvent(nextGame: GameState, resolvedIds: Set<string>): GameEvent | null {
    if (nextGame.endingId) return null;
    return getEligibleEvents(nextGame).find((event) => !resolvedIds.has(event.id)) ?? null;
  }

  function start(input: NewGameInput) {
    setActiveEvent(null);
    setResolvedEventIds(new Set());
    setGame(createNewGame(input));
  }

  function applyTurn(actions: ActionId[]) {
    if (!game) return;
    const includesFundraise = actions.includes("fundraise");
    const genericActions = actions.filter((id) => id !== "fundraise");
    let next = advanceQuarter(game, genericActions);
    if (actions.includes("hire")) {
      const role = EMPLOYEE_ROLE_IDS[next.employees.length % EMPLOYEE_ROLE_IDS.length];
      next = hireEmployee(next, role);
    }
    if (includesFundraise) {
      next = applyActionHealthCost(next, "fundraise");
      next = executeFundraise(next);
    }
    next = unlockAchievements(next);
    const ending = evaluateEnding(next);
    if (ending) next = { ...next, endingId: ending.id };
    setGame(next);
    setActiveEvent(pickActiveEvent(next, resolvedEventIds));
  }

  function chooseEvent(choiceId: string) {
    if (!game || !activeEvent) return;
    const resolvedEventId = activeEvent.id;
    let next = resolveEventChoice(game, activeEvent, choiceId);
    next = unlockAchievements(next);
    const ending = evaluateEnding(next);
    if (ending) next = { ...next, endingId: ending.id };
    setGame(next);
    setResolvedEventIds((previous) => {
      const resolved = new Set(previous);
      resolved.add(resolvedEventId);
      return resolved;
    });
    setActiveEvent(null);
  }

  if (!game) return <CreateFounder onStart={start} />;
  if (game.endingId) return <GameOver game={game} />;

  return (
    <main className="app-shell">
      <Dashboard game={game} />
      <div className="game-grid">
        <section className="main-column" aria-label="主操作区">
          {activeEvent ? <EventCard event={activeEvent} onChoose={chooseEvent} /> : <ActionPanel onSubmit={applyTurn} />}
          <AnnualReport game={game} />
        </section>
        <aside className="side-column" aria-label="运营侧栏">
          <EmployeePanel game={game} />
          <FinancingPanel game={game} />
        </aside>
      </div>
    </main>
  );
}
