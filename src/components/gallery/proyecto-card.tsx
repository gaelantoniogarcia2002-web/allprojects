import Link from "next/link";
import type { GalleryTile } from "@/lib/gallery/types";
import { ProgressFill } from "./progress-fill";
import { OverBudgetBadge } from "./over-budget-badge";
import { SelectionCheckbox } from "@/components/comparison/selection-checkbox";

type ProyectoCardProps = {
  tile: GalleryTile;
  comparisonMode?: boolean;
};

/**
 * Presentational, props-only gallery card. Composes `ProgressFill` (tint +
 * solid fill) and `OverBudgetBadge`, and applies the spec's solid red 2px
 * border when over budget. No server-only imports: this renders inside the
 * client `GalleryGrid` (react-grid-layout) subtree.
 */
export function ProyectoCard({ tile, comparisonMode = false }: ProyectoCardProps) {
  return (
    <div
      data-testid="proyecto-card"
      className="relative flex h-full w-full flex-col overflow-hidden rounded-md"
      style={tile.isOverBudget ? { border: "2px solid red" } : undefined}
    >
      <ProgressFill tintColor={tile.tintColor} solidColor={tile.solidColor} percent={tile.percent} />
      <div className="relative z-10 flex flex-1 flex-col justify-between gap-1 p-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">
            {comparisonMode ? (
              tile.titulo
            ) : (
              <Link href={`/proyectos/${tile.id}`}>{tile.titulo}</Link>
            )}
          </h3>
          {comparisonMode && <SelectionCheckbox proyectoId={tile.id} />}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span>{tile.categoriaNombre}</span>
          <OverBudgetBadge isOverBudget={tile.isOverBudget} />
        </div>
      </div>
    </div>
  );
}
