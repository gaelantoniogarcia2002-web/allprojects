/**
 * Thrown when attempting to delete a `Categoria` that is still referenced
 * by at least one `Proyecto` (FK `RESTRICT` on `proyectos.categoria_id`).
 */
export class CategoriaEnUsoError extends Error {
  constructor(categoriaId: number) {
    super(`Categoria ${categoriaId} is still referenced by at least one Proyecto and cannot be deleted.`);
    this.name = "CategoriaEnUsoError";
  }
}

/**
 * Thrown when a lookup by id does not match any row.
 */
export class NotFoundError extends Error {
  constructor(entity: string, id: number) {
    super(`${entity} with id ${id} was not found.`);
    this.name = "NotFoundError";
  }
}
