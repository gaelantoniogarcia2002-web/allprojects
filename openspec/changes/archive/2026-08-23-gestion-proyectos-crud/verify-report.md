# Verification Report: gestion-proyectos-crud (Fase 3)

**Change**: gestion-proyectos-crud
**Mode**: Full artifact set (proposal, design, tasks, apply-progress, 4 specs)
**Branch verified**: `pr4-taxonomy` (contains all 4 chained work units)
**Verdict**: **PASS WITH WARNINGS**

## Completeness

All 33 tasks across Phases 0–4 are checked off in `tasks.md` and match the code state on `pr4-taxonomy`. No unchecked tasks.

## Command Evidence (independently re-run, not trusted from apply-progress.md)

| Command | Result |
|---|---|
| `npm test -- --run` | **191/191 passed**, 32 test files, 18.39s. Matches apply-progress's claim exactly. |
| `npm run build` | **Success.** TypeScript passed. Routes: `ƒ /`, `○ /_not-found`, `○ /categorias`, `○ /contactos`, `ƒ /proyectos/[id]`, `○ /proyectos/nuevo`. Matches apply-progress's claim exactly. |

Both commands confirmed with actual exit codes and output, not taken on faith.

## Spec Compliance Matrix (16 requirements / 39 scenarios across 4 spec files)

| Spec | Requirements | Scenarios | Status |
|---|---|---|---|
| `project-authoring` | 5 | 15 | 14 PASS, 1 WARNING (untested duplicate-nombre integration path is N/A here — belongs to taxonomy) |
| `taxonomy-management` | 4 | 10 | 9 PASS, 1 WARNING (duplicate-nombre scenario — see below) |
| `project-data-model` (delta) | 5 | 11 | 11 PASS |
| `project-gallery` (delta) | 2 | 3 | 3 PASS |

## Deep-Dive Findings (per the six flagged risk areas)

### 1. Comparison-mode card navigation (PR 3) — CONFIRMED, literal spec satisfied

Read `src/components/gallery/proyecto-card.tsx` directly: when `comparisonMode` is `true`, `tile.titulo` renders as plain text (no `<Link>`); when `false`, it renders `<Link href={/proyectos/${tile.id}}>`. The test `proyecto-card.test.tsx` line 87 asserts `screen.queryByRole("link", {name: tile.titulo})` is absent in comparison mode. This genuinely satisfies the literal MUST clause ("MUST suppress that navigation while comparison mode is active") — not just the design.md's weaker "disjoint targets" argument, which apply-progress correctly identified as insufficient and overrode. Verified by direct source read, not just apply-progress's narrative.

### 2. NotFoundError consistency across all 7 mutation functions — CONFIRMED, fully fixed

Read all four repository files directly:
- `updateProyecto` / `deleteProyecto` (`proyectos.ts`) — throw `NotFoundError` ✓
- `updateCategoria` (`categorias.ts`) — throws `NotFoundError` ✓
- `deleteCategoria` (`categorias.ts`) — throws `NotFoundError` after the FK catch, confirmed fixed in Phase 4 as claimed ✓
- `updateContacto` / `deleteContacto` (`contactos.ts`) — throw `NotFoundError` ✓
- `deleteInspiracion` (`inspiraciones.ts`) — throws `NotFoundError` ✓

All 7 are consistent. No other function has the gap `deleteCategoria` had in Phase 1.

### 3. CategoriaEnUsoError precedence over NotFoundError — CONFIRMED

`deleteCategoria`'s `try { db.delete(...).run() } catch { if FK → throw CategoriaEnUsoError }` runs first; the `result.changes === 0` NotFoundError check only executes if the delete didn't throw. The regression test `tests/repositories/categorias.test.ts` ("regression: FK-restrict precedence — an in-use categoria still throws CategoriaEnUsoError, never NotFoundError") passes and asserts both directions explicitly.

### 4. Server Action error handling — CONFIRMED, no bubbling

Traced all 5 `actions.ts` files (`proyectos/nuevo`, `proyectos/[id]`, `categorias`, `contactos`) plus `src/lib/forms/result.ts`'s `toActionError`. Every mutation wraps the repository call in `try { ... } catch (err) { return toActionError(err); }`. `toActionError` catches `NotFoundError`, `CategoriaEnUsoError`, and `SQLITE_CONSTRAINT_*` (UNIQUE/FOREIGNKEY), returning `{ok:false, error}`; any other error rethrows (intentional — genuine bugs still reach the overlay, per design). `redirect()` is consistently placed outside the try block in all 3 call sites that use it (`crearProyectoAction`, `eliminarProyectoAction`), preventing `NEXT_REDIRECT` from being swallowed. This matches design.md's documented ordering requirement exactly.

