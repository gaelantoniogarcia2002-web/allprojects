"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { parseGalleryParams } from "@/lib/gallery/search-params";
import type { GalleryTile } from "@/lib/gallery/types";
import { ComparisonTable } from "./comparison-table";

const MIN_SELECTION = 2;

type ComparisonOverlayProps = {
  tiles: GalleryTile[];
};

/**
 * Client-owned comparison trigger + overlay. Reads `modo`/`seleccion` from
 * `useSearchParams()`; renders nothing outside comparison mode
 * (`project-comparison` §Comparison Mode Toggle). Attempting to open with
 * fewer than 2 selections keeps the overlay closed and shows an indicating
 * message instead (§Multi-Select Proyecto Selection). Closing the overlay
 * only resets local open/blocked state — the URL `seleccion` is untouched,
 * so the selection stays intact (§Comparison Overlay Table).
 */
export function ComparisonOverlay({ tiles }: ComparisonOverlayProps) {
  const searchParams = useSearchParams();
  const params = parseGalleryParams(Object.fromEntries(searchParams.entries()));
  const [isOpen, setIsOpen] = useState(false);
  const [blocked, setBlocked] = useState(false);

  if (!params.comparisonMode) {
    return null;
  }

  const selectedTiles = tiles.filter((tile) => params.seleccion.includes(tile.id));

  function handleOpen() {
    if (selectedTiles.length < MIN_SELECTION) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  return (
    <div data-testid="comparison-overlay-controls">
      <button type="button" onClick={handleOpen}>
        Comparar seleccionados
      </button>
      {blocked && !isOpen && (
        <p role="status">Selecciona al menos 2 proyectos para comparar.</p>
      )}
      {isOpen && (
        <div role="dialog" aria-label="Comparación de proyectos" data-testid="comparison-overlay">
          <button type="button" onClick={handleClose}>
            Cerrar
          </button>
          <ComparisonTable tiles={selectedTiles} />
        </div>
      )}
    </div>
  );
}
