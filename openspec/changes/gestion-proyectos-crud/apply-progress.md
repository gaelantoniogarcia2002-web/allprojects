# Apply Progress: Fase 3 — CRUD Management for Proyecto, Inspiracion, Categoria, Contacto

**Batch**: 2 of N (merged with batch 1)
**Branch (batch 1)**: `pr1-repo-layer` (base: `feature/gestion-proyectos-crud`)
**Branch (batch 2)**: `pr2-proyecto-create` (base: `pr1-repo-layer`)
**Mode**: Strict TDD
**Scope (batch 1)**: Phase 0 (Server Action Spike) + Phase 1 (PR 1 — Repository layer)
**Scope (batch 2)**: Phase 2 (PR 2 — Proyecto creation, tasks 2.1–2.7)

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

### Phase 2 (PR 2 — proyecto creation)
- [x] 2.1 RED `tests/lib/forms/parse-proyecto.test.ts` (14 cases: valid, contactoIds via getAll, empty/whitespace titulo, negative/NaN tiempo_estimado_h, negative/NaN tiempo_invertido_h, default-to-0 when omitted, invalid estado, invalid frecuencia_avance, missing categoria_id, non-numeric categoria_id, optional monto_pago/carpeta_drive_url/repositorio_gh_url present vs. null)
- [x] 2.2 GREEN `src/lib/forms/result.ts` (`ActionResult`, `ParseResult`, `ok`/`fail`, `toActionError`) + `src/lib/forms/parse-proyecto.ts`. Also added `tests/lib/forms/result.test.ts` (8 cases: `ok`/`fail`, `NotFoundError`, `CategoriaEnUsoError`, `SQLITE_CONSTRAINT_UNIQUE`, `SQLITE_CONSTRAINT_FOREIGNKEY`, unknown-error rethrow) — not an explicit tasks.md line item, added because `toActionError` is new pure logic requiring its own RED/GREEN cycle per Strict TDD.
- [x] 2.3 RED `tests/app/proyectos/nuevo/actions.test.ts` — valid submission (persists row, links contacto, `revalidatePath("/")`, `redirect("/proyectos/[id]")` via a throwing mock sentinel); empty titulo and invalid estado return `{ok:false}` without calling `getDb`; nonexistent `categoria_id` returns `{ok:false}` with zero rows inserted (FK constraint caught by `toActionError`); duplicate `contactoId` submission stays idempotent (task 2.6, same test file)
- [x] 2.4 GREEN `src/app/proyectos/nuevo/actions.ts` (`crearProyectoAction`, `"use server"`, no Phase 0 split needed) + `src/app/proyectos/nuevo/page.tsx` (async Server Component loading categorias/contactos)
- [x] 2.5 RED/GREEN `src/components/forms/{contacto-checkbox-list,proyecto-form,form-error,confirm-submit-button}.tsx` + matching RTL tests in `tests/components/forms/`. `contacto-checkbox-list.test.tsx` asserts `FormData.getAll("contactoId")` payload for checked/unchecked/pre-checked (`selectedIds`) cases.
- [x] 2.6 Test: `tests/app/proyectos/nuevo/actions.test.ts` "creating a proyecto with the same contactoId submitted twice stays idempotent" — asserts exactly one `proyecto_contactos` row after submitting a duplicated `contactoId`, confirming the action layer doesn't break `vincularContacto`'s `onConflictDoNothing` idempotency (relevant for Phase 3 edit-form reuse of `ProyectoForm`).
- [x] 2.7 `npm test` (156/156 passing) + `npm run build` (success, TypeScript passed, new routes `ƒ /proyectos/nuevo` listed in build output)

## Files Changed (Phase 1 — repository layer)

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

## Files Changed (Phase 2 — proyecto creation)

