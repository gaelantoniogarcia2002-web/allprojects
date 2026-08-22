import { eq } from "drizzle-orm";
import type { Db } from "../client";
import { inspiraciones } from "../schema";
import type { Inspiracion, NuevaInspiracion } from "../types";

export function createInspiracion(db: Db, input: NuevaInspiracion): Inspiracion {
  return db.insert(inspiraciones).values(input).returning().get();
}

export function listInspiracionesPorProyecto(db: Db, proyectoId: number): Inspiracion[] {
  return db.select().from(inspiraciones).where(eq(inspiraciones.proyectoId, proyectoId)).all();
}

export function deleteInspiracion(db: Db, id: number): boolean {
  const result = db.delete(inspiraciones).where(eq(inspiraciones.id, id)).run();
  return result.changes > 0;
}
