"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { parseGalleryParams, buildGalleryHref } from "@/lib/gallery/search-params";

/**
 * URL-driven "Modo Comparación" switch. Reads the active mode from
 * `useSearchParams()` and pushes a patched `buildGalleryHref` URL via
 * `useRouter().push(..., { scroll: false })`, following the same
 * self-contained pattern as `FilterBar` — the URL is the single source of
 * truth (`project-comparison` §Comparison Mode Toggle). Disabling the mode
 * also clears the current selection so a stale `seleccion` never lingers.
 */
export function ComparisonToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = parseGalleryParams(Object.fromEntries(searchParams.entries()));

  function handleChange(checked: boolean) {
    const href = checked
      ? buildGalleryHref(params, { comparisonMode: true })
      : buildGalleryHref(params, { comparisonMode: false, seleccion: [] });
    router.push(href, { scroll: false });
  }

  return (
    <label htmlFor="comparison-toggle">
      <input
        id="comparison-toggle"
        type="checkbox"
        checked={params.comparisonMode}
        onChange={(event) => handleChange(event.target.checked)}
      />
      Modo Comparación
    </label>
  );
}
