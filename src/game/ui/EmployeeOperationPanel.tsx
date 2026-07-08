import { Users } from "lucide-react";
import { employeeRoles } from "../data/employeeRoles";
import { employeeOperations } from "../engine/employeeOperations";
import type { EmployeeOperationAssignment, EmployeeOperationId, EmployeeRoleId, GameState } from "../types";

interface EmployeeOperationPanelProps {
  game: GameState;
  assignments: EmployeeOperationAssignment[];
  onChange: (assignments: EmployeeOperationAssignment[]) => void;
}

const ROLE_NAMES: Record<EmployeeRoleId, string> = Object.fromEntries(
  employeeRoles.map((role) => [role.id, role.name]),
) as Record<EmployeeRoleId, string>;

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

export function EmployeeOperationPanel({ game, assignments, onChange }: EmployeeOperationPanelProps) {
  function updateAssignment(employeeId: string, operationId: EmployeeOperationId | "") {
    const next = assignments.filter((assignment) => assignment.employeeId !== employeeId);
    if (operationId) {
      next.push({ employeeId, operationId });
    }
    onChange(next);
  }

  return (
    <section className="panel employee-operation-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">每位员工最多 1 项</p>
          <h2>
            <Users aria-hidden="true" size={20} />
            员工季度操作
          </h2>
        </div>
        <span className={assignments.length > 0 ? "status-pill success" : "status-pill neutral"}>
          {game.employees.length === 0 ? "暂无员工" : assignments.length > 0 ? `已选择 ${assignments.length}` : "可选"}
        </span>
      </div>

      {game.employees.length === 0 ? (
        <p className="empty-state">还没有员工。选择“招聘”后，这里会出现加薪、期权、PUA、放假和裁员操作。</p>
      ) : (
        <div className="employee-operation-list">
          {game.employees.map((employee) => {
            const assignment = assignments.find((item) => item.employeeId === employee.id);
            const operation = employeeOperations.find((item) => item.id === assignment?.operationId);
            return (
              <div className="employee-operation-option" key={employee.id}>
                <span className="employee-operation-person">
                  <strong>{employee.name}</strong>
                  <small>{ROLE_NAMES[employee.role]}</small>
                </span>
                <div className="employee-operation-cards" aria-label={`${employee.name} 员工操作`}>
                  <button
                    aria-pressed={!assignment}
                    className={!assignment ? "employee-operation-card selected" : "employee-operation-card"}
                    onClick={() => updateAssignment(employee.id, "")}
                    type="button"
                  >
                    <strong>平稳度过</strong>
                    <small>不额外干预，维持本季度状态。</small>
                  </button>
                  {employeeOperations.map((operation) => (
                    <button
                      aria-label={`${employee.name} ${operation.name}`}
                      aria-pressed={assignment?.operationId === operation.id}
                      className={
                        assignment?.operationId === operation.id
                          ? `employee-operation-card selected ${operation.risk}`
                          : `employee-operation-card ${operation.risk}`
                      }
                      key={operation.id}
                      onClick={() => updateAssignment(employee.id, operation.id)}
                      type="button"
                    >
                      <strong>{operation.name}</strong>
                      <small>{operation.description}</small>
                    </button>
                  ))}
                </div>
                {operation ? (
                  <em className={`status-pill ${riskTone(operation.risk)}`}>
                    {riskLabel(operation.risk)}
                  </em>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
