# Apply Progress: Fase 2 — Vista Galería, Filtros y Módulo Comparador

## FINAL STATUS: 41/41 tasks complete — Fase 2 fully implemented

All four work units (PR 1 Foundation, PR 2 Gallery Rendering, PR 3 Filtering, PR 4 Comparison Module) are complete, TDD-verified, and committed to their respective branches (`pr1-geometry` → `pr2-gallery-rendering` → `pr3-filtering` → `pr4-comparison`). `npm test` (109/109) and `npm run build` pass on the full accumulated diff. `proposal.md` Success Criteria are all checked. Ready for `sdd-verify`.

---

## Batch 4

**Change**: galeria-visual-proyectos
**Work unit**: Unit 4 — Comparison Module (PR 4, base: PR 3 branch `pr3-filtering`, worked on `pr4-comparison`)
**Mode**: Strict TDD

### Completed Tasks
- [x] 4.1 RED: `src/components/comparison/comparison-toggle.test.tsx`
- [x] 4.2 GREEN: `src/components/comparison/comparison-toggle.tsx`
- [x] 4.3 RED: `src/components/comparison/selection-checkbox.test.tsx`
- [x] 4.4 GREEN: `src/components/comparison/selection-checkbox.tsx`; wired into `proyecto-card.tsx` (extended `proyecto-card.test.tsx` RED first) and threaded `comparisonMode` through `gallery-grid.tsx`
- [x] 4.5 RED: `src/components/comparison/comparison-table.test.tsx`
- [x] 4.6 GREEN: `src/components/comparison/comparison-table.tsx`
- [x] 4.7 RED: `src/components/comparison/comparison-overlay.test.tsx`
- [x] 4.8 GREEN: `src/components/comparison/comparison-overlay.tsx`
- [x] 4.9 GREEN: wired `<ComparisonToggle>` and `<ComparisonOverlay>` into `src/app/page.tsx`
- [x] 4.10 Integration test: extended `tests/app/page.test.tsx` with `?modo=comparar&seleccion=1,3` fixture
- [x] 4.11 Manual verification: `npm run dev` + `curl` with `?modo=comparar&seleccion=1,2`
- [x] 4.12 Final check: `npm test` (109/109) and `npm run build` pass end-to-end; `proposal.md` Success Criteria checkboxes updated to `[x]`

### Files Changed
| File | Action | What Was Done |
|------|--------|---------------|
| `src/components/comparison/comparison-toggle.tsx` | Created | `'use client'`; self-contained (reads `useSearchParams()`/`parseGalleryParams`, pushes `buildGalleryHref` via `useRouter().push(..., { scroll: false })`), same pattern as `FilterBar`; enabling sets `comparisonMode: true`, disabling patches `{ comparisonMode: false, seleccion: [] }` to clear the selection |
| `src/components/comparison/comparison-toggle.test.tsx` | Created | Mocks `next/navigation`; asserts enabling pushes `modo=comparar`, disabling with an existing selection pushes `/` (mode + selection cleared), checkbox reflects current URL in both states |
| `src/components/comparison/selection-checkbox.tsx` | Created | `'use client'`; per-card checkbox, `proyectoId` prop, checked state from `seleccion` URL param, toggling adds/removes the id and pushes the patched URL |
| `src/components/comparison/selection-checkbox.test.tsx` | Created | Unchecked/checked reflecting `seleccion`, add-on-check and remove-on-uncheck push assertions |
| `src/components/gallery/proyecto-card.tsx` | Modified | Added optional `comparisonMode` prop (default `false`); renders `<SelectionCheckbox proyectoId={tile.id}>` next to the title only when `comparisonMode` is true |
| `src/components/gallery/proyecto-card.test.tsx` | Modified | Added `next/navigation` mock (required by `SelectionCheckbox`); 2 new RED-then-GREEN cases: checkbox present when `comparisonMode`, absent when omitted/false |
| `src/components/gallery/gallery-grid.tsx` | Modified | Added optional `comparisonMode` prop (default `false`), forwarded to each `<ProyectoCard>` |
| `src/components/comparison/comparison-table.tsx` | Created | Presentational `<table>`; one column per tile (`tiles: GalleryTile[]` prop), rows for `tiempoEstimadoH`, `tiempoInvertidoH`, `montoPago` (renders "No establecido" when `null`), `frecuenciaAvance` |
| `src/components/comparison/comparison-table.test.tsx` | Created | Multi-column row content assertions; explicit "No establecido" case for `montoPago: null` |
| `src/components/comparison/comparison-overlay.tsx` | Created | `'use client'`; self-contained via `useSearchParams()`; renders `null` outside comparison mode; "Comparar seleccionados" trigger button; clicking with `<2` selections sets a blocked message (does not open); with `>=2` opens a `role="dialog"` composing `ComparisonTable` filtered to `seleccion`; closing only resets local `isOpen` state (URL `seleccion` untouched) |
| `src/components/comparison/comparison-overlay.test.tsx` | Created | Mocks `next/navigation`; 4 cases: not rendered outside comparison mode, blocked-message with 1 selection, table opens and shows only selected proyectos with 2+, close hides the table while the trigger (and implicitly the selection) remains |
| `src/app/page.tsx` | Modified | Imports and renders `<ComparisonToggle/>` in both the empty-state and populated branches; renders `<ComparisonOverlay tiles={tiles}/>` and passes `comparisonMode={params.comparisonMode}` to `<GalleryGrid>` in the populated branch |
| `tests/app/page.test.tsx` | Modified | Added `fireEvent`/`within` imports; new integration test for `?modo=comparar&seleccion=1,3`: opens the overlay via the trigger button, asserts the table contains only the two selected proyectos (by title), the third stays absent from the table but still renders as a normal gallery card, and the "No establecido" cell renders for a `null` `montoPago` |
| `openspec/changes/galeria-visual-proyectos/tasks.md` | Modified | Marked 4.1–4.12 `[x]` — all 48/48 tasks across all 4 phases now complete |
| `openspec/changes/galeria-visual-proyectos/proposal.md` | Modified | All 6 Success Criteria checkboxes marked `[x]` |

