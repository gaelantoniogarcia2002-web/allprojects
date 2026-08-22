# Proposal: Fase 2 — Vista Galería, Filtros y Módulo Comparador

## Intent

Fase 1 delivered the data layer, but `src/app/page.tsx` is still a placeholder — the seeded projects are invisible. The user cannot see at a glance which projects consume the most estimated time, how far each has progressed, or which have overrun. This change delivers the primary read-only UI from `spec.md` §3: proportional gallery, filters, comparison overlay.

## Scope

### In Scope
- Gallery page: cards bin-packed with **area ∝ `tiempo_estimado_h`**, no gaps.
- Progress fill: transparent `categoria.color` background, solid fill at `tiempo_invertido_h / tiempo_estimado_h`.
- Over-budget alert: solid red 2px border + `⚠ Excedido` badge when invertido > estimado.
- Filters: categoría and contacto, driven by URL search params.
- Comparison module: "Modo Comparación" toggle, per-card checkboxes (2+), overlay/modal with a side-by-side table (Tiempos estimado vs. invertido, Monto/Pago, Frecuencia de avance).
- Empty states: no projects, no filter matches, `tiempo_estimado_h = 0` (no divide-by-zero).

### Out of Scope
- Project detail view, any create/edit/delete UI, `getProyectoConDetalle`.
- Inspiraciones UI, text search, estado filter, sorting, pagination.
- New API route handlers, schema changes, migrations.
- Drag/resize/persisted layout, export of comparisons.

## Capabilities

### New Capabilities
- `project-gallery`: proportional bin-packed cards, progress fill, category color, over-budget alert, empty states.
- `project-filtering`: categoría/contacto filtering with URL-encoded, shareable state.
- `project-comparison`: multi-select mode and overlay comparison view.

### Modified Capabilities
- None. `project-data-model` and `data-seeding` are consumed unchanged.

## Approach

**Library — `react-grid-layout`, static mode.** Rejected: `masonic`/`react-masonry-css` (1-D column packers, fixed width, cannot vary area); `muuri` (imperative, non-React, heavier); `react-mosaic` (tiling window manager, wrong domain). RGL is the lightest mature React component accepting explicit per-tile `{x,y,w,h}` grid units with responsive width (`WidthProvider`), interaction off via `isDraggable/isResizable/isDroppable={false}`. Runner-up if bundle size bites: `maxrects-packer` + CSS Grid spans.

**Geometry** is a pure server-side function — `tiempo_estimado_h → {w,h}` grid units (clamped to a readable minimum), then deterministic shelf bin-packing for `{x,y}`. RGL only renders the precomputed layout, so packing is unit-testable without a DOM.

**Composition.** Page stays a Server Component: reads `searchParams`, calls `listProyectos(db, {categoriaId, contactoId})`, `listCategorias`, `listContactos`, computes geometry/progress, passes serializable props to a `'use client'` grid. Accepted tradeoff: no pure SSR for tile positions.

**Color.** Inline-style `color-mix()`/rgba only for the two runtime-color properties; everything else Tailwind v4 utilities.

**State.** URL search params throughout: `?categoria=&contacto=&modo=comparar&seleccion=1,3,5&comparar=1`. One shareable, bookmarkable, back-button-correct mechanism; no state library.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/page.tsx` | Modified | Placeholder → gallery Server Component reading `searchParams` |
| `src/components/gallery/` | New | Grid (client), card, progress fill, over-budget badge |
| `src/components/filters/` | New | Categoría/contacto filter bar (client, URL-writing) |
| `src/components/comparison/` | New | Mode toggle, selection checkboxes, comparison overlay |
| `src/lib/gallery/` | New | Pure tile-geometry + bin-packing + progress functions |
| `package.json` | Modified | Adds `react-grid-layout` (+ types) |
| `src/db/**` | Unchanged | Repositories reused as-is |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| RGL forces a Client Component; loses SSR for grid | High (accepted) | Fetch + geometry stay on the server; ship serializable props only |
| RGL peer/type friction on React 19 | Med | Verify install first in apply; fallback `maxrects-packer` + CSS Grid spans (geometry code unchanged) |
| Extreme `tiempo_estimado_h` spread yields unreadable tiles | Med | Clamp min/max tile units; unit-test both extremes |
| `tiempo_estimado_h = 0` divide-by-zero | Med | Rule: progress 0%, minimum tile, no alert |
| Choice forces a new backend endpoint | Low | Not expected — geometry computed in-process from fetched rows; escalate as scope change if it materializes |

## Rollback Plan

Frontend-only and additive. Revert the PR: `src/app/page.tsx` returns to the placeholder, new component/lib directories are deleted, `react-grid-layout` is removed from `package.json`. No migrations, schema, seed or persisted-state changes — nothing to undo in the database.

## Dependencies

- Fase 1 (`project-data-model`, `data-seeding`) merged and live — satisfied.
- New runtime dependency: `react-grid-layout` (+ `@types/react-grid-layout`).

## Success Criteria

- [x] Gallery renders every seeded proyecto with card area visibly proportional to `tiempo_estimado_h` and no layout gaps.
- [x] Each card shows the categoría color as a transparent background with a solid fill at the correct progress percentage.
- [x] Projects with `tiempo_invertido_h > tiempo_estimado_h` show the red border + `⚠ Excedido` badge.
- [x] Filtering by categoría and/or contacto narrows the gallery, and the resulting URL reproduces the same view when reloaded or shared.
- [x] Selecting 2+ projects in Modo Comparación opens an overlay comparing tiempos, montos and frecuencia for exactly those projects.
- [x] Pure geometry/progress functions are unit-tested (including 0 hours and extreme spreads); `npm test` and `npm run build` pass.
