import { ArrowRight, Trophy } from "lucide-react";
import { findEnding } from "../engine/endings";
import type { EndingId, GameState } from "../types";

interface MilestoneEndingModalProps {
  game: GameState;
  endingId: EndingId;
  onClose: () => void;
}

function money(value: number): string {
  if (Math.abs(value) >= 100_000_000) return `${(value / 100_000_000).toFixed(1)} 亿`;
  return `${Math.round(value / 10_000)} 万`;
}

export function MilestoneEndingModal({ game, endingId, onClose }: MilestoneEndingModalProps) {
  const ending = findEnding(endingId);
  if (!ending) return null;

  return (
    <div className="modal-backdrop">
      <section aria-label={`阶段结局：${ending.name}`} className="achievement-modal milestone-modal" role="dialog">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">阶段结局</p>
            <h2>
              <Trophy aria-hidden="true" size={20} />
              {ending.name}
            </h2>
          </div>
          <em className="status-pill success">可继续</em>
        </div>
        <div className="milestone-copy">
          <strong>{ending.settlementTitle ?? `${ending.name} 结算页`}</strong>
          <p>{ending.description}</p>
        </div>
        <dl className="milestone-metrics">
          <div>
            <dt>ARR</dt>
            <dd>{money(game.metrics.arr)}</dd>
          </div>
          <div>
            <dt>估值</dt>
            <dd>{money(game.metrics.valuation)}</dd>
          </div>
          <div>
            <dt>毛利率</dt>
            <dd>{game.metrics.grossMargin}%</dd>
          </div>
          <div>
            <dt>创始人健康</dt>
            <dd>{game.metrics.founderHealth}%</dd>
          </div>
        </dl>
        <p className="milestone-note">
          董事会已经把这一页放进材料，但公司还没通关。继续推进季度，冲更高阶结局。
        </p>
        <button className="primary-button" onClick={onClose} type="button">
          继续创业
          <ArrowRight aria-hidden="true" size={16} />
        </button>
      </section>
    </div>
  );
}
