# Apply Progress: Visual Project Database — Data Layer Bootstrap (Fase 1)

## Mode
Strict TDD (config `strict_tdd: true`), OpenSpec artifact store.

## Delivery
- Delivery strategy: `auto-chain`
- Chain strategy: `stacked-to-main`
- Current batch: Work Unit 2 — Phase 2 (PR 2: Schema & Constraints)
- Branch: `pr2-schema` (branched from `pr1-scaffold`)
- Previous batch: Work Unit 1 — Phase 1 (PR 1: Bootstrap Scaffold & Test Runner) — COMPLETE, branch `pr1-scaffold`

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

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.6/1.7 | `tests/app/page.test.tsx` | Component (RTL) | N/A (new) | ✅ Written first — referenced non-existent `@/app/page`, confirmed failing via `npx vitest run tests/app/page.test.tsx` (`Failed to resolve import "@/app/page"`) | ✅ Implemented `page.tsx`/`layout.tsx`/`globals.css`; re-ran same command → 1/1 passed | ➖ Skipped — purely structural placeholder heading, single possible output, no branching (documented per strict-tdd.md skip conditions) | ➖ None needed — minimal component, nothing to extract |
| 1.1–1.5, 1.8 | N/A | Config/scaffold | N/A (new) | N/A — generated scaffold/config is exempt boilerplate per design.md Testing Strategy ("Generated scaffold... is exempt boilerplate") | N/A | N/A | N/A |
| 2.3/2.4 | `tests/schema/constraints.test.ts` | Unit (schema + FK/cascade) | N/A (new) | ✅ Written first — referenced non-existent `@/db/schema`, confirmed failing via `npx vitest run tests/schema/constraints.test.ts` (`Failed to resolve import "@/db/schema"`) | ✅ Implemented `schema.ts` + generated `drizzle/` migration via `npm run db:generate`; re-ran same command → 16/16 passed | ✅ 16 cases across 9 `describe` blocks: each enum's reject-one-invalid + accept-all-valid, NOT NULL, UNIQUE, FK reject/RESTRICT-block/allow-unreferenced-delete, proyecto-delete cascade (join+inspiraciones removed, contactos kept), contacto-delete (join removed, proyecto kept), tiempo >=0 (zero accepted / negative rejected on both columns), default 0 | ➖ None needed — schema is declarative table definitions, no duplication to extract |
| 2.1, 2.2, 2.5, 2.6, 2.7 | N/A | Config/infra | N/A (new) | N/A — `drizzle.config.ts`, `client.ts`, generated migration, and `migrate.ts` are structural/config; their correctness is proven transitively by `constraints.test.ts` running against the real generated `drizzle/` output (2.7 verified by temporarily removing `drizzle/` and confirming all 16 tests fail, then restoring it and re-confirming 16/16 pass) | N/A | N/A | N/A |

### Test Summary
- **Total tests written**: 17 (1 Phase 1 + 16 Phase 2)
- **Total tests passing**: 17
- **Layers used**: Component (1), Unit/schema (16)
- **Approval tests**: None — no refactoring tasks, all new files
- **Pure functions created**: 0 (Phase 2 batch is declarative schema + thin DB client wrappers)

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

## Deviations from Design
- Next.js 16's new `agentRules` feature auto-generates root `AGENTS.md` and `CLAUDE.md` on first `next dev` run and mutates `tsconfig.json` (`jsx: react-jsx`, adds `.next/dev/types/**/*.ts` to `include`). This is Next.js tooling behavior, not part of design.md's file structure. Disabled it explicitly via `agentRules: false` in `next.config.ts` and removed the generated `AGENTS.md`/`CLAUDE.md` files to avoid unwanted repo noise; kept the `tsconfig.json` auto-adjustments (they are required for `next dev` to run and are harmless/correct).
- `@types/node` pinned to `^26.2.0` instead of `^24.14.0` — the local registry no longer serves an `@types/node` release matching `^24.14.0` (latest is `26.2.0`); Node runtime itself is unaffected (still v24.14.0).
- Pinned `vite`/`vitest`/`@vitejs/plugin-react` to exact versions (`6.3.5` / `3.2.4` / `5.0.4`) instead of caret ranges — caret ranges resolved to an experimental `vite@8.x` (rolldown-based) release whose peer-dependency graph caused `npm install` to hang for 40+ minutes in ERESOLVE backtracking. Pinning to a known-stable `vite@6` line fixed the resolution to ~34s.
- Package versions in `package.json` (Next 16.3.2, React 19.2.0, drizzle-orm ^0.44.6, drizzle-kit ^0.31.6, etc.) are current npm registry latest-stable at implementation time rather than the exact wording of `dependencies` list in proposal.md (which lists no versions) — matches design.md intent, no deviation in architecture.
- **`tiempo_estimado_h` CHECK is `>= 0`, not `> 0` as design.md's Schema table states.** spec.md's "Requirement: Tiempo Estimado Non-Negative" explicitly requires `0` to be accepted (`Scenario: Accept zero tiempo_estimado_h`) and tasks.md task 2.3 already lists `>= 0` for both columns. Implemented per spec.md/tasks.md (the acceptance criteria) rather than design.md's narrative table, since spec.md scenarios are the binding acceptance criteria and directly contradict the design table on this one point. No other deviation from design's schema.

## Issues Found
None blocking. The `npm install` hang (see Deviations) was resolved by pinning `vite`; documenting it here in case a future `npm install` on this lockfile needs the same pin.

## Remaining Tasks
- [ ] Phase 3: Repository Layer (PR 3) — 3.1–3.11
- [ ] Phase 4: Seed Script & Verification (PR 4) — 4.1–4.4

## Workload / PR Boundary
- Mode: chained PR slice (stacked-to-main)
- Current work unit: Unit 2 — Drizzle schema, migrations, client, constraint tests (PR 2)
- Boundary: starts from the PR 1 scaffold (branch `pr2-schema` off `pr1-scaffold`), ends with the full 5-table schema, generated+committed migrations, a working `createDb`/`getDb` client, and 16 passing constraint tests proven to depend on the real generated SQL. Does not touch `src/db/repositories/`, `src/db/types.ts`, `src/db/errors.ts`, or `scripts/seed.ts` — those are PR 3–4.
- Estimated review budget impact: 9 files changed, 839 insertions (schema ~100 lines, client ~30 lines, config+migrate ~40 lines, generated migration+meta ~330 lines, test-db helper ~20 lines, constraints test ~280 lines). Generated migration/meta files are excluded from authored-risk counting per the review workload guard; authored lines are well under the 400-line budget for this unit.

## Status
15/30 total tasks complete (1.1–1.8, 2.1–2.7). Phase 1 and Phase 2 both COMPLETE. 0/15 remaining tasks (Phases 3–4) started. Ready for orchestrator to review/push/PR PR 2, then dispatch the next apply batch for Phase 3.
