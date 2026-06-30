import { PERCENT_METRICS } from "../constants";
import type { CompanyMetrics, MetricId } from "../types";

export function clampMetric(metric: MetricId, value: number): number {
  if (PERCENT_METRICS.has(metric)) {
    return Math.min(100, Math.max(0, Math.round(value)));
  }
  return Math.max(0, Math.round(value));
}

export function applyMetricDelta(metrics: CompanyMetrics, metric: MetricId, delta: number): CompanyMetrics {
  return {
    ...metrics,
    [metric]: clampMetric(metric, metrics[metric] + delta),
  };
}
