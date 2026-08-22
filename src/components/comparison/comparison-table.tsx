import type { GalleryTile } from "@/lib/gallery/types";

type ComparisonTableProps = {
  tiles: GalleryTile[];
};

/**
 * Presentational side-by-side comparison table: one column per selected
 * proyecto, one row per compared metric (`project-comparison` §Comparison
 * Overlay Table). `monto_pago` renders an explicit "No establecido"
 * indicator instead of a blank cell or `0` when the value is `null`.
 */
export function ComparisonTable({ tiles }: ComparisonTableProps) {
  return (
    <table data-testid="comparison-table">
      <thead>
        <tr>
          <th scope="col">Métrica</th>
          {tiles.map((tile) => (
            <th key={tile.id} scope="col">
              {tile.titulo}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr data-testid="comparison-row-tiempo-estimado">
          <th scope="row">Tiempo estimado (h)</th>
          {tiles.map((tile) => (
            <td key={tile.id}>{tile.tiempoEstimadoH}</td>
          ))}
        </tr>
        <tr data-testid="comparison-row-tiempo-invertido">
          <th scope="row">Tiempo invertido (h)</th>
          {tiles.map((tile) => (
            <td key={tile.id}>{tile.tiempoInvertidoH}</td>
          ))}
        </tr>
        <tr data-testid="comparison-row-monto-pago">
          <th scope="row">Monto / Pago</th>
          {tiles.map((tile) => (
            <td key={tile.id}>{tile.montoPago === null ? "No establecido" : tile.montoPago}</td>
          ))}
        </tr>
        <tr data-testid="comparison-row-frecuencia-avance">
          <th scope="row">Frecuencia de avance</th>
          {tiles.map((tile) => (
            <td key={tile.id}>{tile.frecuenciaAvance}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
