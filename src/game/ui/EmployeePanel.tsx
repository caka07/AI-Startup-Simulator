import { Users } from "lucide-react";
import { employeeRoles } from "../data/employeeRoles";
import { calculateDepartureRisk } from "../engine/employees";
import type { EmployeeRoleId, GameState } from "../types";

interface EmployeePanelProps {
  game: GameState;
}

const ROLE_NAMES: Record<EmployeeRoleId, string> = Object.fromEntries(
  employeeRoles.map((role) => [role.id, role.name]),
) as Record<EmployeeRoleId, string>;

function riskTone(risk: number): "success" | "warning" | "danger" {
  if (risk >= 65) return "danger";
  if (risk >= 35) return "warning";
  return "success";
}

export function EmployeePanel({ game }: EmployeePanelProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">团队</p>
          <h2>
            <Users aria-hidden="true" size={20} />
            员工面板
          </h2>
        </div>
        <span className="status-pill neutral">{game.employees.length} 人</span>
      </div>

      {game.employees.length === 0 ? (
        <p className="empty-state">尚未招聘。选择“招聘”后，团队风险会在这里显性化。</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>员工</th>
                <th>角色</th>
                <th>忠诚</th>
                <th>疲劳</th>
                <th>离职风险</th>
              </tr>
            </thead>
            <tbody>
              {game.employees.map((employee) => {
                const departureRisk = calculateDepartureRisk(game, employee);
                return (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{ROLE_NAMES[employee.role]}</td>
                    <td>{Math.round(employee.loyalty)}%</td>
                    <td>{Math.round(employee.fatigue)}%</td>
                    <td>
                      <span className={`status-pill ${riskTone(departureRisk)}`}>{Math.round(departureRisk)}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
