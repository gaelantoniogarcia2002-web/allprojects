"use client";

import { useActionState } from "react";
import type { Contacto } from "@/db/types";
import type { ActionResult } from "@/lib/forms/result";
import { FormError } from "./form-error";
import { ConfirmSubmitButton } from "./confirm-submit-button";

type ContactoEditAction = (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult>;
type ContactoDeleteAction = () => Promise<ActionResult>;

type ContactoRowProps = {
  contacto: Contacto;
  editAction: ContactoEditAction;
  deleteAction: ContactoDeleteAction;
};

/**
 * One `/contactos` row: an inline edit form and a delete form gated by a
 * single `ConfirmSubmitButton` confirmation (`taxonomy-management`
 * §Contacto Deletion Is Always Allowed).
 */
export function ContactoRow({ contacto, editAction, deleteAction }: ContactoRowProps) {
  const [editResult, editFormAction] = useActionState<ActionResult | null, FormData>(editAction, null);
  const [deleteResult, deleteFormAction] = useActionState<ActionResult | null, FormData>(
    async () => deleteAction(),
    null
  );

  return (
    <li data-testid="contacto-row">
      <form action={editFormAction} data-testid="contacto-edit-form">
        <FormError result={editResult} />

        <label htmlFor={`contacto-nombre-${contacto.id}`}>Nombre</label>
        <input id={`contacto-nombre-${contacto.id}`} name="nombre" defaultValue={contacto.nombre} />

        <label htmlFor={`contacto-url-${contacto.id}`}>URL</label>
        <input id={`contacto-url-${contacto.id}`} name="url" type="url" defaultValue={contacto.url ?? ""} />

        <button type="submit">Guardar</button>
      </form>

      <form action={deleteFormAction} data-testid="contacto-delete-form">
        <FormError result={deleteResult} />
        <ConfirmSubmitButton confirmMessage="¿Eliminar este contacto?">Eliminar</ConfirmSubmitButton>
      </form>
    </li>
  );
}
