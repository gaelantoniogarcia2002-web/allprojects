"use client";

import { useActionState } from "react";
import { ESTADOS, FRECUENCIAS_AVANCE } from "@/db/schema";
import type { Categoria, Contacto, Proyecto } from "@/db/types";
import type { ActionResult } from "@/lib/forms/result";
import { ContactoCheckboxList } from "./contacto-checkbox-list";
import { FormError } from "./form-error";
import { ConfirmSubmitButton } from "./confirm-submit-button";

type ProyectoFormAction = (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult>;

type ProyectoFormProps = {
  action: ProyectoFormAction;
  categorias: Categoria[];
  contactos: Contacto[];
  defaultValues?: Partial<Proyecto>;
  selectedContactoIds?: number[];
  submitLabel?: string;
};

/**
 * Shared create/edit form body (`useActionState`-driven), reused by
 * `/proyectos/nuevo` now and `/proyectos/[id]` in Phase 3. `defaultValues`
 * and `selectedContactoIds` are omitted on create; the edit page passes the
 * existing proyecto and its linked contacto ids.
 */
export function ProyectoForm({
  action,
  categorias,
  contactos,
  defaultValues,
  selectedContactoIds = [],
  submitLabel = "Guardar",
}: ProyectoFormProps) {
  const [result, formAction] = useActionState<ActionResult | null, FormData>(action, null);

  return (
    <form action={formAction} data-testid="proyecto-form">
      <FormError result={result} />

      <label htmlFor="titulo">Título</label>
      <input id="titulo" name="titulo" defaultValue={defaultValues?.titulo ?? ""} />

      <label htmlFor="categoria_id">Categoría</label>
      <select id="categoria_id" name="categoria_id" defaultValue={defaultValues?.categoriaId ?? ""}>
        <option value="">Selecciona una categoría</option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.nombre}
          </option>
        ))}
      </select>

      <label htmlFor="estado">Estado</label>
      <select id="estado" name="estado" defaultValue={defaultValues?.estado ?? ESTADOS[0]}>
        {ESTADOS.map((estado) => (
          <option key={estado} value={estado}>
            {estado}
          </option>
        ))}
      </select>

      <label htmlFor="tiempo_estimado_h">Tiempo estimado (h)</label>
      <input
        id="tiempo_estimado_h"
        name="tiempo_estimado_h"
        type="number"
        step="0.5"
        defaultValue={defaultValues?.tiempoEstimadoH ?? ""}
      />

      <label htmlFor="tiempo_invertido_h">Tiempo invertido (h)</label>
      <input
        id="tiempo_invertido_h"
        name="tiempo_invertido_h"
        type="number"
        step="0.5"
        defaultValue={defaultValues?.tiempoInvertidoH ?? 0}
      />

      <label htmlFor="frecuencia_avance">Frecuencia de avance</label>
      <select
        id="frecuencia_avance"
        name="frecuencia_avance"
        defaultValue={defaultValues?.frecuenciaAvance ?? FRECUENCIAS_AVANCE[0]}
      >
        {FRECUENCIAS_AVANCE.map((frecuencia) => (
          <option key={frecuencia} value={frecuencia}>
            {frecuencia}
          </option>
        ))}
      </select>

      <label htmlFor="monto_pago">Monto de pago</label>
      <input id="monto_pago" name="monto_pago" type="number" step="0.01" defaultValue={defaultValues?.montoPago ?? ""} />

      <label htmlFor="carpeta_drive_url">Carpeta de Drive</label>
      <input
        id="carpeta_drive_url"
        name="carpeta_drive_url"
        type="url"
        defaultValue={defaultValues?.carpetaDriveUrl ?? ""}
      />

      <label htmlFor="repositorio_gh_url">Repositorio de GitHub</label>
      <input
        id="repositorio_gh_url"
        name="repositorio_gh_url"
        type="url"
        defaultValue={defaultValues?.repositorioGhUrl ?? ""}
      />

      <ContactoCheckboxList contactos={contactos} selectedIds={selectedContactoIds} />

      <ConfirmSubmitButton>{submitLabel}</ConfirmSubmitButton>
    </form>
  );
}
