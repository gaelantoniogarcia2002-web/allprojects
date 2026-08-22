"use client";

import { ReactGridLayout, WidthProvider, type Layout } from "react-grid-layout/legacy";
import type { GalleryTile } from "@/lib/gallery/types";
import { GRID_COLS } from "@/lib/gallery/tile-geometry";
import { ProyectoCard } from "./proyecto-card";

const GridLayoutWithWidth = WidthProvider(ReactGridLayout);

const ROW_HEIGHT_PX = 60;

type GalleryGridProps = {
  tiles: GalleryTile[];
  comparisonMode?: boolean;
};

/**
 * Renders `computeTileLayout`'s output as a static (non-draggable,
 * non-resizable, non-droppable) `react-grid-layout` grid. The grid never
 * fetches data itself; it only renders the `GalleryTile[]` view model built
 * by the server component.
 */
export function GalleryGrid({ tiles, comparisonMode = false }: GalleryGridProps) {
  const layout: Layout = tiles.map((tile) => ({
    i: String(tile.id),
    x: tile.rect.x,
    y: tile.rect.y,
    w: tile.rect.w,
    h: tile.rect.h,
  }));

  return (
    <GridLayoutWithWidth
      layout={layout}
      cols={GRID_COLS}
      rowHeight={ROW_HEIGHT_PX}
      compactType={null}
      preventCollision
      isDraggable={false}
      isResizable={false}
      isDroppable={false}
    >
      {tiles.map((tile) => (
        <div key={String(tile.id)}>
          <ProyectoCard tile={tile} comparisonMode={comparisonMode} />
        </div>
      ))}
    </GridLayoutWithWidth>
  );
}
