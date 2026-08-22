import type { TileRect } from "./types";
import { clamp } from "./math";

export const GRID_COLS = 12;
export const MIN_AREA = 1;
export const MAX_AREA = 12;
export const MAX_SPAN = 4;

type LayoutItem = { id: number; tiempoEstimadoH: number };

type LayoutOptions = {
  cols?: number;
  minArea?: number;
  maxArea?: number;
};

function computeArea(hoursI: number, maxH: number, minArea: number, maxArea: number): number {
  if (maxH <= 0 || hoursI <= 0) return minArea;
  return Math.round(minArea + (maxArea - minArea) * Math.sqrt(hoursI / maxH));
}

function computeSpan(area: number): { w: number; h: number } {
  const w = clamp(Math.round(Math.sqrt(area)), 1, MAX_SPAN);
  const h = clamp(Math.ceil(area / w), 1, MAX_SPAN);
  return { w, h };
}

/**
 * Finds the first free w×h window scanning row-major (top-to-bottom,
 * left-to-right) in a growing cols-wide occupancy grid.
 */
function findFirstFit(occupied: Set<string>, cols: number, w: number, h: number): { x: number; y: number } {
  for (let y = 0; ; y++) {
    for (let x = 0; x <= cols - w; x++) {
      let fits = true;
      for (let dy = 0; dy < h && fits; dy++) {
        for (let dx = 0; dx < w && fits; dx++) {
          if (occupied.has(`${x + dx},${y + dy}`)) fits = false;
        }
      }
      if (fits) return { x, y };
    }
  }
}

function markOccupied(occupied: Set<string>, x: number, y: number, w: number, h: number): void {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      occupied.add(`${x + dx},${y + dy}`);
    }
  }
}

/**
 * Computes deterministic tile geometry: area scales with sqrt(tiempoEstimadoH)
 * relative to the largest estimate in the set, then tiles are packed via
 * first-fit-decreasing into a cols-wide grid (shelf packing).
 */
export function computeTileLayout(items: LayoutItem[], opts: LayoutOptions = {}): TileRect[] {
  const cols = opts.cols ?? GRID_COLS;
  const minArea = opts.minArea ?? MIN_AREA;
  const maxArea = opts.maxArea ?? MAX_AREA;

  const maxH = items.length > 0 ? Math.max(...items.map((i) => i.tiempoEstimadoH)) : 0;

  const withGeometry = items.map((item) => {
    const area = computeArea(item.tiempoEstimadoH, maxH, minArea, maxArea);
    const { w, h } = computeSpan(area);
    return { id: item.id, area, w, h };
  });

  // First-fit-decreasing: largest area first, ties broken by id ascending for determinism.
  const ordered = [...withGeometry].sort((a, b) => (b.area !== a.area ? b.area - a.area : a.id - b.id));

  const occupied = new Set<string>();
  const placed: TileRect[] = [];
  for (const item of ordered) {
    const { x, y } = findFirstFit(occupied, cols, item.w, item.h);
    markOccupied(occupied, x, y, item.w, item.h);
    placed.push({ id: item.id, x, y, w: item.w, h: item.h });
  }

  return placed;
}
