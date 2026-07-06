import { Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { actions } from "../data/actions";
import { calculateActionPreview } from "../engine/actionEffects";
import type { ActionId, EmployeeOperationAssignment, GameState, TurnSubmission } from "../types";

interface ActionPanelProps {
  game: GameState;
  onSubmit: (submission: TurnSubmission) => void;
  employeeOperations: EmployeeOperationAssignment[];
}

export function ActionPanel({ game, onSubmit, employeeOperations }: ActionPanelProps) {
  const [selected, setSelected] = useState<ActionId[]>([]);
  const [extraEnabled, setExtraEnabled] = useState(false);
  const requiredActions = extraEnabled ? 3 : 2;
  const canSubmit = selected.length === requiredActions;

  useEffect(() => {
    if (!extraEnabled && selected.length > 2) {
      setSelected((current) => current.slice(0, 2));
    }
  }, [extraEnabled, selected.length]);

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
      extraCompanyAction: extraEnabled ? selected[2] : null,
      employeeOperations,
    });
    setSelected([]);
    setExtraEnabled(false);
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

      <label className="extra-action-toggle">
        <input
          type="checkbox"
          checked={extraEnabled}
          onChange={(event) => setExtraEnabled(event.target.checked)}
        />
        购买额外公司动作（现金 -75 万）
      </label>

      <div className="action-list">
        {actions.map((action) => {
          const preview = calculateActionPreview(game, action.id);
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
                  {preview.summary.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <em className="status-pill neutral">效率 x{preview.efficiencyMultiplier}</em>
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
