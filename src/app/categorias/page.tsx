import { getDb } from "@/db/client";
import { listCategorias } from "@/db/repositories/categorias";
import { CategoriaRow } from "@/components/forms/categoria-row";
import { editarCategoriaAction, eliminarCategoriaAction } from "./actions";

/**
 * Standalone categoria list/edit/delete screen
 * (`taxonomy-management` §Categoria List, Edit and Delete Screen). Each row
 * carries its own inline edit form and a delete button gated by
 * `ConfirmSubmitButton`; a `CategoriaEnUsoError` delete failure renders
 * inline next to the row via `CategoriaRow`'s own `useActionState`.
 */
export default async function CategoriasPage() {
  const db = getDb();
  const categorias = listCategorias(db);

  return (
    <main>
      <h1>Categorías</h1>
      <ul data-testid="categorias-list">
        {categorias.map((categoria) => (
          <CategoriaRow
            key={categoria.id}
            categoria={categoria}
            editAction={editarCategoriaAction.bind(null, categoria.id)}
            deleteAction={eliminarCategoriaAction.bind(null, categoria.id)}
          />
        ))}
      </ul>
    </main>
  );
}