### TDD Cycle Evidence
| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 4.1-4.2 | `comparison-toggle.test.tsx` | Component | N/A (new) | ✅ Written (`Failed to resolve import "./comparison-toggle"`) | ✅ 4/4 passed | ✅ 4 cases (enable, disable-clears-selection, reflects-active, reflects-inactive) | ➖ None needed |
| 4.3-4.4 | `selection-checkbox.test.tsx` | Component | N/A (new) | ✅ Written (module-resolution failure) | ✅ 4/4 passed | ✅ 4 cases (unchecked, checked, add-on-check, remove-on-uncheck) | ➖ None needed |
| 4.4 (wiring) | `proyecto-card.test.tsx` | Component | ✅ 3/3 pre-existing (Batch 2) | ✅ 2 new cases written first; ran RED against pre-wiring `ProyectoCard` and failed (`getByRole("checkbox")` found no element) | ✅ 5/5 passed after GREEN | ✅ 2 cases (comparisonMode true/false) | ➖ None needed |
| 4.5-4.6 | `comparison-table.test.tsx` | Component | N/A (new) | ✅ Written (module-resolution failure) | ✅ 2/2 passed | ✅ 2 cases (multi-column rows, null-montoPago "not set") | ➖ None needed |
| 4.7-4.8 | `comparison-overlay.test.tsx` | Component | N/A (new) | ✅ Written (module-resolution failure) | ✅ 4/4 passed | ✅ 4 cases (hidden-outside-mode, blocked-message, open-with-table, close-intact) | ➖ None needed |
| 4.9-4.10 | `tests/app/page.test.tsx` | Integration | ✅ 7/7 pre-existing (Batch 3) | ✅ New fixture written and run — passed immediately since 4.1-4.8's GREEN components were already wired into `page.tsx` in 4.9 before this integration test was added (same execution-order pattern as Batch 2's 2.9-2.11: RED discipline honored at the component level; the integration test extends already-green wiring rather than driving new production code) | ✅ 8/8 passed | ✅ covered via the new `?modo=comparar&seleccion=1,3` fixture | ➖ None needed |

### Test Summary
- **Total tests written this batch**: 16 (14 component + 1 integration, plus 1 extension of an existing `page.test.tsx` file)
- **Total tests passing**: 109/109 (`npm test`, full suite — up from 92 in Batch 3)
- **Layers used**: Unit (0 new — reused Phase 1), Component (14), Integration (1 new + 7 pre-existing extended), E2E (0 — unavailable per config)
- **Approval tests** (refactoring): None — no refactoring tasks in this batch
- **Pure functions created**: 0 new — reused `parseGalleryParams`/`buildGalleryHref` from Phase 1

### Work Unit Evidence
| Evidence | Value |
|---|---|
| Focused test command and exact result | `npx vitest run src/components/comparison` → 4 files, 14/14 passed; `npx vitest run src/components/gallery` → 4 files, 13/13 passed (incl. 2 new `proyecto-card` cases); `npx vitest run tests/app/page.test.tsx` → 8/8 passed |
| Runtime harness command/scenario and exact result | `npm run dev` (`DATABASE_URL=./data/allprojects.db`) + `curl`: unfiltered `/` → HTTP 200; `/?modo=comparar&seleccion=1,2` → HTTP 200, response HTML contains 3 `data-testid="proyecto-card"`, the "Comparar seleccionados" trigger button, and 4 checkboxes (1 comparison-toggle + 3 per-card selection checkboxes); dev server log shows `GET / 200` and `GET /?modo=comparar&seleccion=1,2 200`, no errors |
| Rollback boundary | Delete `src/components/comparison/`; revert `src/app/page.tsx` to the Batch 3 version (drop `ComparisonToggle`/`ComparisonOverlay` imports and usage, drop `comparisonMode` prop on `GalleryGrid`); revert `src/components/gallery/gallery-grid.tsx` and `proyecto-card.tsx` to their Batch 2 versions (drop `comparisonMode` prop and `SelectionCheckbox` usage); revert `proyecto-card.test.tsx` and `tests/app/page.test.tsx` to their Batch 3 versions |

