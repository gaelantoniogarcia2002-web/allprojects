# Apply Progress: Fase 3 — CRUD Management for Proyecto, Inspiracion, Categoria, Contacto

**Batch**: 1 of N (first batch — fresh artifact)
**Branch**: `pr1-repo-layer` (base: `feature/gestion-proyectos-crud`)
**Mode**: Strict TDD
**Scope**: Phase 0 (Server Action Spike) + Phase 1 (PR 1 — Repository layer)

## Phase 0 Spike Outcome (governs the shape of Phases 2–4)

**Decision: NO split into `actions.impl.ts` + thin `"use server"` wrapper is required.**

A throwaway module `src/lib/forms/actions-spike.ts` with `"use server"` and one no-op
async export was imported directly by `tests/lib/forms/actions-spike.test.ts` and invoked.
Vitest (Vite's SWC/Next plugin pipeline via `@vitejs/plugin-react`) resolved and ran the
module without error; the RED test (import of a nonexistent module) failed first, then
the GREEN implementation passed. Both spike files were deleted immediately after, per
task 0.3 — only this decision record persists.

**Implication for Phases 2–4**: every `actions.ts` under `src/app/**/actions.ts` may be
written as a single `"use server"` file and tested by importing its exported action
functions directly in Vitest, exactly as documented in design.md's Testing Strategy
("Import action functions directly and call them with a `FormData`"). No `actions.impl.ts`
split, no extra indirection layer.

## Completed Tasks

### Phase 0
- [x] 0.1 RED `tests/lib/forms/actions-spike.test.ts` (deleted after 0.3)
- [x] 0.2 GREEN throwaway `"use server"` spike module (deleted after 0.3)
- [x] 0.3 Spike run — success, decision recorded above, spike files deleted

### Phase 1 (PR 1 — repository layer)
- [x] 1.1 RED `tests/repositories/categorias.test.ts` — `updateCategoria` behavior
- [x] 1.2 GREEN `src/db/repositories/categorias.ts` — `updateCategoria` added
- [x] 1.3 RED `tests/repositories/contactos.test.ts` — `updateContacto` + `deleteContacto` NotFoundError
- [x] 1.4 GREEN `src/db/repositories/contactos.ts` — `updateContacto` added; `deleteContacto` → `void` + throw
- [x] 1.5 RED/GREEN `src/db/repositories/proyectos.ts` — `updateProyecto`/`deleteProyecto` → throw `NotFoundError`; existing boolean assertions converted to `toThrow`
- [x] 1.6 RED/GREEN `src/db/repositories/inspiraciones.ts` — `deleteInspiracion` → `void` + throw `NotFoundError`
- [x] 1.7 `src/db/repositories/index.ts` — export `updateCategoria`, `updateContacto`
- [x] 1.8 Regression test — `deleteCategoria` FK-restrict precedence over any NotFoundError path (approval test, passed unchanged)
- [x] 1.9 `npm test` (117/117 passing) + `npm run build` (success)

## Files Changed

| File | Action | What Was Done |
|------|--------|----------------|
| `src/db/repositories/categorias.ts` | Modified | Added `updateCategoria(db, id, patch)`: `.returning().get()`, throws `NotFoundError` when `undefined` |
| `src/db/repositories/contactos.ts` | Modified | Added `updateContacto(db, id, patch)`; `deleteContacto` signature `boolean → void`, throws `NotFoundError` on 0 changes |
| `src/db/repositories/proyectos.ts` | Modified | `updateProyecto` throws `NotFoundError` instead of returning an undefined row; `deleteProyecto` signature `boolean → void`, throws `NotFoundError` on 0 changes |
| `src/db/repositories/inspiraciones.ts` | Modified | `deleteInspiracion` signature `boolean → void`, throws `NotFoundError` on 0 changes |
| `src/db/repositories/index.ts` | Modified | Export `updateCategoria`, `updateContacto` |
| `tests/repositories/categorias.test.ts` | Modified | Added `updateCategoria` describe block (3 tests) + FK-precedence regression test |
| `tests/repositories/contactos.test.ts` | Modified | Added `updateContacto` describe block (3 tests); `deleteContacto` assertions converted to `toThrow(NotFoundError)` |
| `tests/repositories/proyectos.test.ts` | Modified | Added `NotFoundError` tests for `updateProyecto`/`deleteProyecto`; boolean assertions converted to `toThrow` |
| `tests/repositories/inspiraciones.test.ts` | Modified | `deleteInspiracion` assertions converted to `toThrow(NotFoundError)` |
| `tests/lib/forms/actions-spike.test.ts` | Created then deleted | Throwaway spike, per task 0.3 |
| `src/lib/forms/actions-spike.ts` | Created then deleted | Throwaway spike, per task 0.3 |

No callers of `deleteContacto`/`deleteProyecto`/`deleteInspiracion` exist yet outside the
repository/test layer (`grep` confirmed — UI consumption arrives in Phases 2–4), so the
`boolean → void` signature change has zero blast radius in this batch.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|-------------|-----|-------|--------------|----------|
| 0.1–0.3 | `tests/lib/forms/actions-spike.test.ts` (deleted) | Unit | N/A (new, throwaway) | ✅ Written (unresolved import) | ✅ Passed | ➖ Single (spike, deleted) | ➖ N/A (deleted) |
| 1.1–1.2 | `tests/repositories/categorias.test.ts` | Integration (repo) | ✅ 29/29 (full repo suite baseline) | ✅ Written (`updateCategoria` undefined) | ✅ Passed | ✅ 3 cases (color update, nombre update, missing id) | ➖ None needed |
| 1.3–1.4 | `tests/repositories/contactos.test.ts` | Integration (repo) | ✅ 8/8 (categorias GREEN state, pre-1.3) | ✅ Written (`updateContacto` undefined; `deleteContacto` no throw) | ✅ Passed | ✅ 4 cases (nombre update, url update, update missing id, delete missing id) | ➖ None needed |
| 1.5 | `tests/repositories/proyectos.test.ts` | Integration (repo) | ✅ 11/11 (pre-1.5) | ✅ Written (assertions expected throw, got no-op) | ✅ Passed | ✅ 2 cases (update missing id, delete missing id) added to existing happy-path coverage | ➖ None needed |
| 1.6 | `tests/repositories/inspiraciones.test.ts` | Integration (repo) | ✅ 5/5 (pre-1.6, boolean-return version) | ✅ Written (assertion expected throw, got no-op) | ✅ Passed | ➖ Single (spec has one NotFoundError scenario for this entity) | ➖ None needed |
| 1.7 | N/A (structural export) | N/A | N/A | N/A | N/A | Triangulation skipped: purely structural re-export, no branching logic, verified transitively by 1.1–1.6 tests and `npm run build` | ➖ None needed |
| 1.8 | `tests/repositories/categorias.test.ts` | Integration (repo) | ✅ 8/8 (post-1.2 state) | N/A — approval test, documents pre-existing FK-restrict behavior, expected to pass immediately | ✅ Passed on first run (no production change required — FK `catch` in `deleteCategoria` was already unmodified and untouched by 1.1–1.7) | ➖ Single (precedence assertion) | ➖ None needed |
| 1.9 | Full suite | — | — | — | ✅ 117/117 `npm test`; `npm run build` succeeded | — | — |

### Test Summary
- **Total tests written/modified this batch**: 9 new test cases across `categorias.test.ts` (4 new: 3 update + 1 regression), `contactos.test.ts` (4 new: 3 update + 1 converted delete assertion), `proyectos.test.ts` (2 new: update/delete NotFoundError), `inspiraciones.test.ts` (1 converted delete assertion). Spike test written and deleted (not counted in final suite).
- **Total tests passing**: 117/117 (full repo suite, `npm test`)
- **Layers used**: Unit/Integration (repository, in-memory SQLite via `makeTestDb()`) — 37 repository tests total after this batch (9 categorias, 11 contactos, 12 proyectos, 5 inspiraciones)
- **Approval tests**: 1 (`deleteCategoria` FK-restrict precedence regression, task 1.8)
- **Pure functions created**: 0 in this batch (repository functions have DB side effects by design; Phase 2+ introduces the pure `src/lib/forms/parse-*.ts` layer)

## Work Unit Evidence (Work Unit 1 — Repository layer)

| Evidence | Value |
|---|---|
| Focused test command and exact result | `npx vitest run tests/repositories` → 37/37 passed |
| Runtime harness command/scenario and exact result | N/A — no e2e harness configured (`openspec/config.yaml`); proven by repository integration tests against real migrated schema (`makeTestDb()` applies `./drizzle` migrations) |
| Rollback boundary | Revert `src/db/repositories/{categorias,contactos,proyectos,inspiraciones,index}.ts` + their test diffs in `tests/repositories/*.test.ts`; no UI depends on this yet (confirmed via grep — zero non-repository/non-test callers of the changed functions) |

## Deviations from Design

None — implementation matches design.md exactly: `NotFoundError` thrown via `.returning().get()` undefined check (updates) and `result.changes === 0` check (deletes); `deleteCategoria`'s FK-restrict `catch` block was left untouched, preserving `CategoriaEnUsoError` precedence as designed.

## Issues Found

None.

## Remaining Tasks

- [ ] Phase 2 (PR 2 — proyecto creation): tasks 2.1–2.7
- [ ] Phase 3 (PR 3 — proyecto detail/edit/delete + inspiraciones): tasks 3.1–3.6
- [ ] Phase 4 (PR 4 — taxonomy screens + gallery entry point): tasks 4.1–4.8

## Workload / PR Boundary

- Mode: chained PR slice (`feature-branch-chain`, `auto-chain` delivery strategy)
- Current work unit: Work Unit 1 — Repository layer (PR 1, base: `feature/gestion-proyectos-crud`)
- Boundary: starts at repo root state before this batch; ends with all Phase 0 + Phase 1 tasks complete, full suite green, build green
- Estimated review budget impact: well under 400 lines — five repository files + four test files, net diff is small (mostly signature/assertion changes), no new route/component code in this batch

## Status

12/25 tasks complete (0.1–0.3, 1.1–1.9 of the full 4-phase task list). Ready for next batch (Phase 2, PR 2 — proyecto creation) or for `sdd-verify` to validate this PR 1 slice independently before Phase 2 begins.