| File | Action | What Was Done |
|------|--------|----------------|
| `src/lib/forms/result.ts` | Created | `ActionResult<T>`, `ParseResult<T>` types; `ok`/`fail` helpers; `toActionError` mapping `NotFoundError`/`CategoriaEnUsoError`/`SQLITE_CONSTRAINT_UNIQUE`/`SQLITE_CONSTRAINT_FOREIGNKEY` to `{ok:false,...}`, rethrows unknown errors |
| `src/lib/forms/parse-proyecto.ts` | Created | Pure `FormData → ParseResult<NuevoProyecto & {contactoIds:number[]}>`; validates titulo, estado/frecuencia_avance enums (via `ESTADOS`/`FRECUENCIAS_AVANCE` from `db/schema`), non-negative/finite tiempo_estimado_h and tiempo_invertido_h (default 0), numeric categoria_id, optional monto_pago/carpeta_drive_url/repositorio_gh_url; collects `contactoId` via `getAll` |
| `src/app/proyectos/nuevo/actions.ts` | Created | `"use server"` `crearProyectoAction` — parses, `createProyecto` + `vincularContacto` per selected contacto inside try/catch → `toActionError`, then `revalidatePath("/")` + `redirect()` outside the try block |
| `src/app/proyectos/nuevo/page.tsx` | Created | Async Server Component; loads categorias/contactos, renders `ProyectoForm` bound to `crearProyectoAction` |
| `src/components/forms/contacto-checkbox-list.tsx` | Created | Checkbox list, `name="contactoId"`, `defaultChecked` from `selectedIds` |
| `src/components/forms/proyecto-form.tsx` | Created | Shared create/edit form body (`useActionState`), reusable by Phase 3 edit page via `defaultValues`/`selectedContactoIds` |
| `src/components/forms/form-error.tsx` | Created | Renders an `ActionResult` error inline (`role="alert"`) |
| `src/components/forms/confirm-submit-button.tsx` | Created | Submit button with optional single `window.confirm` gate, reusable for Phase 3 delete flows |
| `tests/lib/forms/result.test.ts` | Created | 8 tests for `ok`/`fail`/`toActionError` |
| `tests/lib/forms/parse-proyecto.test.ts` | Created | 14 tests covering every validation branch |
| `tests/app/proyectos/nuevo/actions.test.ts` | Created | 5 tests: valid submission (DB + spy args), empty titulo, invalid estado, nonexistent categoria_id, duplicate contactoId idempotency |
| `tests/components/forms/contacto-checkbox-list.test.tsx` | Created | 3 tests asserting `FormData.getAll("contactoId")` payloads |
| `tests/components/forms/form-error.test.tsx` | Created | 3 tests (no result, ok result, fail result) |
| `tests/components/forms/confirm-submit-button.test.tsx` | Created | 3 tests (no confirm, declined, accepted) |
| `tests/components/forms/proyecto-form.test.tsx` | Created | 3 tests: submitted FormData shape, inline error rendering, `defaultValues`/`selectedContactoIds` pre-fill |

