# Design: Fase 3 — CRUD Management for Proyecto, Inspiracion, Categoria, Contacto

## Technical Approach

Four new App Router segments, each owning a colocated `actions.ts` (`"use server"`). Pages stay async Server Components reading through the existing repositories; forms are native `<form action={...}>` driven by `useActionState` so a `{ok:false}` result renders inline. All parsing/validation lives in **pure functions under `src/lib/forms/`** — that is the strict-TDD lever, since a `FormData → ParseResult<T>` function is unit-testable with zero Next runtime. Repositories gain `updateCategoria`/`updateContacto` and switch from falsy returns to `NotFoundError`, making "row missing" a single uniform signal the action boundary translates. No schema, migration or dependency change.

## Architecture Decisions

| Decision | Choice | Rejected | Rationale |
|---|---|---|---|
| Validation home | Pure `src/lib/forms/parse-*.ts`, called by actions | Inline validation inside each action | Only shape that is unit-testable RED-first; actions stay thin I/O shells |
| Missing-row signal | Repos throw `NotFoundError`; actions catch | Actions pre-check with a `get*` call | Removes a TOCTOU read and a second round-trip; `errors.ts` already defines it |
| Error translation | One `toActionError(err)` at the boundary; unknown errors rethrown | Catch-all `catch { return {ok:false} }` | Business outcomes render inline; genuine bugs still reach the overlay |
| Duplicate `nombre` | Detect `SQLITE_CONSTRAINT_UNIQUE` in `toActionError` | New `NombreDuplicadoError` class | Keeps `errors.ts` stable; UNIQUE is a DB-owned invariant, not a domain concept |
| Card → detail link | `<Link>` wraps **only the title**, sibling of `SelectionCheckbox` | Whole-card link + navigation suppression in comparison mode | Targets are disjoint, so no suppression logic is needed (see Data Flow) |
| Contacto association | Checkbox list emitting repeated `contactoId` values, read with `formData.getAll` | Native `<select multiple>` | Fixed product decision; also keyboard/RTL friendly |
| Post-mutation refresh | `revalidatePath()` + `redirect()` | `useOptimistic` | Server Component re-derives tile geometry/progress; no client duplication |

## Data Flow

    <form action> ──▶ Server Action (actions.ts)
                         │ 1. parseX(formData)  ── pure, src/lib/forms
                         │      └─ invalid ──▶ {ok:false, error, fieldErrors}
                         │ 2. try { repository(db, ...) }
                         │      └─ catch ──▶ toActionError ──▶ {ok:false, error}
                         │ 3. revalidatePath(...)
                         └─ 4. redirect(...)   ◀── OUTSIDE the try block
                                  │
                         Server Component re-reads DB ──▶ page

`redirect()` throws `NEXT_REDIRECT`; calling it inside the `try` would have `toActionError` swallow the navigation. Both are explicit ordering requirements.

