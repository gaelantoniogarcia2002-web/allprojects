import type { NuevaCategoria, NuevoContacto } from "@/db/types";
import type { ParseResult } from "./result";

const HEX_COLOR_PATTERN = /^#?[0-9a-fA-F]{3,8}$/;

/**
 * Pure `FormData → ParseResult<NuevaCategoria>` parser for the `/categorias`
 * edit form (`taxonomy-management` §Categoria List, Edit and Delete Screen).
 * `nombre` is required; `color` is required and must look like a hex color.
 */
export function parseCategoria(formData: FormData): ParseResult<NuevaCategoria> {
  const fieldErrors: Record<string, string> = {};

  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) {
    fieldErrors.nombre = "El nombre es obligatorio.";
  }

  const color = String(formData.get("color") ?? "").trim();
  if (!color) {
    fieldErrors.color = "El color es obligatorio.";
  } else if (!HEX_COLOR_PATTERN.test(color)) {
    fieldErrors.color = "El color debe ser un valor hexadecimal válido.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Revisa los campos marcados.", fieldErrors };
  }

  return { ok: true, value: { nombre, color } };
}

/**
 * Pure `FormData → ParseResult<NuevoContacto>` parser for the `/contactos`
 * edit form. `nombre` is required; `url` is optional and blank collapses
 * to `null`.
 */
export function parseContacto(formData: FormData): ParseResult<NuevoContacto> {
  const fieldErrors: Record<string, string> = {};

  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) {
    fieldErrors.nombre = "El nombre es obligatorio.";
  }

  const urlRaw = formData.get("url");
  const url = urlRaw === null || String(urlRaw).trim() === "" ? null : String(urlRaw).trim();

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Revisa los campos marcados.", fieldErrors };
  }

  return { ok: true, value: { nombre, url } };
}
