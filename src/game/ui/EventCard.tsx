import { AlertTriangle } from "lucide-react";
import type { Condition, GameEvent } from "../types";

interface EventCardProps {
  event: GameEvent;
  onChoose: (choiceId: string) => void;
}

function formatCondition(condition: Condition): string {
  const value =
    Math.abs(condition.value) >= 1_000_000 ? `¥${Math.round(condition.value / 10_000)}万` : `${condition.value}`;
  return `${condition.metric} ${condition.op} ${value}`;
}

export function EventCard({ event, onChoose }: EventCardProps) {
  return (
    <section className="panel event-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">突发事件 / {event.category}</p>
          <h2>
            <AlertTriangle aria-hidden="true" size={20} />
            {event.title}
          </h2>
        </div>
      </div>

      <p className="event-trigger">触发信号：{event.trigger.map(formatCondition).join("；")}</p>

      <div className="choice-list">
        {event.choices.map((choice) => (
          <button className="choice-button" key={choice.id} onClick={() => onChoose(choice.id)} type="button">
            {choice.label}
          </button>
        ))}
      </div>
    </section>
  );
}
