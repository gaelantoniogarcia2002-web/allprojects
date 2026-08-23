import { ESTADOS, FRECUENCIAS_AVANCE, type Estado, type FrecuenciaAvance } from "@/db/schema";
import type { NuevoProyecto } from "@/db/types";
import type { ParseResult } from "./result";

export type ProyectoFormInput = NuevoProyecto & { contactoIds: number[] };

/**
 * Pure `FormData → ParseResult<ProyectoFormInput>` parser. Field names match
 * the create/edit form (`titulo`, `categoria_id`, ...) and are `snake_case`
 * per the Project Authoring spec; the returned value uses the repository's
 * `camelCase` shape. Never touches the database — `categoria_id` existence
 * is validated by the FK constraint at insert time (`toActionError`).
 */
export function parseProyecto(formData: FormData): ParseResult<ProyectoFormInput> {
  const fieldErrors: Record<string, string> = {};

  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!titulo) {
    fieldErrors.titulo = "El título es obligatorio.";
  }

  const estadoRaw = String(formData.get("estado") ?? "");
  if (!ESTADOS.includes(estadoRaw as Estado)) {
    fieldErrors.estado = "Selecciona un estado válido.";
  }

  const frecuenciaRaw = String(formData.get("frecuencia_avance") ?? "");
  if (!FRECUENCIAS_AVANCE.includes(frecuenciaRaw as FrecuenciaAvance)) {
    fieldErrors.frecuencia_avance = "Selecciona una frecuencia de avance válida.";
  }

  const categoriaIdRaw = formData.get("categoria_id");
  const categoriaId = Number(categoriaIdRaw);
  if (categoriaIdRaw === null || String(categoriaIdRaw).trim() === "" || !Number.isFinite(categoriaId)) {
    fieldErrors.categoria_id = "Selecciona una categoría.";
  }

  const tiempoEstimadoH = Number(formData.get("tiempo_estimado_h"));
  if (!Number.isFinite(tiempoEstimadoH) || tiempoEstimadoH < 0) {
    fieldErrors.tiempo_estimado_h = "El tiempo estimado debe ser un número mayor o igual a 0.";
  }

  const tiempoInvertidoHRaw = formData.get("tiempo_invertido_h");
  const tiempoInvertidoH =
    tiempoInvertidoHRaw === null || String(tiempoInvertidoHRaw).trim() === "" ? 0 : Number(tiempoInvertidoHRaw);
  if (!Number.isFinite(tiempoInvertidoH) || tiempoInvertidoH < 0) {
    fieldErrors.tiempo_invertido_h = "El tiempo invertido debe ser un número mayor o igual a 0.";
  }

  const montoPagoRaw = formData.get("monto_pago");
  const montoPago = montoPagoRaw === null || String(montoPagoRaw).trim() === "" ? null : Number(montoPagoRaw);
  if (montoPago !== null && !Number.isFinite(montoPago)) {
    fieldErrors.monto_pago = "El monto de pago debe ser un número.";
  }

  const carpetaDriveUrlRaw = formData.get("carpeta_drive_url");
  const carpetaDriveUrl =
    carpetaDriveUrlRaw === null || String(carpetaDriveUrlRaw).trim() === "" ? null : String(carpetaDriveUrlRaw);

  const repositorioGhUrlRaw = formData.get("repositorio_gh_url");
  const repositorioGhUrl =
    repositorioGhUrlRaw === null || String(repositorioGhUrlRaw).trim() === "" ? null : String(repositorioGhUrlRaw);

  const contactoIds = formData
    .getAll("contactoId")
    .map((value) => Number(value))
    .filter((id) => Number.isFinite(id));

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Revisa los campos marcados.", fieldErrors };
  }

  return {
    ok: true,
    value: {
      titulo,
      estado: estadoRaw as Estado,
      categoriaId,
      tiempoEstimadoH,
      tiempoInvertidoH,
      frecuenciaAvance: frecuenciaRaw as FrecuenciaAvance,
      montoPago,
      carpetaDriveUrl,
      repositorioGhUrl,
      contactoIds,
    },
  };
}
