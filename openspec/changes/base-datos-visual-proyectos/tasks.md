# Tasks: Visual Project Database — Data Layer Bootstrap (Fase 1)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1150-1300 (scaffold ~200, schema/client/types/errors ~215, repositories ~170, seed+migrate ~105, tests ~700) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (scaffold+runner) → PR 2 (schema+constraints) → PR 3 (repositories) → PR 4 (seed) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main (recommended default; confirm before PR 2) |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Scaffold Next.js/TS/Tailwind + Vitest + placeholder page | PR 1 | `npm test -- tests/app` | `npm run dev` starts app | Delete `src/app`, `vitest.config.ts`, `tests/`, root configs |
| 2 | Drizzle schema, migrations, client, constraint tests | PR 2 | `npm test -- tests/schema` | `npm run db:migrate` on temp DB | Delete `src/db/schema.ts`, `client.ts`, `drizzle/`, `scripts/migrate.ts` |
| 3 | Typed repository module + repo tests | PR 3 | `npm test -- tests/repositories` | N/A — repos exercised only via tests until seed exists | Delete `src/db/repositories/`, `types.ts`, `errors.ts`, related tests |
| 4 | Seed script + config.yaml test-command wiring | PR 4 | `npm test -- tests/seed` | `npm run db:seed` then inspect temp DB | Delete `scripts/seed.ts`, seed test; revert `config.yaml` |

## Phase 1: Bootstrap Scaffold & Test Runner (PR 1)

- [x] 1.1 Scaffold Next.js App Router + TS: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, Tailwind setup
- [x] 1.2 Add `dev`/`build`/`test`/`db:generate`/`db:migrate`/`db:seed` scripts to `package.json`
- [x] 1.3 Install deps: `better-sqlite3`, `drizzle-orm`, `drizzle-kit`, `vitest`, `@testing-library/react`, `tsx`
- [x] 1.4 Configure `vitest.config.ts` (jsdom) and `tests/setup.ts`
- [x] 1.5 Add `.gitignore` (`*.db`, `node_modules`, `data/`)
- [x] 1.6 RED: `tests/app/page.test.tsx` — placeholder page renders a heading
- [x] 1.7 GREEN: `src/app/layout.tsx`, `page.tsx`, `globals.css` minimal placeholder
- [x] 1.8 Confirm `better-sqlite3` native build; fall back to `node:sqlite` behind `createDb()` if it fails

## Phase 2: Schema & Constraints (PR 2)

- [x] 2.1 `drizzle.config.ts` (sqlite dialect, schema `src/db/schema.ts`, out `drizzle/`)
- [x] 2.2 `tests/helpers/test-db.ts` — `makeTestDb()`: `:memory:` + `migrate()`
- [x] 2.3 RED: `tests/schema/constraints.test.ts` — estado/frecuencia_avance/tipo_referencia CHECKs, NOT NULL `titulo`, UNIQUE `categorias.nombre`, FK `categoria_id` RESTRICT, cascade proyecto→inspiraciones/proyecto_contactos, contacto delete removes only join rows, `tiempo_estimado_h`/`tiempo_invertido_h` >= 0
- [x] 2.4 GREEN: `src/db/schema.ts` — 5 tables per design, enum const arrays, CHECKs, indexes
- [x] 2.5 GREEN: `src/db/client.ts` — `createDb()`/`getDb()`, `PRAGMA foreign_keys = ON`
- [x] 2.6 `npm run db:generate`; `scripts/migrate.ts` applies `drizzle/` to `DATABASE_URL`
- [x] 2.7 Verify all Phase 2 tests pass against the real generated migration

## Phase 3: Repository Layer (PR 3)

- [ ] 3.1 `src/db/types.ts` — `Proyecto`, `NuevoProyecto`, `ProyectoConDetalle`, `FiltroProyectos`, `Categoria`, `Contacto`, `Inspiracion`
- [ ] 3.2 `src/db/errors.ts` — `CategoriaEnUsoError`, `NotFoundError`
- [ ] 3.3 RED: `tests/repositories/categorias.test.ts` — create, list, delete throws when referenced, delete succeeds when unreferenced
- [ ] 3.4 GREEN: `src/db/repositories/categorias.ts`
- [ ] 3.5 RED: `tests/repositories/contactos.test.ts` — create, list, `vincularContacto`/`desvincularContacto` idempotent, delete cascades join rows only
- [ ] 3.6 GREEN: `src/db/repositories/contactos.ts`
- [ ] 3.7 RED: `tests/repositories/proyectos.test.ts` — create defaults `tiempo_invertido_h=0`, `listProyectos` filters by estado/categoria/contacto, `getProyectoConDetalle` nested joins, update bumps `updated_at`, delete cascades
- [ ] 3.8 GREEN: `src/db/repositories/proyectos.ts`
- [ ] 3.9 RED: `tests/repositories/inspiraciones.test.ts` — create, list by proyecto, delete
- [ ] 3.10 GREEN: `src/db/repositories/inspiraciones.ts`
- [ ] 3.11 `src/db/repositories/index.ts` — barrel export

## Phase 4: Seed Script & Verification (PR 4)

- [ ] 4.1 RED: `tests/seed.test.ts` — seed on temp-file DB yields 2-3 proyectos with categoria+contacto+inspiracion, >=2 distinct `estado`, re-run without `--reset` fails on UNIQUE(nombre) not silent dup
- [ ] 4.2 GREEN: `scripts/seed.ts` — single transaction, `--reset` flag, 3 categorias/contactos/proyectos (one over-budget, one `monto_pago: null`) inserted via repositories, 1-3 inspiraciones/proyecto spanning `tipo_referencia`
- [ ] 4.3 Update `openspec/config.yaml` `rules.apply.test_command` / `rules.verify.test_command` with the real `npm test` invocation
- [ ] 4.4 Verify proposal success criteria: `npm run dev`, `npm test`, `npm run db:seed` idempotent, a repository query returns a seeded project with joined categoria/contactos/inspiraciones
