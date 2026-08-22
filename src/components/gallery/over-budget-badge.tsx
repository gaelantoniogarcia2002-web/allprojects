type OverBudgetBadgeProps = {
  isOverBudget: boolean;
};

/**
 * "⚠ Excedido" badge for a proyecto whose `tiempo_invertido_h` exceeds its
 * `tiempo_estimado_h`. `isOverBudget` is expected to come from
 * `computeProgress`, which already returns `false` when the estimate is 0.
 */
export function OverBudgetBadge({ isOverBudget }: OverBudgetBadgeProps) {
  if (!isOverBudget) return null;

  return (
    <span role="status" className="inline-block rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
      ⚠ Excedido
    </span>
  );
}
