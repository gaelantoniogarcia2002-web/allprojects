# Apply Progress: Visual Project Database — Data Layer Bootstrap (Fase 1)

## Mode
Strict TDD (config `strict_tdd: true`), OpenSpec artifact store.

## Delivery
- Delivery strategy: `auto-chain`
- Chain strategy: `stacked-to-main`
- Current batch: Work Unit 1 — Phase 1 (PR 1: Bootstrap Scaffold & Test Runner)
- Branch: `pr1-scaffold` (branched from tracker branch `feature/base-datos-visual-proyectos`, itself branched from `main`)

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

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.6/1.7 | `tests/app/page.test.tsx` | Component (RTL) | N/A (new) | ✅ Written first — referenced non-existent `@/app/page`, confirmed failing via `npx vitest run tests/app/page.test.tsx` (`Failed to resolve import "@/app/page"`) | ✅ Implemented `page.tsx`/`layout.tsx`/`globals.css`; re-ran same command → 1/1 passed | ➖ Skipped — purely structural placeholder heading, single possible output, no branching (documented per strict-tdd.md skip conditions) | ➖ None needed — minimal component, nothing to extract |
| 1.1–1.5, 1.8 | N/A | Config/scaffold | N/A (new) | N/A — generated scaffold/config is exempt boilerplate per design.md Testing Strategy ("Generated scaffold... is exempt boilerplate") | N/A | N/A | N/A |

### Test Summary
- **Total tests written**: 1
- **Total tests passing**: 1
- **Layers used**: Component (1)
- **Approval tests**: None — no refactoring tasks, all new files
- **Pure functions created**: 0 (this batch is scaffold + a single presentational component)

## Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused test command and exact result | `npx vitest run tests/app/page.test.tsx` → `Test Files 1 passed (1)`, `Tests 1 passed (1)` |
| Full suite | `npm test` → `Test Files 1 passed (1)`, `Tests 1 passed (1)` |
| Typecheck | `npx tsc --noEmit` → no errors |
| Runtime harness command/scenario and exact result | `npm run dev` started Turbopack dev server (`✓ Ready in 246ms`); `curl http://localhost:3000/` → `HTTP 200`, server log shows `GET / 200` |
| Rollback boundary | Delete `src/`, `tests/`, `vitest.config.ts`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `package.json`, `package-lock.json`, `.gitignore` — repository returns to pre-scaffold state (only `spec.md` and `openspec/` remain) |

## Deviations from Design
- Next.js 16's new `agentRules` feature auto-generates root `AGENTS.md` and `CLAUDE.md` on first `next dev` run and mutates `tsconfig.json` (`jsx: react-jsx`, adds `.next/dev/types/**/*.ts` to `include`). This is Next.js tooling behavior, not part of design.md's file structure. Disabled it explicitly via `agentRules: false` in `next.config.ts` and removed the generated `AGENTS.md`/`CLAUDE.md` files to avoid unwanted repo noise; kept the `tsconfig.json` auto-adjustments (they are required for `next dev` to run and are harmless/correct).
- `@types/node` pinned to `^26.2.0` instead of `^24.14.0` — the local registry no longer serves an `@types/node` release matching `^24.14.0` (latest is `26.2.0`); Node runtime itself is unaffected (still v24.14.0).
- Pinned `vite`/`vitest`/`@vitejs/plugin-react` to exact versions (`6.3.5` / `3.2.4` / `5.0.4`) instead of caret ranges — caret ranges resolved to an experimental `vite@8.x` (rolldown-based) release whose peer-dependency graph caused `npm install` to hang for 40+ minutes in ERESOLVE backtracking. Pinning to a known-stable `vite@6` line fixed the resolution to ~34s.
- Package versions in `package.json` (Next 16.3.2, React 19.2.0, drizzle-orm ^0.44.6, drizzle-kit ^0.31.6, etc.) are current npm registry latest-stable at implementation time rather than the exact wording of `dependencies` list in proposal.md (which lists no versions) — matches design.md intent, no deviation in architecture.

## Issues Found
None blocking. The `npm install` hang (see Deviations) was resolved by pinning `vite`; documenting it here in case a future `npm install` on this lockfile needs the same pin.

## Remaining Tasks
- [ ] Phase 2: Schema & Constraints (PR 2) — 2.1–2.7
- [ ] Phase 3: Repository Layer (PR 3) — 3.1–3.11
- [ ] Phase 4: Seed Script & Verification (PR 4) — 4.1–4.4

## Workload / PR Boundary
- Mode: chained PR slice (stacked-to-main)
- Current work unit: Unit 1 — Scaffold Next.js/TS/Tailwind + Vitest + placeholder page (PR 1)
- Boundary: starts from empty repo (only `spec.md`/`openspec/`), ends with a runnable Next.js scaffold, Vitest wired, one passing component test, and a confirmed native `better-sqlite3` build. Does not touch `src/db/`, `drizzle/`, or `scripts/` — those are PR 2–4.
- Estimated review budget impact: ~150-250 authored lines (config + 3 tiny app files + 1 test); well under the 400-line budget. Matches the tasks.md forecast for Unit 1.

## Status
8/8 Phase 1 tasks complete (1.1–1.8). 0/22 remaining tasks (Phases 2–4) started. Ready for orchestrator to review/push/PR PR 1, then dispatch the next apply batch for Phase 2.
