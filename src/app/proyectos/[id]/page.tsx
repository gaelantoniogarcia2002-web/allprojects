import { notFound } from "next/navigation";
import { getDb } from "@/db/client";
import { getProyectoConDetalle } from "@/db/repositories/proyectos";
import { listCategorias, listContactos } from "@/db/repositories";
import { ProyectoForm } from "@/components/forms/proyecto-form";
import { InspiracionForm } from "@/components/forms/inspiracion-form";
import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import {
  editarProyectoAction,
  eliminarProyectoAction,
  agregarInspiracionAction,
  eliminarInspiracionAction,
} from "./actions";

type ProyectoDetallePageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Detail/edit/delete page at `/proyectos/[id]` (`project-authoring`
 * §Proyecto Detail, Edit and Delete). Reuses `ProyectoForm` pre-filled via
 * `defaultValues`/`selectedContactoIds`, renders the inspiraciones sub-list
 * with an inline add form and a delete button per row, and a
 * delete-proyecto button gated by `ConfirmSubmitButton`'s single
 * confirmation step. `notFound()` covers a missing/invalid id at page load;
 * the mutation actions themselves catch `NotFoundError` for a row deleted
 * concurrently.
 */
export default async function ProyectoDetallePage({ params }: ProyectoDetallePageProps) {
  const { id } = await params;
  const proyectoId = Number(id);
  const db = getDb();
  const proyecto = Number.isFinite(proyectoId) ? getProyectoConDetalle(db, proyectoId) : null;

  if (!proyecto) {
    notFound();
  }

  const categorias = listCategorias(db);
  const contactos = listContactos(db);

  async function eliminarInspiracion(inspiracionId: number, _formData: FormData) {
    "use server";
    await eliminarInspiracionAction(inspiracionId);
  }

  async function eliminarProyecto(_formData: FormData) {
    "use server";
    await eliminarProyectoAction(proyectoId);
  }

  return (
    <main>
      <h1>{proyecto.titulo}</h1>

      <ProyectoForm
        action={editarProyectoAction.bind(null, proyectoId)}
        categorias={categorias}
        contactos={contactos}
        defaultValues={proyecto}
        selectedContactoIds={proyecto.contactos.map((contacto) => contacto.id)}
        submitLabel="Guardar cambios"
      />

      <section aria-label="Inspiraciones">
        <h2>Inspiraciones</h2>
        <ul data-testid="inspiraciones-list">
          {proyecto.inspiraciones.map((inspiracion) => (
            <li key={inspiracion.id}>
              <a href={inspiracion.urlOrigen}>{inspiracion.urlOrigen}</a> ({inspiracion.tipoReferencia})
              <form action={eliminarInspiracion.bind(null, inspiracion.id)}>
                <button type="submit">Eliminar inspiración</button>
              </form>
            </li>
          ))}
        </ul>

        <InspiracionForm action={agregarInspiracionAction.bind(null, proyectoId)} />
      </section>

      <form action={eliminarProyecto}>
        <ConfirmSubmitButton confirmMessage="¿Eliminar este proyecto? Esta acción no se puede deshacer.">
          Eliminar proyecto
        </ConfirmSubmitButton>
      </form>
    </main>
  );
}
