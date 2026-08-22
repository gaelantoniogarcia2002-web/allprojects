# Design: Visual Project Database — Data Layer Bootstrap (Fase 1)

## Technical Approach

Drizzle schema in `src/db/schema.ts` is the single source of truth; `drizzle-kit` generates SQL migrations into `drizzle/`. A `better-sqlite3` client applies `PRAGMA foreign_keys = ON` on every connection. All queries live in `src/db/repositories/*`, which export plain typed functions over domain types — Drizzle never escapes that boundary, so Fase 2 UI code imports repositories only. Tests (Vitest) run each suite against a fresh `:memory:` database created by the same migration files used in dev, so constraint tests validate real production DDL.

Enums (`estado`, `frecuencia_avance`, `tipo_referencia`) are `text` columns with `CHECK` constraints plus TS union types — SQLite has no native enum. Referential rules: `proyectos.categoria_id` → `RESTRICT` (a used category cannot be deleted); `proyecto_contactos` and `inspiraciones` → `ON DELETE CASCADE` from `proyectos`; `proyecto_contactos.contacto_id` → `ON DELETE CASCADE` (deleting a contact removes only its links).

## Architecture Decisions

| Decision | Choice | Alternatives rejected | Rationale |
|---|---|---|---|
| Persistence | SQLite file via `better-sqlite3` | JSON file; Supabase | Relational integrity + joins for filters/comparison; zero network, single local user (spec.md §1, §4) |
| ORM | Drizzle ORM + drizzle-kit | Prisma; raw SQL | TS-first inferred types, SQL-shaped migrations, no codegen daemon; raw SQL loses type inference |
| Enums | `text` + `CHECK` | Lookup tables; app-only validation | DB is last line of defense; values are closed and stable, tables would add joins for no gain |
| Category delete | FK `RESTRICT` | `CASCADE`; nullable FK | Deleting a category must never silently destroy projects; category is required for card tinting |
| DB boundary | Repository module | Direct Drizzle in components/routes | Keeps swap of driver (`node:sqlite`/libsql fallback risk) local; UI depends on domain types only |
| Test DB | `:memory:` + real migrations | Mocks; shared dev file | Constraint behavior (CHECK/FK/cascade) is untestable with mocks; per-suite isolation, no cleanup |
| Return style | Throw typed errors (`CategoriaEnUsoError`) | Return `Result` unions | Matches better-sqlite3's synchronous throwing API; avoids double error channel |

Deferred (out of Fase 1 scope, per proposal): gallery masonry/proportional sizing, progress fill and comparison rendering are **not** designed here; `openspec/config.yaml` `rules.design` requires that rendering design in the Fase 2 change.

## File Structure

```
allprojects/
├── package.json              scripts: dev build test db:generate db:migrate db:seed
├── tsconfig.json  next.config.ts  postcss.config.mjs  .gitignore
├── drizzle.config.ts         dialect sqlite, schema src/db/schema.ts, out drizzle/
├── vitest.config.ts          environment jsdom, setupFiles tests/setup.ts
├── drizzle/                  GENERATED migrations + meta/
├── scripts/
│   ├── migrate.ts            applies drizzle/ to DATABASE_URL
│   └── seed.ts               2–3 fictitious projects
├── src/
│   ├── app/layout.tsx  page.tsx  globals.css      placeholder only
│   └── db/
│       ├── schema.ts         5 tables + relations
│       ├── client.ts         createDb() / getDb(), FK pragma
│       ├── types.ts          inferred + composite domain types
│       ├── errors.ts         CategoriaEnUsoError, NotFoundError
│       └── repositories/     proyectos.ts categorias.ts contactos.ts inspiraciones.ts index.ts
└── tests/
    ├── setup.ts  helpers/test-db.ts               makeTestDb(): in-memory + migrate
    ├── schema/constraints.test.ts                 enums, FK, cascade, RESTRICT, UNIQUE
    └── repositories/*.test.ts
```

## Schema (`src/db/schema.ts`)

| Table | Columns | Constraints |
|---|---|---|
| `categorias` | `id` PK autoinc, `nombre` text NOT NULL, `color` text NOT NULL | `unique(nombre)` |
| `contactos` | `id` PK autoinc, `nombre` text NOT NULL, `url` text | — |
| `proyectos` | `id` PK autoinc, `titulo`, `estado`, `categoria_id`, `tiempo_estimado_h` real NOT NULL, `tiempo_invertido_h` real NOT NULL default 0, `frecuencia_avance`, `monto_pago` real null, `carpeta_drive_url` null, `repositorio_gh_url` null, `created_at`/`updated_at` text NOT NULL default `(datetime('now'))` | CHECK `estado IN (...)`, CHECK `frecuencia_avance IN (...)`, CHECK `tiempo_estimado_h > 0`, CHECK `tiempo_invertido_h >= 0`, FK `categoria_id → categorias.id ON DELETE RESTRICT`, index on `categoria_id`, index on `estado` |
| `proyecto_contactos` | `proyecto_id`, `contacto_id` | composite PK, both FK `ON DELETE CASCADE` |
| `inspiraciones` | `id` PK autoinc, `proyecto_id`, `url_origen` NOT NULL, `tipo_referencia`, `notas` null, `created_at` default | CHECK `tipo_referencia IN (...)`, FK `proyecto_id → proyectos.id ON DELETE CASCADE`, index on `proyecto_id` |

