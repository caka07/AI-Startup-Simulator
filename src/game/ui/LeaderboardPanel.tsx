import { BarChart3 } from "lucide-react";
import { getLeaderboard } from "../engine/leaderboard";
import type { GameState } from "../types";

interface LeaderboardPanelProps {
  game: GameState;
}

function deltaLabel(delta: number): string {
  if (delta > 0) return `+${delta}`;
  return `${delta}`;
}

export function LeaderboardPanel({ game }: LeaderboardPanelProps) {
  const leaderboard = getLeaderboard(game);

  return (
    <section className="panel leaderboard-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">模拟实时榜 / 非联网</p>
          <h2>
            <BarChart3 aria-hidden="true" size={20} />
            AI 公司排行榜
          </h2>
        </div>
        <span className="status-pill neutral">TOP {leaderboard.length}</span>
      </div>

      <div className="leaderboard-list">
        {leaderboard.map((row) => (
          <div className={row.id === "player" ? "leaderboard-row player" : "leaderboard-row"} key={row.id}>
            <span className="leaderboard-rank">#{row.rank}</span>
            <div>
              <strong>{row.name}</strong>
              <small>{row.focus}</small>
            </div>
            <span className="leaderboard-score">{row.score}</span>
            <em className={row.delta >= 0 ? "status-pill success" : "status-pill warning"}>{deltaLabel(row.delta)}</em>
          </div>
        ))}
      </div>
    </section>
  );
}
