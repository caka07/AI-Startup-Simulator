import { Activity, Banknote, CalendarDays, HeartPulse, Percent, TrendingUp } from "lucide-react";
import type { GameState, MetricId } from "../types";

interface DashboardProps {
  game: GameState;
}

interface MetricItem {
  id: MetricId;
  label: string;
  tooltip?: string;
  value: string;
  inverse?: boolean;
}

function formatMoney(value: number): string {
  if (Math.abs(value) >= 100_000_000) return `¥${(value / 100_000_000).toFixed(2)}亿`;
  if (Math.abs(value) >= 10_000) return `¥${Math.round(value / 10_000)}万`;
  return `¥${value.toLocaleString("zh-CN")}`;
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function metricTone(value: number, inverse = false): "success" | "warning" | "danger" | "neutral" {
  const score = inverse ? 100 - value : value;
  if (score >= 70) return "success";
  if (score >= 40) return "neutral";
  if (score >= 20) return "warning";
  return "danger";
}

export function Dashboard({ game }: DashboardProps) {
  const primaryMetrics: MetricItem[] = [
    { id: "cash", label: "现金", value: formatMoney(game.metrics.cash) },
    { id: "runway", label: "Runway", tooltip: "Runway：公司现金还能支撑的月份", value: `${Math.round(game.metrics.runway)} 个月` },
    { id: "arr", label: "ARR", tooltip: "ARR：年度经常性收入", value: formatMoney(game.metrics.arr) },
    { id: "mrr", label: "MRR", tooltip: "MRR：月度经常性收入", value: formatMoney(game.metrics.mrr) },
    { id: "valuation", label: "估值", value: formatMoney(game.metrics.valuation) },
  ];

  const operatingMetrics: MetricItem[] = [
    { id: "pmf", label: "PMF", tooltip: "PMF：产品市场匹配度", value: formatPercent(game.metrics.pmf) },
    { id: "modelPower", label: "模型能力", value: formatPercent(game.metrics.modelPower) },
    { id: "productQuality", label: "产品质量", value: formatPercent(game.metrics.productQuality) },
    { id: "grossMargin", label: "Gross Margin", tooltip: "Gross Margin：毛利率", value: formatPercent(game.metrics.grossMargin) },
    { id: "complianceRisk", label: "合规风险", value: formatPercent(game.metrics.complianceRisk), inverse: true },
    { id: "morale", label: "士气", value: formatPercent(game.metrics.morale) },
    { id: "boardPressure", label: "Board Pressure", tooltip: "Board Pressure：董事会对增长、预算和治理的压力", value: formatPercent(game.metrics.boardPressure), inverse: true },
    { id: "globalReadiness", label: "Global Readiness", tooltip: "Global Readiness：进入海外市场的产品、合规和运营准备度", value: formatPercent(game.metrics.globalReadiness) },
    { id: "founderHealth", label: "创始人健康", value: formatPercent(game.metrics.founderHealth) },
    { id: "founderEquity", label: "创始人股权", value: formatPercent(game.metrics.founderEquity) },
  ];

  return (
    <section className="dashboard" aria-label="公司仪表盘">
      <div className="dashboard-title">
        <div>
          <p className="eyebrow">12 年生命周期 / {game.founder.name}</p>
          <h1>
            <CalendarDays aria-hidden="true" size={22} />
            {game.year} Q{game.quarter}
          </h1>
        </div>
        <div className="dashboard-icons" aria-hidden="true">
          <Banknote size={20} />
          <TrendingUp size={20} />
          <Activity size={20} />
          <HeartPulse size={20} />
        </div>
      </div>

      <div className="metric-grid primary-metrics">
        {primaryMetrics.map((metric) => (
          <div className="metric-cell" key={metric.id}>
            <span
              className="metric-label"
              title={metric.tooltip}
              tabIndex={metric.tooltip ? 0 : -1}
              aria-label={metric.tooltip ?? metric.label}
            >
              {metric.label}
            </span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>

      <div className="metric-grid operating-metrics">
        {operatingMetrics.map((metric) => (
          <div className="metric-cell compact" key={metric.id}>
            <span
              className="metric-label"
              title={metric.tooltip}
              tabIndex={metric.tooltip ? 0 : -1}
              aria-label={metric.tooltip ?? metric.label}
            >
              {metric.label}
            </span>
            <strong className={`metric-value ${metricTone(game.metrics[metric.id], metric.inverse)}`}>
              <Percent aria-hidden="true" size={14} />
              {metric.value}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}