### 5. Full CRUD round-trip (create → edit → add inspiracion → delete inspiracion → delete proyecto) — WARNING: no single continuous test

Each mutation is proven individually against a real migrated SQLite DB (`makeTestDb()`), including real cascade behavior (`eliminarProyectoAction`'s test creates a contacto link + inspiracion, then asserts both are gone after delete). However, no single test chains `crearProyectoAction` → `editarProyectoAction` → `agregarInspiracionAction` → `eliminarInspiracionAction` → `eliminarProyectoAction` against the *same* created row in one continuous flow. `tests/app/proyectos/nuevo/actions.test.ts` and `tests/app/proyectos/[id]/actions.test.ts` are separate suites, each with its own `beforeEach`-seeded fixture (the `[id]` suite seeds a fresh "Original" proyecto rather than reusing one created via `crearProyectoAction`). Individual coverage is strong and each piece against real DB semantics is trustworthy, but the literal "full round-trip, not just individual pieces" bar from the review instructions is not met by a dedicated test. **WARNING, not CRITICAL** — the underlying behaviors are correct and each transition is proven; this is a coverage-shape gap, not a behavior gap.

### 6. Categoria delete-blocked-when-in-use vs. contacto delete-always-succeeds — CONFIRMED, correctly differentiated

- `categoria-row.tsx`: two independent `useActionState` hooks (edit / delete) per row so a blocked delete's inline `CategoriaEnUsoError` message never clobbers the edit form's state. `eliminarCategoriaAction` → `deleteCategoria` → `CategoriaEnUsoError` when referenced, tested in `tests/app/categorias/actions.test.ts` ("returns {ok:false} with CategoriaEnUsoError's message and keeps the row when in use").
- `contacto-row.tsx`: same two-hook pattern, but `eliminarContactoAction` → `deleteContacto` never blocks — `ON DELETE CASCADE` only removes `proyecto_contactos` join rows, tested in `tests/app/contactos/actions.test.ts` ("always succeeds, cascading only the join rows for a linked contacto"), which explicitly links a contacto to a proyecto first and confirms the proyecto is unaffected.

Both behaviors are correctly and distinctly implemented and tested.

## Additional Issue Found (not in the six flagged areas)

**WARNING — "Reject a duplicate nombre" scenario (taxonomy-management) has no direct integration-level covering test.** The scenario requires: edit a categoria to a `nombre` already used by another categoria → `{ok:false, error}` derived from the UNIQUE violation. Coverage is currently split across two indirect unit tests: (a) `tests/schema/constraints.test.ts` proves the DB-level UNIQUE constraint rejects a duplicate `nombre` on *insert* (not update, and not through the action), and (b) `tests/lib/forms/result.test.ts` proves `toActionError` maps a synthetic `SQLITE_CONSTRAINT_UNIQUE` error object to a duplicate-record message (not a real DB-thrown error). No test calls `editarCategoriaAction` with a real duplicate `nombre` against `makeTestDb()` to confirm the two are actually wired together end-to-end for this scenario. Given `updateCategoria` uses a plain `.returning().get()` without any duplicate-specific handling, this is very likely correct in practice, but it is untested as a literal scenario per the strict-TDD "a spec scenario is compliant only when a covering test passed at runtime" rule.

**SUGGESTION** — "tiempo_invertido_h is only editable via the full form" (project-authoring) is satisfied by omission (no quick-log control was ever built on the card) but has no explicit test asserting the card exposes no such control. Low risk given `proyecto-card.tsx` is a small, fully-read presentational component with no time-editing UI.

## Design Coherence

One documented deviation, already disclosed and independently confirmed correct: PR 3's card-link implementation follows the literal `project-gallery` spec text over `design.md`'s "disjoint targets, no suppression needed" reasoning (see finding #1). All other design decisions (validation location, error translation, `redirect()` ordering, contacto checkbox list, `revalidatePath()` + `redirect()`) match the implementation as documented.

## Issues Summary

- **CRITICAL**: 0
- **WARNING**: 2 (no single full-CRUD-round-trip test; duplicate-nombre scenario untested at the action/repository integration layer)
- **SUGGESTION**: 1 (no explicit test for the "no quick-log control" negative UI assertion)

## Final Verdict

**PASS WITH WARNINGS.** All 191 tests pass, build is green, all 33 tasks are complete, the disclosed spec/design discrepancy on comparison-mode navigation genuinely satisfies the literal spec, NotFoundError is now consistent across all 7 mutation functions with correct CategoriaEnUsoError precedence, and error handling never bubbles to the overlay. Two WARNING-level test-coverage gaps were found (full round-trip chaining, duplicate-nombre scenario) that do not block archive but should be tracked as follow-up hardening.