Enum tuples are exported as `const` arrays and reused for both the CHECK expression and the TS union, so DDL and types cannot drift:

```ts
export const ESTADOS = ['idea','en_desarrollo','pausado','finalizado'] as const
export type Estado = (typeof ESTADOS)[number]
```

## Interfaces

```ts
// src/db/client.ts
export type Db = BetterSQLite3Database<typeof schema>
export function createDb(url: string): { db: Db; close(): void } // sets PRAGMA foreign_keys = ON
export function getDb(): Db                                      // process singleton, DATABASE_URL

// src/db/types.ts
export type Proyecto = typeof proyectos.$inferSelect
export type NuevoProyecto = Omit<typeof proyectos.$inferInsert, 'id'|'createdAt'|'updatedAt'>
export type ProyectoConDetalle = Proyecto & {
  categoria: Categoria; contactos: Contacto[]; inspiraciones: Inspiracion[]
}
export type FiltroProyectos = { estado?: Estado; categoriaId?: number; contactoId?: number }

// src/db/repositories/proyectos.ts   (every fn takes Db first — no hidden global)
createProyecto(db: Db, input: NuevoProyecto): Proyecto
listProyectos(db: Db, filtro?: FiltroProyectos): (Proyecto & { categoria: Categoria })[]
getProyectoConDetalle(db: Db, id: number): ProyectoConDetalle | null
updateProyecto(db: Db, id: number, patch: Partial<NuevoProyecto>): Proyecto   // bumps updatedAt
deleteProyecto(db: Db, id: number): boolean                                    // cascades

// categorias.ts
createCategoria(db, input: NuevaCategoria): Categoria
listCategorias(db): Categoria[]
deleteCategoria(db, id: number): void        // throws CategoriaEnUsoError on FK RESTRICT

// contactos.ts
createContacto(db, input: NuevoContacto): Contacto
listContactos(db): Contacto[]
vincularContacto(db, proyectoId: number, contactoId: number): void   // idempotent (composite PK)
desvincularContacto(db, proyectoId: number, contactoId: number): void
deleteContacto(db, id: number): boolean

// inspiraciones.ts
createInspiracion(db, input: NuevaInspiracion): Inspiracion
listInspiracionesPorProyecto(db, proyectoId: number): Inspiracion[]
deleteInspiracion(db, id: number): boolean
```

`getProyectoConDetalle` uses one Drizzle relational query (`db.query.proyectos.findFirst({ with: {...} })`) instead of manual joins, avoiding row-fanout deduplication.

## Data Flow

```
schema.ts ──drizzle-kit generate──→ drizzle/*.sql ──migrate()──→ SQLite file
                                                                     │
seed.ts ──→ repositories ──→ Drizzle ──→ better-sqlite3 ────────────┤
                                                                     │
future UI (Fase 2) ──→ repositories ──→ domain types ←───────────────┘
tests ──→ makeTestDb(':memory:') ──migrate()──→ repositories
```

## Seed Script (`scripts/seed.ts`)

Single `db.transaction`: optional `--reset` deletes rows child-first; inserts 3 categorías (distinct hex colors), 3 contactos, 3 proyectos covering distinct `estado`/`frecuencia_avance` values including one over-budget case (`tiempo_invertido_h > tiempo_estimado_h`) and one `monto_pago: null`, links contacts, adds 1–3 inspiraciones per project spanning all `tipo_referencia` values. Data is declared as typed literal arrays and inserted through the repository functions, so the seed doubles as an integration exercise of the public API. Re-running without `--reset` fails loudly on `UNIQUE(nombre)` rather than silently duplicating.

## Migrations

`npm run db:generate` → `drizzle-kit generate` diffs `schema.ts` against `drizzle/meta/_journal.json` and emits a numbered SQL file. `npm run db:migrate` → `tsx scripts/migrate.ts`, which opens the client and calls `migrate(db, { migrationsFolder: 'drizzle' })`. Generated SQL is committed and reviewed; migrations are never hand-edited after being applied. Tests call the same `migrate()` on `:memory:`, so a missing regenerated migration fails the suite.

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit (schema) | Enum CHECKs reject invalid values; NOT NULL; `UNIQUE(nombre)`; positive-hours CHECKs | Direct inserts on `makeTestDb()`, assert throw |
| Unit (FK) | FK enforcement active; category RESTRICT; project→inspiraciones/join CASCADE; contacto delete removes links but not projects | Insert fixtures, delete, assert row counts |
| Integration (repos) | Each function's happy path + error path; `getProyectoConDetalle` returns nested category/contacts/inspirations; filters by estado/categoria/contacto | Per-test in-memory DB, real migrations |
| Integration (seed) | Seed loads 3 projects with links; `--reset` is re-runnable | Run seed against temp file DB, assert counts |
| Component | Placeholder page renders | React Testing Library smoke test |

Strict TDD: every schema constraint and repository function starts as a RED test. Generated scaffold (Next.js/Tailwind config) is exempt boilerplate.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. Scripts are developer-invoked npm tasks with no external input.

## Migration / Rollout

No data migration — greenfield, no existing database. Rollback per proposal: delete generated directories and the `*.db` file.

## Open Questions

- [ ] `better-sqlite3` native rebuild on the local Node version — if it fails, fall back to `node:sqlite` (Node 22+) behind the same `createDb()` boundary; decide at first task.
- [ ] `DATABASE_URL` default location (`./data/allprojects.db`) — confirm during apply.
