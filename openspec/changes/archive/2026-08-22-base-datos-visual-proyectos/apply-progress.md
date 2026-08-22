# Apply Progress: Visual Project Database — Data Layer Bootstrap (Fase 1)

## Mode
Strict TDD (config `strict_tdd: true`), OpenSpec artifact store.

## Delivery
- Delivery strategy: `auto-chain`
- Chain strategy: `stacked-to-main`
- Current batch: Work Unit 4 — Phase 4 (PR 4: Seed Script & Verification) — FINAL WORK UNIT, change fully implemented
- Branch: `pr4-seed` (branched from `pr3-repositories`)
- Previous batches: Work Unit 1 — Phase 1 (PR 1) — COMPLETE, branch `pr1-scaffold`; Work Unit 2 — Phase 2 (PR 2) — COMPLETE, branch `pr2-schema`; Work Unit 3 — Phase 3 (PR 3) — COMPLETE, branch `pr3-repositories`

## Completed Tasks

### Phase 1: Bootstrap Scaffold & Test Runner (PR 1) — COMPLETE
- [x] 1.1 Scaffold Next.js App Router + TS: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, Tailwind setup
- [x] 1.2 Add `dev`/`build`/`test`/`db:generate`/`db:migrate`/`db:seed` scripts to `package.json`
- [x] 1.3 Install deps: `better-sqlite3`, `drizzle-orm`, `drizzle-kit`, `vitest`, `@testing-library/react`, `tsx`
- [x] 1.4 Configure `vitest.config.ts` (jsdom) and `tests/setup.ts`
- [x] 1.5 Add `.gitignore` (`*.db`, `node_modules`, `data/`)
- [x] 1.6 RED: `tests/app/page.test.tsx` — placeholder page renders a heading
- [x] 1.7 GREEN: `src/app/layout.tsx`, `page.tsx`, `globals.css` minimal placeholder
- [x] 1.8 Confirmed `better-sqlite3` native build succeeds on this machine (Node v24.14.0) — no `node:sqlite` fallback needed

### Phase 3: Repository Layer (PR 3) — COMPLETE
- [x] 3.1 `src/db/types.ts` — `Proyecto`, `NuevoProyecto`, `ProyectoConDetalle`, `FiltroProyectos`, `Categoria`, `Contacto`, `Inspiracion`
- [x] 3.2 `src/db/errors.ts` — `CategoriaEnUsoError`, `NotFoundError`
- [x] 3.3 RED: `tests/repositories/categorias.test.ts` — create, list, delete throws when referenced, delete succeeds when unreferenced
- [x] 3.4 GREEN: `src/db/repositories/categorias.ts`
- [x] 3.5 RED: `tests/repositories/contactos.test.ts` — create, list, `vincularContacto`/`desvincularContacto` idempotent, delete cascades join rows only
- [x] 3.6 GREEN: `src/db/repositories/contactos.ts`
- [x] 3.7 RED: `tests/repositories/proyectos.test.ts` — create defaults `tiempo_invertido_h=0`, `listProyectos` filters by estado/categoria/contacto, `getProyectoConDetalle` nested joins, update bumps `updated_at`, delete cascades
- [x] 3.8 GREEN: `src/db/repositories/proyectos.ts`
- [x] 3.9 RED: `tests/repositories/inspiraciones.test.ts` — create, list by proyecto, delete
- [x] 3.10 GREEN: `src/db/repositories/inspiraciones.ts`
- [x] 3.11 `src/db/repositories/index.ts` — barrel export

