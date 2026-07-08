import { useState } from "react";
import { RotateCcw, Trophy } from "lucide-react";
import type { EmployeeOperationAssignment, EndingId, GameEvent, GameState, NewGameInput, TurnSubmission } from "./game/types";
import { createNewGame } from "./game/engine/createGame";
import { isTerminalEndingId } from "./game/engine/endings";
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
import { MilestoneEndingModal } from "./game/ui/MilestoneEndingModal";

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
  const [milestoneEndingId, setMilestoneEndingId] = useState<EndingId | null>(null);

  function saveAndSetGame(next: GameState, nextActiveEvent: GameEvent | null, nextMilestoneEndingId: EndingId | null = null) {
    saveGame(next);
    setAppState({ game: next, activeEvent: nextActiveEvent });
    setEmployeeAssignments([]);
    setAchievementsOpen(false);
    setMilestoneEndingId(nextMilestoneEndingId);
  }

  function findNewMilestoneEnding(previous: GameState, next: GameState): EndingId | null {
    if (next.endingId) return null;
    return (
      next.completedEndings.find(
        (endingId) => !previous.completedEndings.includes(endingId) && !isTerminalEndingId(endingId),
      ) ?? null
    );
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
    const milestoneEnding = findNewMilestoneEnding(game, next);
    saveAndSetGame(next, milestoneEnding ? null : pickNextEvent(next), milestoneEnding);
  }

  function chooseEvent(choiceId: string) {
    if (!game || !activeEvent) return;
    const next = resolveGameEventChoice(game, activeEvent, choiceId);
    saveAndSetGame(next, null, findNewMilestoneEnding(game, next));
  }

  if (!game) return <CreateFounder onStart={start} />;
  if (game.endingId) return <GameOver game={game} onReset={reset} />;

  return (
    <main className="app-shell command-shell">
      <div className="shell-ambient ambient-a" aria-hidden="true" />
      <div className="shell-ambient ambient-b" aria-hidden="true" />
      <section className="mission-bridge" aria-label="任务舰桥">
        <Dashboard game={game} />
      </section>
      <div className="game-grid command-grid">
        <section className="main-column operation-deck" aria-label="操作甲板">
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
        <aside className="side-column intelligence-column" aria-label="情报舱">
          <div className="side-command-buttons" aria-label="存档与成就">
            <button className="secondary-button reset-button" onClick={reset} type="button">
              <RotateCcw aria-hidden="true" size={16} />
              重置存档
            </button>
            <button className="secondary-button reset-button" onClick={() => setAchievementsOpen(true)} type="button">
              <Trophy aria-hidden="true" size={16} />
              成就
            </button>
          </div>
          <LeaderboardPanel game={game} />
          <EmployeePanel game={game} />
          <FinancingPanel game={game} />
        </aside>
      </div>
      {achievementsOpen ? <AchievementsModal game={game} onClose={() => setAchievementsOpen(false)} /> : null}
      {milestoneEndingId ? (
        <MilestoneEndingModal
          game={game}
          endingId={milestoneEndingId}
          onClose={() => setMilestoneEndingId(null)}
        />
      ) : null}
    </main>
  );
}
