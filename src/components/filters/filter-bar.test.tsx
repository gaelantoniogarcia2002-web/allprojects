import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Categoria, Contacto } from "@/db/types";

const { mockPush, mockUseSearchParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUseSearchParams: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: mockUseSearchParams,
}));

import { FilterBar } from "./filter-bar";

const categorias: Categoria[] = [
  { id: 1, nombre: "Robótica", color: "#3B82F6" },
  { id: 2, nombre: "Software", color: "#10B981" },
];

const contactos: Contacto[] = [
  { id: 10, nombre: "Ana", url: null },
  { id: 20, nombre: "Beto", url: null },
];

function setUrl(search: string) {
  mockUseSearchParams.mockReturnValue(new URLSearchParams(search));
}

describe("FilterBar", () => {
  beforeEach(() => {
    mockPush.mockClear();
    setUrl("");
  });

  it("selecting a categoria pushes the categoria search param only", () => {
    render(<FilterBar categorias={categorias} contactos={contactos} />);

    fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: "1" } });

    expect(mockPush).toHaveBeenCalledWith("/?categoria=1", { scroll: false });
  });

  it("selecting a contacto pushes the contacto search param only", () => {
    render(<FilterBar categorias={categorias} contactos={contactos} />);

    fireEvent.change(screen.getByLabelText(/contacto/i), { target: { value: "20" } });

    expect(mockPush).toHaveBeenCalledWith("/?contacto=20", { scroll: false });
  });

  it("clearing an active categoria filter drops it from the URL", () => {
    setUrl("categoria=1");

    render(<FilterBar categorias={categorias} contactos={contactos} />);

    fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: "" } });

    expect(mockPush).toHaveBeenCalledWith("/", { scroll: false });
  });

  it("combines an existing contacto filter with a new categoria filter (AND intersection)", () => {
    setUrl("contacto=20");

    render(<FilterBar categorias={categorias} contactos={contactos} />);

    fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: "2" } });

    expect(mockPush).toHaveBeenCalledWith("/?categoria=2&contacto=20", { scroll: false });
  });

  it("reflects the active selections from the current URL", () => {
    setUrl("categoria=2&contacto=10");

    render(<FilterBar categorias={categorias} contactos={contactos} />);

    expect(screen.getByLabelText(/categoría/i)).toHaveValue("2");
    expect(screen.getByLabelText(/contacto/i)).toHaveValue("10");
  });
});
