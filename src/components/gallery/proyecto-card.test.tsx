import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProyectoCard } from "./proyecto-card";
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
    montoPago: null,
    frecuenciaAvance: "semanal",
    ...overrides,
  };
}

describe("ProyectoCard", () => {
  it("renders the title, tint background and solid fill width from props", () => {
    const tile = baseTile();
    render(<ProyectoCard tile={tile} />);

    expect(screen.getByText("Brazo robótico")).toBeInTheDocument();
    expect(screen.getByTestId("progress-tint")).toHaveStyle({ backgroundColor: tile.tintColor });
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");
  });

  it("shows the badge and a solid red 2px border when the tile is over budget", () => {
    const tile = baseTile({ isOverBudget: true, percent: 100 });
    render(<ProyectoCard tile={tile} />);

    expect(screen.getByText("⚠ Excedido")).toBeInTheDocument();
    expect(screen.getByTestId("proyecto-card")).toHaveStyle({
      borderTopWidth: "2px",
      borderTopStyle: "solid",
      borderTopColor: "rgb(255, 0, 0)",
    });
  });

  it("shows neither the badge nor the red border when the tile is on budget", () => {
    const tile = baseTile({ isOverBudget: false });
    render(<ProyectoCard tile={tile} />);

    expect(screen.queryByText("⚠ Excedido")).not.toBeInTheDocument();
    expect(screen.getByTestId("proyecto-card")).not.toHaveStyle({
      borderTopWidth: "2px",
      borderTopStyle: "solid",
      borderTopColor: "rgb(255, 0, 0)",
    });
  });
});
