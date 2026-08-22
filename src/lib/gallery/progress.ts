import { clamp } from "./math";

export type ProgressResult = {
  percent: number;
  isOverBudget: boolean;
};

/**
 * Computes a card's visual progress: percentage of tiempoInvertidoH over
 * tiempoEstimadoH, clamped to 100% even when invertido exceeds the estimate.
 * When estimadoH <= 0, returns 0% and never flags over-budget (no division).
 */
export function computeProgress(estimadoH: number, invertidoH: number): ProgressResult {
  if (estimadoH <= 0) {
    return { percent: 0, isOverBudget: false };
  }

  const rawPercent = (invertidoH / estimadoH) * 100;
  const percent = clamp(rawPercent, 0, 100);
  const isOverBudget = invertidoH > estimadoH;

  return { percent, isOverBudget };
}