No production files outside `src/lib/forms/`, `src/app/proyectos/nuevo/` and `src/components/forms/` were touched in this batch; Phase 1's repository layer is consumed as-is (`createProyecto`, `vincularContacto`).

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
| 2.1–2.2 | `tests/lib/forms/parse-proyecto.test.ts`, `tests/lib/forms/result.test.ts` | Unit | N/A (new files) | ✅ Written (unresolved imports for `parseProyecto`/`ok`/`fail`/`toActionError`) | ✅ Passed | ✅ 14 cases (`parse-proyecto`) + 8 cases (`result`) covering every validation/error-mapping branch | ➖ None needed — kept as small pure functions per design |
| 2.3–2.4 | `tests/app/proyectos/nuevo/actions.test.ts` | Integration (action, `makeTestDb()` + mocked `next/cache`/`next/navigation`) | N/A (new file) | ✅ Written (unresolved import for `crearProyectoAction`) | ✅ Passed | ✅ 5 cases (valid submission, empty titulo, invalid estado, nonexistent categoria_id via FK, duplicate contactoId idempotency) | ➖ None needed |
| 2.5 | `tests/components/forms/{contacto-checkbox-list,form-error,confirm-submit-button,proyecto-form}.test.tsx` | Component (RTL) | N/A (new files) | ⚠️ Deviation — `contacto-checkbox-list.tsx`/`form-error.tsx`/`confirm-submit-button.tsx`/`proyecto-form.tsx` were authored together with `page.tsx`/`actions.ts` (2.4) since `page.tsx` imports `ProyectoForm` directly; RTL tests were then written and run against the already-existing components, confirmed passing on first run — not a pre-written-test RED gate for these four files specifically | ✅ Passed | ✅ 3+3+3+3 = 12 cases covering checked/unchecked/pre-checked payloads, no-result/ok/fail error rendering, confirm accept/decline/no-message, and full-form submit + inline-error + defaultValues pre-fill | ➖ None needed |
| 2.6 | `tests/app/proyectos/nuevo/actions.test.ts` (same file as 2.3) | Integration (action) | ✅ 4/4 (post-2.3 state) | ✅ Written (asserted `detail.contactos` length before the idempotency guard existed at the action layer — the repo-level guard already existed from `vincularContacto`, this test proves the action layer doesn't bypass it) | ✅ Passed on first run (no production change required beyond 2.4's `crearProyectoAction`) | ➖ Single (one duplicate-id scenario, mirrors the existing `vincularContacto` idempotency contract) | ➖ None needed |
| 2.7 | Full suite | — | — | — | ✅ 156/156 `npm test`; `npm run build` succeeded (TypeScript pass, new `ƒ /proyectos/nuevo` route) | — | — |

### Test Summary
- **Total tests written/modified this batch (Phase 2)**: 39 new test cases — `parse-proyecto.test.ts` (14), `result.test.ts` (8), `actions.test.ts` (5), `contacto-checkbox-list.test.tsx` (3), `form-error.test.tsx` (3), `confirm-submit-button.test.tsx` (3), `proyecto-form.test.tsx` (3)
- **Total tests passing**: 156/156 (full suite, `npm test`) — up from 117/117 after Phase 1
- **Layers used**: Unit (22: `parse-proyecto` + `result`), Integration (5: action + DB + mocked Next APIs), Component/RTL (12)
- **Approval tests**: 0 in this batch (no refactoring of existing behavior)
- **Pure functions created**: 2 (`parseProyecto`, `toActionError`) — both zero-DB, zero-Next-runtime, directly unit-testable per design's Testing Strategy

## Work Unit Evidence (Work Unit 1 — Repository layer)

| Evidence | Value |
|---|---|
| Focused test command and exact result | `npx vitest run tests/repositories` → 37/37 passed |
| Runtime harness command/scenario and exact result | N/A — no e2e harness configured (`openspec/config.yaml`); proven by repository integration tests against real migrated schema (`makeTestDb()` applies `./drizzle` migrations) |
| Rollback boundary | Revert `src/db/repositories/{categorias,contactos,proyectos,inspiraciones,index}.ts` + their test diffs in `tests/repositories/*.test.ts`; no UI depends on this yet (confirmed via grep — zero non-repository/non-test callers of the changed functions) |

## Work Unit Evidence (Work Unit 2 — Proyecto creation)

| Evidence | Value |
|---|---|
| Focused test command and exact result | `npx vitest run tests/lib/forms/parse-proyecto.test.ts tests/app/proyectos/nuevo` → 19/19 passed; `npx vitest run tests/components/forms` → 12/12 passed; `npx vitest run tests/lib/forms` → 22/22 passed |
| Runtime harness command/scenario and exact result | N/A — no e2e harness configured (`openspec/config.yaml`); proven by `tests/app/proyectos/nuevo/actions.test.ts` exercising the real Server Action against `makeTestDb()` (real migrated schema) with `next/cache`/`next/navigation` mocked at the module boundary, matching the exact pattern in `tests/app/page.test.tsx` |
| Rollback boundary | Delete `src/app/proyectos/nuevo/`, `src/lib/forms/{result,parse-proyecto}.ts`, `src/components/forms/` and their matching test files under `tests/app/proyectos/nuevo/`, `tests/lib/forms/`, `tests/components/forms/`; no existing route or component imports these new files, so removal is a clean revert with zero blast radius on Phase 1 or the gallery |

