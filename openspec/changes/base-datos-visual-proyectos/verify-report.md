# Verification Report: base-datos-visual-proyectos

## Change
`base-datos-visual-proyectos` — Visual Project Database, Data Layer Bootstrap (Fase 1)

## Mode
Full artifact set (proposal + design + specs + tasks + apply-progress). Strict TDD active. Branch `pr4-seed`, 4 stacked PRs open, not yet merged. This is a re-verify pass following fixes for both CRITICAL findings raised in the prior verify report.

## Command Evidence (all executed independently in this pass, not taken on trust)

| Command | Result | Exit |
|---|---|---|
| `npm test` (vitest run) | 7 test files, 50/50 tests passed | 0 |
| `npx tsc --noEmit` | No errors | 0 |
| `DATABASE_URL=... npx tsx scripts/migrate.ts` (fresh temp file) | 5 tables + `__drizzle_migrations` created | 0 |
| `npx tsx scripts/seed.ts` run 1 (fresh temp DB, no `--reset`) | `Seed complete`, exit 0 | 0 |
| `npx tsx scripts/seed.ts` run 2 (same DB, no `--reset`) | `Seed complete`, exit 0; row counts identical to run 1 (`categorias=3, contactos=3, proyectos=3, proyecto_contactos=4, inspiraciones=5`) | 0 |
| `npx tsx scripts/seed.ts` run 3 (same DB, no `--reset`) | `Seed complete`, exit 0; row counts still identical | 0 |
| `npx tsx scripts/seed.ts --reset` (same DB, after 3x re-runs) | `Seed complete ... [reset]`, exit 0; row counts unchanged after wipe+reseed | 0 |

## Task Completion (tasks.md)

31/31 items marked `[x]` (30 original tasks across Phase 1–4 plus verify-fix task 4.5). No unchecked or missing tasks. Spot-checked against actual files: `scripts/seed.ts`, `tests/seed.test.ts`, `openspec/config.yaml`, `specs/project-data-model/spec.md` all reflect the described verify-fix changes.

## Spec Compliance Matrix — `project-data-model` (11 requirements, 20 scenarios)

| Requirement / Scenario | Status | Evidence |
|---|---|---|
| Proyecto Entity — Create a valid proyecto | PASS | `tests/repositories/proyectos.test.ts` |
| Proyecto Entity — Reject missing titulo | PASS | `tests/schema/constraints.test.ts:117` |
| Proyecto Entity — Reject nonexistent categoria | PASS | `constraints.test.ts:143` |
| Estado Enum — Reject invalid estado | PASS | `constraints.test.ts:38` |
| Estado Enum — Accept each defined value | PASS | `constraints.test.ts:52` |
| Frecuencia Avance — Reject invalid value | PASS | `constraints.test.ts:68` |
| Tiempo Estimado — Accept zero | PASS | `constraints.test.ts:205` |
| Tiempo Estimado — Reject negative estimado | PASS | `constraints.test.ts:212` |
| Tiempo Estimado — Reject negative invertido | PASS | `constraints.test.ts:219` |
| Categoria — Create with user color | PASS | `tests/repositories/categorias.test.ts:15` |
| Categoria — Reject duplicate nombre | PASS | `constraints.test.ts:136` |
| Categoria Deletion — Block when referenced | PASS | `constraints.test.ts:147`, `categorias.test.ts:44` |
| Categoria Deletion — Allow when unreferenced | PASS | `constraints.test.ts:155`, `categorias.test.ts:61` |
| Contacto — Associate with multiple proyectos | PASS | `contactos.test.ts:59` |
| **Contacto — Re-link an already-linked contacto is idempotent** | **PASS (was CRITICAL FAIL)** | Spec scenario now reads "Re-link an already-linked contacto is idempotent" (renamed from "Reject duplicate association"), matching `vincularContacto`'s `.onConflictDoNothing()` behavior. `contactos.test.ts:70` ("is idempotent when linking the same pair twice") directly covers this scenario and passes. `design.md:97` already documented this as intentional ("idempotent (composite PK)"). Spec, design and implementation are now fully aligned. |
| Contacto Deletion — Removes only join rows | PASS | `constraints.test.ts:188`, `contactos.test.ts:104` |
| Inspiracion — Create for proyecto | PASS | `tests/repositories/inspiraciones.test.ts:36` |
| Inspiracion — Cascade delete with proyecto | PASS | `constraints.test.ts:164` |
| Tipo Referencia — Reject invalid value | PASS | `constraints.test.ts:84` |
| Proyecto Deletion — Cascades to dependents, leaves contacto/categoria | PASS | `constraints.test.ts:164` |

**20/20 PASS, 0 CRITICAL FAIL.**

## Spec Compliance Matrix — `data-seeding` (3 requirements, 5 scenarios)