### Phase 4: Seed Script & Verification (PR 4) — COMPLETE
- [x] 4.1 RED: `tests/seed.test.ts` — seed on temp-file DB yields 2-3 proyectos with categoria+contacto+inspiraciones linked, >=2 distinct `estado`, re-run without `--reset` fails on `UNIQUE(categorias.nombre)` not silent dup
- [x] 4.2 GREEN: `scripts/seed.ts` — single `db.transaction`, `--reset` flag (wipes child-first then reseeds), 3 categorias/3 contactos/3 proyectos inserted via the repository layer (one over-budget: `tiempoInvertidoH=55 > tiempoEstimadoH=40`; one with `montoPago: null`), 1-3 inspiraciones per proyecto spanning all 4 `tipo_referencia` values
- [x] 4.3 Updated `openspec/config.yaml` `rules.apply.test_command`/`rules.verify.test_command`/`build_command` to real `npm test`/`npm run build`; also refreshed the stale `testing:` block (was `status: not_detected` from before any stack existed) to `status: detected`
- [x] 4.4 Verified all proposal success criteria end-to-end (see Work Unit Evidence below)

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `package.json` | Created | Next.js/React 19/TS deps, drizzle-orm/kit, better-sqlite3, vitest + RTL + jsdom, `dev/build/test/db:generate/db:migrate/db:seed` scripts (db:* stubs referencing files that land in PR2/PR4) |
| `package-lock.json` | Created | Locked dependency tree |
| `tsconfig.json` | Created | Strict TS, `bundler` resolution, `@/*` → `src/*` path alias (Next.js auto-appended `.next/dev/types` include and `jsx: react-jsx` on first `next dev` run) |
| `next.config.ts` | Created | Minimal config; explicitly sets `agentRules: false` to stop Next.js 16 from auto-generating root `AGENTS.md`/`CLAUDE.md` |
| `postcss.config.mjs` | Created | `@tailwindcss/postcss` plugin |
| `vitest.config.ts` | Created | jsdom environment, `tests/setup.ts` setup file, `@` alias matching tsconfig |
| `tests/setup.ts` | Created | Imports `@testing-library/jest-dom/vitest` |
| `.gitignore` | Created | `node_modules/`, `.next/`, `*.db*`, `data/`, `.env*`, `next-env.d.ts`, `*.tsbuildinfo`, etc. |
| `tests/app/page.test.tsx` | Created | RED→GREEN: renders `Home` and asserts heading text "Base de Datos Visual de Proyectos" |
| `src/app/page.tsx` | Created | Placeholder `Home` component with the heading asserted by the test |
| `src/app/layout.tsx` | Created | Root layout, imports `globals.css`, sets metadata title/description |
| `src/app/globals.css` | Created | `@import "tailwindcss"` |
| `drizzle.config.ts` | Created | `dialect: sqlite`, `schema: ./src/db/schema.ts`, `out: ./drizzle` |
| `tests/helpers/test-db.ts` | Created | `makeTestDb()` — `:memory:` `better-sqlite3`, `PRAGMA foreign_keys = ON`, applies real `drizzle/` migrations via `drizzle-orm/better-sqlite3/migrator` |
| `tests/schema/constraints.test.ts` | Created | RED→GREEN: 16 tests covering estado/frecuencia_avance/tipo_referencia CHECKs, `titulo` NOT NULL, `categorias.nombre` UNIQUE, `categoria_id` FK RESTRICT (block/allow delete), proyecto delete CASCADE to `proyecto_contactos`+`inspiraciones` (contactos untouched), contacto delete removes only join rows (proyecto untouched), `tiempo_estimado_h`/`tiempo_invertido_h` >= 0 (zero accepted, negative rejected), default `tiempo_invertido_h = 0` |
| `src/db/schema.ts` | Created | 5 Drizzle tables (`categorias`, `contactos`, `proyectos`, `proyecto_contactos`, `inspiraciones`) with `ESTADOS`/`FRECUENCIAS_AVANCE`/`TIPOS_REFERENCIA` const arrays reused for CHECK SQL + TS union types, FK actions (`restrict`/`cascade`), indexes on `categoria_id`/`estado`/`proyecto_id` |
| `src/db/client.ts` | Created | `createDb(url)` (new connection + `PRAGMA foreign_keys = ON`), `getDb()` (process singleton via `DATABASE_URL`, default `./data/allprojects.db`) |
| `drizzle/0000_sour_millenium_guard.sql` + `drizzle/meta/*` | Generated | `npm run db:generate` output — real committed migration, all 5 tables, CHECK/FK/UNIQUE/index DDL verified by reading the generated SQL |
| `scripts/migrate.ts` | Created | Opens `createDb(DATABASE_URL)`, runs `migrate(db, { migrationsFolder: './drizzle' })`, closes connection; manually verified against a temp file DB (5 tables + `__drizzle_migrations` created) |
| `src/db/schema.ts` | Modified | Added `relations()` exports (`categoriasRelations`, `contactosRelations`, `proyectosRelations`, `proyectoContactosRelations`, `inspiracionesRelations`) so `db.query.proyectos.findFirst({ with: {...} })` can resolve nested categoria/contactos/inspiraciones for `getProyectoConDetalle` — not a DDL/constraint change, verified by re-running the full Phase 2 constraints suite unchanged (16/16 still pass) |
| `src/db/types.ts` | Created | `Categoria`/`NuevaCategoria`, `Contacto`/`NuevoContacto`, `Proyecto`/`NuevoProyecto`, `Inspiracion`/`NuevaInspiracion` inferred from schema; composite `ProyectoConDetalle`; `FiltroProyectos` |
| `src/db/errors.ts` | Created | `CategoriaEnUsoError` (thrown by `deleteCategoria` on FK RESTRICT), `NotFoundError` |
| `src/db/repositories/categorias.ts` | Created | `createCategoria`, `listCategorias`, `deleteCategoria` — maps the `SQLITE_CONSTRAINT*` FK-failure error from better-sqlite3 to `CategoriaEnUsoError` |
| `src/db/repositories/contactos.ts` | Created | `createContacto`, `listContactos`, `vincularContacto`/`desvincularContacto` (idempotent via `onConflictDoNothing`/unconditional delete on the composite PK), `deleteContacto` (returns boolean) |
| `src/db/repositories/proyectos.ts` | Created | `createProyecto`, `listProyectos` (estado/categoriaId/contactoId filters, inner-joined with `categorias`), `getProyectoConDetalle` (Drizzle relational query, `.sync()` for the better-sqlite3 driver), `updateProyecto` (bumps `updated_at` via `sql\`(datetime('now'))\``), `deleteProyecto` (returns boolean) |
| `src/db/repositories/inspiraciones.ts` | Created | `createInspiracion`, `listInspiracionesPorProyecto`, `deleteInspiracion` (returns boolean) |
| `src/db/repositories/index.ts` | Created | Barrel export of all 16 repository functions |
| `tests/repositories/categorias.test.ts` | Created | RED→GREEN: 5 tests — create, list (empty + non-empty), delete throws `CategoriaEnUsoError` when referenced, delete succeeds when unreferenced |
| `tests/repositories/contactos.test.ts` | Created | RED→GREEN: 8 tests — create, list, link, link-twice-idempotent, unlink-never-linked-idempotent, unlink-existing, delete cascades only join rows (other contacto + proyecto untouched), delete-nonexistent returns false |
| `tests/repositories/proyectos.test.ts` | Created | RED→GREEN: 11 tests — create defaults `tiempoInvertidoH=0` / explicit value, `listProyectos` filters by estado/categoriaId/contactoId/none, `getProyectoConDetalle` nested categoria+contactos+inspiraciones / not-found→null, `updateProyecto` bumps `updatedAt` (1.1s real-clock wait, since `updated_at` default resolution is whole seconds), `deleteProyecto` cascades / not-found returns false |
| `tests/repositories/inspiraciones.test.ts` | Created | RED→GREEN: 5 tests — create, list-by-proyecto (scoped, excludes other proyecto's rows), list-empty, delete, delete-nonexistent returns false |
| `tests/seed.test.ts` | Created | RED→GREEN: 4 tests against a real temp-file DB (migrated via `migrate()`, same as production) — 2-3 proyectos each with categoria+>=1 contacto+>=1 inspiracion linked (via `getProyectoConDetalle`), >=2 distinct `estado` values, re-run without `reset` throws `UNIQUE constraint failed` and leaves proyecto count unchanged (transaction rollback), `{ reset: true }` wipes and reseeds cleanly |
| `scripts/seed.ts` | Created | Exports `seed(db, { reset? })` — single `db.transaction`; optional `wipe()` (child-first: proyectos→cascade removes join+inspiraciones, then contactos, then categorias) before inserting 3 typed-literal categorias/contactos/proyectos (with contact links + 1-3 inspiraciones each) through the public repository API; CLI entrypoint guarded by `import.meta.url` check reads `DATABASE_URL`/`--reset` and is invoked via `npm run db:seed` |
| `openspec/config.yaml` | Modified | `rules.apply.test_command`/`rules.verify.test_command` set to `npm test`, `rules.verify.build_command` set to `npm run build`; `testing:` block refreshed from stale pre-stack `not_detected` state to `detected` with layer/tool availability reflecting the now-existing Vitest+tsc setup |

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.6/1.7 | `tests/app/page.test.tsx` | Component (RTL) | N/A (new) | ✅ Written first — referenced non-existent `@/app/page`, confirmed failing via `npx vitest run tests/app/page.test.tsx` (`Failed to resolve import "@/app/page"`) | ✅ Implemented `page.tsx`/`layout.tsx`/`globals.css`; re-ran same command → 1/1 passed | ➖ Skipped — purely structural placeholder heading, single possible output, no branching (documented per strict-tdd.md skip conditions) | ➖ None needed — minimal component, nothing to extract |
| 1.1–1.5, 1.8 | N/A | Config/scaffold | N/A (new) | N/A — generated scaffold/config is exempt boilerplate per design.md Testing Strategy ("Generated scaffold... is exempt boilerplate") | N/A | N/A | N/A |
| 2.3/2.4 | `tests/schema/constraints.test.ts` | Unit (schema + FK/cascade) | N/A (new) | ✅ Written first — referenced non-existent `@/db/schema`, confirmed failing via `npx vitest run tests/schema/constraints.test.ts` (`Failed to resolve import "@/db/schema"`) | ✅ Implemented `schema.ts` + generated `drizzle/` migration via `npm run db:generate`; re-ran same command → 16/16 passed | ✅ 16 cases across 9 `describe` blocks: each enum's reject-one-invalid + accept-all-valid, NOT NULL, UNIQUE, FK reject/RESTRICT-block/allow-unreferenced-delete, proyecto-delete cascade (join+inspiraciones removed, contactos kept), contacto-delete (join removed, proyecto kept), tiempo >=0 (zero accepted / negative rejected on both columns), default 0 | ➖ None needed — schema is declarative table definitions, no duplication to extract |
| 2.1, 2.2, 2.5, 2.6, 2.7 | N/A | Config/infra | N/A (new) | N/A — `drizzle.config.ts`, `client.ts`, generated migration, and `migrate.ts` are structural/config; their correctness is proven transitively by `constraints.test.ts` running against the real generated `drizzle/` output (2.7 verified by temporarily removing `drizzle/` and confirming all 16 tests fail, then restoring it and re-confirming 16/16 pass) | N/A | N/A | N/A |

| 3.1, 3.2 | N/A | Types/errors | N/A (new) | N/A — pure type re-exports/inference and two trivial `Error` subclasses; structural, zero branching (documented per strict-tdd.md skip conditions, same treatment as Phase 2's declarative config) | N/A | N/A | N/A |
| 3.3/3.4 | `tests/repositories/categorias.test.ts` | Integration (repo + real migrated `:memory:` DB) | ✅ 16/16 (`tests/schema/constraints.test.ts` re-run before touching `schema.ts`) | ✅ Written first — referenced non-existent `@/db/repositories/categorias`, confirmed failing via `npx vitest run tests/repositories/categorias.test.ts` (`Failed to resolve import`) | ✅ Implemented `categorias.ts` (+ minimal `createProyecto` needed for the referenced-delete test); re-ran → 5/5 passed | ✅ 2 cases for `deleteCategoria` (referenced→throws `CategoriaEnUsoError` / unreferenced→succeeds) plus empty/non-empty `listCategorias`; first attempt used `code === 'SQLITE_CONSTRAINT_FOREIGNKEY'` which failed real assertion (actual code is `SQLITE_CONSTRAINT_TRIGGER` for CHECK-adjacent triggers) — generalized to `code.startsWith('SQLITE_CONSTRAINT') && /FOREIGN KEY/.test(message)`, re-ran → passed | ➖ None needed — small, single-purpose functions |
| 3.5/3.6 | `tests/repositories/contactos.test.ts` | Integration | ✅ 5/5 (categorias suite re-run) | ✅ Written first — referenced non-existent `@/db/repositories/contactos`, confirmed failing (`Failed to resolve import`) | ✅ Implemented `contactos.ts`; re-ran → 8/8 passed | ✅ 4 cases for link/unlink idempotency (link-twice, unlink-never-linked, unlink-existing) plus delete-cascades-join-rows-only (other contacto + proyecto untouched) / delete-nonexistent→false | ➖ None needed |
| 3.7/3.8 | `tests/repositories/proyectos.test.ts` | Integration | ✅ 8/8 (contactos suite re-run) | ✅ Written first — referenced non-existent `@/db/repositories/inspiraciones` (dependency) and the full `proyectos` API surface, confirmed failing (`Failed to resolve import`) | ✅ Implemented `inspiraciones.ts` then full `proyectos.ts`; first run failed 2/11 (`getProyectoConDetalle` — `db.query.proyectos.findFirst(...)` returns a thenable query builder under the better-sqlite3 driver, not resolved data; fixed by chaining `.sync()`); re-ran → 11/11 passed | ✅ create (default vs explicit `tiempoInvertidoH`), `listProyectos` (estado / categoriaId / contactoId / no-filter, 4 cases), `getProyectoConDetalle` (found-with-nested-data / not-found→null), `deleteProyecto` (cascades / not-found→false) | ➖ None needed — one repository function per concern |
| 3.9/3.10 | `tests/repositories/inspiraciones.test.ts` | Integration | ✅ 11/11 (proyectos suite re-run) | ➖ Production code (`inspiraciones.ts`) already existed as a 3.7/3.8 dependency; per strict-tdd.md "if production code already exists, write a test for the NEW behavior not yet implemented" — this test file exercises `inspiraciones.ts` directly (list scoping across two proyectos) rather than only indirectly via `proyectos.test.ts` | ✅ First run failed 1/5 (`UNIQUE constraint failed: categorias.nombre` — test bug: `makeProyecto` reused the literal name `"Robótica"` across two proyectos in the same test); fixed the test helper to suffix a counter, re-ran → 5/5 passed | ✅ list-scoped-to-proyecto (2 proyectos, asserts only the target's rows return) / list-empty, delete / delete-nonexistent→false | ➖ None needed |
| 3.11 | N/A | Barrel export | N/A (new) | N/A — re-export only, no logic; verified by `npx tsx -e "import * as repos from './src/db/repositories/index'; console.log(Object.keys(repos))"` printing all 16 expected function names | N/A | N/A | N/A |
| 4.1/4.2 | `tests/seed.test.ts` | Integration (seed + real temp-file DB, same migrations as production) | ✅ 29/29 (`tests/repositories` re-run before touching `scripts/`) | ✅ Written first — referenced non-existent `../scripts/seed`, confirmed failing via `npx vitest run tests/seed.test.ts` (`Failed to resolve import "../scripts/seed"`) | ✅ Implemented `scripts/seed.ts`; re-ran same command → 4/4 passed | ✅ 4 cases: happy-path nested-join assertions (categoria+contactos+inspiraciones per proyecto via `getProyectoConDetalle`), estado diversity (`Set` size >=2), re-run-without-reset throws `UNIQUE constraint failed` AND count unchanged (proves transaction rollback, not silent dup), `{reset:true}` wipes+reseeds cleanly | ➖ None needed — declarative seed-data literals + two small helper functions (`insertSeedData`, `wipe`), no duplication to extract |

### Test Summary
- **Total tests written**: 50 (1 Phase 1 + 16 Phase 2 + 29 Phase 3 + 4 Phase 4: 5 categorias + 8 contactos + 11 proyectos + 5 inspiraciones + 4 seed)
- **Total tests passing**: 50
- **Layers used**: Component (1), Unit/schema (16), Integration/repositories (29), Integration/seed (4)
- **Approval tests**: None — no refactoring tasks, all new files
- **Pure functions created**: 0 (Phase 3 repositories and Phase 4 seed script are thin, deliberately impure wrappers over a `Db` connection per design.md's "every fn takes `Db` first" interface — the DB call itself is the point of each function)

## Work Unit Evidence

### Unit 1 (Phase 1 / PR 1)

| Evidence | Value |
|---|---|
| Focused test command and exact result | `npx vitest run tests/app/page.test.tsx` → `Test Files 1 passed (1)`, `Tests 1 passed (1)` |
| Full suite | `npm test` → `Test Files 1 passed (1)`, `Tests 1 passed (1)` |
| Typecheck | `npx tsc --noEmit` → no errors |
| Runtime harness command/scenario and exact result | `npm run dev` started Turbopack dev server (`✓ Ready in 246ms`); `curl http://localhost:3000/` → `HTTP 200`, server log shows `GET / 200` |
| Rollback boundary | Delete `src/`, `tests/`, `vitest.config.ts`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `package.json`, `package-lock.json`, `.gitignore` — repository returns to pre-scaffold state (only `spec.md` and `openspec/` remain) |

### Unit 2 (Phase 2 / PR 2)

| Evidence | Value |
|---|---|
| Focused test command and exact result | `npx vitest run tests/schema/constraints.test.ts` → `Test Files 1 passed (1)`, `Tests 16 passed (16)` |
| Full suite | `npm test` → `Test Files 2 passed (2)`, `Tests 17 passed (17)` |
| Typecheck | `npx tsc --noEmit` → no errors |
| Runtime harness command/scenario and exact result | `DATABASE_URL=/tmp/.../test.db npx tsx scripts/migrate.ts` → `Migrations applied to /tmp/.../test.db`; inspected the resulting file with `better-sqlite3` and confirmed `categorias`, `contactos`, `proyectos`, `proyecto_contactos`, `inspiraciones`, `__drizzle_migrations` all exist |
| Real-migration dependency proof (task 2.7) | Temporarily moved `drizzle/` aside and re-ran `npx vitest run tests/schema/constraints.test.ts` → all 16 tests failed (`no such table: categorias` via migrator lookup failure); restored `drizzle/` → 16/16 passed again. Proves the suite exercises the committed generated SQL, not hand-written DDL |
| Rollback boundary | Delete `src/db/schema.ts`, `src/db/client.ts`, `drizzle.config.ts`, `drizzle/`, `scripts/migrate.ts`, `tests/helpers/test-db.ts`, `tests/schema/constraints.test.ts` — repository returns to the PR 1 scaffold state; does not touch `src/app/`, Phase 1 config, or Phase 3/4 files (none exist yet) |

### Unit 3 (Phase 3 / PR 3)

| Evidence | Value |
|---|---|
| Focused test command and exact result | `npx vitest run tests/repositories` → `Test Files 4 passed (4)`, `Tests 29 passed (29)` |
| Full suite | `npm test` → `Test Files 6 passed (6)`, `Tests 46 passed (46)` |
| Typecheck | `npx tsc --noEmit` → no errors |
| Runtime harness command/scenario and exact result | N/A per tasks.md's own Suggested Work Units table — no `scripts/seed.ts` exists yet (PR 4), so repositories are exercised only through the Vitest integration suite against a real migrated `:memory:` DB (same migration files as production, per design.md's Test DB decision); supplementary manual check: `npx tsx -e "import * as repos from './src/db/repositories/index'; console.log(Object.keys(repos))"` confirmed all 16 functions are reachable from the barrel export |
| Rollback boundary | Delete `src/db/repositories/`, `src/db/types.ts`, `src/db/errors.ts`, `tests/repositories/`, and revert the `relations()` addition in `src/db/schema.ts` — repository returns to the PR 2 schema/client state; does not touch `scripts/seed.ts` or `openspec/config.yaml` (PR 4) |

### Unit 4 (Phase 4 / PR 4) — FINAL WORK UNIT

| Evidence | Value |
|---|---|
| Focused test command and exact result | `npx vitest run tests/seed.test.ts` → `Test Files 1 passed (1)`, `Tests 4 passed (4)` |
| Full suite | `npm test` → `Test Files 7 passed (7)`, `Tests 50 passed (50)` |
| Typecheck | `npx tsc --noEmit` → no errors |
| Runtime harness command/scenario and exact result | Ran the real CLI against a fresh temp-file DB (not just the Vitest suite): `DATABASE_URL=/tmp/.../verify.db npx tsx scripts/migrate.ts` → 5 tables created; `npx tsx scripts/seed.ts` → `Seed complete (...).`; re-running the identical command WITHOUT `--reset` → `SqliteError: UNIQUE constraint failed: categorias.nombre`, process exits non-zero (clean failure, not silent duplication); `npx tsx scripts/seed.ts --reset` → `Seed complete (...) [reset].` succeeds. Then ran `getProyectoConDetalle` via `npx tsx -e '...'` against that same file DB and confirmed the returned JSON has nested `categoria` (object), `contactos` (array, 2 entries), and `inspiraciones` (array, 2 entries) all populated from real joined rows. Also ran `npm run dev` and `curl http://localhost:3000/` → `HTTP 200`, server log `GET / 200` |
| Rollback boundary | Delete `scripts/seed.ts`, `tests/seed.test.ts`; revert `openspec/config.yaml`'s `rules.apply.test_command`/`rules.verify.test_command`/`rules.verify.build_command` and `testing:` block to their pre-PR-4 values — repository returns to the PR 3 repository-layer state; does not touch `src/db/` or `tests/repositories/` |

## Deviations from Design
- Next.js 16's new `agentRules` feature auto-generates root `AGENTS.md` and `CLAUDE.md` on first `next dev` run and mutates `tsconfig.json` (`jsx: react-jsx`, adds `.next/dev/types/**/*.ts` to `include`). This is Next.js tooling behavior, not part of design.md's file structure. Disabled it explicitly via `agentRules: false` in `next.config.ts` and removed the generated `AGENTS.md`/`CLAUDE.md` files to avoid unwanted repo noise; kept the `tsconfig.json` auto-adjustments (they are required for `next dev` to run and are harmless/correct).
- `@types/node` pinned to `^26.2.0` instead of `^24.14.0` — the local registry no longer serves an `@types/node` release matching `^24.14.0` (latest is `26.2.0`); Node runtime itself is unaffected (still v24.14.0).
- Pinned `vite`/`vitest`/`@vitejs/plugin-react` to exact versions (`6.3.5` / `3.2.4` / `5.0.4`) instead of caret ranges — caret ranges resolved to an experimental `vite@8.x` (rolldown-based) release whose peer-dependency graph caused `npm install` to hang for 40+ minutes in ERESOLVE backtracking. Pinning to a known-stable `vite@6` line fixed the resolution to ~34s.
- Package versions in `package.json` (Next 16.3.2, React 19.2.0, drizzle-orm ^0.44.6, drizzle-kit ^0.31.6, etc.) are current npm registry latest-stable at implementation time rather than the exact wording of `dependencies` list in proposal.md (which lists no versions) — matches design.md intent, no deviation in architecture.
- **`tiempo_estimado_h` CHECK is `>= 0`, not `> 0` as design.md's Schema table states.** spec.md's "Requirement: Tiempo Estimado Non-Negative" explicitly requires `0` to be accepted (`Scenario: Accept zero tiempo_estimado_h`) and tasks.md task 2.3 already lists `>= 0` for both columns. Implemented per spec.md/tasks.md (the acceptance criteria) rather than design.md's narrative table, since spec.md scenarios are the binding acceptance criteria and directly contradict the design table on this one point. No other deviation from design's schema.
- **Phase 3 added `relations()` exports to `src/db/schema.ts`** (a Phase 2 file). design.md's Interfaces section states `getProyectoConDetalle` "uses one Drizzle relational query (`db.query.proyectos.findFirst({ with: {...} })`)" but never explicitly lists `relations()` calls in the File Structure/Schema sections. `db.query.*` requires `relations()` definitions passed through the `schema` module to resolve `with: {...}`, so this addition is required to satisfy design's own stated interface, not a deviation from it. Verified non-destructive: the full Phase 2 constraints suite (16/16) was re-run unchanged before and after this edit.
- **`db.query.proyectos.findFirst(...)` requires an explicit `.sync()` call** under the `better-sqlite3` driver — otherwise it returns an unresolved thenable query-builder object, not data (discovered via a failing test: `Cannot read properties of undefined (reading 'map')`). Not documented in design.md; recorded here for future maintainers touching relational queries.
- **`updateProyecto`'s `updated_at` bump is proven with a real 1.1s wait**, not a mocked clock. The column defaults to `sql\`(datetime('now'))\`` (whole-second SQLite resolution, not millisecond), and `better-sqlite3` runs natively so Vitest's fake timers cannot influence it. Documented here so a future refactor to millisecond-precision timestamps (e.g. `strftime('%Y-%m-%d %H:%M:%f')`) is understood as an intentional option, not required by current spec/design.
- **Phase 4 wipe order in `scripts/seed.ts`'s `--reset` path**: deletes proyectos first (schema `ON DELETE CASCADE` removes their `proyecto_contactos`/`inspiraciones` rows automatically), then contactos, then categorias last — required because `categoria_id` is FK `RESTRICT`, so any surviving proyecto row would block a categoria delete. Not spelled out at this level of detail in design.md's one-line "deletes rows child-first" note; recorded here for future maintainers.
- **`db.transaction`'s callback parameter (`tx`) is cast to `Db` via `as unknown as Db`** in `scripts/seed.ts`. Drizzle's `SQLiteTransaction` type is structurally close to `BetterSQLite3Database<typeof schema>` but not identically named, so passing `tx` straight into the existing `Db`-typed repository functions needs an explicit cast. Verified safe: `npx tsc --noEmit` passes and the real transaction-rollback behavior (task 4.1's UNIQUE-violation test) is exercised and passes, confirming `tx` is a fully functional query interface at runtime, not a type-only workaround.

## Issues Found
None blocking. The `npm install` hang (see Deviations) was resolved by pinning `vite`; documenting it here in case a future `npm install` on this lockfile needs the same pin. Phase 3 found and fixed two implementation-adjacent issues during TDD (both documented in TDD Cycle Evidence above): the FK-error code assumption in `deleteCategoria` (`SQLITE_CONSTRAINT_FOREIGNKEY` vs. actual `SQLITE_CONSTRAINT_TRIGGER`) and the missing `.sync()` on relational queries. Phase 4 found no new implementation issues; the seed script worked as designed on first GREEN pass.

## Remaining Tasks
None. All 30 original tasks across all 4 phases are complete, plus one verify-fix task (4.5, see below).

## Verify-Fix: `sdd-verify` CRITICAL Finding #1 Resolved

`sdd-verify`'s first pass (`verify-report.md`) found `data-seeding/spec.md`'s "Re-run the seed script" scenario was directly contradicted: `scripts/seed.ts` threw `SqliteError: UNIQUE constraint failed: categorias.nombre` and exited 1 on a second run without `--reset`, instead of completing without constraint violations.

Explicit product decision (confirmed by the user): the spec's original literal behavior is correct — re-running `npm run db:seed` without `--reset` MUST complete successfully as an idempotent no-op (no throw, no duplication, exit 0). Only `--reset` wipes and reseeds.

**TDD Cycle Evidence (verify-fix)**

| Step | Command | Result |
|---|---|---|
| RED | `npx vitest run tests/seed.test.ts` (after rewriting the re-run test to assert `not.toThrow()` + unchanged row counts) | 1 failed: `expected [Function] to not throw an error but 'SqliteError: UNIQUE constraint failed…' was thrown` — confirms the old implementation genuinely fails the new assertion |
| GREEN | `npx vitest run tests/seed.test.ts` (after fixing `scripts/seed.ts`) | 4/4 passed |
| Full suite | `npm test` | 7 test files, 50/50 passed, exit 0 |
| Typecheck | `npx tsc --noEmit` | No errors |

**Implementation**: `scripts/seed.ts`'s `insertSeedData` now upserts on each entity's natural key instead of unconditionally inserting:
- `categorias`: a new `upsertCategoria` helper does `db.insert(categorias).values(...).onConflictDoNothing().returning({ id }).get()` against the real `UNIQUE(categorias.nombre)` DB constraint, falling back to a `select` by `nombre` when the insert is skipped by the conflict.
- `contactos`: no DB-level unique constraint exists on `nombre` (adding one was out of scope for this fix — it would be a schema/migration change affecting real, non-seed usage), so dedup is done at the application level: existing rows are loaded via `listContactos(db)` into a `Map<nombre, id>` and only names not already present are inserted.
- `proyectos`: same application-level pattern, keyed on `titulo` (per the user's explicit instruction to treat `titulo` as the natural seed-dedup key) — existing titles are loaded via `listProyectos(db)` into a `Set`, and any seed proyecto whose `titulo` already exists is skipped entirely (including its contacto links and inspiraciones, since those were already created on the row's first insert).

`vincularContacto` (`src/db/repositories/contactos.ts`) was NOT touched — its `onConflictDoNothing()` idempotent behavior is a separate, already-resolved design decision (see CRITICAL finding #2 in `verify-report.md`, resolved by updating `project-data-model/spec.md`'s "Reject duplicate association" scenario to "Re-link an already-linked contacto is idempotent").

**Real CLI proof (not just the test assertion)**: ran `npx tsx scripts/migrate.ts` then `npx tsx scripts/seed.ts` three times in a row without `--reset` against a fresh temp-file DB. All three runs printed `Seed complete (...).` and exited 0; row counts after run 1, run 2, and run 3 were identical (`categorias=3, contactos=3, proyectos=3, proyecto_contactos=4, inspiraciones=5`). A subsequent `npx tsx scripts/seed.ts --reset` still wiped and reseeded correctly to the same counts.

### Files Changed (verify-fix)

| File | Action | What Was Done |
|---|---|---|
| `scripts/seed.ts` | Modified | `insertSeedData` upserts on natural keys instead of unconditional insert; added `upsertCategoria` helper; updated the `seed()` docstring to describe the corrected idempotent behavior |
| `tests/seed.test.ts` | Modified | Re-run test rewritten to assert `not.toThrow()` and unchanged `proyectos`/`categorias`/`contactos` counts (RED→GREEN cycle documented above); added `listCategorias`/`listContactos` imports |
| `openspec/changes/base-datos-visual-proyectos/tasks.md` | Modified | Task 4.1 description updated to match corrected behavior; added task 4.5 documenting the verify-fix |
| `openspec/changes/base-datos-visual-proyectos/apply-progress.md` | Modified | This section |
| `openspec/changes/base-datos-visual-proyectos/verify-report.md` | Modified | CRITICAL finding #1 marked resolved with evidence (see file) |

## Workload / PR Boundary
- Mode: chained PR slice (stacked-to-main) — this was the last slice in the chain; this verify-fix is a follow-up commit on the same `pr4-seed` branch, not a new PR
- Current work unit: Unit 4 — Seed script + config.yaml test-command wiring + end-to-end verification (PR 4), plus verify-fix for CRITICAL finding #1
- Boundary: touches only `scripts/seed.ts`, `tests/seed.test.ts`, and the change's own OpenSpec artifacts (`tasks.md`, `apply-progress.md`, `verify-report.md`); does not touch `src/db/`, `tests/repositories/`, or `openspec/config.yaml`
- Estimated review budget impact: 2 source files changed (~50 lines net), well under the 400-line budget

## Status
30/30 original tasks complete, plus verify-fix task 4.5. Full `npm test` suite: 50/50 passing across 7 test files. `npx tsc --noEmit`: no errors. Both `sdd-verify` CRITICAL findings are now resolved (finding #2 via spec.md correction in a prior step, finding #1 via this `scripts/seed.ts` fix). The change `base-datos-visual-proyectos` is fully implemented. Ready for `sdd-verify` re-run.
