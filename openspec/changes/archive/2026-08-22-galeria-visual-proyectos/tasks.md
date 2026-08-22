# Tasks: Fase 2 — Vista Galería, Filtros y Módulo Comparador

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~950-1200 (5 lib modules + 5 gallery components + 4 filter/comparison components + page.tsx + tests for all pure fns/components + package.json) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (tracker) → PR 2 → PR 3 → PR 4 |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | RGL install spike + `src/lib/gallery/` pure functions (geometry, progress, color, search-params) with full unit tests | PR 1 (base: tracker branch) | `npm test -- src/lib/gallery` | `npm run build` | Delete `src/lib/gallery/`, revert `package.json` |
| 2 | Gallery rendering: `page.tsx`, `gallery-grid.tsx`, `proyecto-card.tsx`, `progress-fill.tsx`, `over-budget-badge.tsx`, `empty-state.tsx` | PR 2 (base: PR 1 branch) | `npm test -- src/components/gallery` | `npm run dev` + manual load of `/` | Revert `page.tsx` to placeholder, delete `src/components/gallery/` |
| 3 | Filtering: `filter-bar.tsx` wired to gallery, no-match empty state | PR 3 (base: PR 2 branch) | `npm test -- src/components/filters` | `npm run dev` + manual `?categoria=&contacto=` | Delete `src/components/filters/`, remove filter-bar usage in `page.tsx` |
| 4 | Comparison: `comparison-toggle.tsx`, `selection-checkbox.tsx`, `comparison-overlay.tsx`, `comparison-table.tsx` | PR 4 (base: PR 3 branch, tracker merges to main) | `npm test -- src/components/comparison` | `npm run dev` + manual select 2+ and open overlay | Delete `src/components/comparison/`, remove toggle usage in `page.tsx` |

## Phase 1: Foundation — RGL Spike + Pure Geometry Layer (PR 1)

- [x] 1.1 Install `react-grid-layout` + `@types/react-grid-layout`; run `npm run build` to validate React 19 peer/type compatibility. If it fails without `--legacy-peer-deps`, document the CSS Grid fallback decision in `design.md` Open Questions and proceed with the fallback approach from `Migration / Rollout` for Phase 2.
- [x] 1.2 RED: write `src/lib/gallery/tile-geometry.test.ts` covering larger-estimate-yields-larger-tile, no-gaps packing, zero-hours minimum tile, and determinism (stable ordering on ties).
- [x] 1.3 GREEN: create `src/lib/gallery/types.ts` (`GalleryTile`, `GalleryParams`, `TileRect`) and `src/lib/gallery/tile-geometry.ts` (`computeTileLayout`, sqrt-area mapping, shelf bin-packing) to pass 1.2.
- [x] 1.4 RED: write `src/lib/gallery/progress.test.ts` covering 25% partial fill, 100%-clamp on overrun, and 0%/no-throw on `tiempo_estimado_h = 0`.
- [x] 1.5 GREEN: create `src/lib/gallery/progress.ts` (`computeProgress`) to pass 1.4.
- [x] 1.6 RED: write `src/lib/gallery/color.test.ts` covering tint (transparent) and solid color output from a hex `categoria.color`.
- [x] 1.7 GREEN: create `src/lib/gallery/color.ts` (`toTint`, `toSolid`) to pass 1.6.
- [x] 1.8 RED: write `src/lib/gallery/search-params.test.ts` covering parse of `categoria`/`contacto`/`modo`/`seleccion`, invalid/non-numeric params dropped (not thrown), and `buildGalleryHref` round-trip.
- [x] 1.9 GREEN: create `src/lib/gallery/search-params.ts` (`parseGalleryParams`, `buildGalleryHref`) to pass 1.8.
- [x] 1.10 REFACTOR: dedupe clamp/round helpers across `src/lib/gallery/*`; confirm `npm test -- src/lib/gallery` and `npm run build` stay green.

## Phase 2: Gallery Rendering (PR 2)

