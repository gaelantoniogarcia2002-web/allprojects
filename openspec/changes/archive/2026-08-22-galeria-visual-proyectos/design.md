# Design: Fase 2 — Vista Galería, Filtros y Módulo Comparador

## Technical Approach

`src/app/page.tsx` becomes an async Server Component: it awaits `searchParams`, parses them into a typed `GalleryParams`, calls the existing `listProyectos(db, { categoriaId, contactoId })`, `listCategorias(db)`, `listContactos(db)` (unchanged, `src/db/repositories/index.ts`), and maps rows into a serializable `GalleryTile[]` view model using pure functions in `src/lib/gallery/`. That array is handed to one `'use client'` grid that renders `react-grid-layout` in static mode. Persistence stays SQLite/Drizzle exactly as delivered in Fase 1 — no schema, migration, or repository change.

Rendering approach (per `rules.design`): explicit 2-D bin packing over a 12-column grid, tile **area** derived from `tiempo_estimado_h`, progress shown as a solid `categoria.color` fill over a transparent tint of the same color. Satisfies `project-gallery` §Proportional Card Sizing, §Progress Fill Rendering, §Over-Budget Alert, §Gallery Empty States.

## Architecture Decisions

| Decision | Choice | Rejected | Rationale |
|---|---|---|---|
| Layout engine | `react-grid-layout` + `WidthProvider`, `isDraggable/isResizable/isDroppable={false}` | masonic / react-masonry-css (1-D), muuri (imperative), CSS `masonry` (not shipped) | Only mature React option accepting explicit per-tile `{x,y,w,h}` units |
| Geometry location | Pure server-side function, layout passed as props | Client-side measurement | Unit-testable without DOM; keeps data + math on the server |
| Card size mapping | Continuous `sqrt` area scaling into 1..12 grid units | Fixed S/M/L/XL buckets | Spec forbids a small fixed bucket set; `sqrt` tames extreme spreads |
| State | URL search params, Server Component reads them | Context/Zustand | Shareable, bookmarkable, back-button correct, zero deps |
| Comparison view | Overlay/modal client component over the gallery | Separate route | Keeps gallery context and selection visible |
| Runtime color | Inline `style` with `color-mix()` + rgba fallback | Tailwind arbitrary values | `categoria.color` is free-text hex, unknown at build time |

## Data Flow

    URL ?categoria=&contacto=&modo=comparar&seleccion=1,3
      │
      ▼
    page.tsx (Server)  ── parseGalleryParams ──▶ FiltroProyectos
      │  listProyectos / listCategorias / listContactos (Drizzle, sync)
      │  computeTileLayout + computeProgress + toTint  ──▶ GalleryTile[]
      ▼
    <FilterBar/>  <ComparisonToggle/>   (client, write URL via useRouter)
    <GalleryGrid tiles=... />           (client, RGL static)
         └─ <ProyectoCard/> ─ <ProgressFill/> + <OverBudgetBadge/> + <SelectionCheckbox/>
    <ComparisonOverlay/>  (client, rendered when modo=comparar && seleccion.length >= 2)

Client components never fetch; they only push new search params, which re-runs the Server Component.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/lib/gallery/types.ts` | Create | `GalleryTile`, `GalleryParams`, `TileRect` |
| `src/lib/gallery/tile-geometry.ts` | Create | `computeTileLayout` (area mapping + shelf packing) |
| `src/lib/gallery/progress.ts` | Create | `computeProgress` (clamped %, over-budget flag) |
| `src/lib/gallery/color.ts` | Create | `toTint(hex, alpha)` / `toSolid(hex)` |
| `src/lib/gallery/search-params.ts` | Create | `parseGalleryParams`, `buildGalleryHref` |
| `src/app/page.tsx` | Modify | Placeholder → async gallery Server Component |
| `src/app/globals.css` | Modify | Import `react-grid-layout/css/styles.css` |
| `src/components/gallery/gallery-grid.tsx` | Create | `'use client'` RGL wrapper |
| `src/components/gallery/proyecto-card.tsx` | Create | Presentational card (client-safe) |
| `src/components/gallery/progress-fill.tsx` | Create | Tint background + solid fill |
| `src/components/gallery/over-budget-badge.tsx` | Create | `⚠ Excedido` badge |
| `src/components/gallery/empty-state.tsx` | Create | No-projects / no-matches states |
| `src/components/filters/filter-bar.tsx` | Create | `'use client'` categoría + contacto selects |
| `src/components/comparison/comparison-toggle.tsx` | Create | `'use client'` mode switch |
| `src/components/comparison/selection-checkbox.tsx` | Create | `'use client'` per-card select |
| `src/components/comparison/comparison-overlay.tsx` | Create | `'use client'` modal shell |
| `src/components/comparison/comparison-table.tsx` | Create | Side-by-side table (presentational) |
| `package.json` | Modify | `react-grid-layout` + `@types/react-grid-layout` |

## Interfaces / Contracts

```ts
// src/lib/gallery/tile-geometry.ts
export const GRID_COLS = 12, MIN_AREA = 1, MAX_AREA = 12, MAX_SPAN = 4;
export type TileRect = { id: number; x: number; y: number; w: number; h: number };

