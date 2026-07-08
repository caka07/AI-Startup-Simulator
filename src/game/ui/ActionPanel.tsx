import { Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { totalExtraCompanyActionCost } from "../constants";
import { actions } from "../data/actions";
import { founderActions } from "../data/founderActions";
import { investors } from "../data/investors";
import { calculateActionPreview } from "../engine/actionEffects";
import type { ActionId, EmployeeOperationAssignment, FounderActionId, GameState, InvestorId, MetricEffect, TurnSubmission } from "../types";

interface ActionPanelProps {
  game: GameState;
  onSubmit: (submission: TurnSubmission) => void;
  employeeOperations: EmployeeOperationAssignment[];
}

export function ActionPanel({ game, onSubmit, employeeOperations }: ActionPanelProps) {
  const [selected, setSelected] = useState<ActionId[]>([]);
  const [extraCount, setExtraCount] = useState(0);
  const [founderAction, setFounderAction] = useState<FounderActionId | "">("");
  const [investorId, setInvestorId] = useState<InvestorId | "">("");
  const nextExtraCost = totalExtraCompanyActionCost(game.employees.length, extraCount + 1);
  const canBuyExtraAction = game.metrics.cash >= nextExtraCost;
  const requiredActions = 2 + extraCount;
  const includesFundraise = selected.includes("fundraise");
  const canSubmit = selected.length === requiredActions && (!includesFundraise || Boolean(investorId));

  useEffect(() => {
    if (selected.length > requiredActions) {
      setSelected((current) => current.slice(0, requiredActions));
    }
  }, [requiredActions, selected.length]);

  useEffect(() => {
    if (!includesFundraise && investorId) {
      setInvestorId("");
    }
  }, [includesFundraise, investorId]);

  function toggle(actionId: ActionId) {
    setSelected((current) => {
      if (current.includes(actionId)) return current.filter((id) => id !== actionId);
      if (current.length >= requiredActions) return current;
      return [...current, actionId];
    });
  }

  function submit() {
    if (!canSubmit) return;
    onSubmit({
      companyActions: selected.slice(0, 2),
      extraCompanyActions: selected.slice(2),
      founderAction: founderAction || null,
      investorId: includesFundraise ? investorId || null : null,
      employeeOperations,
    });
    setSelected([]);
    setExtraCount(0);
    setFounderAction("");
    setInvestorId("");
  }

  function changeExtraCount(delta: number) {
    setExtraCount((current) => Math.max(0, Math.min(3, current + delta)));
  }

  function metricEffectTrend(effect: MetricEffect): string {
    const labels: Record<MetricEffect["metric"], string> = {
      cash: "现金",
      runway: "Runway",
      arr: "ARR",
      mrr: "MRR",
      pmf: "PMF",
      modelPower: "模型能力",
      productQuality: "产品质量",
      computeSupply: "算力供给",
      computeCost: "算力成本",
      grossMargin: "Gross Margin",
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
    return `${labels[effect.metric]}${effect.delta >= 0 ? "↑" : "↓"}`;
  }

  function actionTrendSummary(lines: string[]): string[] {
    return [...new Set(lines.map((line) => line.replace(/\s*[+-]\d+(?:万)?/g, "").replace(/小幅/g, "")))];
  }

  function efficiencyTrend(multiplier: number): string {
    if (multiplier >= 1.15) return "效率↑";
    if (multiplier <= 0.9) return "效率↓";
    return "效率→";
  }

  function termLabel(termStyle: (typeof investors)[number]["termStyle"]): string {
    if (termStyle === "friendly") return "友好条款";
    if (termStyle === "pressure") return "压力条款";
    if (termStyle === "predatory") return "救火条款";
    return "常规条款";
  }

  return (
    <section className="panel action-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">每季度必须选择 2 项</p>
          <h2>本季度动作</h2>
        </div>
        <span className={canSubmit ? "status-pill success" : "status-pill neutral"}>
          {selected.length}/{requiredActions}
        </span>
      </div>

      <div className="extra-action-control">
        <div>
          <strong>额外公司动作</strong>
          <small>
            已购买 {extraCount} 项；每次价格会按倍数上涨，员工越多折扣越明显。
          </small>
        </div>
        <div className="stepper-control">
          <button className="secondary-button icon-button" disabled={extraCount === 0} onClick={() => changeExtraCount(-1)} type="button">
            -
          </button>
          <span className="status-pill neutral">{extraCount}</span>
          <button className="secondary-button" disabled={!canBuyExtraAction || extraCount >= 3} onClick={() => changeExtraCount(1)} type="button">
            增加额外动作
          </button>
        </div>
      </div>

      {includesFundraise ? (
        <section aria-label="投资人选择" className="investor-picker">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">本轮领投</p>
              <h3>选择本轮领投</h3>
              <small>融资必须选择一个领投人。不同投资人会改变条款、董事会压力和融资叙事。</small>
            </div>
            <span className="status-pill neutral">
              {investorId ? investors.find((investor) => investor.id === investorId)?.name : "未选择"}
            </span>
          </div>
          <div className="investor-choice-grid">
            {investors.map((investor) => (
              <button
                aria-pressed={investorId === investor.id}
                className={investorId === investor.id ? "investor-choice-card selected" : "investor-choice-card"}
                key={investor.id}
                onClick={() => setInvestorId(investor.id)}
                type="button"
              >
                <strong>{investor.name}</strong>
                <span>
                  {termLabel(investor.termStyle)} / {investor.type}
                </span>
                <small>{investor.description}</small>
                <small>喜欢：{investor.likes.join("、")}；讨厌：{investor.hates.join("、")}。</small>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="section-title-row compact">
        <div>
          <p className="eyebrow">创始人本季度动作</p>
          <h3>创始人操作</h3>
        </div>
        <span className="status-pill neutral">
          {founderAction ? founderActions.find((action) => action.id === founderAction)?.name : "平稳度过"}
        </span>
      </div>
      <p className="action-submit-hint">创始人动作会在公司动作后结算，用来换增长、融资叙事、客户理解或创始人健康。</p>
      <div className="founder-action-grid" aria-label="创始人动作效果">
        <button
          aria-pressed={founderAction === ""}
          className={founderAction === "" ? "founder-action-card selected" : "founder-action-card"}
          onClick={() => setFounderAction("")}
          type="button"
        >
          <strong>平稳度过</strong>
          <small>不改变节奏，把这季度留给公司动作和团队执行。</small>
        </button>
        {founderActions.map((action) => (
          <button
            aria-pressed={founderAction === action.id}
            className={founderAction === action.id ? "founder-action-card selected" : "founder-action-card"}
            key={action.id}
            onClick={() => setFounderAction(action.id)}
            type="button"
          >
            <strong>{action.name}</strong>
            <small>{action.effects.map(metricEffectTrend).join(" / ")}</small>
          </button>
        ))}
      </div>

      <div className="action-list">
        {actions.map((action) => {
          const preview = calculateActionPreview(game, action.id, {
            investorId: action.id === "fundraise" && includesFundraise ? investorId || null : null,
          });
          const checked = selected.includes(action.id);
          const disabled = !checked && selected.length >= requiredActions;
          return (
            <label className={checked ? "action-option selected" : "action-option"} key={action.id}>
              <input
                aria-label={action.name}
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(action.id)}
                type="checkbox"
              />
              <span>
                <strong>{action.name}</strong>
                <small>{action.description}</small>
                <ul className="effect-list">
                  {actionTrendSummary(action.visibleSummary).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <em className="status-pill neutral">{efficiencyTrend(preview.efficiencyMultiplier)}</em>
              </span>
            </label>
          );
        })}
      </div>

      <button className="primary-button panel-action" disabled={!canSubmit} onClick={submit} type="button">
        <Rocket aria-hidden="true" size={18} />
        推进季度
      </button>
    </section>
  );
}
