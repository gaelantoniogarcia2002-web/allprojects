# Exploration: Fase 2 — Vista Galería, Filtros y Módulo Comparador

## Current State

Fase 1 (merged to `main`) delivered Next.js 16 (App Router) + React 19 + TS + Tailwind v4, better-sqlite3 + Drizzle schema, typed repository functions, seed data. `src/app/page.tsx` is a static placeholder. No `src/app/api/` route handler layer exists. Tailwind v4 is CSS-first config (`@import 'tailwindcss'` in globals.css, no tailwind.config.js).

Available repository functions (`src/db/repositories/index.ts`), all reusable as-is:
- `listProyectos(db, filtro?: { estado?, categoriaId?, contactoId? })` — returns proyectos joined with categoria. Already supports categoriaId/contactoId filters.
- `getProyectoConDetalle(db, id)` — nested categoria/contactos/inspiraciones; only needed for a future detail view, not for gallery/comparator.
- `listCategorias(db)` / `listContactos(db)` — needed for filter dropdown option lists.

No mutation functions needed — gallery/filters/comparator are read-only. `Categoria.color` is a free-text hex string, not a Tailwind token — the central styling constraint.

## Approaches Considered

**1. Proportional/masonry gallery layout**
1. CSS Grid, dense auto-flow, server-computed size-tier classes (S/M/L/XL from tiempo_estimado_h) — recommended. No dependency, SSR-friendly, testable pure function.
2. CSS multi-column masonry (`columns-*`) — rejected, cannot express 2D size-proportional-to-hours.
3. JS masonry library (react-masonry-css, masonic) — rejected for this scale, loses SSR, adds dependency.
4. CSS native `grid-template-rows: masonry` — rejected, not production-viable (Firefox-only behind flag).

**2. Dynamic categoria color**
1. Inline `style` + `color-mix()` for transparent background, plain `style={{backgroundColor}}` for solid progress fill — recommended.
2. Hex→rgba() helper function — safer browser-support fallback, easy to unit test.

**3. State management (filters + comparison multi-select)**
1. URL search params, Server-Component-driven (`?categoria=`, `?contacto=`, `?modo=comparar&seleccion=1,3,5`) — recommended. Shareable, no state library, consistent with Fase 1's DB-direct server pattern.
2. Client-side state (Context/Zustand) — rejected, unnecessary dependency for a dataset this small, loses shareable state.

**4. New Route Handlers / Server Components**
No new Route Handlers needed. New Server Components: gallery page, gallery grid, project card, comparison table. New small Client Components: filter bar, compare-mode toggle. No new repository functions or schema changes needed.

## Recommendation

1. Layout: CSS Grid + `grid-flow-dense` with server-computed size-tier classes.
2. Color: `color-mix()`/rgba inline-style escape hatch only for the two runtime-color properties.
3. State: URL search params for both filters and comparison-mode selection.
4. Data: reuse `listProyectos`, `listCategorias`, `listContactos` — no new backend work.

## Risks

- "Tamaño proporcional al Tiempo Estimado" is approximate under tiered CSS Grid (discrete buckets, not literal area ∝ hours) — explicit accepted tradeoff.
- Dense grid auto-flow can reorder cards relative to DB order — fine unless stable ordering becomes a requirement.
- No pagination — fine at current seed scale (2-3 rows).

## Open Questions for the Proposal

1. Confirm CSS Grid tiered-size approach (approximate proportionality) vs. a JS masonry library (literal area-proportional, adds dependency/loses SSR).
2. Confirm URL search params for filter/compare state vs. client-side state.
3. Comparison view shape: dedicated table/page, or an overlay on the gallery itself?
4. Alert style for "Tiempo Invertido > Tiempo Estimado" — border/badge/color change? (spec only says "indicate clearly")

## Ready for Proposal

Yes — the data layer fully covers Fase 2's read needs; remaining decisions are proposal/design-level.
