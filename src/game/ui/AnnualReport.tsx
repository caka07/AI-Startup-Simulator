import { ClipboardList, Trophy } from "lucide-react";
import { achievements } from "../data/achievements";
import { endings } from "../data/endings";
import type { AchievementId, EndingId, GameState } from "../types";

interface AnnualReportProps {
  game: GameState;
}

const ACHIEVEMENT_NAMES: Record<AchievementId, string> = Object.fromEntries(
  achievements.map((achievement) => [achievement.id, achievement.name]),
);
const ENDING_NAMES: Record<EndingId, string> = Object.fromEntries(
  endings.map((ending) => [ending.id, ending.name]),
);

export function AnnualReport({ game }: AnnualReportProps) {
  const latestLog = game.log.slice(-12).reverse();

  return (
    <section className="panel report-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">经营记录</p>
          <h2>
            <ClipboardList aria-hidden="true" size={20} />
            年度报告
          </h2>
        </div>
        <span className="status-pill neutral">{latestLog.length} 条</span>
      </div>

      <ol className="log-list">
        {latestLog.map((line, index) => (
          <li key={`${line}-${index}`}>{line}</li>
        ))}
      </ol>

      <div className="achievement-block">
        <h3>
          <Trophy aria-hidden="true" size={18} />
          已达成结局
        </h3>
        {game.completedEndings.length === 0 ? (
          <p className="empty-state">暂无结局。先把公司从季度报表里活出来。</p>
        ) : (
          <div className="achievement-list">
            {game.completedEndings.map((id) => (
              <span className="round-pill achievement-pill" key={id}>
                {ENDING_NAMES[id] ?? id}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="achievement-block">
        <h3>
          <Trophy aria-hidden="true" size={18} />
          已完成成就
        </h3>
        {game.completedAchievements.length === 0 ? (
          <p className="empty-state">暂无成就。先活过几个季度。</p>
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
  );
}
