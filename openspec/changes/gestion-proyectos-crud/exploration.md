# Exploration: Fase 3 — CRUD UI for Proyecto, Inspiracion, Categoria, Contacto

## Current State

The app (Next.js 16 App Router, React 19, Drizzle + better-sqlite3) is entirely read-only from the UI. `page.tsx` is a Server Component reading filters/comparison state from `searchParams`. No `src/app/api/`, no Server Actions, no forms exist. The only mutation path today is `scripts/seed.ts` (dev CLI, outside the request lifecycle).

**Repository layer is already fully CRUD-complete** (`src/db/repositories/*`):
- Proyecto: create, list, getProyectoConDetalle, update (partial patch, bumps updated_at), delete (cascades) — all exist.
- Categoria: create, list, delete (throws `CategoriaEnUsoError` on FK restrict). No update.
- Contacto: create, list, delete, vincular/desvincular (idempotent). No update.
- Inspiracion: create, list by proyecto, delete. No update (matches scope — add/delete only).

`NotFoundError` is defined in `src/db/errors.ts` but never thrown — update/delete currently return falsy on missing id instead.

## Approaches Considered

**A. Mutation mechanism**
1. Server Actions colocated per route (`"use server"`) — recommended. Idiomatic Next 16, works with native `<form action>`, pairs with `revalidatePath`, no auth boundary to worry about.
2. Route Handlers (REST-shaped API) — rejected, adds boilerplate with no external consumer to justify it.

**B. Form/validation**
1. Native HTML forms + manual validation reusing `ESTADOS`/`FRECUENCIAS_AVANCE`/`TIPOS_REFERENCIA` consts already exported from `schema.ts` — recommended, zero new dependencies, matches project's minimal-dependency style.
2. Add `zod` — rejected as over-engineering at this scale (4 entities, ~15 fields).

**C. Error surfacing**
`CategoriaEnUsoError`/`NotFoundError` must be caught at the Server Action boundary and returned as a discriminated result (`{ok:false, error}`), not thrown into Next's error overlay — these are expected business outcomes, not crashes. Recommend adding `NotFoundError` throws to `updateProyecto`/`deleteProyecto`/`deleteContacto`/`deleteInspiracion` for consistency.

**D. UI reactivity**
1. Plain `revalidatePath("/")` after mutation — recommended. Matches the existing "Server Component re-derives everything from DB" architecture; avoids duplicating `computeTileLayout`/`computeProgress` client-side.
2. `useOptimistic` — rejected, unjustified complexity for a personal single-user tool with no latency pressure.

**E. UI surface**
- `/proyectos/nuevo` — dedicated create route (full form: título, estado, categoría select + inline "nueva categoría", tiempos, frecuencia, monto, links, contactos multi-select + inline "nuevo contacto").
- `/proyectos/[id]` — detail/edit view (reuses `getProyectoConDetalle`'s exact shape), delete action with confirm, inspiraciones sub-list with inline add/delete.
- `page.tsx`/`ProyectoCard` — add a link to each card's detail/edit route, plus a "Nuevo proyecto" link.
- Categoria/Contacto: inline "create new" sub-forms embedded in the proyecto form only — no standalone `/categorias` or `/contactos` management pages, unless scope is explicitly widened.

## Risks

- Scope ambiguity on categoria/contacto management depth (inline-create-only vs standalone edit/delete UI).
- `NotFoundError` currently unused — needs a decision on throw-in-repo vs check-in-action.
- No existing multi-select UI pattern for contacto associations (FilterBar's `<select>` is single-value).
- No established test pattern for Server Actions yet in this codebase.
- `react-grid-layout` tiles are non-draggable, so adding click targets (edit links) inside them should be safe, but needs verification.

## Open Question for the Proposal

Should Categoria and Contacto get a minimal standalone edit/delete UI, or is inline "create new" during proyecto create/edit sufficient for Fase 3?

## Ready for Proposal

Yes, pending the scope question above.