export function computeTileLayout(
  items: { id: number; tiempoEstimadoH: number }[],
  opts?: { cols?: number; minArea?: number; maxArea?: number }
): TileRect[];
```

Algorithm (deterministic, DOM-free):
1. `maxH = max(tiempoEstimadoH)`; if `maxH <= 0`, every tile gets `MIN_AREA`.
2. `area_i = round(MIN_AREA + (MAX_AREA - MIN_AREA) * Math.sqrt(h_i / maxH))`; `h_i = 0` ⇒ `MIN_AREA` (§Zero estimated hours).
3. `w = clamp(round(sqrt(area)), 1, MAX_SPAN)`, `h = clamp(ceil(area / w), 1, MAX_SPAN)`.
4. Pack: sort by area desc (ties by `id` asc for stability), then first-fit into a growing `cols`-wide occupancy bitmap, scanning row-major for the first free `w×h` window. First-fit-decreasing fills holes left by large tiles, satisfying §Tiles pack without gaps.

```ts
// src/lib/gallery/progress.ts
export function computeProgress(estimadoH: number, invertidoH: number):
  { percent: number /* 0..100, clamped */; isOverBudget: boolean };
// estimadoH <= 0 → { percent: 0, isOverBudget: false }
```

```ts
// src/lib/gallery/search-params.ts
export type GalleryParams = {
  categoriaId?: number; contactoId?: number;
  comparisonMode: boolean; seleccion: number[];
};
export function parseGalleryParams(sp: Record<string, string | string[] | undefined>): GalleryParams;
export function buildGalleryHref(current: GalleryParams, patch: Partial<GalleryParams>): string;
```

Invalid/non-numeric params are dropped (never thrown), so a hand-edited URL degrades to the unfiltered gallery.

## Server → Client Boundary

`page.tsx` is `async` and awaits `searchParams` (Next 16 passes it as a Promise). It computes everything non-serializable-free and passes only plain data:

```tsx
const params = parseGalleryParams(await searchParams);
const proyectos = listProyectos(getDb(), { categoriaId: params.categoriaId, contactoId: params.contactoId });
const layout = computeTileLayout(proyectos.map(p => ({ id: p.id, tiempoEstimadoH: p.tiempoEstimadoH })));
<GalleryGrid tiles={toGalleryTiles(proyectos, layout)} params={params} />
```

`GalleryTile` carries `{ id, titulo, estado, rect, percent, isOverBudget, tintColor, solidColor, categoriaNombre, tiempoEstimadoH, tiempoInvertidoH, montoPago, frecuenciaAvance }` — all primitives. RGL requires its children to be direct keyed elements, so `ProyectoCard` and its children must stay client-safe (no `getDb`, no server-only imports); they receive props only. Filter/toggle/checkbox components use `useRouter()` + `useSearchParams()` and `router.push(buildGalleryHref(...), { scroll: false })`.

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit | `computeTileLayout` (0 h, extreme spread, no overlaps/gaps, determinism), `computeProgress` (25%, clamp at 100%, 0-estimate), `toTint`, `parseGalleryParams`/`buildGalleryHref` round-trip | Vitest, pure functions, no DOM |
| Component | Card tint/fill width, red 2px border + `⚠ Excedido` badge presence/absence, empty states, comparison table rows | Vitest + @testing-library/react (jsdom), props-driven |
| Integration | `page.tsx` with seeded DB and various `searchParams` | Render the async Server Component in Vitest with a temp SQLite `DATABASE_URL` |
| E2E | Not available (`config.yaml testing.test_layers.e2e: unavailable`) | N/A |

Strict TDD (`rules.apply.tdd: true`): RED tests first for every pure function before implementation.

## Threat Matrix

N/A — no routing-authority, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. All work is in-process React rendering over an existing local read-only query path.

## Migration / Rollout

No migration required. Frontend-only and additive; rollback is reverting the PR (see proposal §Rollback Plan).

**RGL/React 19 contingency (first implementation task):** install `react-grid-layout` and run `npm run build` before any UI work. If peer deps or types reject React 19 and `--legacy-peer-deps` is not acceptable, fall back to CSS Grid: keep `computeTileLayout` and every `src/lib/gallery/` function byte-identical, drop `gallery-grid.tsx`'s RGL import, and render a `grid-cols-12 grid-flow-dense` container where each card applies `gridColumn: span w` / `gridRow: span h` with `gridColumnStart: x+1` / `gridRowStart: y+1` from the same `TileRect`. Only that one component changes; no test rewrite, no `package.json` dependency.

## Open Questions

- [ ] None blocking. Tile-unit row height (px) is a visual-tuning detail to settle during apply.
