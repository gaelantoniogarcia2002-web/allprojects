# Tasks: Fase 3 — CRUD Management for Proyecto, Inspiracion, Categoria, Contacto

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1300–1500 total across 4 work units (~150–450 each) |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (repo layer) → PR 2 (proyecto create) → PR 3 (proyecto detail/edit/delete + inspiraciones) → PR 4 (taxonomy + gallery entry) |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |
| Session budget note | Session configured budget is 800 lines; largest single unit (~450) stays comfortably under it, but exceeds the nominal 400-line default, hence chaining. |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Repository layer: updateCategoria/updateContacto + NotFoundError wiring | PR 1 (base: tracker branch) | `npx vitest run tests/repositories` | N/A — no e2e harness configured (`config.yaml`); proven by repo integration tests | Revert `src/db/repositories/{categorias,contactos,proyectos,inspiraciones,index}.ts` + their test diffs; no UI depends on this yet |
| 2 | Proyecto creation: `/proyectos/nuevo`, parse-proyecto, shared form components | PR 2 (base: PR 1 branch) | `npx vitest run tests/lib/forms/parse-proyecto.test.ts tests/app/proyectos/nuevo` | N/A — no e2e harness configured | Delete `src/app/proyectos/nuevo/`, `src/lib/forms/{result,parse-proyecto}.ts`, new form components |
| 3 | Proyecto detail/edit/delete + inspiraciones sub-list + card link | PR 3 (base: PR 2 branch) | `npx vitest run tests/lib/forms/parse-inspiracion.test.ts tests/app/proyectos/\[id\] tests/components/gallery/proyecto-card.test.tsx` | N/A — no e2e harness configured | Delete `src/app/proyectos/[id]/`, `src/lib/forms/parse-inspiracion.ts`; revert `proyecto-card.tsx` link |
| 4 | Taxonomy screens (`/categorias`, `/contactos`) + gallery entry links | PR 4 (base: PR 3 branch) | `npx vitest run tests/lib/forms/parse-taxonomia.test.ts tests/app/categorias tests/app/contactos` | N/A — no e2e harness configured | Delete `src/app/categorias/`, `src/app/contactos/`, `src/lib/forms/parse-taxonomia.ts`; revert `page.tsx` entry links |

Threat matrix: N/A (design.md confirms no shell/subprocess/VCS boundary in this change) — no threat-matrix RED tasks required.

## Phase 0: Server Action Spike (run first — resolves architecture risk before slices 2–4)

- [x] 0.1 RED `tests/lib/forms/actions-spike.test.ts` — directly import a trivial `"use server"` module and call its export; assert it resolves.
- [x] 0.2 Create a throwaway `"use server"` module with one no-op async export to satisfy 0.1.
- [x] 0.3 Run the spike. If import/invocation fails under Vitest, record the decision to split every `actions.ts` into `actions.impl.ts` (plain, db-injected, testable) + thin `"use server"` wrapper for all later phases; delete spike files regardless of outcome. **Outcome: import/invocation succeeded — no split required.**

## Phase 1 (PR 1 — repository layer)

- [x] 1.1 RED `tests/repositories/categorias.test.ts` — `updateCategoria` updates nombre/color; throws `NotFoundError` for missing id.
- [x] 1.2 GREEN `src/db/repositories/categorias.ts` — add `updateCategoria` (`.returning().get()`, throw when undefined).
- [x] 1.3 RED `tests/repositories/contactos.test.ts` — `updateContacto` updates nombre/url; `deleteContacto` throws `NotFoundError`.
- [x] 1.4 GREEN `src/db/repositories/contactos.ts` — add `updateContacto`; `deleteContacto` → `void` + throw on 0 changes.
- [x] 1.5 RED/GREEN `src/db/repositories/proyectos.ts` — `updateProyecto`/`deleteProyecto` throw `NotFoundError` instead of returning falsy; update existing boolean assertions to `expect(() => ...).toThrow(NotFoundError)`.
- [x] 1.6 RED/GREEN `src/db/repositories/inspiraciones.ts` — `deleteInspiracion` → `void` + throw `NotFoundError`.
- [x] 1.7 `src/db/repositories/index.ts` — export `updateCategoria`, `updateContacto`.
- [x] 1.8 Regression test: `deleteCategoria` on an in-use categoria still throws `CategoriaEnUsoError` (existing FK catch precedes the new NotFoundError check).
- [x] 1.9 `npm test` (full repo suite) + `npm run build`.

