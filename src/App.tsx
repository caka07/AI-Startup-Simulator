import { useState } from "react";
import { RotateCcw, Trophy } from "lucide-react";
import type { EmployeeOperationAssignment, GameEvent, GameState, NewGameInput, TurnSubmission } from "./game/types";
import { createNewGame } from "./game/engine/createGame";
import { pickNextEvent } from "./game/engine/events";
import { clearGame, loadGame, saveGame } from "./game/engine/persistence";
import { advanceGameTurn, resolveGameEventChoice } from "./game/engine/turn";
import { CreateFounder } from "./game/ui/CreateFounder";
import { Dashboard } from "./game/ui/Dashboard";
import { ActionPanel } from "./game/ui/ActionPanel";
import { EventCard } from "./game/ui/EventCard";
import { EmployeeOperationPanel } from "./game/ui/EmployeeOperationPanel";
import { EmployeePanel } from "./game/ui/EmployeePanel";
import { FinancingPanel } from "./game/ui/FinancingPanel";
import { LeaderboardPanel } from "./game/ui/LeaderboardPanel";
import { AnnualReport } from "./game/ui/AnnualReport";
import { GameOver } from "./game/ui/GameOver";
import { AchievementsModal } from "./game/ui/AchievementsModal";

interface AppState {
  game: GameState | null;
  activeEvent: GameEvent | null;
}

function createInitialAppState(): AppState {
  const game = loadGame();
  return {
    game,
    activeEvent: game ? pickNextEvent(game) : null,
  };
}

export function App() {
  const [{ game, activeEvent }, setAppState] = useState<AppState>(() => createInitialAppState());
  const [employeeAssignments, setEmployeeAssignments] = useState<EmployeeOperationAssignment[]>([]);
  const [achievementsOpen, setAchievementsOpen] = useState(false);

  function saveAndSetGame(next: GameState, nextActiveEvent: GameEvent | null) {
    saveGame(next);
    setAppState({ game: next, activeEvent: nextActiveEvent });
    setEmployeeAssignments([]);
    setAchievementsOpen(false);
  }

  function start(input: NewGameInput) {
    const next = createNewGame(input);
    saveAndSetGame(next, null);
  }

  function reset() {
    clearGame();
    setAppState({ game: null, activeEvent: null });
  }

  function applyTurn(submission: TurnSubmission) {
    if (!game) return;
    const next = advanceGameTurn(game, {
      ...submission,
      employeeOperations: employeeAssignments,
    });
    saveAndSetGame(next, pickNextEvent(next));
  }

  function chooseEvent(choiceId: string) {
    if (!game || !activeEvent) return;
    const next = resolveGameEventChoice(game, activeEvent, choiceId);
    saveAndSetGame(next, null);
  }

  if (!game) return <CreateFounder onStart={start} />;
  if (game.endingId) return <GameOver game={game} onReset={reset} />;

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
                game={game}
                onSubmit={applyTurn}
                employeeOperations={employeeAssignments}
              />
              <EmployeeOperationPanel
                game={game}
                assignments={employeeAssignments}
                onChange={setEmployeeAssignments}
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
          <button className="secondary-button reset-button" onClick={() => setAchievementsOpen(true)} type="button">
            <Trophy aria-hidden="true" size={16} />
            成就
          </button>
          <LeaderboardPanel game={game} />
          <EmployeePanel game={game} />
          <FinancingPanel game={game} />
        </aside>
      </div>
      {achievementsOpen ? <AchievementsModal game={game} onClose={() => setAchievementsOpen(false)} /> : null}
    </main>
  );
}
