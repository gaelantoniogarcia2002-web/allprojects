import { getDb } from "@/db/client";
import { listProyectos, listCategorias, listContactos } from "@/db/repositories";
import { parseGalleryParams } from "@/lib/gallery/search-params";
import { computeTileLayout } from "@/lib/gallery/tile-geometry";
import { computeProgress } from "@/lib/gallery/progress";
import { toTint, toSolid } from "@/lib/gallery/color";
import type { GalleryTile } from "@/lib/gallery/types";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { EmptyState } from "@/components/gallery/empty-state";
import { FilterBar } from "@/components/filters/filter-bar";

type RawSearchParams = Record<string, string | string[] | undefined>;

type HomeProps = {
  searchParams: Promise<RawSearchParams>;
};

/**
 * Async gallery Server Component (Fase 2). Reads filters from the URL,
 * loads proyectos/categorias/contactos via the existing repositories, maps
 * rows into the serializable `GalleryTile[]` view model, and renders the
 * client `GalleryGrid` (or an empty state when there are zero proyectos).
 * `listCategorias`/`listContactos` are fetched here to keep the data
 * boundary in one place and are handed to `FilterBar`, which reads the
 * active selection back from the URL and pushes filter changes.
 */
export default async function Home({ searchParams }: HomeProps) {
  const params = parseGalleryParams(await searchParams);
  const db = getDb();

  const categorias = listCategorias(db);
  const contactos = listContactos(db);

  const proyectos = listProyectos(db, {
    categoriaId: params.categoriaId,
    contactoId: params.contactoId,
  });

  const filtersActive = params.categoriaId !== undefined || params.contactoId !== undefined;

  if (proyectos.length === 0) {
    const hasAnyProyectos = filtersActive ? listProyectos(db).length > 0 : false;

    return (
      <main>
        <h1>Base de Datos Visual de Proyectos</h1>
        <FilterBar categorias={categorias} contactos={contactos} />
        <EmptyState variant={hasAnyProyectos ? "no-matches" : "no-proyectos"} />
      </main>
    );
  }

  const layout = computeTileLayout(proyectos.map((p) => ({ id: p.id, tiempoEstimadoH: p.tiempoEstimadoH })));
  const rectById = new Map(layout.map((rect) => [rect.id, rect]));

  const tiles: GalleryTile[] = proyectos.map((proyecto) => {
    const { percent, isOverBudget } = computeProgress(proyecto.tiempoEstimadoH, proyecto.tiempoInvertidoH);
    const rect = rectById.get(proyecto.id);
    if (!rect) {
      throw new Error(`Missing computed tile layout for proyecto ${proyecto.id}`);
    }

    return {
      id: proyecto.id,
      titulo: proyecto.titulo,
      estado: proyecto.estado,
      rect,
      percent,
      isOverBudget,
      tintColor: toTint(proyecto.categoria.color),
      solidColor: toSolid(proyecto.categoria.color),
      categoriaNombre: proyecto.categoria.nombre,
      tiempoEstimadoH: proyecto.tiempoEstimadoH,
      tiempoInvertidoH: proyecto.tiempoInvertidoH,
      montoPago: proyecto.montoPago,
      frecuenciaAvance: proyecto.frecuenciaAvance,
    };
  });

  return (
    <main>
      <h1>Base de Datos Visual de Proyectos</h1>
      <FilterBar categorias={categorias} contactos={contactos} />
      <GalleryGrid tiles={tiles} />
    </main>
  );
}
