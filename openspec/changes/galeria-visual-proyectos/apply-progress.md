# Apply Progress: Fase 2 — Vista Galería, Filtros y Módulo Comparador

## Batch 1 (this batch)

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
