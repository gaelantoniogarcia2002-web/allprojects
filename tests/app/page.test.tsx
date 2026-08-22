import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { makeTestDb, type TestDb } from "../helpers/test-db";
import { createCategoria } from "@/db/repositories/categorias";
import { createProyecto } from "@/db/repositories/proyectos";

const { mockGetDb } = vi.hoisted(() => ({ mockGetDb: vi.fn() }));

vi.mock("@/db/client", () => ({
  getDb: mockGetDb,
}));

import Home from "@/app/page";

function baseProyectoInput(categoriaId: number, overrides: Partial<Parameters<typeof createProyecto>[1]> = {}) {
  return {
    titulo: "Brazo robótico",
    categoriaId,
    tiempoEstimadoH: 40,
    tiempoInvertidoH: 10,
    frecuenciaAvance: "semanal" as const,
    estado: "idea" as const,
    montoPago: null,
    carpetaDriveUrl: null,
    repositorioGhUrl: null,
    ...overrides,
  };
}

async function renderHome(searchParams: Record<string, string | string[] | undefined> = {}) {
  const ui = await Home({ searchParams: Promise.resolve(searchParams) });
  return render(ui);
}

describe("Home page (gallery Server Component)", () => {
  it("renders the app heading", async () => {
    const db: TestDb = makeTestDb();
    mockGetDb.mockReturnValue(db);

    await renderHome();

    expect(screen.getByRole("heading", { name: "Base de Datos Visual de Proyectos" })).toBeInTheDocument();
  });

  it("shows the no-proyectos empty state when the database has zero rows", async () => {
    const db: TestDb = makeTestDb();
    mockGetDb.mockReturnValue(db);

    await renderHome();

    expect(screen.getByTestId("empty-state")).toHaveTextContent(/todavía no hay proyectos/i);
    expect(screen.queryAllByTestId("proyecto-card")).toHaveLength(0);
  });

  it("renders one card per seeded proyecto, with title and over-budget badge from the row data", async () => {
    const db: TestDb = makeTestDb();
    const categoriaId = createCategoria(db, { nombre: "Robótica", color: "#3B82F6" }).id;
    createProyecto(db, baseProyectoInput(categoriaId, { titulo: "Brazo robótico", tiempoEstimadoH: 40, tiempoInvertidoH: 10 }));
    createProyecto(db, baseProyectoInput(categoriaId, { titulo: "Dashboard IoT", tiempoEstimadoH: 10, tiempoInvertidoH: 12 }));
    mockGetDb.mockReturnValue(db);

    await renderHome();

    expect(screen.getAllByTestId("proyecto-card")).toHaveLength(2);
    expect(screen.getByText("Brazo robótico")).toBeInTheDocument();
    expect(screen.getByText("Dashboard IoT")).toBeInTheDocument();
    expect(screen.getByText("⚠ Excedido")).toBeInTheDocument();
    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
  });
});
