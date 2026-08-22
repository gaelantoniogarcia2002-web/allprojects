# Exploration: Base de Datos Visual de Proyectos — Initial Architecture

## Current State

Greenfield: `/home/gael/allprojects` contains only `spec.md`, `openspec/config.yaml`, `.atl/skill-registry.md`. No `package.json`, no git repo, no existing code.

Spec facts that drive the decision:
- Single personal user, no auth (spec.md §1, §4).
- Persistence explicitly `[Por definir: Local SQLite / JSON / Supabase]` (spec.md §4).
- Entity Proyecto has many Inspiración (spec.md §2) — one-to-many.
- UI needs proportional masonry sizing, computed progress fill, category-tinted transparency, filters (category, contact), and a 2+-item comparison view (spec.md §3).
- `strict_tdd: true` is enabled globally but no test runner chosen yet.

## Approaches Considered

**A. Frontend + persistence stack**

1. Next.js (App Router) + TypeScript + Tailwind, SQLite via `better-sqlite3` + Drizzle ORM, Route Handlers as thin local API — **recommended**.
2. Vite + React SPA + JSON file, no backend — low effort, weak querying/relational integrity.
3. Next.js/React + Supabase — adds cloud/auth surface not required by a single-user local spec.

**B. Category/contact modeling**

1. Normalize `categoria` and `contacto` into their own lookup tables — recommended (deterministic UI color per category, clean contact filtering, reusable contacts).
2. Keep as free text / JSON array exactly as spec'd — faster but weaker filtering/color consistency.

## Recommendation

Next.js (App Router) + TypeScript + Tailwind CSS, Route Handlers as thin local API, SQLite (via `better-sqlite3` + Drizzle ORM for schema/migrations). Normalize `categoria` and `contacto` into lookup tables.

## Proposed Schema

```sql
proyectos
  id                 INTEGER PK
  titulo             TEXT NOT NULL
  estado             TEXT NOT NULL CHECK (estado IN ('idea','en_desarrollo','pausado','finalizado'))
  categoria_id       INTEGER NOT NULL REFERENCES categorias(id)
  tiempo_estimado_h  REAL NOT NULL
  tiempo_invertido_h REAL NOT NULL DEFAULT 0
  frecuencia_avance  TEXT NOT NULL CHECK (frecuencia_avance IN ('diario','semanal','ocasional'))
  monto_pago         REAL
  carpeta_drive_url  TEXT
  repositorio_gh_url TEXT
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
  updated_at         TEXT NOT NULL DEFAULT (datetime('now'))

categorias
  id      INTEGER PK
  nombre  TEXT NOT NULL UNIQUE
  color   TEXT NOT NULL

contactos
  id      INTEGER PK
  nombre  TEXT NOT NULL
  url     TEXT

proyecto_contactos
  proyecto_id  INTEGER NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE
  contacto_id  INTEGER NOT NULL REFERENCES contactos(id) ON DELETE CASCADE
  PRIMARY KEY (proyecto_id, contacto_id)

inspiraciones
  id                INTEGER PK
  proyecto_id       INTEGER NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE
  url_origen        TEXT NOT NULL
  tipo_referencia   TEXT NOT NULL CHECK (tipo_referencia IN ('diseno_ui','stack_tecnologico','funcionalidad','otro'))
  notas             TEXT
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
```

## Open Questions (require user confirmation before sdd-propose)

1. Persistence: SQLite (recommended) vs. JSON vs. Supabase.
2. Normalize categoria/contacto into tables (recommended) vs. free-text/array fields as literally spec'd.
3. Deployment target: local dev only, self-hosted, or packaged desktop (Tauri)?
4. Frontend stack: Next.js + TS + Tailwind (recommended) vs. other preference.
5. Test runner for strict TDD: Vitest + React Testing Library (recommended default).
6. `Monto/Pago`: single currency assumed, or needs a currency field?

## Ready for Proposal

Yes — pending the six confirmations above, which materially affect the bootstrap task list.