**Gallery interaction**: `GalleryGrid` sets `isDraggable/isResizable/isDroppable={false}`, so react-grid-layout registers no drag handlers on tile children and never `preventDefault`s their pointer events. Because the anchor covers the title only and `SelectionCheckbox` sits in the same flex row as a sibling, a checkbox click can never bubble through the link. No comparison-mode suppression is required; a RED test asserts both targets coexist.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/lib/forms/result.ts` | Create | `ActionResult`, `ok`/`fail` helpers, `toActionError` |
| `src/lib/forms/parse-proyecto.ts` | Create | Pure `FormData → ParseResult<NuevoProyecto & {contactoIds:number[]}>` |
| `src/lib/forms/parse-inspiracion.ts` | Create | Pure parse for `urlOrigen`/`tipoReferencia`/`notas` |
| `src/lib/forms/parse-taxonomia.ts` | Create | Pure parse for categoria (`nombre`,`color`) and contacto (`nombre`,`url`) |
| `src/app/proyectos/nuevo/{page.tsx,actions.ts}` | Create | Create form + `crearProyectoAction` |
| `src/app/proyectos/[id]/{page.tsx,actions.ts}` | Create | Detail/edit/delete + inspiracion add/delete actions |
| `src/app/categorias/{page.tsx,actions.ts}` | Create | List/edit/delete + inline in-use message |
| `src/app/contactos/{page.tsx,actions.ts}` | Create | List/edit/delete |
| `src/components/forms/proyecto-form.tsx` | Create | Client form shared by create/edit (`useActionState`) |
| `src/components/forms/contacto-checkbox-list.tsx` | Create | Checkbox list, `defaultChecked` from linked ids |
| `src/components/forms/{form-error.tsx,confirm-submit-button.tsx}` | Create | Inline error display; single `window.confirm` gate |
| `src/db/repositories/categorias.ts` | Modify | Add `updateCategoria`; `NotFoundError` on 0-change delete |
| `src/db/repositories/contactos.ts` | Modify | Add `updateContacto`; `deleteContacto` → `void` + throw |
| `src/db/repositories/proyectos.ts` | Modify | `updateProyecto` throws; `deleteProyecto` → `void` + throw |
| `src/db/repositories/inspiraciones.ts` | Modify | `deleteInspiracion` → `void` + throw |
| `src/db/repositories/index.ts` | Modify | Export the two new functions |
| `src/components/gallery/proyecto-card.tsx` | Modify | Title wrapped in `<Link href={/proyectos/${id}}>` |
| `src/app/page.tsx` | Modify | "Nuevo proyecto" / `/categorias` / `/contactos` entry links |
| `tests/repositories/*.test.ts` | Modify | Boolean assertions → `expect(() => ...).toThrow(NotFoundError)` |

## Interfaces / Contracts

```ts
// src/lib/forms/result.ts
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string; fieldErrors: Record<string, string> };
export function toActionError(err: unknown): ActionResult<never>; // NotFoundError | CategoriaEnUsoError | SQLITE_CONSTRAINT_UNIQUE; rethrows otherwise

// Server Action shape (useActionState-compatible)
type Action<T = void> = (prev: ActionResult<T> | null, formData: FormData) => Promise<ActionResult<T>>;

// src/db/repositories — new
export function updateCategoria(db: Db, id: number, patch: Partial<NuevaCategoria>): Categoria; // throws NotFoundError
export function updateContacto(db: Db, id: number, patch: Partial<NuevoContacto>): Contacto;   // throws NotFoundError
```

`NotFoundError` wiring: update functions read `.returning().get()` and throw when it is `undefined`; delete functions inspect `result.changes === 0`. In `deleteCategoria` the existing FK `catch` runs first, so `CategoriaEnUsoError` still wins over `NotFoundError`. Signatures change `boolean → void` for `deleteProyecto`/`deleteContacto`/`deleteInspiracion`.

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit | `parse-*.ts`, `toActionError` | Plain Vitest; every enum/empty/negative/NaN branch, no DB, no Next |
| Integration (repo) | `NotFoundError` throws, `updateCategoria/Contacto`, UNIQUE, cascade | Extend `tests/repositories/*` with `makeTestDb()` |
| Integration (action) | Import action functions directly and call them with a `FormData` | `vi.mock("@/db/client")` → `makeTestDb()` (exact `tests/app/page.test.tsx` pattern); `vi.mock("next/cache")` and `vi.mock("next/navigation")` spy on `revalidatePath`/`redirect`, with the `redirect` stub throwing a sentinel to mimic real control flow. Assert DB rows + spy args |
| Component | `contacto-checkbox-list`, `proyecto-form`, card link vs. checkbox | RTL with an injected stub action; assert `getAll("contactoId")` payload and that both card targets are reachable |
| E2E | — | Unavailable in this project (`config.yaml`) |

**Spike, first RED test of the actions slice**: confirm Vitest can import a `"use server"` module directly. If the SWC directive transform rejects it, split each action into a pure `actions.impl.ts` (db passed in) re-exported by a thin `"use server"` wrapper, and target the impl in tests. No other design element depends on the outcome.

## Threat Matrix

N/A — no shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. The new App Router segments are HTTP routes, not command dispatch; every matrix row concerns Git/PR/shell surfaces absent here.

## Migration / Rollout

No migration required. Delivered in three slices to respect the 400-line review budget: (1) repository layer + repo tests, (2) proyecto CRUD routes + shared form components, (3) categoria/contacto screens + gallery entry links. Slice 1 is independently revertible; slices 2–3 are additive route folders.

## Open Questions

- [ ] None blocking. The `"use server"` importability spike is resolved inside slice 2 with a pre-agreed fallback.
