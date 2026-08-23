"use client";

import { useActionState } from "react";
import type { Categoria } from "@/db/types";
import type { ActionResult } from "@/lib/forms/result";
import { FormError } from "./form-error";
import { ConfirmSubmitButton } from "./confirm-submit-button";

type CategoriaEditAction = (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult>;
type CategoriaDeleteAction = () => Promise<ActionResult>;

type CategoriaRowProps = {
  categoria: Categoria;
  editAction: CategoriaEditAction;
  deleteAction: CategoriaDeleteAction;
};

/**
 * One `/categorias` row: an inline edit form and a delete form, each with
 * its own `useActionState` so a delete blocked by `CategoriaEnUsoError`
 * renders inline next to the row without touching the edit form's state
 * (`taxonomy-management` §Categoria Deletion Blocked When In Use).
 */
export function CategoriaRow({ categoria, editAction, deleteAction }: CategoriaRowProps) {
  const [editResult, editFormAction] = useActionState<ActionResult | null, FormData>(editAction, null);
  const [deleteResult, deleteFormAction] = useActionState<ActionResult | null, FormData>(
    async () => deleteAction(),
    null
  );

  return (
    <li data-testid="categoria-row">
      <form action={editFormAction} data-testid="categoria-edit-form">
        <FormError result={editResult} />

        <label htmlFor={`categoria-nombre-${categoria.id}`}>Nombre</label>
        <input id={`categoria-nombre-${categoria.id}`} name="nombre" defaultValue={categoria.nombre} />

        <label htmlFor={`categoria-color-${categoria.id}`}>Color</label>
        <input id={`categoria-color-${categoria.id}`} name="color" defaultValue={categoria.color} />

        <button type="submit">Guardar</button>
      </form>

      <form action={deleteFormAction} data-testid="categoria-delete-form">
        <FormError result={deleteResult} />
        <ConfirmSubmitButton confirmMessage="¿Eliminar esta categoría?">Eliminar</ConfirmSubmitButton>
      </form>
    </li>
  );
}