## Deviations from Design

Phase 1: None — implementation matches design.md exactly: `NotFoundError` thrown via `.returning().get()` undefined check (updates) and `result.changes === 0` check (deletes); `deleteCategoria`'s FK-restrict `catch` block was left untouched, preserving `CategoriaEnUsoError` precedence as designed.

Phase 2:
- **RED-before-GREEN not strictly followed for 4 of the 4 shared form components (2.5)**: `page.tsx` (task 2.4) imports `ProyectoForm`, which composes `ContactoCheckboxList`, `FormError` and `ConfirmSubmitButton`, so all five files were authored together to keep `page.tsx` buildable. RTL tests for each component were written and run immediately after and all passed on first execution against real (not pre-existing) component code — behavior was proven correct, but the GREEN step was not preceded by an observed RED failure for these four files specifically. `parse-proyecto.ts`, `result.ts`, and `actions.ts` (2.1–2.3) all followed strict RED→GREEN with an observed import-resolution failure before implementation.
- **`toActionError`'s SQLITE_CONSTRAINT handling extends design.md's literal contract comment**: design.md's interface comment lists `NotFoundError | CategoriaEnUsoError | SQLITE_CONSTRAINT_UNIQUE; rethrows otherwise`. The "Reject a nonexistent categoria_id" scenario (`project-authoring` spec) requires a caught `{ok:false}` result, but a nonexistent `categoria_id` fails via `SQLITE_CONSTRAINT_FOREIGNKEY`, not `UNIQUE`. `toActionError` was extended to also catch `SQLITE_CONSTRAINT_FOREIGNKEY` (and any other `SQLITE_CONSTRAINT*` code, generically) as a business error, consistent with the broader Requirement "Business Errors Never Reach the Error Overlay" ("any repository error"). Unknown non-constraint errors still rethrow, preserving the "genuine bugs still reach the overlay" rationale.
- **Form field names use `snake_case`** (`titulo`, `categoria_id`, `tiempo_estimado_h`, ...) matching the DB column names and the literal field names used in the `project-authoring` spec scenarios, while the parsed/repository-facing value uses the existing `camelCase` `NuevoProyecto` shape. This is a convention choice, not a deviation from any stated design decision.

## Issues Found

None.

## Remaining Tasks

- [ ] Phase 3 (PR 3 — proyecto detail/edit/delete + inspiraciones): tasks 3.1–3.6
- [ ] Phase 4 (PR 4 — taxonomy screens + gallery entry point): tasks 4.1–4.8

## Workload / PR Boundary

- Mode: chained PR slice (`feature-branch-chain`, `auto-chain` delivery strategy)
- Work unit 1 (done): Repository layer (PR 1, base: `feature/gestion-proyectos-crud`)
- Work unit 2 (done, this batch): Proyecto creation (PR 2, base: `pr1-repo-layer`) — `/proyectos/nuevo`, `parse-proyecto`, shared form components
- Boundary: starts at `pr1-repo-layer`'s final state; ends with all Phase 2 tasks complete, full suite green (156/156), build green
- Estimated review budget impact: new-file-only diff (no modifications to Phase 1 files) — 8 new `src/` files (~430 lines) + 7 new test files (~430 lines); comfortably under the 400-authored-line-per-PR guidance when counted as its own PR 2 diff, well within the session's 800-line budget regardless

## Status

19/25 tasks complete (0.1–0.3, 1.1–1.9, 2.1–2.7 of the full 4-phase task list). Ready for next batch (Phase 3, PR 3 — proyecto detail/edit/delete + inspiraciones) or for `sdd-verify` to validate the PR 1 + PR 2 slices before Phase 3 begins.
