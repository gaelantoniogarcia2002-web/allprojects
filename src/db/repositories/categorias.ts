import { eq } from "drizzle-orm";
import type { Db } from "../client";
import { categorias } from "../schema";
import type { Categoria, NuevaCategoria } from "../types";
import { CategoriaEnUsoError, NotFoundError } from "../errors";

export function createCategoria(db: Db, input: NuevaCategoria): Categoria {
  return db.insert(categorias).values(input).returning().get();
}

export function listCategorias(db: Db): Categoria[] {
  return db.select().from(categorias).all();
}

/**
 * Applies a partial patch (`nombre` and/or `color`) to a categoria.
 * Throws `NotFoundError` when no categoria with `id` exists.
 */
export function updateCategoria(db: Db, id: number, patch: Partial<NuevaCategoria>): Categoria {
  const updated = db.update(categorias).set(patch).where(eq(categorias.id, id)).returning().get();
  if (!updated) {
    throw new NotFoundError("Categoria", id);
  }
  return updated;
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