| Requirement / Scenario | Status | Evidence |
|---|---|---|
| Seed Script — Run on empty database | PASS | `tests/seed.test.ts:30` |
| Seed Script — Satisfies all data-model constraints | PASS (by construction) | All seed rows inserted via constrained repository functions |
| Enum Diversity — Multiple estado values | PASS | `tests/seed.test.ts:46` |
| **Disposable/Reseedable — Re-run the seed script** | **PASS (was CRITICAL FAIL)** | `scripts/seed.ts` upserts on natural keys (`categorias.nombre` via real DB `UNIQUE` + `onConflictDoNothing`; `contactos.nombre`/`proyectos.titulo` via application-level pre-check). `tests/seed.test.ts`'s re-run test asserts `not.toThrow()` + unchanged row counts and passes (4/4). Independently verified in this pass: real CLI run 3x in a row without `--reset` against a fresh temp DB — all 3 runs exit 0 with byte-identical row counts (`categorias=3, contactos=3, proyectos=3, proyecto_contactos=4, inspiraciones=5`); `--reset` still wipes+reseeds correctly afterward. |
| Disposable — Never treated as data-loss incident | N/A (policy statement, not independently testable) | — |

**4/5 PASS, 0 CRITICAL FAIL, 1 N/A.**

## Design Coherence

Design and implementation match closely (schema DDL, repository signatures, file structure, testing strategy all verified against actual source).

- `tiempo_estimado_h` CHECK is `>= 0` in the implementation, while design.md's Schema table narrative still says `> 0`. Correctly resolved in favor of spec.md's binding scenario ("Accept zero tiempo_estimado_h"). WARNING only — design.md's table is stale for future readers, not a code defect.
- `vincularContacto`'s idempotent (`onConflictDoNothing`) behavior, documented in design.md since the design phase, is now fully reconciled with spec.md (see Spec Compliance Matrix above). No outstanding design/spec divergence.

## Proposal Success Criteria Checklist

`proposal.md` still lists all 6 Success Criteria as unchecked `[ ]` boxes, despite every one of them being functionally satisfied and evidenced in this pass and the prior one:

| Criterion | Functionally verified in this pass? | Checkbox state in proposal.md |
|---|---|---|
| `npm run dev` starts without errors | Yes (prior pass: HTTP 200; unchanged this pass) | `[ ]` unchecked |
| `npm test` all pass | Yes (50/50, this pass) | `[ ]` unchecked |
| Migrations create 5 tables with CHECKs/FKs | Yes (fresh migrate run, this pass) | `[ ]` unchecked |
| `npm run db:seed` is idempotent-safe | **Yes** (3x re-run + reset, this pass — was the CRITICAL failure last pass) | `[ ]` unchecked |
| Repository query returns seeded project with joins | Yes (prior pass: `getProyectoConDetalle` nested-join checks; unchanged this pass) | `[ ]` unchecked |
| `openspec/config.yaml` testing section reflects real command | Yes (`test_command: npm test`) | `[ ]` unchecked |

6/6 criteria are now functionally satisfied, but none of the six checkboxes in `proposal.md` were ever ticked — the source-of-truth proposal document remains out of sync with the actual completion state. Not blocking (the checkboxes are documentation bookkeeping, not a functional gate), but should be corrected before archive.

## Issues

### CRITICAL
None remaining. Both prior CRITICAL findings are resolved and independently re-verified in this pass:

1. **RESOLVED — re-verified.** `data-seeding` "Re-run the seed script" scenario. `scripts/seed.ts` now upserts on natural keys; independently confirmed 3x-in-a-row CLI re-run without `--reset` completes cleanly with identical row counts each time, and `--reset` still wipes+reseeds correctly.
2. **RESOLVED — re-verified.** `project-data-model` "Contacto ... association" scenario. `specs/project-data-model/spec.md` was renamed/rewritten ("Re-link an already-linked contacto is idempotent") to match `vincularContacto`'s existing, design-documented `onConflictDoNothing()` behavior. `contactos.test.ts:70` covers exactly this scenario and passes.

### WARNING
1. `proposal.md`'s Success Criteria checklist was never updated (`[ ]` for all 6 items) despite every criterion now being functionally satisfied. Documentation drift between the proposal artifact and the actual completion state — cosmetic, not functional, but should be fixed before archive for an accurate historical record.
2. `design.md`'s Schema table still states `tiempo_estimado_h > 0`; the implemented/spec-correct constraint is `>= 0`. Correctly implemented per spec, but design.md itself is stale and should be corrected for future readers.
3. `specs/project-data-model/spec.md`'s fix for finding #2 is present on disk but **uncommitted** (`git status` shows it as a modified, unstaged file on branch `pr4-seed`). It must be committed before this change can be archived, or the spec fix will not survive as part of the change's history.

### SUGGESTION
None outstanding — the prior suggestion (add a test/doc trail proving the two intentional spec divergences) is now satisfied: both scenarios are directly spec-compliant and covered by passing tests, with no divergence left to document.

## Final Verdict

**PASS WITH WARNINGS**

Rationale: both CRITICAL spec/implementation contradictions from the prior verify pass are resolved and independently re-proven in this pass with real command execution (not evidence taken on trust) — `npm test` (50/50), `npx tsc --noEmit` (clean), and a fresh 3x-in-a-row real CLI re-run of `scripts/seed.ts` without `--reset` (idempotent, exit 0, no duplication each time). All 31 tasks.md items are complete and match the code. All 20 `project-data-model` scenarios and 4/5 testable `data-seeding` scenarios pass; the 5th is a non-testable policy statement. Remaining issues are documentation-hygiene WARNINGs only (unchecked proposal checkboxes, a stale design.md narrative value, and one uncommitted spec.md fix that must be committed before archive) — none of them contradict shipped, tested behavior. Recommend committing the pending `specs/project-data-model/spec.md` change and ticking `proposal.md`'s checklist, then proceeding to archive.
