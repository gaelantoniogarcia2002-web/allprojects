"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { parseGalleryParams, buildGalleryHref } from "@/lib/gallery/search-params";

type SelectionCheckboxProps = {
  proyectoId: number;
};

/**
 * Per-card comparison-selection checkbox. Reads the current `seleccion`
 * list from `useSearchParams()` and pushes a patched `buildGalleryHref` URL
 * on toggle, following the same self-contained pattern as `FilterBar` and
 * `ComparisonToggle` (`project-comparison` §Multi-Select Proyecto
 * Selection). Only rendered by `ProyectoCard` while comparison mode is
 * active.
 */
export function SelectionCheckbox({ proyectoId }: SelectionCheckboxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = parseGalleryParams(Object.fromEntries(searchParams.entries()));
  const checked = params.seleccion.includes(proyectoId);

  function handleChange(nextChecked: boolean) {
    const seleccion = nextChecked
      ? [...params.seleccion, proyectoId]
      : params.seleccion.filter((id) => id !== proyectoId);
    router.push(buildGalleryHref(params, { seleccion }), { scroll: false });
  }

  return (
    <input
      type="checkbox"
      aria-label={`Seleccionar proyecto ${proyectoId} para comparar`}
      checked={checked}
      onChange={(event) => handleChange(event.target.checked)}
    />
  );
}
