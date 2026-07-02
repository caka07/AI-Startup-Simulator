import { Landmark } from "lucide-react";
import { evaluateFundraising, type FundingRound } from "../engine/finance";
import type { GameState } from "../types";

interface FinancingPanelProps {
  game: GameState;
}

const ROUND_LABELS: Record<FundingRound, string> = {
  angel: "Angel",
  seed: "Seed",
  "pre-a": "Pre-A",
  "series-a": "Series A",
  "series-b": "Series B",
  "series-c": "Series C",
  strategic: "Strategic",
  "venture-debt": "Venture Debt",
  "pre-ipo": "Pre-IPO",
};

function formatMoney(value: number): string {
  if (value >= 100_000_000) return `¥${(value / 100_000_000).toFixed(2)}亿`;
  return `¥${Math.round(value / 10_000)}万`;
}

function termTone(termStyle: string): "success" | "neutral" | "warning" | "danger" {
  if (termStyle === "friendly") return "success";
  if (termStyle === "normal") return "neutral";
  if (termStyle === "pressure") return "warning";
  return "danger";
}

export function FinancingPanel({ game }: FinancingPanelProps) {
  const evaluation = evaluateFundraising(game);

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">融资窗口</p>
          <h2>
            <Landmark aria-hidden="true" size={20} />
            融资
          </h2>
        </div>
        <span className={`status-pill ${termTone(evaluation.termStyle)}`}>{evaluation.termStyle}</span>
      </div>

      <dl className="finance-list">
        <div>
          <dt>融资评分</dt>
          <dd>{evaluation.score}/100</dd>
        </div>
        <div>
          <dt>估算估值</dt>
          <dd>{formatMoney(evaluation.valuation)}</dd>
        </div>
        <div>
          <dt>建议金额</dt>
          <dd>{formatMoney(evaluation.suggestedAmount)}</dd>
        </div>
        <div>
          <dt>预计稀释</dt>
          <dd>{evaluation.dilution}%</dd>
        </div>
      </dl>

      <div className="round-list" aria-label="可用轮次">
        {evaluation.availableRounds.map((round) => (
          <span className="round-pill" key={round}>
            {ROUND_LABELS[round]}
          </span>
        ))}
      </div>
    </section>
  );
}
