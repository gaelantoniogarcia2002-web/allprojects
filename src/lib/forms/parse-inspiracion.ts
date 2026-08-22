import { TIPOS_REFERENCIA, type TipoReferencia } from "@/db/schema";
import type { NuevaInspiracion } from "@/db/types";
import type { ParseResult } from "./result";

export type InspiracionFormInput = Omit<NuevaInspiracion, "proyectoId">;

/**
 * Pure `FormData → ParseResult<InspiracionFormInput>` parser for the
 * proyecto detail page's "add inspiracion" form (`project-authoring`
 * §Inspiraciones Sub-Management). `url_origen` and `tipo_referencia` are
 * `snake_case`, matching the spec scenarios and `parseProyecto`'s
 * convention; `notas` is optional and collapses to `null` when blank.
 */
export function parseInspiracion(formData: FormData): ParseResult<InspiracionFormInput> {
  const fieldErrors: Record<string, string> = {};

  const urlOrigen = String(formData.get("url_origen") ?? "").trim();
  if (!urlOrigen) {
    fieldErrors.url_origen = "La URL de origen es obligatoria.";
  }

  const tipoReferenciaRaw = String(formData.get("tipo_referencia") ?? "");
  if (!TIPOS_REFERENCIA.includes(tipoReferenciaRaw as TipoReferencia)) {
    fieldErrors.tipo_referencia = "Selecciona un tipo de referencia válido.";
  }

  const notasRaw = formData.get("notas");
  const notas = notasRaw === null || String(notasRaw).trim() === "" ? null : String(notasRaw);

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Revisa los campos marcados.", fieldErrors };
  }

  return {
    ok: true,
    value: {
      urlOrigen,
      tipoReferencia: tipoReferenciaRaw as TipoReferencia,
      notas,
    },
  };
}
