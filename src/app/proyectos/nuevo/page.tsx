import { getDb } from "@/db/client";
import { listCategorias, listContactos } from "@/db/repositories";
import { ProyectoForm } from "@/components/forms/proyecto-form";
import { crearProyectoAction } from "./actions";

/**
 * Create form at `/proyectos/nuevo` (`project-authoring` §Proyecto Creation
 * Form). Async Server Component that loads categorias/contactos for the
 * form's select/checkbox inputs and hands `crearProyectoAction` to the
 * shared `ProyectoForm`.
 */
export default async function NuevoProyectoPage() {
  const db = getDb();
  const categorias = listCategorias(db);
  const contactos = listContactos(db);

  return (
    <main>
      <h1>Nuevo proyecto</h1>
      <ProyectoForm
        action={crearProyectoAction}
        categorias={categorias}
        contactos={contactos}
        submitLabel="Crear proyecto"
      />
    </main>
  );
}
