import { and, eq } from "drizzle-orm";
import type { Db } from "../client";
import { contactos, proyectoContactos } from "../schema";
import type { Contacto, NuevoContacto } from "../types";

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
 * Deletes a contacto. `ON DELETE CASCADE` on `proyecto_contactos.contacto_id`
 * removes only its join rows; referenced proyectos are left untouched.
 * Returns `false` when no contacto with `id` exists.
 */
export function deleteContacto(db: Db, id: number): boolean {
  const result = db.delete(contactos).where(eq(contactos.id, id)).run();
  return result.changes > 0;
}
