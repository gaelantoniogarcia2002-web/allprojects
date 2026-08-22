# Proposal: Visual Project Database — Data Layer Bootstrap (Fase 1)

## Intent

`allprojects` is greenfield: only `spec.md` and SDD config exist. Project state, hours, payments and links live nowhere today, so nothing can be filtered, compared or measured. The visual gallery cannot start until that domain data is queryable. This change delivers the runnable foundation — scaffold, relational schema, seed data — so later UI work renders real records instead of mocks.

## Scope

### In Scope
- Next.js (App Router) + TypeScript + Tailwind CSS scaffold, local dev only.
- Vitest + React Testing Library test runner wired for strict TDD (`strict_tdd: true`).
- SQLite persistence via `better-sqlite3` + Drizzle ORM: schema + generated migration for `proyectos`, `categorias`, `contactos`, `proyecto_contactos`, `inspiraciones` (per `exploration.md`).
- Seed script inserting 2–3 fictitious projects with categories, contacts and inspirations.
- Minimal typed data-access module (repository functions) the future UI will consume.

### Out of Scope
- Gallery view, masonry/proportional cards, progress fill, over-budget alerts.
- Filters, comparison mode, overlay menus, any page beyond a scaffold placeholder.
- Route Handlers beyond, at most, a smoke endpoint; full API surface is later work.
- Auth, multi-user, cloud sync, deployment/packaging, multi-currency.

### Assumptions (not re-opened)
- Deployment target: local dev server only for now.
- `monto_pago` is a single-currency numeric field.
- Categoria/contacto are normalized lookup tables, deviating from spec.md's free-text/array wording.

## Capabilities

### New Capabilities
- `project-data-model`: persisted entities, fields, enums, relationships and referential rules for Proyecto, Categoria, Contacto and Inspiracion.
- `data-seeding`: reproducible local seed of representative fictitious data.

### Modified Capabilities
- None (no existing specs in `openspec/specs/`).

## Approach

Scaffold Next.js/TS/Tailwind, then define the Drizzle schema as the single source of truth and generate SQLite migrations from it. Enable `PRAGMA foreign_keys = ON`; enforce enums (`estado`, `frecuencia_avance`, `tipo_referencia`) with CHECK constraints. Cascade deletes from `proyectos` to `inspiraciones` and `proyecto_contactos`. Keep DB access in a dedicated module so the UI layer never touches Drizzle directly. Write tests first per strict TDD: schema/constraint tests and repository tests run against an in-memory or temp-file SQLite instance.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json`, `tsconfig.json`, `next.config.ts` | New | Scaffold + scripts (`dev`, `test`, `db:generate`, `db:migrate`, `db:seed`) |
| `src/db/schema.ts` | New | Drizzle table definitions |
| `src/db/client.ts` | New | better-sqlite3 connection, FK pragma |
| `src/db/repositories/` | New | Typed query functions |
| `drizzle/` | New | Generated migrations |
| `scripts/seed.ts` | New | Fictitious seed data |
| `vitest.config.ts`, `tests/` | New | Test runner + schema/repository tests |
| `openspec/config.yaml` | Modified | Fill `test_command` / `build_command` once stack exists |
| `.gitignore` | New | Ignore `*.db`, `node_modules` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `better-sqlite3` native build fails on the local Node version | Med | Pin supported Node; fall back to `node:sqlite` or `libsql` if rebuild fails |
| Normalized categories/contacts diverge from `spec.md` wording | High | Documented as an explicit, user-confirmed deviation; spec delta records the new model |
| Schema churn once UI needs (masonry sizing, comparison) are implemented | Med | Migrations are additive and regenerable; seed data is disposable |
| Strict TDD slows bootstrap (scaffold code is hard to test-first) | Med | Apply TDD to schema/repository logic; treat generated scaffold as untested boilerplate |

## Rollback Plan

The change is purely additive to an empty repository. Rollback = delete the created files/directories (`src/`, `drizzle/`, `scripts/`, `tests/`, `node_modules/`, config files, `*.db`) and revert `openspec/config.yaml`. No existing code, data or consumers are affected; no production state to migrate back.

## Dependencies

- Node.js (LTS) + a package manager available locally.
- npm packages: `next`, `react`, `typescript`, `tailwindcss`, `better-sqlite3`, `drizzle-orm`, `drizzle-kit`, `vitest`, `@testing-library/react`.
- Native toolchain for `better-sqlite3` compilation.

## Success Criteria

- [x] `npm run dev` starts the Next.js app without errors.
- [x] `npm test` runs Vitest and all tests pass.
- [x] Migrations create all five tables with enum CHECKs and foreign keys enforced.
- [x] `npm run db:seed` is idempotent-safe and loads 2–3 projects with linked categories, contacts and inspirations.
- [x] A repository query returns a seeded project with its category, contacts and inspirations joined.
- [x] `openspec/config.yaml` testing section reflects the real, working test command.
