import { useState } from "react";
import { RotateCcw } from "lucide-react";
import type { ActionId, EmployeeOperationId, GameEvent, GameState, NewGameInput } from "./game/types";
import { createNewGame } from "./game/engine/createGame";
import { getEligibleEvents } from "./game/engine/events";
import { clearGame, loadGame, saveGame } from "./game/engine/persistence";
import { advanceGameTurn, resolveGameEventChoice } from "./game/engine/turn";
import { CreateFounder } from "./game/ui/CreateFounder";
import { Dashboard } from "./game/ui/Dashboard";
import { ActionPanel } from "./game/ui/ActionPanel";
import { EventCard } from "./game/ui/EventCard";
import { EmployeeOperationPanel } from "./game/ui/EmployeeOperationPanel";
import { EmployeePanel } from "./game/ui/EmployeePanel";
import { FinancingPanel } from "./game/ui/FinancingPanel";
import { AnnualReport } from "./game/ui/AnnualReport";
import { GameOver } from "./game/ui/GameOver";

interface AppState {
  game: GameState | null;
  activeEvent: GameEvent | null;
}

function pickActiveEvent(nextGame: GameState): GameEvent | null {
  if (nextGame.endingId) return null;
  const resolvedIds = new Set(nextGame.resolvedEventIds);
  return getEligibleEvents(nextGame).find((event) => !resolvedIds.has(event.id)) ?? null;
}

function createInitialAppState(): AppState {
  const game = loadGame();
  return {
    game,
    activeEvent: game ? pickActiveEvent(game) : null,
  };
}

export function App() {
  const [{ game, activeEvent }, setAppState] = useState<AppState>(() => createInitialAppState());
  const [selectedEmployeeOperation, setSelectedEmployeeOperation] = useState<EmployeeOperationId | null>(null);

  function saveAndSetGame(next: GameState, nextActiveEvent: GameEvent | null) {
    saveGame(next);
    setAppState({ game: next, activeEvent: nextActiveEvent });
    setSelectedEmployeeOperation(null);
  }

  function start(input: NewGameInput) {
    const next = createNewGame(input);
    saveAndSetGame(next, null);
  }

  function reset() {
    clearGame();
    setAppState({ game: null, activeEvent: null });
  }

  function applyTurn(actions: ActionId[]) {
    if (!game) return;
    const next = advanceGameTurn(game, actions, selectedEmployeeOperation ?? undefined);
    saveAndSetGame(next, pickActiveEvent(next));
  }

  function chooseEvent(choiceId: string) {
    if (!game || !activeEvent) return;
    const next = resolveGameEventChoice(game, activeEvent, choiceId);
    saveAndSetGame(next, null);
  }

  if (!game) return <CreateFounder onStart={start} />;
  if (game.endingId) return <GameOver game={game} onReset={reset} />;

  const requiresEmployeeOperation = game.employees.length > 0;

  return (
    <main className="app-shell">
      <Dashboard game={game} />
      <div className="game-grid">
        <section className="main-column" aria-label="主操作区">
          {activeEvent ? (
            <EventCard event={activeEvent} onChoose={chooseEvent} />
          ) : (
            <>
              <ActionPanel
                canSubmitExtra={!requiresEmployeeOperation || selectedEmployeeOperation !== null}
                onSubmit={applyTurn}
                submitHint={
                  requiresEmployeeOperation && selectedEmployeeOperation === null
                    ? "有员工时必须先选择 1 个员工季度操作。"
                    : undefined
                }
              />
              <EmployeeOperationPanel
                game={game}
                selectedOperation={selectedEmployeeOperation}
                onSelect={setSelectedEmployeeOperation}
              />
            </>
          )}
          <AnnualReport game={game} />
        </section>
        <aside className="side-column" aria-label="运营侧栏">
          <button className="secondary-button reset-button" onClick={reset} type="button">
            <RotateCcw aria-hidden="true" size={16} />
            重置存档
          </button>
          <EmployeePanel game={game} />
          <FinancingPanel game={game} />
        </aside>
      </div>
    </main>
  );
}
