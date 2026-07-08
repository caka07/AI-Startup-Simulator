import { Trophy, X } from "lucide-react";
import { achievements } from "../data/achievements";
import type { Condition, GameState, MetricId } from "../types";

interface AchievementsModalProps {
  game: GameState;
  onClose: () => void;
}

const METRIC_LABELS: Record<MetricId, string> = {
  cash: "现金",
  runway: "现金跑道",
  arr: "年度经常性收入",
  mrr: "月度经常性收入",
  pmf: "产品市场匹配",
  modelPower: "模型能力",
  productQuality: "产品质量",
  computeSupply: "算力供给",
  computeCost: "算力成本",
  grossMargin: "毛利率",
  techDebt: "技术债",
  reputation: "声誉",
  morale: "士气",
  complianceRisk: "合规风险",
  globalReadiness: "全球化准备",
  boardPressure: "董事会压力",
  founderHealth: "创始人健康",
  founderEquity: "创始人股权",
  valuation: "估值",
  marketHeat: "市场热度",
};

const OPERATOR_LABELS: Record<Condition["op"], string> = {
  ">=": "不低于",
  ">": "高于",
  "<=": "不高于",
  "<": "低于",
  "===": "等于",
};

function formatConditionValue(condition: Condition): string {
  if (["cash", "arr", "mrr", "valuation"].includes(condition.metric)) {
    if (Math.abs(condition.value) >= 100_000_000) {
      const yi = condition.value / 100_000_000;
      return `${Number.isInteger(yi) ? yi : yi.toFixed(1)} 亿`;
    }
    if (Math.abs(condition.value) >= 10_000) return `${Math.round(condition.value / 10_000)} 万`;
  }
  return `${condition.value}`;
}

function formatConditions(trigger: Condition[]): string {
  return trigger
    .map((condition) => `${METRIC_LABELS[condition.metric]}${OPERATOR_LABELS[condition.op]} ${formatConditionValue(condition)}`)
    .join("，并且");
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
            <p className="eyebrow">已解锁 {completed.size} / {achievements.length}</p>
          </div>
          <button aria-label="关闭成就" className="secondary-button icon-button" onClick={onClose} type="button">
            <X aria-hidden="true" size={16} />
          </button>
        </div>

        <div className="achievement-modal-list">
          {achievements.map((achievement) => {
            const unlocked = completed.has(achievement.id);
            const hiddenLocked = achievement.hiddenCondition && !unlocked;
            const conditionText = hiddenLocked ? "？？？" : formatConditions(achievement.trigger);
            return (
              <article className={unlocked ? "achievement-row unlocked" : "achievement-row"} key={achievement.id}>
                <div>
                  <strong>{achievement.name}</strong>
                  <span>{achievement.description}</span>
                  <span>解锁条件：{conditionText}</span>
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
