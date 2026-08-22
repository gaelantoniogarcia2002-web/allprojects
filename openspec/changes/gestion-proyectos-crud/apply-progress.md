# Apply Progress: Fase 3 — CRUD Management for Proyecto, Inspiracion, Categoria, Contacto

**Batch**: 3 of N (merged with batches 1–2)
**Branch (batch 1)**: `pr1-repo-layer` (base: `feature/gestion-proyectos-crud`)
**Branch (batch 2)**: `pr2-proyecto-create` (base: `pr1-repo-layer`)
**Branch (batch 3)**: `pr3-proyecto-detail` (base: `pr2-proyecto-create`)
**Mode**: Strict TDD
**Scope (batch 1)**: Phase 0 (Server Action Spike) + Phase 1 (PR 1 — Repository layer)
**Scope (batch 2)**: Phase 2 (PR 2 — Proyecto creation, tasks 2.1–2.7)
**Scope (batch 3)**: Phase 3 (PR 3 — Proyecto detail/edit/delete + inspiraciones, tasks 3.1–3.6)

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

### Phase 3 (PR 3 — proyecto detail/edit/delete + inspiraciones)
- [x] 3.1 RED `tests/lib/forms/parse-inspiracion.test.ts` (5 cases: valid with notas omitted, valid with notas present, empty/whitespace `url_origen`, invalid `tipo_referencia`, whitespace-only `notas` collapses to `null`)
- [x] 3.2 GREEN `src/lib/forms/parse-inspiracion.ts` — pure `FormData → ParseResult<Omit<NuevaInspiracion,"proyectoId">>`, `TIPOS_REFERENCIA` enum check via `db/schema`, `notas` optional/nullable, same `snake_case` field-name convention as `parse-proyecto.ts`
- [x] 3.3 RED `tests/app/proyectos/[id]/actions.test.ts` (9 cases across 4 describe blocks: `editarProyectoAction` updates fields + revalidates / `{ok:false}` on missing id / `{ok:false}` without updating on invalid data; `eliminarProyectoAction` cascades proyecto+contactos+inspiraciones then redirects to `/` / `{ok:false}` on missing id; `agregarInspiracionAction` persists a row + revalidates / `{ok:false}` and inserts nothing on invalid `tipo_referencia`; `eliminarInspiracionAction` removes the row + revalidates / `{ok:false}` on missing id)
- [x] 3.4 GREEN `src/app/proyectos/[id]/actions.ts` (`editarProyectoAction`/`eliminarProyectoAction`/`agregarInspiracionAction`/`eliminarInspiracionAction`, all `"use server"`, `proyectoId`/`inspiracionId` pre-bound via `.bind(null, id)` so the edit/add actions match `ProyectoForm`'s `(prevState, formData) => Promise<ActionResult>` shape) + `src/app/proyectos/[id]/page.tsx` (async Server Component, `notFound()` on a missing/invalid id, reuses `ProyectoForm` pre-filled via `defaultValues`/`selectedContactoIds`, inspiraciones `<ul>` with a per-row delete form, `ConfirmSubmitButton`-gated delete-proyecto form) + `src/components/forms/inspiracion-form.tsx` (new shared client component, same `useActionState` pattern as `proyecto-form.tsx`, for the inline "add inspiracion" form)
- [x] 3.5 RED/GREEN `src/components/gallery/proyecto-card.tsx` — see "Design/Spec Discrepancy Resolution (3.5)" below
- [x] 3.6 `npm test` (172/172 passing) + `npm run build` (success, TypeScript passed, `ƒ /proyectos/[id]` route listed in build output)

## Design/Spec Discrepancy Resolution (3.5)

`design.md`'s "Card → detail link" decision states the title-only `<Link>` and the sibling
`SelectionCheckbox` are disjoint click targets, so "no suppression logic is needed." The
`project-gallery` spec delta (`specs/project-gallery/spec.md`), however, states as a hard
requirement: "The system MUST render each gallery card as a link ... and MUST suppress
that navigation while comparison mode is active," with the literal scenario "GIVEN the
gallery is in comparison mode WHEN the user activates a card THEN the card participates in
comparison selection instead of navigating."

Per this batch's instruction to follow the test over the design doc on conflict, a RED test
was written directly against the literal scenario: **"suppresses the detail link during
comparison mode so activating the card selects instead of navigating"**
(`src/components/gallery/proyecto-card.test.tsx`). It asserts that, in `comparisonMode`,
`screen.queryByRole("link", { name: tile.titulo })` is **absent** — i.e., the title itself
must not remain an activatable navigation target while comparison mode is on, not merely
"the checkbox happens to be a separate element from the link."

**Resolution: the design's disjoint-target reasoning does NOT satisfy the spec as written.**
The design's own rationale ("a checkbox click can never bubble through the link") only
proves the checkbox is unaffected by the link — it says nothing about a user directly
activating the title link itself while comparison mode is active, which the spec's
"activates a card" scenario does not restrict to the checkbox specifically, and the
Requirement's plain-language MUST clause ("suppress that navigation while comparison mode
is active") is unconditional, not scoped to "unless the user clicks the title precisely."
Implemented instead: `proyecto-card.tsx` renders `tile.titulo` as plain text (no `<a>`)
when `comparisonMode` is `true`, and as `<Link href={\`/proyectos/${tile.id}\`}>` otherwise.
This is the "render title as plain text" branch from the batch's own decision tree, not the
"no suppression logic" branch. No separate "Ver detalle" affordance was added during
comparison mode — the spec's Requirement and both its scenarios only describe (a) normal-mode
navigation and (b) comparison-mode suppression; a tertiary escape-hatch link is unrequested
scope not backed by any scenario, so it was intentionally left out to keep the diff
minimal and spec-traceable.

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

## Files Changed (Phase 3 — proyecto detail/edit/delete + inspiraciones)

| File | Action | What Was Done |
|------|--------|----------------|
| `src/lib/forms/parse-inspiracion.ts` | Created | Pure `FormData → ParseResult<Omit<NuevaInspiracion,"proyectoId">>`; validates `url_origen` non-empty and `tipo_referencia` against `TIPOS_REFERENCIA`; `notas` optional, blank collapses to `null` |
| `src/app/proyectos/[id]/actions.ts` | Created | `"use server"` `editarProyectoAction`, `eliminarProyectoAction`, `agregarInspiracionAction`, `eliminarInspiracionAction` — each catches errors via `toActionError`, `revalidatePath("/")` after mutations, `redirect("/")` after delete (outside the try block) |
| `src/app/proyectos/[id]/page.tsx` | Created | Async Server Component; `notFound()` on missing/invalid id; renders `ProyectoForm` pre-filled from `getProyectoConDetalle`; inspiraciones `<ul>` with per-row delete `<form>`; inline `InspiracionForm`; `ConfirmSubmitButton`-gated delete-proyecto `<form>`; two inline `"use server"` wrapper functions (`eliminarInspiracion`, `eliminarProyecto`) adapt the `Promise<ActionResult>`-returning actions to the `(formData) => Promise<void>` type React's plain `<form action>` prop requires (`editarProyectoAction`/`agregarInspiracionAction` avoid this because they're bound into `ProyectoForm`'s `useActionState`, which accepts `Promise<ActionResult>`) |
| `src/components/forms/inspiracion-form.tsx` | Created | Shared client component (`useActionState`), same shape as `proyecto-form.tsx`, for the inline "add inspiracion" form |
| `src/components/gallery/proyecto-card.tsx` | Modified | Title renders as `<Link href={/proyectos/${id}}>` when `comparisonMode` is false, plain text when `true` — see Discrepancy Resolution above |
| `tests/lib/forms/parse-inspiracion.test.ts` | Created | 5 tests covering every validation branch |
| `tests/app/proyectos/[id]/actions.test.ts` | Created | 9 tests across 4 describe blocks (edit, delete+cascade, add inspiracion, delete inspiracion) |
| `src/components/gallery/proyecto-card.test.tsx` | Modified | Added 2 tests: title-link href in normal mode; link absence + text + checkbox presence in comparison mode |

No production files outside `src/lib/forms/parse-inspiracion.ts`, `src/app/proyectos/[id]/`,
`src/components/forms/inspiracion-form.tsx` and `src/components/gallery/proyecto-card.tsx`
were touched in this batch. Phases 1–2's repository layer and shared form components
(`proyecto-form.tsx`, `contacto-checkbox-list.tsx`, `form-error.tsx`,
`confirm-submit-button.tsx`, `result.ts`, `parse-proyecto.ts`) are consumed as-is with zero
modification, confirming the Phase 2 apply-progress note that these were built reusable for
Phase 3.

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
| 3.1–3.2 | `tests/lib/forms/parse-inspiracion.test.ts` | Unit | N/A (new file) | ✅ Written (unresolved import for `parseInspiracion`) | ✅ Passed | ✅ 5 cases (valid w/o notas, valid w/ notas, empty url_origen, invalid tipo_referencia, whitespace notas → null) | ➖ None needed — kept as a small pure function per design, mirrors `parse-proyecto.ts` |
| 3.3–3.4 | `tests/app/proyectos/[id]/actions.test.ts` | Integration (action, `makeTestDb()` + mocked `next/cache`/`next/navigation`) | N/A (new file) | ✅ Written (unresolved imports for all 4 exported actions) | ✅ Passed | ✅ 9 cases (edit happy path, edit missing id, edit validation failure, delete cascade + redirect, delete missing id, add inspiracion happy path, add inspiracion validation failure, delete inspiracion happy path, delete inspiracion missing id) | ➖ None needed |
| 3.5 | `src/components/gallery/proyecto-card.test.tsx` | Component (RTL) | ✅ 5/5 (pre-3.5 state) | ✅ Written (`getByRole("link", {name: tile.titulo})` failed — no link existed yet in either mode) | ✅ Passed | ✅ 2 cases (title-link href present outside comparison mode; link absent + text + checkbox present inside comparison mode — the second case is the literal `project-gallery` "Card navigation suppressed during comparison mode" scenario) | ➖ None needed |
| 3.6 | Full suite | — | — | — | ✅ 172/172 `npm test`; `npm run build` succeeded (TypeScript pass, new `ƒ /proyectos/[id]` route) | — | — |

### Test Summary (Phase 2)
- **Total tests written/modified this batch (Phase 2)**: 39 new test cases — `parse-proyecto.test.ts` (14), `result.test.ts` (8), `actions.test.ts` (5), `contacto-checkbox-list.test.tsx` (3), `form-error.test.tsx` (3), `confirm-submit-button.test.tsx` (3), `proyecto-form.test.tsx` (3)
- **Total tests passing**: 156/156 (full suite, `npm test`) — up from 117/117 after Phase 1
- **Layers used**: Unit (22: `parse-proyecto` + `result`), Integration (5: action + DB + mocked Next APIs), Component/RTL (12)
- **Approval tests**: 0 in this batch (no refactoring of existing behavior)
- **Pure functions created**: 2 (`parseProyecto`, `toActionError`) — both zero-DB, zero-Next-runtime, directly unit-testable per design's Testing Strategy

### Test Summary (Phase 3)
- **Total tests written/modified this batch (Phase 3)**: 16 new/modified test cases — `parse-inspiracion.test.ts` (5), `tests/app/proyectos/[id]/actions.test.ts` (9), `proyecto-card.test.tsx` (2 added to the existing 5)
- **Total tests passing**: 172/172 (full suite, `npm test`) — up from 156/156 after Phase 2
- **Layers used**: Unit (5: `parse-inspiracion`), Integration (9: action + DB + mocked Next APIs), Component/RTL (2)
- **Approval tests**: 0 in this batch (no refactoring of existing behavior)
- **Pure functions created**: 1 (`parseInspiracion`) — zero-DB, zero-Next-runtime, directly unit-testable

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

## Work Unit Evidence (Work Unit 3 — Proyecto detail/edit/delete + inspiraciones)

| Evidence | Value |
|---|---|
| Focused test command and exact result | `npx vitest run tests/lib/forms/parse-inspiracion.test.ts "tests/app/proyectos/[id]" src/components/gallery/proyecto-card.test.tsx` → 16/16 passed |
| Runtime harness command/scenario and exact result | N/A — no e2e harness configured (`openspec/config.yaml`); proven by `tests/app/proyectos/[id]/actions.test.ts` exercising the real Server Actions against `makeTestDb()` (real migrated schema, real `ON DELETE CASCADE`) with `next/cache`/`next/navigation` mocked at the module boundary, matching the exact pattern used in Phase 2's `actions.test.ts` |
| Rollback boundary | Delete `src/app/proyectos/[id]/`, `src/lib/forms/parse-inspiracion.ts`, `src/components/forms/inspiracion-form.tsx`, and `tests/app/proyectos/[id]/`, `tests/lib/forms/parse-inspiracion.test.ts`; revert the `Link`/comparisonMode change in `src/components/gallery/proyecto-card.tsx` and its two added test cases. No existing route depends on the new `[id]` segment; `ProyectoCard`'s only consumer (`GalleryGrid`) already passes `comparisonMode`, so the revert is a clean two-line diff on top of Phase 2's final state |

## Deviations from Design

Phase 1: None — implementation matches design.md exactly: `NotFoundError` thrown via `.returning().get()` undefined check (updates) and `result.changes === 0` check (deletes); `deleteCategoria`'s FK-restrict `catch` block was left untouched, preserving `CategoriaEnUsoError` precedence as designed.

Phase 2:
- **RED-before-GREEN not strictly followed for 4 of the 4 shared form components (2.5)**: `page.tsx` (task 2.4) imports `ProyectoForm`, which composes `ContactoCheckboxList`, `FormError` and `ConfirmSubmitButton`, so all five files were authored together to keep `page.tsx` buildable. RTL tests for each component were written and run immediately after and all passed on first execution against real (not pre-existing) component code — behavior was proven correct, but the GREEN step was not preceded by an observed RED failure for these four files specifically. `parse-proyecto.ts`, `result.ts`, and `actions.ts` (2.1–2.3) all followed strict RED→GREEN with an observed import-resolution failure before implementation.
- **`toActionError`'s SQLITE_CONSTRAINT handling extends design.md's literal contract comment**: design.md's interface comment lists `NotFoundError | CategoriaEnUsoError | SQLITE_CONSTRAINT_UNIQUE; rethrows otherwise`. The "Reject a nonexistent categoria_id" scenario (`project-authoring` spec) requires a caught `{ok:false}` result, but a nonexistent `categoria_id` fails via `SQLITE_CONSTRAINT_FOREIGNKEY`, not `UNIQUE`. `toActionError` was extended to also catch `SQLITE_CONSTRAINT_FOREIGNKEY` (and any other `SQLITE_CONSTRAINT*` code, generically) as a business error, consistent with the broader Requirement "Business Errors Never Reach the Error Overlay" ("any repository error"). Unknown non-constraint errors still rethrow, preserving the "genuine bugs still reach the overlay" rationale.
- **Form field names use `snake_case`** (`titulo`, `categoria_id`, `tiempo_estimado_h`, ...) matching the DB column names and the literal field names used in the `project-authoring` spec scenarios, while the parsed/repository-facing value uses the existing `camelCase` `NuevoProyecto` shape. This is a convention choice, not a deviation from any stated design decision.

Phase 3:
- **`design.md`'s "Card → detail link" decision was overridden by the literal `project-gallery` spec scenario** — see the dedicated "Design/Spec Discrepancy Resolution (3.5)" section above for the full reasoning. Summary: design.md argued no suppression logic was needed because the title-link and `SelectionCheckbox` are disjoint click targets; the spec's Requirement unconditionally states navigation MUST be suppressed while comparison mode is active, and its scenario ("the user activates a card ... participates in comparison selection instead of navigating") does not scope "activates a card" to only the checkbox. The RED test was written against the literal spec text, it failed against the design's disjoint-target implementation (no implementation existed for either mode), and the GREEN implementation renders the title as plain text — not a `<Link>` — whenever `comparisonMode` is `true`.
- **`editarProyectoAction`/`agregarInspiracionAction` take `proyectoId` as their first parameter** (`.bind(null, proyectoId)` at the call site in `page.tsx`), matching design.md's interface comment only implicitly — design.md's `Action<T>` type signature (`(prev, formData) => Promise<ActionResult<T>>`) doesn't show how a per-row id reaches a `useActionState`-bound action; this batch resolves it the same way React's own docs recommend (`action.bind(null, id)`), consistent with `ConfirmSubmitButton`'s existing reusability goal noted in Phase 2's apply-progress.
- **`eliminarProyectoAction`/`eliminarInspiracionAction` take no `formData` parameter** (only the row id) since neither the "delete proyecto" nor "delete inspiracion" scenario reads any form field — they're single-button forms whose only purpose is the `ConfirmSubmitButton` gate and the POST itself. `page.tsx` wraps each in a tiny local `"use server"` function that discards the framework-supplied `FormData` so the wrapper's return type satisfies React's `(formData) => void | Promise<void>` requirement for a plain `<form action>` prop (confirmed necessary by a `tsc` type error during `npm run build`, not a design assumption).

## Issues Found

None.

## Remaining Tasks

- [ ] Phase 4 (PR 4 — taxonomy screens + gallery entry point): tasks 4.1–4.8

## Workload / PR Boundary

- Mode: chained PR slice (`feature-branch-chain`, `auto-chain` delivery strategy)
- Work unit 1 (done): Repository layer (PR 1, base: `feature/gestion-proyectos-crud`)
- Work unit 2 (done): Proyecto creation (PR 2, base: `pr1-repo-layer`) — `/proyectos/nuevo`, `parse-proyecto`, shared form components
- Work unit 3 (done, this batch): Proyecto detail/edit/delete + inspiraciones (PR 3, base: `pr2-proyecto-create`) — `/proyectos/[id]`, `parse-inspiracion`, gallery card detail link
- Boundary: starts at `pr2-proyecto-create`'s final state; ends with all Phase 3 tasks complete, full suite green (172/172), build green
- Estimated review budget impact: 5 new `src/` files (~330 lines: `parse-inspiracion.ts`, `actions.ts`, `page.tsx`, `inspiracion-form.tsx`) + 1 modified `src/` file (~10-line diff: `proyecto-card.tsx`) + 2 new/modified test files (~230 lines); comfortably under the 400-authored-line-per-PR guidance when counted as its own PR 3 diff, well within the session's 800-line budget regardless

## Status

25/33 tasks complete (0.1–0.3, 1.1–1.9, 2.1–2.7, 3.1–3.6 of the full 4-phase task list). Ready for next batch (Phase 4, PR 4 — taxonomy screens + gallery entry point) or for `sdd-verify` to validate the PR 1 + PR 2 + PR 3 slices before Phase 4 begins.
