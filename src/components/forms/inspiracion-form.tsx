"use client";

import { useActionState } from "react";
import { TIPOS_REFERENCIA } from "@/db/schema";
import type { ActionResult } from "@/lib/forms/result";
import { FormError } from "./form-error";

type InspiracionFormAction = (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult>;

type InspiracionFormProps = {
  action: InspiracionFormAction;
};

/**
 * Inline "add inspiracion" form on the proyecto detail page
 * (`project-authoring` §Inspiraciones Sub-Management). No inline editing is
 * offered for an existing inspiracion — this form only creates new rows.
 */
export function InspiracionForm({ action }: InspiracionFormProps) {
  const [result, formAction] = useActionState<ActionResult | null, FormData>(action, null);

  return (
    <form action={formAction} data-testid="inspiracion-form">
      <FormError result={result} />

      <label htmlFor="url_origen">URL de origen</label>
      <input id="url_origen" name="url_origen" type="url" />

      <label htmlFor="tipo_referencia">Tipo de referencia</label>
      <select id="tipo_referencia" name="tipo_referencia" defaultValue={TIPOS_REFERENCIA[0]}>
        {TIPOS_REFERENCIA.map((tipo) => (
          <option key={tipo} value={tipo}>
            {tipo}
          </option>
        ))}
      </select>

      <label htmlFor="notas">Notas</label>
      <input id="notas" name="notas" />

      <button type="submit">Agregar inspiración</button>
    </form>
  );
}
