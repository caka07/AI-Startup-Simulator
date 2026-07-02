import { Users } from "lucide-react";
import { employeeOperations } from "../engine/employeeOperations";
import type { EmployeeOperationId, GameState } from "../types";

interface EmployeeOperationPanelProps {
  game: GameState;
  selectedOperation: EmployeeOperationId | null;
  onSelect: (operationId: EmployeeOperationId) => void;
}

function riskTone(risk: string): "success" | "warning" | "danger" {
  if (risk === "high") return "danger";
  if (risk === "medium") return "warning";
  return "success";
}

function riskLabel(risk: string): string {
  if (risk === "high") return "高风险";
  if (risk === "medium") return "中风险";
  return "低风险";
}

export function EmployeeOperationPanel({ game, selectedOperation, onSelect }: EmployeeOperationPanelProps) {
  return (
    <section className="panel employee-operation-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">每季度 1 项 / 有员工时必选</p>
          <h2>
            <Users aria-hidden="true" size={20} />
            员工季度操作
          </h2>
        </div>
        <span className={selectedOperation ? "status-pill success" : "status-pill neutral"}>
          {game.employees.length === 0 ? "暂无员工" : selectedOperation ? "已选择" : "待选择"}
        </span>
      </div>

      {game.employees.length === 0 ? (
        <p className="empty-state">还没有员工。选择 Hire 后，这里会出现加薪、期权、PUA、放假和裁员操作。</p>
      ) : (
        <div className="employee-operation-list">
          {employeeOperations.map((operation) => {
            const selected = selectedOperation === operation.id;
            return (
              <button
                aria-pressed={selected}
                className={selected ? "employee-operation-option selected" : "employee-operation-option"}
                key={operation.id}
                onClick={() => onSelect(operation.id)}
                type="button"
              >
                <span>
                  <strong>{operation.name}</strong>
                  <small>{operation.description}</small>
                </span>
                <em className={`status-pill ${riskTone(operation.risk)}`}>{riskLabel(operation.risk)}</em>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