### Full Suite Confirmation
`npm test` → 20 test files, 109/109 tests passed (baseline safety net: all 92 Batch-3 tests still pass; no regression).
`npm run build` → Next.js 16.3.2 (Turbopack) compiled successfully, TypeScript check passed, `/` listed as dynamic (ƒ) route.

### Deviations from Design
- `design.md`'s Data Flow diagram annotates `<ComparisonOverlay/>` as "client, rendered when `modo=comparar && seleccion.length >= 2`" — read literally, this would mean the overlay component itself is only mounted once 2+ selections exist. That contradicts `project-comparison` spec's explicit "Fewer than two selections cannot open the comparison overlay" scenario, which requires the system to indicate the shortfall when the user *attempts* to open the overlay with fewer than 2 selections — impossible if the component isn't mounted at all below that threshold. Implemented instead: `ComparisonOverlay` mounts (and renders its trigger button) whenever `comparisonMode` is true, regardless of selection count; the `seleccion.length >= 2` gate applies only to whether clicking the trigger actually opens the dialog (otherwise it shows the blocked message). This is the literal, spec-driven reading of "gated on `comparisonMode && seleccion.length >= 2`" from `tasks.md` task 4.8, applied to the open action rather than the mount.
- `SelectionCheckbox` and `ComparisonOverlay` follow the same self-contained URL-reading pattern established for `FilterBar` in Batch 3 (reading `useSearchParams()`/`parseGalleryParams` internally rather than receiving parsed `GalleryParams` as props) for consistency; `ComparisonToggle` likewise. `comparisonMode` is still passed as an explicit prop from `page.tsx` down through `GalleryGrid` to `ProyectoCard` (per the user's explicit instruction for this batch), since that boolean drives *rendering* (whether to show the checkbox at all) rather than URL-writing — the checkbox itself, once rendered, reads/writes `seleccion` independently.
- `proyecto-card.test.tsx` required adding a `next/navigation` mock (previously absent) because `SelectionCheckbox` — now always in `ProyectoCard`'s render tree — calls `useRouter()`/`useSearchParams()`. This mirrors the mock already present in `filter-bar.test.tsx` and `tests/app/page.test.tsx`.

### Issues Found
None.

### Workload / PR Boundary
- Mode: feature-branch-chain (auto-chain), PR 4 of 4 (final)
- Current work unit: Unit 4 — Comparison Module
- Boundary: starts from `pr4-comparison` (base: `pr3-filtering`), ends with all Phase 4 tasks (4.1-4.12) complete and green — the last work unit of Fase 2
- Estimated review budget impact: ~547 changed lines per `git commit` stat (15 files changed, 547 insertions(+), 26 deletions(-)) — above the 400-line guard for a single slice but within this work unit's own chained-PR-slice budget per the `feature-branch-chain` strategy recorded in `tasks.md`'s Review Workload Forecast (High risk, chained PRs recommended, `Decision needed before apply: No` since the chain strategy was already resolved at tasks time)

### Status
41/41 total tasks complete across all 4 phases (10 Phase 1 + 12 Phase 2 + 7 Phase 3 + 12 Phase 4), confirmed by `grep -c '^- \[x\]' tasks.md` matching `grep -c '^- \['`. Prior batches' running totals (out of "48") were a stale denominator carried in the narrative text only — `tasks.md` itself has always had exactly 41 checkbox items, and all 41 are now `[x]`. Fase 2 (galeria-visual-proyectos) is fully implemented. Ready for `sdd-verify`.

---

## Batch 3

**Change**: galeria-visual-proyectos
**Work unit**: Unit 3 — Filtering (PR 3, base: PR 2 branch `pr2-gallery-rendering`, worked on `pr3-filtering`)
**Mode**: Strict TDD

### Completed Tasks
- [x] 3.1 RED: `src/components/filters/filter-bar.test.tsx`
- [x] 3.2 GREEN: `src/components/filters/filter-bar.tsx`
- [x] 3.3 GREEN: wired `<FilterBar>` into `src/app/page.tsx`
- [x] 3.4 RED: `no-matches` empty-state coverage — already present from Batch 2 (`src/components/gallery/empty-state.test.tsx`, tasks 2.7-2.8); reused as-is, no new test needed
- [x] 3.5 GREEN: `page.tsx` now selects `no-matches` vs `no-proyectos` based on whether an unfiltered query still returns rows
- [x] 3.6 Integration test: extended `tests/app/page.test.tsx` with `?categoria=`, `?categoria=&contacto=`, no-match, and reload-reproducibility fixtures
- [x] 3.7 Manual verification: `npm run dev` + `curl` with `?categoria=1`, `?categoria=1&contacto=1`, `?categoria=999`

### Files Changed
| File | Action | What Was Done |
|------|--------|---------------|
| `src/components/filters/filter-bar.tsx` | Created | `'use client'`; reads current filters via `useSearchParams()` + `parseGalleryParams`, pushes `buildGalleryHref(params, patch)` via `useRouter().push(href, { scroll: false })` on categoría/contacto `<select>` change |
| `src/components/filters/filter-bar.test.tsx` | Created | Mocks `next/navigation` (`useRouter`, `useSearchParams`); asserts categoría-only push, contacto-only push, clearing a filter drops its param, combined AND intersection preserves the other active filter, and selects reflect the current URL |
| `src/app/page.tsx` | Modified | Imports and renders `<FilterBar categorias={categorias} contactos={contactos} />` in both the populated and empty-state branches; computes `filtersActive` from `parseGalleryParams`; when the filtered result is empty, re-queries `listProyectos(db)` unfiltered to distinguish `no-matches` (rows exist elsewhere) from `no-proyectos` (database is genuinely empty) |
| `tests/app/page.test.tsx` | Modified | Added `vi.mock("next/navigation", ...)` (hoisted `mockPush`/`mockUseSearchParams`) so `FilterBar` renders inside the Server Component tree under test; `renderHome()` now mirrors the `searchParams` fixture into the mocked `useSearchParams()` so `FilterBar`'s "current" state matches the page's own parse, exercising real reload-reproducibility; added 4 new tests: `?categoria=` narrowing, `?categoria=&contacto=` AND intersection, no-matches empty state, and same-URL re-render producing identical card content |

### TDD Cycle Evidence
| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 3.1-3.2 | `src/components/filters/filter-bar.test.tsx` | Component | N/A (new) | ✅ Written (import-resolution failure: `Failed to resolve import "./filter-bar"`) | ✅ 5/5 passed | ✅ 5 cases (categoría-only, contacto-only, clear-categoria, categoria+existing-contacto AND, reflects-current-URL) | ➖ None needed |
| 3.3, 3.5 | `tests/app/page.test.tsx` | Integration | ✅ 7 pre-existing page tests (3 from Batch 2 + this batch's own additions run together) | ✅ Extended tests written first; ran against pre-wiring `page.tsx`/mocked `next/navigation` and failed with `invariant expected app router to be mounted` (no `next/navigation` mock yet) before the mock + `<FilterBar>` wiring landed | ✅ 7/7 passed after GREEN | ✅ covered via 3.6's new integration cases | ➖ None needed |
| 3.4 | `src/components/gallery/empty-state.test.tsx` | Component | ✅ 2/2 (unchanged from Batch 2) | N/A — `no-matches` variant + test already existed from Batch 2 (2.7-2.8); no new RED cycle run | N/A | N/A | ➖ Reused as-is |
| 3.6 | `tests/app/page.test.tsx` | Integration | ✅ 3 pre-existing (Batch 2) | ✅ Written first; new fixtures failed pre-wiring for the same `next/navigation` mounting reason above | ✅ 4/4 new cases passed after GREEN | ✅ 4 cases (categoria-narrow, categoria+contacto AND, no-matches, reload-reproducibility) | ➖ None needed |

### Test Summary
- **Total tests written this batch**: 9 (5 component + 4 integration)
- **Total tests passing**: 92/92 (`npm test`, full suite — up from 83 in Batch 2)
- **Layers used**: Unit (0 new — reused Phase 1), Component (5), Integration (4), E2E (0 — unavailable per config)
- **Approval tests** (refactoring): None — no refactoring tasks in this batch
- **Pure functions created**: 0 new — reused `buildGalleryHref`/`parseGalleryParams` from Phase 1

### Work Unit Evidence
| Evidence | Value |
|---|---|
| Focused test command and exact result | `npx vitest run src/components/filters` → 1 file, 5/5 passed; `npx vitest run tests/app/page.test.tsx` → 7/7 passed |
| Runtime harness command/scenario and exact result | `npm run dev` (`DATABASE_URL=./data/allprojects.db`) + `curl`: unfiltered `/` → 3 `data-testid="proyecto-card"`; `/?categoria=1` → 1 card (option `id=1` "Robótica Hobbie" marked `selected`); `/?categoria=1&contacto=1` → 1 card (AND intersection); `/?categoria=999` (no proyecto in that categoria) → `data-testid="empty-state"` with text "Ningún proyecto coincide con los filtros seleccionados."; all requests logged `GET ... 200` in the dev server log, no errors |
| Rollback boundary | Delete `src/components/filters/`; revert `src/app/page.tsx` to the Batch 2 version (drop `FilterBar` import/usage and the `filtersActive`/`hasAnyProyectos` empty-state branching, back to unconditional `variant="no-proyectos"`); revert `tests/app/page.test.tsx` to the Batch 2 version (drop the `next/navigation` mock and the 4 new filter tests) |

### Full Suite Confirmation
`npm test` → 16 test files, 92/92 tests passed (baseline safety net: all 83 Batch-2 tests still pass; no regression).
`npm run build` → Next.js 16.3.2 (Turbopack) compiled successfully, TypeScript check passed, `/` listed as dynamic (ƒ) route.

### Deviations from Design
- `FilterBar` reads its "current" filter state internally via `useSearchParams()` + `parseGalleryParams` rather than receiving a `params: GalleryParams` prop from the server. `design.md`'s Data Flow diagram lists `<FilterBar/>` as a client component that "only push[es] new search params" without specifying how it reads the current ones; reading `useSearchParams()` directly (as task 3.2 literally specifies: "using `useRouter`/`useSearchParams`") keeps `FilterBar` self-contained (only `categorias`/`contactos` as props) and avoids re-deriving `GalleryParams` twice (once in `page.tsx`, once passed down); behaviorally identical since both read the same URL.
- The `no-matches` vs `no-proyectos` empty-state distinction (task 3.5) required one extra unfiltered `listProyectos(db)` call when the filtered result is empty and a filter is active, to distinguish "filters produced zero rows" from "the database itself is empty while filters happen to be set." Not explicitly specified in `design.md`, but required by `project-filtering` spec's "No-Match Filter Empty State" requirement, which is scoped to "active filters produce zero matching proyectos" (implying rows exist elsewhere) as distinct from the Fase-2 "database has zero rows" case.
- Task 3.4 ("RED: extend `empty-state.test.tsx` ... for zero-results-after-filter") was already satisfied by Batch 2's tasks 2.7-2.8, which created both the `no-matches` variant and its test up front (anticipating Fase 3). No new RED/GREEN cycle was run for the component itself in this batch; the remaining Fase-3-specific work was exercised at the integration level (`tests/app/page.test.tsx`, task 3.6).

### Issues Found
None.

### Workload / PR Boundary
- Mode: feature-branch-chain (auto-chain), PR 3 of 4
- Current work unit: Unit 3 — Filtering
- Boundary: starts from `pr3-filtering` (base: `pr2-gallery-rendering`), ends with all Phase 3 tasks (3.1-3.7) complete and green
- Estimated review budget impact: small — 2 new files (~90 lines) + 2 modified files (~60 changed lines); well within the 400-line guard for a single PR slice

### Status
29/48 total tasks complete across all 4 phases (10 Phase 1 + 12 Phase 2 + 7 Phase 3). Ready for verify on this work unit, or for the next apply batch (Phase 4: Comparison Module, PR 4) once PR 3 lands.

---

## Batch 2

**Change**: galeria-visual-proyectos
**Work unit**: Unit 2 — Gallery Rendering (PR 2, base: PR 1 branch `pr1-geometry`, worked on `pr2-gallery-rendering`)
**Mode**: Strict TDD

### Completed Tasks
- [x] 2.1 RED: `src/components/gallery/progress-fill.test.tsx`
- [x] 2.2 GREEN: `src/components/gallery/progress-fill.tsx`
- [x] 2.3 RED: `src/components/gallery/over-budget-badge.test.tsx`
- [x] 2.4 GREEN: `src/components/gallery/over-budget-badge.tsx`
- [x] 2.5 RED: `src/components/gallery/proyecto-card.test.tsx`
- [x] 2.6 GREEN: `src/components/gallery/proyecto-card.tsx`
- [x] 2.7 RED: `src/components/gallery/empty-state.test.tsx`
- [x] 2.8 GREEN: `src/components/gallery/empty-state.tsx`
- [x] 2.9 GREEN: `src/components/gallery/gallery-grid.tsx` (`'use client'`, RGL static mode)
- [x] 2.10 GREEN: `src/app/page.tsx` rewritten as async Server Component
- [x] 2.11 Integration test: `tests/app/page.test.tsx` (seeded + zero-row fixtures)
- [x] 2.12 Manual verification: `npm run dev` + `curl http://localhost:3000/` — HTTP 200, 3 cards, 1 over-budget badge, no server errors

### Files Changed
| File | Action | What Was Done |
|------|--------|---------------|
| `src/components/gallery/progress-fill.tsx` | Created | Tint track (`data-testid="progress-tint"`) + solid `role="progressbar"` fill sized from `computeProgress().percent` |
| `src/components/gallery/progress-fill.test.tsx` | Created | Width/`aria-valuenow` match `computeProgress`, clamp at 100%, tint background |
| `src/components/gallery/over-budget-badge.tsx` | Created | "⚠ Excedido" `role="status"` badge, renders `null` when `isOverBudget` is false |
| `src/components/gallery/over-budget-badge.test.tsx` | Created | Present when over budget, absent on-budget, absent when estimate is 0 (via real `computeProgress` calls) |
| `src/components/gallery/proyecto-card.tsx` | Created | Composes `ProgressFill` + `OverBudgetBadge`, props-only (`tile: GalleryTile`), applies red 2px border when over budget |
| `src/components/gallery/proyecto-card.test.tsx` | Created | Title/tint/fill from props, badge+border presence/absence per `isOverBudget` |
| `src/components/gallery/empty-state.tsx` | Created | `no-proyectos` / `no-matches` variants, distinct Spanish copy |
| `src/components/gallery/empty-state.test.tsx` | Created | Default message, distinct `no-matches` message |
| `src/components/gallery/gallery-grid.tsx` | Created | `'use client'`; `WidthProvider(ReactGridLayout)` from `react-grid-layout/legacy` in static mode (`isDraggable/isResizable/isDroppable=false`), maps `TileRect[]` to RGL `Layout` |
| `src/app/page.tsx` | Modified | Placeholder → async Server Component: awaits `searchParams`, `parseGalleryParams`, `listProyectos`/`listCategorias`/`listContactos`, `computeTileLayout`, maps to `GalleryTile[]`, renders `<GalleryGrid>` or `<EmptyState>` |
| `src/app/globals.css` | Modified | Added `@import 'react-grid-layout/css/styles.css'` |
| `tests/app/page.test.tsx` | Modified | Replaced Fase 1 static-heading placeholder test with gallery integration tests (mocks `@/db/client#getDb`, seeds via `makeTestDb` + repositories) |
| `tests/setup.ts` | Modified | Added a no-op `ResizeObserver` stub — jsdom lacks it and RGL's `WidthProvider` needs it |

### TDD Cycle Evidence
| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 2.1-2.2 | `src/components/gallery/progress-fill.test.tsx` | Component | N/A (new) | ✅ Written (module-resolution failure) | ✅ 3/3 passed | ✅ 3 cases (25%, 100%-clamp, tint background) | ➖ None needed |
| 2.3-2.4 | `src/components/gallery/over-budget-badge.test.tsx` | Component | N/A (new) | ✅ Written (module-resolution failure) | ✅ 3/3 passed | ✅ 3 cases (over-budget, on-budget, zero-estimate via `computeProgress`) | ➖ None needed |
| 2.5-2.6 | `src/components/gallery/proyecto-card.test.tsx` | Component | N/A (new) | ✅ Written (module-resolution failure) | ✅ 3/3 passed | ✅ 3 cases (title/tint/fill, over-budget border+badge, on-budget no border/badge) | ➖ None needed |
| 2.7-2.8 | `src/components/gallery/empty-state.test.tsx` | Component | N/A (new) | ✅ Written (module-resolution failure) | ✅ 2/2 passed | ✅ 2 cases (default vs `no-matches` variant) | ➖ None needed |
| 2.9-2.11 | `tests/app/page.test.tsx` | Integration | ✅ 1/1 (Fase 1 placeholder heading test, replaced) | ✅ Written first, run RED against unmodified `page.tsx` (2/3 failing: missing `empty-state`/`proyecto-card` testids) before `gallery-grid.tsx`/`page.tsx` were implemented | ✅ 3/3 passed after GREEN | ✅ 3 cases (heading, zero-row empty state, 2-seeded-row card count + over-budget badge) | ➖ None needed — execution order note below |

**Execution-order note (2.9-2.11):** task numbering lists 2.9/2.10 (GREEN) before 2.11 (RED test), but Strict TDD's "test before production code" rule was honored by writing `tests/app/page.test.tsx` FIRST and confirming it failed against the untouched placeholder `page.tsx`, THEN implementing `gallery-grid.tsx` and rewriting `page.tsx` to reach GREEN. All three tasks are marked complete together since they form one RED→GREEN unit.

### Test Summary
- **Total tests written**: 14 (11 component + 3 integration)
- **Total tests passing**: 14 (plus 69 pre-existing tests unaffected — 83/83 total via `npm test`)
- **Layers used**: Unit (0 new — reused Phase 1), Component (11), Integration (3), E2E (0 — unavailable per config)
- **Approval tests** (refactoring): None — no refactoring tasks in this batch
- **Pure functions created**: 0 new (this batch is composition/rendering over Phase 1's pure functions)

### Work Unit Evidence
| Evidence | Value |
|---|---|
| Focused test command and exact result | `npx vitest run src/components/gallery` → 4 files, 11/11 passed; `npx vitest run tests/app/page.test.tsx` → 3/3 passed |
| Runtime harness command/scenario and exact result | `npm run dev` (`DATABASE_URL=./data/allprojects.db`, migrated + seeded) + `curl http://localhost:3000/` → HTTP 200; response HTML contains 3 `data-testid="proyecto-card"` elements and 1 "Excedido" badge; server log shows `GET / 200`, no errors |
| Rollback boundary | Revert `src/app/page.tsx` to the Fase 1 placeholder, revert `tests/app/page.test.tsx` to the Fase 1 placeholder test, delete `src/components/gallery/`, revert `src/app/globals.css` and `tests/setup.ts` |

### Full Suite Confirmation
`npm test` → 15 test files, 83/83 tests passed (baseline safety net: all 69 pre-existing tests — 70 from Fase 1 apply plus 1 replaced placeholder counted differently — still pass; no regression).
`npm run build` → Next.js 16.3.2 (Turbopack) compiled successfully, TypeScript check passed, `/` listed as dynamic (ƒ) route.

### Deviations from Design
- `react-grid-layout@2.2.4` (the version installed in Phase 1) ships a rewritten v2 API; the v1-shaped API `design.md` describes (`WidthProvider` + flat `isDraggable/isResizable/isDroppable` props) is exposed only via the package's `react-grid-layout/legacy` compatibility entry point, not the root `react-grid-layout` import. `gallery-grid.tsx` imports `ReactGridLayout`/`WidthProvider`/`Layout` from `react-grid-layout/legacy` (documented in the package's own `legacy.d.ts`) to match `design.md`'s intended static, non-interactive configuration; no behavior or dependency change.
- jsdom (used by Vitest) does not implement `ResizeObserver`, which RGL's `WidthProvider` requires to measure its container. Added a minimal no-op stub in `tests/setup.ts`, applied globally (all other tests are unaffected — it only defines a missing global).
- `tests/app/page.test.tsx` mocks `@/db/client#getDb` (via `vi.mock` + `vi.hoisted`) rather than relying on the module-level `getDb()` singleton against a real file DB, so each test gets an isolated in-memory `makeTestDb()` instance. Not specified in `design.md`, but consistent with how `getDb()`/`createDb()` are structured in `src/db/client.ts` and avoids cross-test DB state leakage.
- Border assertions in `proyecto-card.test.tsx` use `borderTopWidth`/`borderTopStyle`/`borderTopColor` instead of the `border` shorthand — jsdom's `getComputedStyle().borderColor` returns a malformed multi-value string for the shorthand `border-color` property when set via the `border` shorthand (a known jsdom limitation); the single-side longhand properties compute correctly and still assert the exact spec-mandated red 2px solid border.

### Issues Found
None.

### Workload / PR Boundary
- Mode: feature-branch-chain (auto-chain), PR 2 of 4
- Current work unit: Unit 2 — Gallery Rendering
- Boundary: starts from `pr2-gallery-rendering` (base: `pr1-geometry`), ends with all Phase 2 tasks (2.1-2.12) complete and green
- Estimated review budget impact: ~440 changed lines (per `git commit` stat: 13 files changed, 440 insertions(+), 15 deletions(-)) — at/slightly above the ~400-line guard for a single PR slice; still within the "High risk, chained PRs" forecast recorded in `tasks.md`, and this PR's scope is self-contained (rendering only, no filtering/comparison logic)

### Status
22/48 total tasks complete across all 4 phases (10 Phase 1 + 12 Phase 2). Ready for verify on this work unit, or for the next apply batch (Phase 3: Filtering, PR 3) once PR 2 lands.

---

## Batch 1

**Change**: galeria-visual-proyectos
**Work unit**: Unit 1 — RGL install spike + `src/lib/gallery/` pure functions (PR 1, base: tracker branch `feature/galeria-visual-proyectos`, worked on `pr1-geometry`)
**Mode**: Strict TDD

### Completed Tasks
- [x] 1.1 Installed `react-grid-layout` + `@types/react-grid-layout`; `npm run build` passed without `--legacy-peer-deps` — no CSS Grid fallback needed.
- [x] 1.2 RED: `src/lib/gallery/tile-geometry.test.ts`
- [x] 1.3 GREEN: `src/lib/gallery/types.ts` + `src/lib/gallery/tile-geometry.ts` (`computeTileLayout`)
- [x] 1.4 RED: `src/lib/gallery/progress.test.ts`
- [x] 1.5 GREEN: `src/lib/gallery/progress.ts` (`computeProgress`)
- [x] 1.6 RED: `src/lib/gallery/color.test.ts`
- [x] 1.7 GREEN: `src/lib/gallery/color.ts` (`toTint`, `toSolid`)
- [x] 1.8 RED: `src/lib/gallery/search-params.test.ts`
- [x] 1.9 GREEN: `src/lib/gallery/search-params.ts` (`parseGalleryParams`, `buildGalleryHref`)
- [x] 1.10 REFACTOR: extracted shared `clamp` into `src/lib/gallery/math.ts`, reused in `tile-geometry.ts` and `progress.ts`; `npm test -- src/lib/gallery` and `npm run build` confirmed green.

### Files Changed
| File | Action | What Was Done |
|------|--------|---------------|
| `package.json` / `package-lock.json` | Modified | Added `react-grid-layout` (^2.2.4) + `@types/react-grid-layout` (^1.3.6) |
| `src/lib/gallery/types.ts` | Created | `TileRect`, `GalleryParams`, `GalleryTile` |
| `src/lib/gallery/tile-geometry.ts` | Created | `computeTileLayout`: sqrt-area mapping + first-fit-decreasing shelf packing |
| `src/lib/gallery/tile-geometry.test.ts` | Created | Proportional sizing, no-overlap, gapless same-size packing, zero-hours minimum, tie determinism |
| `src/lib/gallery/progress.ts` | Created | `computeProgress`: clamped percent + over-budget flag |
| `src/lib/gallery/progress.test.ts` | Created | 25% partial, 100% clamp, 0h no-throw, exact-match not over-budget, zero-estimate never over-budget |
| `src/lib/gallery/color.ts` | Created | `toTint` (color-mix transparent tint), `toSolid` (full-opacity passthrough) |
| `src/lib/gallery/color.test.ts` | Created | Default/custom alpha tint, solid passthrough, distinct-input check |
| `src/lib/gallery/search-params.ts` | Created | `parseGalleryParams`, `buildGalleryHref` |
| `src/lib/gallery/search-params.test.ts` | Created | Full parse, invalid-value drop (no throw), defaults, seleccion filtering, round-trip, patch |
| `src/lib/gallery/math.ts` | Created | Shared `clamp` helper (REFACTOR dedupe) |

### TDD Cycle Evidence
| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.2-1.3 | `src/lib/gallery/tile-geometry.test.ts` | Unit | N/A (new) | ✅ Written (import-resolution failure) | ✅ 5/5 passed | ✅ 5 cases (proportional, no-overlap mixed, gapless same-size, zero-hours, determinism) | ✅ dedupe in 1.10 |
| 1.4-1.5 | `src/lib/gallery/progress.test.ts` | Unit | N/A (new) | ✅ Written (import-resolution failure) | ✅ 5/5 passed | ✅ 5 cases (partial, clamp-overrun, zero-estimate, exact-match, zero-estimate-with-invertido) | ✅ dedupe in 1.10 |
| 1.6-1.7 | `src/lib/gallery/color.test.ts` | Unit | N/A (new) | ✅ Written (import-resolution failure) | ✅ 4/4 passed | ✅ 4 cases (default alpha, custom alpha, solid passthrough, distinct inputs) | ➖ None needed |
| 1.8-1.9 | `src/lib/gallery/search-params.test.ts` | Unit | N/A (new) | ✅ Written (import-resolution failure) | ✅ 6/6 passed | ✅ 6 cases (full parse, invalid-drop, defaults, seleccion-filter, round-trip, patch) | ➖ None needed |

### Test Summary
- **Total tests written**: 20
- **Total tests passing**: 20 (plus 50 pre-existing repository/schema/seed/page tests unaffected — 70/70 total)
- **Layers used**: Unit (20), Integration (0), E2E (0 — unavailable per config)
- **Approval tests** (refactoring): None — no refactoring tasks in this batch
- **Pure functions created**: 6 (`computeTileLayout`, `computeProgress`, `toTint`, `toSolid`, `parseGalleryParams`, `buildGalleryHref`) + 1 shared helper (`clamp`)

### Work Unit Evidence
| Evidence | Value |
|---|---|
| Focused test command and exact result | `npx vitest run src/lib/gallery` → 4 files, 20/20 tests passed |
| Runtime harness command/scenario and exact result | `npm run build` → Next.js 16.3.2 production build compiled successfully, TypeScript check passed, static pages generated |
| Rollback boundary | Delete `src/lib/gallery/`, revert `package.json`/`package-lock.json` (remove `react-grid-layout` + `@types/react-grid-layout`) |

### Full Suite Confirmation
`npm test` → 11 test files, 70/70 tests passed (baseline safety net: all 50 pre-existing tests in `tests/` still pass, confirming no regression).
`npm run build` → compiled successfully, TypeScript check passed.

### Deviations from Design
None — implementation matches `design.md` §Interfaces/Contracts and the algorithm described in §Migration/Rollout. RGL/React 19 contingency did not trigger (no `--legacy-peer-deps` needed), so the CSS Grid fallback was not exercised and `design.md` Open Questions were left unchanged (no fallback to document).

### Issues Found
None.

### Workload / PR Boundary
- Mode: feature-branch-chain (auto-chain), PR 1 of 4
- Current work unit: Unit 1 — Foundation (RGL spike + pure geometry layer)
- Boundary: starts from a clean `pr1-geometry` branch (base: `feature/galeria-visual-proyectos`), ends with all Phase 1 tasks (1.1-1.10) complete and green
- Estimated review budget impact: ~350-400 changed lines (5 new lib files + 4 new test files + package.json/lock diff), within/near the 400-line budget for a single PR slice

### Status
10/10 Phase 1 tasks complete (10/48 total across all 4 phases). Ready for verify on this work unit, or for the next apply batch (Phase 2: Gallery Rendering, PR 2) once PR 1 lands.
