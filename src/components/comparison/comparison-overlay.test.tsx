import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { GalleryTile } from "@/lib/gallery/types";

const { mockUseSearchParams } = vi.hoisted(() => ({
  mockUseSearchParams: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: mockUseSearchParams,
}));

import { ComparisonOverlay } from "./comparison-overlay";

function setUrl(search: string) {
  mockUseSearchParams.mockReturnValue(new URLSearchParams(search));
}

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

const tiles: GalleryTile[] = [
  baseTile({ id: 1, titulo: "Brazo robótico" }),
  baseTile({ id: 2, titulo: "Dashboard IoT" }),
  baseTile({ id: 3, titulo: "Sensor IoT" }),
];

describe("ComparisonOverlay", () => {
  beforeEach(() => {
    setUrl("");
  });

  it("renders nothing when comparison mode is not active", () => {
    setUrl("");

    const { container } = render(<ComparisonOverlay tiles={tiles} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("blocks opening and shows an indicating message with fewer than 2 selections", () => {
    setUrl("modo=comparar&seleccion=1");

    render(<ComparisonOverlay tiles={tiles} />);
    fireEvent.click(screen.getByRole("button", { name: /comparar/i }));

    expect(screen.getByText(/selecciona al menos 2 proyectos/i)).toBeInTheDocument();
    expect(screen.queryByTestId("comparison-table")).not.toBeInTheDocument();
  });

  it("opens the overlay with a table when 2 or more proyectos are selected", () => {
    setUrl("modo=comparar&seleccion=1,3");

    render(<ComparisonOverlay tiles={tiles} />);
    fireEvent.click(screen.getByRole("button", { name: /comparar/i }));

    expect(screen.getByTestId("comparison-table")).toBeInTheDocument();
    expect(screen.getByText("Brazo robótico")).toBeInTheDocument();
    expect(screen.getByText("Sensor IoT")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard IoT")).not.toBeInTheDocument();
  });

  it("closing the overlay returns to the selection view with the selection intact", () => {
    setUrl("modo=comparar&seleccion=1,3");

    render(<ComparisonOverlay tiles={tiles} />);
    fireEvent.click(screen.getByRole("button", { name: /comparar/i }));
    expect(screen.getByTestId("comparison-table")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cerrar/i }));

    expect(screen.queryByTestId("comparison-table")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /comparar/i })).toBeInTheDocument();
  });
});
