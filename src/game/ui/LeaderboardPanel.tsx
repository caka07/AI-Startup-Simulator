import { BarChart3 } from "lucide-react";
import { useState } from "react";
import { getLeaderboard, getLeaderboardCategories, getLeaderboardCompanyDetail } from "../engine/leaderboard";
import type { FactionId, GameState, LeaderboardCategoryId } from "../types";

interface LeaderboardPanelProps {
  game: GameState;
}

function deltaLabel(delta: number): string {
  if (delta > 0) return `+${delta}`;
  return `${delta}`;
}

export function LeaderboardPanel({ game }: LeaderboardPanelProps) {
  const categories = getLeaderboardCategories();
  const [categoryId, setCategoryId] = useState<LeaderboardCategoryId>("overall");
  const [selectedCompanyId, setSelectedCompanyId] = useState<FactionId | "player">("player");
  const leaderboard = getLeaderboard(game, categoryId);
  const detail = getLeaderboardCompanyDetail(game, selectedCompanyId);

  return (
    <section className="panel leaderboard-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">模拟实时榜 / 非联网</p>
          <h2>
            <BarChart3 aria-hidden="true" size={20} />
            排行榜
          </h2>
        </div>
        <span className="status-pill neutral">{leaderboard.playerRankLabel}</span>
      </div>

      <div className="leaderboard-categories" role="group" aria-label="排行榜分类">
        {categories.map((category) => (
          <button
            aria-pressed={categoryId === category.id}
            className={categoryId === category.id ? "secondary-button selected" : "secondary-button"}
            data-tooltip={category.description}
            key={category.id}
            onClick={() => setCategoryId(category.id)}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="leaderboard-list">
        {leaderboard.rows.map((row) => (
          <button
            className={row.id === "player" ? "leaderboard-row player" : "leaderboard-row"}
            key={row.id}
            onClick={() => setSelectedCompanyId(row.id)}
            type="button"
          >
            <span className="leaderboard-rank">#{row.rank}</span>
            <div>
              <strong>{row.name}</strong>
              <small>{row.focus}</small>
            </div>
            <span className="leaderboard-score">{row.score}</span>
            <em className={row.delta >= 0 ? "status-pill success" : "status-pill warning"}>{deltaLabel(row.delta)}</em>
          </button>
        ))}
        {leaderboard.playerRank > 9 ? (
          <button className="leaderboard-row player" onClick={() => setSelectedCompanyId("player")} type="button">
            <span className="leaderboard-rank">...</span>
            <div>
              <strong>{game.companyName}</strong>
              <small>{leaderboard.playerRankLabel}</small>
            </div>
            <span className="leaderboard-score">{leaderboard.playerScore}</span>
            <em className="status-pill neutral">{leaderboard.playerRankLabel}</em>
          </button>
        ) : null}
      </div>

      {detail ? (
        <article className="leaderboard-detail">
          <strong>{detail.name}</strong>
          <small>{detail.region}</small>
          <p>{detail.description}</p>
          <p>优势：{detail.strengths.join(" / ")}</p>
          <p>短板：{detail.weaknesses.join(" / ")}</p>
          <em className="status-pill neutral">{detail.mood}</em>
        </article>
      ) : null}
    </section>
  );
}
