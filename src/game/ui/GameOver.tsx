import { CircleAlert, RotateCcw, Trophy } from "lucide-react";
import { achievements } from "../data/achievements";
import { endings } from "../data/endings";
import type { AchievementId, GameState } from "../types";

interface GameOverProps {
  game: GameState;
  onReset: () => void;
}

const ACHIEVEMENT_NAMES: Record<AchievementId, string> = Object.fromEntries(
  achievements.map((achievement) => [achievement.id, achievement.name]),
);

const SUCCESS_ENDING_IDS = new Set([
  "acquired-by-giant",
  "hk-ipo",
  "us-ipo",
  "cashflow-champion",
  "paper-billionaire",
  "lifestyle-company",
]);

function formatMoney(value: number): string {
  if (value >= 100_000_000) return `¥${(value / 100_000_000).toFixed(2)}亿`;
  return `¥${Math.round(value / 10_000)}万`;
}

export function GameOver({ game, onReset }: GameOverProps) {
  const ending = endings.find((item) => item.id === game.endingId);
  const isSuccessEnding = Boolean(game.endingId && SUCCESS_ENDING_IDS.has(game.endingId));
  const EndingIcon = isSuccessEnding ? Trophy : CircleAlert;

  return (
    <main className="create-shell">
      <section className="game-over">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">结局 / {game.endingId}</p>
            <h1>
              <EndingIcon aria-hidden="true" size={24} />
              {ending?.name ?? "Unknown Ending"}
            </h1>
          </div>
          <div className="game-over-actions">
            <span className={isSuccessEnding ? "status-pill success" : "status-pill warning"}>
              {isSuccessEnding ? "Outcome" : "Closure"}
            </span>
            <button className="secondary-button" onClick={onReset} type="button">
              <RotateCcw aria-hidden="true" size={16} />
              重置存档
            </button>
          </div>
        </div>

        <p className="ending-description">{ending?.description ?? "No ending details found."}</p>

        <dl className="final-metrics">
          <div>
            <dt>最终时间</dt>
            <dd>
              {game.year} Q{game.quarter}
            </dd>
          </div>
          <div>
            <dt>现金</dt>
            <dd>{formatMoney(game.metrics.cash)}</dd>
          </div>
          <div>
            <dt>ARR</dt>
            <dd>{formatMoney(game.metrics.arr)}</dd>
          </div>
          <div>
            <dt>估值</dt>
            <dd>{formatMoney(game.metrics.valuation)}</dd>
          </div>
          <div>
            <dt>PMF</dt>
            <dd>{Math.round(game.metrics.pmf)}%</dd>
          </div>
          <div>
            <dt>创始人股权</dt>
            <dd>{Math.round(game.metrics.founderEquity)}%</dd>
          </div>
        </dl>

        <div className="achievement-block">
          <h2>
            <Trophy aria-hidden="true" size={20} />
            完成成就
          </h2>
          {game.completedAchievements.length === 0 ? (
            <p className="empty-state">没有完成成就。</p>
          ) : (
            <div className="achievement-list">
              {game.completedAchievements.map((id) => (
                <span className="round-pill achievement-pill" key={id}>
                  {ACHIEVEMENT_NAMES[id] ?? id}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
