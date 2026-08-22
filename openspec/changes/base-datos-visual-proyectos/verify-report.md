# Verification Report: base-datos-visual-proyectos

## Change
`base-datos-visual-proyectos` — Visual Project Database, Data Layer Bootstrap (Fase 1)

## Mode
Full artifact set (proposal + design + specs + tasks + apply-progress). Strict TDD active. Branch `pr4-seed`, 4 stacked PRs open, not yet merged.

## Command Evidence

| Command | Result | Exit |
|---|---|---|
| `npm test` (vitest run) | 7 test files, 50/50 tests passed | 0 |
| `npx tsc --noEmit` | No errors | 0 |
| `npm run dev` + `curl localhost:3000/` | `HTTP 200`, server log `GET / 200` | 0 |
| `DATABASE_URL=... npx tsx scripts/migrate.ts` (fresh temp file) | 5 tables + `__drizzle_migrations` created | 0 |
| `npx tsx scripts/seed.ts` then re-run without `--reset` (original pass) | First run succeeds; second run threw `SqliteError: UNIQUE constraint failed: categorias.nombre`, process exited 1 | 1 |
| **`npx tsx scripts/seed.ts` re-run 3x in a row without `--reset` (verify-fix, RESOLVED)** | All 3 runs succeed, exit 0, identical row counts each time (`categorias=3, contactos=3, proyectos=3, proyecto_contactos=4, inspiraciones=5`) | 0 |
| `npx tsx scripts/seed.ts --reset` after failed re-run | Succeeds, wipes+reseeds | 0 |

All commands were executed directly in this verify pass (not taken on trust from apply-progress.md). apply-progress.md's test/tsc/dev-server claims are accurate.

## Task Completion (tasks.md)

30/30 tasks marked `[x]` across Phase 1–4. Spot-checked against actual files/git history: scaffold (`package.json`, `next.config.ts`, `vitest.config.ts`, `src/app/*`), schema (`src/db/schema.ts`, `drizzle/0000_*.sql`, `client.ts`), repositories (`src/db/repositories/*.ts`, `types.ts`, `errors.ts`), seed (`scripts/seed.ts`, `tests/seed.test.ts`, `openspec/config.yaml` test/build commands). Confirmed `openspec/config.yaml` was updated (`test_command: npm test`, `build_command: npm run build`, `testing.status: detected`). No unchecked or missing tasks found.

## Spec Compliance Matrix — `project-data-model` (11 requirements, 20 scenarios)

| Requirement / Scenario | Status | Evidence |
|---|---|---|
| Proyecto Entity — Create a valid proyecto | PASS | `tests/repositories/proyectos.test.ts` create tests |
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
| Contacto — Associate with multiple proyectos | PASS | `contactos.test.ts:59` (single-link path exercised; no dedicated multi-proyecto assertion, but same code path) |
| **Contacto — Reject duplicate association** | **FAIL (CRITICAL)** | Spec requires the duplicate `(proyecto_id, contacto_id)` insert to be **rejected as a primary key violation**. `src/db/repositories/contactos.ts`'s `vincularContacto` uses `.onConflictDoNothing()` and is explicitly documented as idempotent (also stated as intentional in design.md's interface list). `contactos.test.ts:70` ("is idempotent when linking the same pair twice") asserts the **opposite** of the spec scenario — no throw, single row silently kept. No test anywhere proves rejection through the public API. |
| Contacto Deletion — Removes only join rows | PASS | `constraints.test.ts:188`, `contactos.test.ts:104` |
| Inspiracion — Create for proyecto | PASS | `tests/repositories/inspiraciones.test.ts:36` |
| Inspiracion — Cascade delete with proyecto | PASS | `constraints.test.ts:164` |
| Tipo Referencia — Reject invalid value | PASS | `constraints.test.ts:84` |
| Proyecto Deletion — Cascades to dependents, leaves contacto/categoria | PASS | `constraints.test.ts:164` |

**19/20 PASS, 1 CRITICAL FAIL.**

## Spec Compliance Matrix — `data-seeding` (3 requirements, 5 scenarios)

