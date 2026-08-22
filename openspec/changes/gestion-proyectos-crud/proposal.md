# Proposal: Fase 3 — CRUD Management for Proyecto, Inspiracion, Categoria, Contacto

## Intent

The app is read-only: the only write path is `scripts/seed.ts`, a dev CLI. The owner cannot register a project, log invested hours, or retire a finished one without editing code. Fase 3 adds write paths for every entity the data model already supports.

## Scope

### In Scope
- `/proyectos/nuevo` — create form (all `NuevoProyecto` fields + contacto multi-select).
- `/proyectos/[id]` — detail/edit/delete, backed by `getProyectoConDetalle`, with an inspiraciones add/delete sub-list.
- `/categorias` and `/contactos` — standalone list/edit/delete screens (confirmed product decision).
- Repository additions: `updateCategoria`, `updateContacto`; `NotFoundError` thrown by `updateProyecto`, `deleteProyecto`, `deleteContacto`, `deleteInspiracion` instead of returning falsy.
- Gallery entry points: per-card link to its detail route, plus "Nuevo proyecto".

### Out of Scope
- Schema/migration changes — no new tables or columns.
- Inspiracion editing (add/delete only), auth, audit log, bulk/undo operations.
- Changes to filtering, comparison, tile geometry, or progress computation.

## Capabilities

### New Capabilities
- `project-authoring`: create, edit and delete a proyecto and manage its inspiraciones and contacto associations from the UI.
- `taxonomy-management`: standalone categoria and contacto list/edit/delete screens, including the in-use-categoria block.

### Modified Capabilities
- `project-data-model`: categoria and contacto become updatable; update/delete against a missing id MUST raise `NotFoundError` rather than return falsy.
- `project-gallery`: cards expose a link to their detail route and the page exposes a create entry point.

## Approach

Server Actions colocated per route (`"use server"`), driven by native `<form action>`. Manual validation reusing `ESTADOS` / `FRECUENCIAS_AVANCE` / `TIPOS_REFERENCIA` from `src/db/schema.ts` — no new dependency. Actions catch `CategoriaEnUsoError` / `NotFoundError` and return a discriminated `{ok:true,...} | {ok:false,error}` so business outcomes render inline, never in Next's error overlay. On success: `revalidatePath()` + `redirect()`, keeping the existing "Server Component re-derives from the DB" model.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/proyectos/nuevo/`, `src/app/proyectos/[id]/` | New | Forms, actions, inspiraciones sub-list |
| `src/app/categorias/`, `src/app/contactos/` | New | Management screens + actions |
| `src/db/repositories/categorias.ts`, `contactos.ts` | Modified | Add `updateCategoria` / `updateContacto` |
| `src/db/repositories/proyectos.ts`, `contactos.ts`, `inspiraciones.ts` | Modified | Throw `NotFoundError` on missing id |
| `src/app/page.tsx`, `src/components/gallery/*` | Modified | Detail + create links |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Return-type change (`boolean` → throw) breaks existing callers/tests | Med | Grep callers; update repository tests in the same slice |
| No test pattern yet for Server Actions | Med | Test action logic as plain functions against an in-memory DB |
| Contacto multi-select has no existing UI pattern | Med | Plain checkbox list posting repeated `contactoId` form values |
| Card click targets conflict with comparison-mode selection | Med | Tiles are non-draggable; suppress navigation while comparison mode is on |
| Four new routes exceed the 400-line review budget | High | Slice: (1) repository layer, (2) proyecto CRUD, (3) categoria/contacto screens |

## Rollback Plan

All deliverables are additive and route-scoped. Revert per slice: delete the new route folders, revert the repository diff. No migration runs, so the SQLite file and seed data are untouched and the gallery falls back to read-only.

## Dependencies

- None. No new packages; Next.js 16 Server Actions and the existing Drizzle repositories are sufficient.

## Success Criteria

- [x] A proyecto can be created, edited and deleted end-to-end from the UI, with contactos and inspiraciones attached.
- [x] Categorias and contactos can be listed, edited and deleted from their own screens.
- [x] Deleting an in-use categoria shows `CategoriaEnUsoError`'s message inline and the row survives.
- [x] Acting on a missing id yields a handled not-found message, never an error overlay.
- [x] `npm test` and `npm run build` pass; gallery, filtering and comparison behavior are unchanged.
