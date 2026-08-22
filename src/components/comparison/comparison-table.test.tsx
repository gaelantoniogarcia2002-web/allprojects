import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ComparisonTable } from "./comparison-table";
import type { GalleryTile } from "@/lib/gallery/types";

function baseTile(overrides: Partial<GalleryTile> = {}): GalleryTile {
  return {
    id: 1,
    titulo: "Brazo robótico",
    estado: "idea",
    rect: { id: 1, x: 0, y: 0, w: 2, h: 2 },
    percent: 25,
    isOverBudget: false,
    tintColor: "color-mix(in srgb, #3B82F6 15%, transparent)",
    solidColor: "#3B82F6",
    categoriaNombre: "Robótica",
    tiempoEstimadoH: 40,
    tiempoInvertidoH: 10,
    montoPago: 150,
    frecuenciaAvance: "semanal",
    ...overrides,
  };
}

describe("ComparisonTable", () => {
  it("renders one column per selected proyecto with rows for the compared metrics", () => {
    const tiles = [
      baseTile({ id: 1, titulo: "Brazo robótico", tiempoEstimadoH: 40, tiempoInvertidoH: 10, montoPago: 150, frecuenciaAvance: "semanal" }),
      baseTile({ id: 2, titulo: "Dashboard IoT", tiempoEstimadoH: 20, tiempoInvertidoH: 25, montoPago: 300, frecuenciaAvance: "diaria" }),
    ];

    render(<ComparisonTable tiles={tiles} />);

    expect(screen.getByText("Brazo robótico")).toBeInTheDocument();
    expect(screen.getByText("Dashboard IoT")).toBeInTheDocument();

    const estimadoRow = screen.getByTestId("comparison-row-tiempo-estimado");
    expect(within(estimadoRow).getByText("40")).toBeInTheDocument();
    expect(within(estimadoRow).getByText("20")).toBeInTheDocument();

    const invertidoRow = screen.getByTestId("comparison-row-tiempo-invertido");
    expect(within(invertidoRow).getByText("10")).toBeInTheDocument();
    expect(within(invertidoRow).getByText("25")).toBeInTheDocument();

    const montoRow = screen.getByTestId("comparison-row-monto-pago");
    expect(within(montoRow).getByText("150")).toBeInTheDocument();
    expect(within(montoRow).getByText("300")).toBeInTheDocument();

    const frecuenciaRow = screen.getByTestId("comparison-row-frecuencia-avance");
    expect(within(frecuenciaRow).getByText("semanal")).toBeInTheDocument();
    expect(within(frecuenciaRow).getByText("diaria")).toBeInTheDocument();
  });

  it("shows an explicit 'not set' indicator when monto_pago is null", () => {
    const tiles = [baseTile({ id: 1, montoPago: null })];

    render(<ComparisonTable tiles={tiles} />);

    const montoRow = screen.getByTestId("comparison-row-monto-pago");
    expect(within(montoRow).getByText(/no establecido/i)).toBeInTheDocument();
  });
});