- [x] 2.1 RED: write `src/components/gallery/progress-fill.test.tsx` (tint background + solid fill width match `computeProgress` output).
- [x] 2.2 GREEN: create `src/components/gallery/progress-fill.tsx` to pass 2.1.
- [x] 2.3 RED: write `src/components/gallery/over-budget-badge.test.tsx` (badge + red 2px border present when over-budget, absent otherwise, absent when estimate is 0).
- [x] 2.4 GREEN: create `src/components/gallery/over-budget-badge.tsx` to pass 2.3.
- [x] 2.5 RED: write `src/components/gallery/proyecto-card.test.tsx` (renders tint/fill/badge/border via props, no server-only imports).
- [x] 2.6 GREEN: create `src/components/gallery/proyecto-card.tsx` composing 2.2/2.4, props-driven only.
- [x] 2.7 RED: write `src/components/gallery/empty-state.test.tsx` (distinct "no proyectos" message).
- [x] 2.8 GREEN: create `src/components/gallery/empty-state.tsx` to pass 2.7.
- [x] 2.9 GREEN: create `src/components/gallery/gallery-grid.tsx` (`'use client'`) rendering RGL static mode from `TileRect[]`, or the CSS Grid fallback from Phase 1.1 if RGL was rejected; import `react-grid-layout/css/styles.css` in `src/app/globals.css` only if RGL is used.
- [x] 2.10 GREEN: modify `src/app/page.tsx` to an async Server Component: await `searchParams`, call `parseGalleryParams`, `listProyectos`/`listCategorias`/`listContactos`, `computeTileLayout`, map to `GalleryTile[]`, render `<GalleryGrid>` or `<EmptyState>` when zero proyectos.
- [x] 2.11 Integration test: `src/app/page.test.tsx` renders the Server Component against a temp SQLite DB with seeded and zero-row fixtures, asserting card count and empty state.
- [x] 2.12 Manual verification: `npm run dev`, load `/`, confirm proportional tiles, no gaps, correct fills/badges per seeded data.

## Phase 3: Filtering (PR 3)

- [x] 3.1 RED: write `src/components/filters/filter-bar.test.tsx` covering categoría-only select, contacto-only select, clearing a filter, and combined AND intersection reflected via `buildGalleryHref` calls.
- [x] 3.2 GREEN: create `src/components/filters/filter-bar.tsx` (`'use client'`) using `useRouter`/`useSearchParams`, calling `router.push(buildGalleryHref(...), { scroll: false })`.
- [x] 3.3 GREEN: wire `<FilterBar>` into `src/app/page.tsx`, passing `categoriaId`/`contactoId` from `parseGalleryParams` into `listProyectos`.
- [x] 3.4 RED: extend `src/components/gallery/empty-state.test.tsx` (or add `no-matches` variant) for zero-results-after-filter, distinct from the no-proyectos-seeded state.
- [x] 3.5 GREEN: render the no-matches empty state in `page.tsx` when filters are active and the filtered list is empty.
- [x] 3.6 Integration test: extend `src/app/page.test.tsx` with `?categoria=` and `?categoria=&contacto=` fixtures asserting narrowed results and reload-reproducibility.
- [x] 3.7 Manual verification: `npm run dev`, apply/clear filters, confirm URL updates and reload reproduces the same filtered view.

## Phase 4: Comparison Module (PR 4)

- [x] 4.1 RED: write `src/components/comparison/comparison-toggle.test.tsx` (toggling writes `modo=comparar` to URL; disabling clears `seleccion`).
- [x] 4.2 GREEN: create `src/components/comparison/comparison-toggle.tsx` (`'use client'`).
- [x] 4.3 RED: write `src/components/comparison/selection-checkbox.test.tsx` (checked state reflects `seleccion` param, toggling updates URL list).
- [x] 4.4 GREEN: create `src/components/comparison/selection-checkbox.tsx` (`'use client'`); wire into `proyecto-card.tsx` shown only when `comparisonMode` is true.
- [x] 4.5 RED: write `src/components/comparison/comparison-table.test.tsx` covering rows for `tiempo_estimado_h`, `tiempo_invertido_h`, `monto_pago` (explicit "not set" when absent), `frecuencia_avance`, one column per selected proyecto.
- [x] 4.6 GREEN: create `src/components/comparison/comparison-table.tsx` (presentational) to pass 4.5.
- [x] 4.7 RED: write `src/components/comparison/comparison-overlay.test.tsx` covering open-with-2+-selections, blocked-open-with-<2-selections with an indicating message, and close-returns-to-selection-intact.
- [x] 4.8 GREEN: create `src/components/comparison/comparison-overlay.tsx` (`'use client'`) composing 4.6, gated on `comparisonMode && seleccion.length >= 2`.
- [x] 4.9 GREEN: wire `<ComparisonToggle>` and `<ComparisonOverlay>` into `src/app/page.tsx`.
- [x] 4.10 Integration test: extend `src/app/page.test.tsx` with `?modo=comparar&seleccion=1,3` fixture asserting overlay content matches selected proyectos.
- [x] 4.11 Manual verification: `npm run dev`, enable comparison mode, select 2+, open/close overlay, confirm table values and URL persistence.
- [x] 4.12 Final check: `npm test` and `npm run build` pass end-to-end; update `proposal.md` Success Criteria checkboxes.
