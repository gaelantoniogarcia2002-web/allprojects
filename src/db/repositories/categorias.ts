import { eq } from "drizzle-orm";
import type { Db } from "../client";
import { categorias } from "../schema";
import type { Categoria, NuevaCategoria } from "../types";
import { CategoriaEnUsoError } from "../errors";

export function createCategoria(db: Db, input: NuevaCategoria): Categoria {
  return db.insert(categorias).values(input).returning().get();
}

export function listCategorias(db: Db): Categoria[] {
  return db.select().from(categorias).all();
}

/**
 * Deletes a categoria. Throws `CategoriaEnUsoError` when the delete is
 * rejected by the `categoria_id` FK `RESTRICT` because at least one
 * `Proyecto` still references it.
 */
export function deleteCategoria(db: Db, id: number): void {
  try {
    db.delete(categorias).where(eq(categorias.id, id)).run();
  } catch (err) {
    if (isForeignKeyConstraintError(err)) {
      throw new CategoriaEnUsoError(id);
    }
    throw err;
  }
}

function isForeignKeyConstraintError(err: unknown): boolean {
  return (
    err instanceof Error &&
    "code" in err &&
    typeof (err as { code?: unknown }).code === "string" &&
    (err as { code: string }).code.startsWith("SQLITE_CONSTRAINT") &&
    /FOREIGN KEY constraint failed/i.test(err.message)
  );
}
