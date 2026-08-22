import { and, eq, sql } from "drizzle-orm";
import type { Db } from "../client";
import { categorias, proyectoContactos, proyectos } from "../schema";
import type { Categoria, FiltroProyectos, NuevoProyecto, Proyecto, ProyectoConDetalle } from "../types";

/**
 * Persists a new proyecto. `tiempo_invertido_h` defaults to 0 at the
 * schema level when omitted from `input`.
 */
export function createProyecto(db: Db, input: NuevoProyecto): Proyecto {
  return db.insert(proyectos).values(input).returning().get();
}

/**
 * Lists proyectos joined with their categoria, optionally filtered by
 * estado, categoriaId and/or contactoId.
 */
export function listProyectos(
  db: Db,
  filtro: FiltroProyectos = {}
): (Proyecto & { categoria: Categoria })[] {
  const conditions = [];
  if (filtro.estado) conditions.push(eq(proyectos.estado, filtro.estado));
  if (filtro.categoriaId) conditions.push(eq(proyectos.categoriaId, filtro.categoriaId));
  if (filtro.contactoId) {
    conditions.push(
      sql`${proyectos.id} IN (SELECT ${proyectoContactos.proyectoId} FROM ${proyectoContactos} WHERE ${proyectoContactos.contactoId} = ${filtro.contactoId})`
    );
  }

  const rows = db
    .select({ proyecto: proyectos, categoria: categorias })
    .from(proyectos)
    .innerJoin(categorias, eq(proyectos.categoriaId, categorias.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .all();

  return rows.map((row) => ({ ...row.proyecto, categoria: row.categoria }));
}

/**
 * Fetches one proyecto with its nested categoria, contactos and
 * inspiraciones via Drizzle's relational query API (`db.query`), avoiding
 * manual joins / row-fanout deduplication. Returns `null` when not found.
 */
export function getProyectoConDetalle(db: Db, id: number): ProyectoConDetalle | null {
  const row = db.query.proyectos
    .findFirst({
      where: eq(proyectos.id, id),
      with: {
        categoria: true,
        inspiraciones: true,
        proyectoContactos: { with: { contacto: true } },
      },
    })
    .sync();

  if (!row) return null;

  const { proyectoContactos: links, ...proyecto } = row;
  return {
    ...proyecto,
    contactos: links.map((link) => link.contacto),
  };
}

/**
 * Applies a partial patch to a proyecto and bumps `updated_at` to the
 * current time.
 */
export function updateProyecto(db: Db, id: number, patch: Partial<NuevoProyecto>): Proyecto {
  return db
    .update(proyectos)
    .set({ ...patch, updatedAt: sql`(datetime('now'))` })
    .where(eq(proyectos.id, id))
    .returning()
    .get();
}

/**
 * Deletes a proyecto. `ON DELETE CASCADE` removes its `proyecto_contactos`
 * join rows and `inspiraciones` rows; `categorias`/`contactos` rows are
 * left untouched. Returns `false` when no proyecto with `id` exists.
 */
export function deleteProyecto(db: Db, id: number): boolean {
  const result = db.delete(proyectos).where(eq(proyectos.id, id)).run();
  return result.changes > 0;
}
