import { describe, it, expect } from "vitest";
import { computeTileLayout } from "./tile-geometry";

describe("computeTileLayout", () => {
  it("gives a larger-estimate proyecto a larger tile area than a smaller one", () => {
    const layout = computeTileLayout([
      { id: 1, tiempoEstimadoH: 5 },
      { id: 2, tiempoEstimadoH: 50 },
    ]);

    const small = layout.find((rect) => rect.id === 1)!;
    const large = layout.find((rect) => rect.id === 2)!;

    expect(large.w * large.h).toBeGreaterThan(small.w * small.h);
  });

  it("never overlaps two tiles for a mixed-size set of proyectos", () => {
    const items = [
      { id: 1, tiempoEstimadoH: 5 },
      { id: 2, tiempoEstimadoH: 50 },
      { id: 3, tiempoEstimadoH: 20 },
      { id: 4, tiempoEstimadoH: 8 },
    ];
    const layout = computeTileLayout(items, { cols: 12 });

    const occupancy = new Map<string, number>();
    for (const rect of layout) {
      for (let dy = 0; dy < rect.h; dy++) {
        for (let dx = 0; dx < rect.w; dx++) {
          const key = `${rect.x + dx},${rect.y + dy}`;
          expect(occupancy.has(key)).toBe(false);
          occupancy.set(key, rect.id);
        }
      }
    }
    expect(occupancy.size).toBe(layout.reduce((sum, r) => sum + r.w * r.h, 0));
  });

  it("packs same-size tiles into a fully filled bounding rectangle with no gaps", () => {
    // 12 proyectos with identical tiempoEstimadoH produce identical-size tiles.
    // Since every valid tile width (1..4) divides the 12-column grid evenly,
    // this exact case must tile the bounding rectangle with zero empty cells.
    const items = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, tiempoEstimadoH: 20 }));
    const layout = computeTileLayout(items, { cols: 12 });

    const occupancy = new Set<string>();
    for (const rect of layout) {
      for (let dy = 0; dy < rect.h; dy++) {
        for (let dx = 0; dx < rect.w; dx++) {
          occupancy.add(`${rect.x + dx},${rect.y + dy}`);
        }
      }
    }

    const maxY = Math.max(...layout.map((r) => r.y + r.h));
    const cols = 12;
    expect(occupancy.size).toBe(maxY * cols);
  });

  it("renders a proyecto with zero estimated hours at the minimum tile size", () => {
    const layout = computeTileLayout([
      { id: 1, tiempoEstimadoH: 0 },
      { id: 2, tiempoEstimadoH: 40 },
    ]);

    const zero = layout.find((rect) => rect.id === 1)!;
    expect(zero.w).toBe(1);
    expect(zero.h).toBe(1);
  });

  it("produces a deterministic, stable order when tiempoEstimadoH values tie", () => {
    const items = [
      { id: 3, tiempoEstimadoH: 10 },
      { id: 1, tiempoEstimadoH: 10 },
      { id: 2, tiempoEstimadoH: 10 },
    ];

    const first = computeTileLayout(items);
    const second = computeTileLayout(items);

    expect(first).toEqual(second);
    // Ties break by id ascending: id 1 must be placed before id 2, and id 2 before id 3.
    const idxOf = (id: number) => first.findIndex((r) => r.id === id);
    expect(idxOf(1)).toBeLessThan(idxOf(2));
    expect(idxOf(2)).toBeLessThan(idxOf(3));
  });
});
