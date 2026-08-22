import { and, eq } from "drizzle-orm";
import type { Db } from "../client";
import { contactos, proyectoContactos } from "../schema";
import type { Contacto, NuevoContacto } from "../types";
import { NotFoundError } from "../errors";

export function createContacto(db: Db, input: NuevoContacto): Contacto {
  return db.insert(contactos).values(input).returning().get();
}

export function listContactos(db: Db): Contacto[] {
  return db.select().from(contactos).all();
}

/**
 * Links a proyecto to a contacto. Idempotent: linking the same pair twice
 * leaves a single row (composite PK `(proyecto_id, contacto_id)`).
 */
export function vincularContacto(db: Db, proyectoId: number, contactoId: number): void {
  db
    .insert(proyectoContactos)
    .values({ proyectoId, contactoId })
    .onConflictDoNothing()
    .run();
}

/**
 * Unlinks a proyecto from a contacto. Idempotent: unlinking a pair that
 * was never linked is a no-op, not an error.
 */
export function desvincularContacto(db: Db, proyectoId: number, contactoId: number): void {
  db
    .delete(proyectoContactos)
    .where(and(eq(proyectoContactos.proyectoId, proyectoId), eq(proyectoContactos.contactoId, contactoId)))
    .run();
}

/**
 * Applies a partial patch (`nombre` and/or `url`) to a contacto.
 * Throws `NotFoundError` when no contacto with `id` exists.
 */
export function updateContacto(db: Db, id: number, patch: Partial<NuevoContacto>): Contacto {
  const updated = db.update(contactos).set(patch).where(eq(contactos.id, id)).returning().get();
  if (!updated) {
    throw new NotFoundError("Contacto", id);
  }
  return updated;
}

/**
 * Deletes a contacto. `ON DELETE CASCADE` on `proyecto_contactos.contacto_id`
 * removes only its join rows; referenced proyectos are left untouched.
 * Throws `NotFoundError` when no contacto with `id` exists.
 */
export function deleteContacto(db: Db, id: number): void {
  const result = db.delete(contactos).where(eq(contactos.id, id)).run();
  if (result.changes === 0) {
    throw new NotFoundError("Contacto", id);
  }
}
