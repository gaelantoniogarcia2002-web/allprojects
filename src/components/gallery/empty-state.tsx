type EmptyStateVariant = "no-proyectos" | "no-matches";

type EmptyStateProps = {
  variant?: EmptyStateVariant;
};

const MESSAGES: Record<EmptyStateVariant, string> = {
  "no-proyectos": "Todavía no hay proyectos. Crea el primero para verlo en la galería.",
  "no-matches": "Ningún proyecto coincide con los filtros seleccionados.",
};

/**
 * Distinct empty-state messages: `no-proyectos` when the database has zero
 * rows, `no-matches` when filters (Fase 3) narrow the result set to zero.
 */
export function EmptyState({ variant = "no-proyectos" }: EmptyStateProps) {
  return (
    <div role="status" data-testid="empty-state">
      <p>{MESSAGES[variant]}</p>
    </div>
  );
}