| Requirement / Scenario | Status | Evidence |
|---|---|---|
| Seed Script — Run on empty database | PASS | `tests/seed.test.ts:30` |
| Seed Script — Satisfies all data-model constraints | PASS (by construction) | All seed rows inserted via constrained repository functions |
| Enum Diversity — Multiple estado values | PASS | `tests/seed.test.ts:46` |
| **Disposable/Reseedable — Re-run the seed script** | **RESOLVED (was FAIL/CRITICAL)** | Spec: "WHEN the seed script is run again ... THEN it completes without constraint violations and the database still contains 2 to 3 proyecto rows." `scripts/seed.ts` now upserts on natural keys (`categorias.nombre`, `contactos.nombre`, `proyectos.titulo`) instead of unconditionally inserting. Verified: `tests/seed.test.ts`'s re-run test now asserts `not.toThrow()` + unchanged row counts (4/4 tests pass); real CLI run 3x in a row without `--reset` exits 0 each time with identical row counts (see Command Evidence table). |
| Disposable — Never treated as data-loss incident | N/A (policy statement, not independently testable) | — |

**4/5 PASS, 0 CRITICAL FAIL (resolved in verify-fix), 1 N/A.**

## Design Coherence

Design and implementation match closely (schema DDL, repository signatures, file structure, testing strategy all verified against actual source). Two points of note:

- `tiempo_estimado_h` CHECK is `>= 0` in the implementation, while design.md's Schema table narrative says `> 0`. This is correctly resolved in apply-progress.md's Deviations section: spec.md's binding scenario ("Accept zero tiempo_estimado_h") requires `>= 0`, and the implementation follows the spec over the design table. Correct call — WARNING only, not blocking (design.md itself should be corrected for future readers, but this is not a code defect).
- `vincularContacto`'s idempotent (`onConflictDoNothing`) behavior is *specified in design.md itself* ("idempotent (composite PK)"), meaning the design phase, not just apply, already diverged from spec.md's "Reject duplicate association" scenario without that divergence being flagged or reconciled anywhere in the artifact chain. See CRITICAL finding above.

## Proposal Success Criteria Checklist

`proposal.md` lists 6 Success Criteria, **all still rendered as unchecked `[ ]` boxes** despite apply-progress.md claiming end-to-end verification with evidence for each:

| Criterion | Functionally verified in this pass? | Checkbox state in proposal.md |
|---|---|---|
| `npm run dev` starts without errors | Yes (HTTP 200) | `[ ]` unchecked |
| `npm test` all pass | Yes (50/50) | `[ ]` unchecked |
| Migrations create 5 tables with CHECKs/FKs | Yes (inspected generated SQL + fresh migrate run) | `[ ]` unchecked |
| `npm run db:seed` is idempotent-safe | **No** — throws on re-run without `--reset` (see CRITICAL above) | `[ ]` unchecked |
| Repository query returns seeded project with joins | Yes (`getProyectoConDetalle` nested-join tests + manual check per apply-progress) | `[ ]` unchecked |
| `openspec/config.yaml` testing section reflects real command | Yes (`test_command: npm test`) | `[ ]` unchecked |

5/6 criteria are functionally satisfied; 1/6 (idempotent seed) is not, and none of the six checkboxes in `proposal.md` were ever ticked even for the satisfied ones — the source-of-truth proposal document is out of sync with the claimed completion state.

## Issues

