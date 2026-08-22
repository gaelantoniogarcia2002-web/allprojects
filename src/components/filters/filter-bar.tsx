"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Categoria, Contacto } from "@/db/types";
import { parseGalleryParams, buildGalleryHref } from "@/lib/gallery/search-params";

type FilterBarProps = {
  categorias: Categoria[];
  contactos: Contacto[];
};

/**
 * URL-driven categoría/contacto filter controls. Reads the current filter
 * state from `useSearchParams()` and pushes a patched `buildGalleryHref`
 * URL via `useRouter().push(..., { scroll: false })` on change, so the
 * server component re-runs and re-renders the narrowed gallery. Never
 * fetches or holds filter state itself — the URL is the single source of
 * truth (`project-filtering` §URL-Driven, Shareable Filter State).
 */
export function FilterBar({ categorias, contactos }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = parseGalleryParams(Object.fromEntries(searchParams.entries()));

  function handleCategoriaChange(value: string) {
    const categoriaId = value === "" ? undefined : Number(value);
    router.push(buildGalleryHref(params, { categoriaId }), { scroll: false });
  }

  function handleContactoChange(value: string) {
    const contactoId = value === "" ? undefined : Number(value);
    router.push(buildGalleryHref(params, { contactoId }), { scroll: false });
  }

  return (
    <div data-testid="filter-bar">
      <label htmlFor="filter-categoria">Categoría</label>
      <select
        id="filter-categoria"
        value={params.categoriaId !== undefined ? String(params.categoriaId) : ""}
        onChange={(event) => handleCategoriaChange(event.target.value)}
      >
        <option value="">Todas las categorías</option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.nombre}
          </option>
        ))}
      </select>

      <label htmlFor="filter-contacto">Contacto</label>
      <select
        id="filter-contacto"
        value={params.contactoId !== undefined ? String(params.contactoId) : ""}
        onChange={(event) => handleContactoChange(event.target.value)}
      >
        <option value="">Todos los contactos</option>
        {contactos.map((contacto) => (
          <option key={contacto.id} value={contacto.id}>
            {contacto.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
