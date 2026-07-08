import { Landmark } from "lucide-react";
import { investors } from "../data/investors";
import { evaluateFundraising, type FundingRound } from "../engine/finance";
import type { GameState } from "../types";

interface FinancingPanelProps {
  game: GameState;
}

const ROUND_LABELS: Record<FundingRound, string> = {
  angel: "天使轮",
  seed: "种子轮",
  "pre-a": "Pre-A",
  "series-a": "A 轮",
  "series-b": "B 轮",
  "series-c": "C 轮",
  strategic: "战略融资",
  "venture-debt": "风险债",
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

function termLabel(termStyle: string): string {
  if (termStyle === "friendly") return "友好条款";
  if (termStyle === "normal") return "常规条款";
  if (termStyle === "pressure") return "压力条款";
  return "掠夺条款";
}

const INVESTOR_THESES: Record<string, string> = {
  "alice-chen": "看重真实付费试点和创始人速度，不爱空泛 ICP。",
  "old-zhou": "看重纪律、现金控制和创始人控制权。",
  "maya-cloud": "看重算力杠杆、企业合同和毛利率。",
  "victor-furnace": "看重模型能力和市场热度，会给董事会压力。",
  "omar-oasis": "看重中东管线、全球化准备和数据驻留。",
  "ms-lin": "看重 ARR 规模、CFO 卫生和汇报纪律。",
  "kevin-founder": "看重创始人健康、团队留存和真实伤疤。",
  "grace-ma": "看重流量、PR 动能和留存曲线。",
  "leo-banker": "看重干净 ARR、毛利率和上市审计叙事。",
  "nora-open": "看重开发者声誉、模型透明度和开源社区。",
  "byteplanet-capital": "看重消费分发、数据闭环和战略协同。",
  "hard-term-capital": "看重下行保护，通常在现金焦虑时出现。",
};

function investorFit(game: GameState, investorId: string): number {
  if (investorId === "kevin-founder") return Math.round((game.metrics.founderHealth + game.metrics.morale) / 2);
  if (investorId === "leo-banker") return Math.round((game.metrics.arr / 1_000_000 + game.metrics.grossMargin + (100 - game.metrics.complianceRisk)) / 3);
  if (investorId === "victor-furnace") return Math.round((game.metrics.modelPower + game.metrics.marketHeat) / 2);
  if (investorId === "omar-oasis") return Math.round(game.metrics.globalReadiness);
  return Math.round((game.metrics.pmf + game.metrics.reputation + game.metrics.marketHeat) / 3);
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
        <span className={`status-pill ${termTone(evaluation.termStyle)}`}>{termLabel(evaluation.termStyle)}</span>
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

      <div className="investor-list" aria-label="投资人候选">
        {investors.map((investor) => (
          <article className="investor-card" key={investor.id}>
            <div>
              <strong>{investor.name}</strong>
              <small>{INVESTOR_THESES[investor.id]}</small>
            </div>
            <em className={`status-pill ${termTone(investor.termStyle)}`}>{termLabel(investor.termStyle)}</em>
            <span className="round-pill">匹配度 {investorFit(game, investor.id)}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