### CRITICAL
1. **RESOLVED.** ~~Seed re-run contradicts `data-seeding` spec.~~ `scripts/seed.ts` (and `npm run db:seed`) throws and exits non-zero on a second run without `--reset`, directly contradicting spec.md's "Re-run the seed script" scenario, which requires completion without constraint violations. The implementation matches design.md/tasks.md intent but that intent itself was never reconciled against the binding spec scenario — either the spec scenario must be amended to require `--reset`/explicit flag semantics, or the seed script must default to reset-and-reseed behavior to satisfy the spec as written.

   **Resolution (product decision, confirmed by user)**: the spec's literal behavior is correct. `scripts/seed.ts` was changed to upsert on natural keys (`categorias.nombre` via `onConflictDoNothing()` against the real DB `UNIQUE` constraint; `contactos.nombre` and `proyectos.titulo` via application-level pre-check since no DB-level uniqueness exists for those columns) instead of unconditionally inserting. Evidence: RED test written first (`tests/seed.test.ts`'s re-run test rewritten to assert `not.toThrow()` + unchanged row counts) confirmed failing against the old implementation with the exact `SqliteError: UNIQUE constraint failed: categorias.nombre` message; GREEN after the fix — `npx vitest run tests/seed.test.ts` 4/4 passed, full `npm test` 50/50 passed, `npx tsc --noEmit` clean. Real CLI proof: `npx tsx scripts/seed.ts` run three times in a row without `--reset` against a fresh temp-file DB all exited 0 with identical row counts (`categorias=3, contactos=3, proyectos=3, proyecto_contactos=4, inspiraciones=5`); `--reset` still wipes and reseeds correctly. See `apply-progress.md`'s "Verify-Fix" section for full detail.
2. **`vincularContacto` contradicts `project-data-model` spec.** Spec requires a duplicate `(proyecto_id, contacto_id)` insert be rejected as a primary key violation; the implementation is explicitly idempotent (`onConflictDoNothing`), and this was a design-time decision (design.md), not just an apply-time slip. No test proves the spec's literal scenario; the existing test proves the opposite. Either update `project-data-model/spec.md` to document idempotent linking as the accepted behavior, or change `vincularContacto` to throw on duplicate insert.

### WARNING
1. `proposal.md`'s Success Criteria checklist was never updated (`[ ]` for all 6 items) despite apply-progress.md claiming full end-to-end verification with evidence. Documentation drift between the proposal artifact and the actual completion state.
2. `design.md`'s Schema table states `tiempo_estimado_h > 0`; the implemented/spec-correct constraint is `>= 0`. Correctly implemented per spec, but design.md itself is stale and should be corrected for future readers.

### SUGGESTION
1. Add a repository-level or schema-level test that directly proves (or documents as an intentional exception) the "Reject duplicate association" and "Re-run the seed script" scenarios so future readers do not have to cross-reference design.md/tasks.md to discover the intentional divergence from spec.md.

## Final Verdict (as originally issued)

**FAIL**

Rationale: two spec scenarios (one per capability: `project-data-model`, `data-seeding`) are directly contradicted by the shipped implementation and by the project's own passing test suite — the tests pass because they assert behavior opposite to the literal spec text, not because the spec scenario is satisfied. Per the verify skill's decision gate, a spec scenario with no passing *covering* test is CRITICAL; here the situation is worse — a test exists and passes, but it proves the inverse of the required behavior. This is not a build/test failure (all 50 tests genuinely pass and typecheck is clean) but a spec/implementation contract violation that must be resolved — either by correcting the two spec scenarios to match the accepted design decisions, or by correcting the implementation — before this change can be archived as spec-compliant.

## Verify-Fix Update

CRITICAL finding #1 (`data-seeding` — "Re-run the seed script") is now **RESOLVED**: `scripts/seed.ts` was corrected, per explicit user product decision, to make re-running without `--reset` an idempotent no-op (upsert on natural keys, no throw, no duplication, exit 0). See the CRITICAL Issues section above and `apply-progress.md`'s "Verify-Fix" section for full evidence (RED→GREEN TDD cycle, full suite, tsc, and a real 3x-in-a-row CLI run against a temp DB).

CRITICAL finding #2 (`project-data-model` — `vincularContacto`) was out of scope for this fix session. A pending, uncommitted edit to `specs/project-data-model/spec.md` (visible via `git status` at the time of this update) already renames the scenario to "Re-link an already-linked contacto is idempotent" and updates its Given/When/Then to match `vincularContacto`'s existing `onConflictDoNothing()` behavior, which would resolve finding #2 the same way — by accepting the implementation's idempotent behavior as the correct spec. That edit was not authored or committed by this fix session and its resolution status should be independently re-verified by the next `sdd-verify` pass.

A full re-run of `sdd-verify` is recommended to produce an updated, authoritative Final Verdict reflecting both findings' current state.
