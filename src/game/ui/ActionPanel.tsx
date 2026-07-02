import { Rocket } from "lucide-react";
import { useState } from "react";
import { actions } from "../data/actions";
import type { ActionId } from "../types";

interface ActionPanelProps {
  onSubmit: (actions: ActionId[]) => void;
}

export function ActionPanel({ onSubmit }: ActionPanelProps) {
  const [selected, setSelected] = useState<ActionId[]>([]);

  function toggle(actionId: ActionId) {
    setSelected((current) => {
      if (current.includes(actionId)) return current.filter((id) => id !== actionId);
      if (current.length >= 2) return current;
      return [...current, actionId];
    });
  }

  function submit() {
    if (selected.length !== 2) return;
    onSubmit(selected);
    setSelected([]);
  }

  return (
    <section className="panel action-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">每季度必须选择 2 项</p>
          <h2>本季度动作</h2>
        </div>
        <span className={selected.length === 2 ? "status-pill success" : "status-pill neutral"}>
          {selected.length}/2
        </span>
      </div>

      <div className="action-list">
        {actions.map((action) => {
          const checked = selected.includes(action.id);
          const disabled = !checked && selected.length >= 2;
          return (
            <label className={checked ? "action-option selected" : "action-option"} key={action.id}>
              <input
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(action.id)}
                type="checkbox"
              />
              <span>
                <strong>{action.name}</strong>
                <small>{action.description}</small>
              </span>
            </label>
          );
        })}
      </div>

      <button className="primary-button panel-action" disabled={selected.length !== 2} onClick={submit} type="button">
        <Rocket aria-hidden="true" size={18} />
        推进季度
      </button>
    </section>
  );
}
