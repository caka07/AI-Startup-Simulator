import { Trophy, X } from "lucide-react";
import { achievements } from "../data/achievements";
import type { GameState } from "../types";

interface AchievementsModalProps {
  game: GameState;
  onClose: () => void;
}

export function AchievementsModal({ game, onClose }: AchievementsModalProps) {
  const completed = new Set(game.completedAchievements);

  return (
    <div className="modal-backdrop">
      <section aria-label="成就" className="achievement-modal" role="dialog">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">成就系统</p>
            <h2>
              <Trophy aria-hidden="true" size={20} />
              成就
            </h2>
          </div>
          <button aria-label="关闭成就" className="secondary-button icon-button" onClick={onClose} type="button">
            <X aria-hidden="true" size={16} />
          </button>
        </div>

        <div className="achievement-modal-list">
          {achievements.map((achievement) => {
            const unlocked = completed.has(achievement.id);
            return (
              <article className={unlocked ? "achievement-row unlocked" : "achievement-row"} key={achievement.id}>
                <div>
                  <strong>{achievement.name}</strong>
                  <span>{unlocked ? achievement.description : achievement.conditionText}</span>
                </div>
                <em className={unlocked ? "status-pill success" : "status-pill neutral"}>
                  {unlocked ? "已解锁" : achievement.tier}
                </em>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