## Phase 2 (PR 2 — proyecto creation)

- [x] 2.1 RED `tests/lib/forms/parse-proyecto.test.ts` — every enum/empty/negative/NaN/missing-categoria branch.
- [x] 2.2 GREEN `src/lib/forms/result.ts` (`ActionResult`, `ok`/`fail`, `toActionError`) + `src/lib/forms/parse-proyecto.ts`.
- [x] 2.3 RED `tests/app/proyectos/nuevo/actions.test.ts` — valid insert + `revalidatePath`/`redirect` spy args; invalid data → `{ok:false}`.
- [x] 2.4 GREEN `src/app/proyectos/nuevo/{page.tsx,actions.ts}` (apply Phase 0 split if needed).
- [x] 2.5 RED/GREEN `src/components/forms/{contacto-checkbox-list,proyecto-form,form-error,confirm-submit-button}.tsx` — RTL asserts `formData.getAll("contactoId")` payload.
- [x] 2.6 Test: re-submitting an already-linked contacto stays idempotent (no duplicate join row).
- [x] 2.7 `npm test` + `npm run build`.

## Phase 3 (PR 3 — proyecto detail/edit/delete + inspiraciones)

- [x] 3.1 RED `tests/lib/forms/parse-inspiracion.test.ts` — `url_origen`/`tipo_referencia`/`notas` branches.
- [x] 3.2 GREEN `src/lib/forms/parse-inspiracion.ts`.
- [x] 3.3 RED `tests/app/proyectos/[id]/actions.test.ts` — edit, confirmed delete, `NotFoundError` on missing id, add/delete inspiracion.
- [x] 3.4 GREEN `src/app/proyectos/[id]/{page.tsx,actions.ts}` — `getProyectoConDetalle`, inspiraciones sub-list, reuse `proyecto-form`.
- [x] 3.5 RED/GREEN `src/components/gallery/proyecto-card.tsx` — title wrapped in `<Link href="/proyectos/[id]">`; RTL test asserts the link and `SelectionCheckbox` coexist and comparison-mode selection still works per `project-gallery` spec scenario. **Resolved in favor of the literal spec scenario over design.md's disjoint-target assumption** — see apply-progress.md.
- [x] 3.6 `npm test` + `npm run build`.

## Phase 4 (PR 4 — taxonomy screens + gallery entry point)

- [x] 4.1 RED `tests/lib/forms/parse-taxonomia.test.ts` — categoria(nombre,color) + contacto(nombre,url) branches.
- [x] 4.2 GREEN `src/lib/forms/parse-taxonomia.ts`.
- [x] 4.3 RED `tests/app/categorias/actions.test.ts` — edit, delete blocked inline (`CategoriaEnUsoError`), delete allowed when unused, `NotFoundError`.
- [x] 4.4 GREEN `src/app/categorias/{page.tsx,actions.ts}`.
- [x] 4.5 RED `tests/app/contactos/actions.test.ts` — edit, delete always succeeds, `NotFoundError`.
- [x] 4.6 GREEN `src/app/contactos/{page.tsx,actions.ts}`.
- [x] 4.7 `src/app/page.tsx` — add "Nuevo proyecto", `/categorias`, `/contactos` entry links; RTL test.
- [x] 4.8 `npm test` + `npm run build`; confirm gallery/filtering/comparison behavior unchanged.
