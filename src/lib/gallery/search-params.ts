import type { GalleryParams } from "./types";

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseId(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && value.trim() !== "" ? parsed : undefined;
}

function parseSeleccion(value: string | undefined): number[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "" && Number.isFinite(Number(entry)))
    .map((entry) => Number(entry));
}

/**
 * Parses gallery filter/comparison state from URL search params.
 * Invalid or non-numeric values are dropped silently (never thrown), so a
 * hand-edited URL degrades to the unfiltered gallery instead of erroring.
 */
export function parseGalleryParams(sp: RawSearchParams): GalleryParams {
  return {
    categoriaId: parseId(firstValue(sp.categoria)),
    contactoId: parseId(firstValue(sp.contacto)),
    comparisonMode: firstValue(sp.modo) === "comparar",
    seleccion: parseSeleccion(firstValue(sp.seleccion)),
  };
}

/**
 * Builds a shareable gallery URL from the current params merged with a
 * partial patch. Round-trips through parseGalleryParams.
 */
export function buildGalleryHref(current: GalleryParams, patch: Partial<GalleryParams>): string {
  const merged: GalleryParams = { ...current, ...patch };
  const params = new URLSearchParams();

  if (merged.categoriaId !== undefined) params.set("categoria", String(merged.categoriaId));
  if (merged.contactoId !== undefined) params.set("contacto", String(merged.contactoId));
  if (merged.comparisonMode) params.set("modo", "comparar");
  if (merged.seleccion.length > 0) params.set("seleccion", merged.seleccion.join(","));

  const query = params.toString();
  return query ? `/?${query}` : "/";
}
