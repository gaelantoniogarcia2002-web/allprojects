import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { makeTestDb, type TestDb } from "../helpers/test-db";
import { createCategoria } from "@/db/repositories/categorias";
import { createContacto, vincularContacto } from "@/db/repositories/contactos";
import { createProyecto } from "@/db/repositories/proyectos";

const { mockGetDb, mockPush, mockUseSearchParams } = vi.hoisted(() => ({
  mockGetDb: vi.fn(),
  mockPush: vi.fn(),
  mockUseSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("@/db/client", () => ({
  getDb: mockGetDb,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: mockUseSearchParams,
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

function toUrlSearchParams(searchParams: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    for (const entry of Array.isArray(value) ? value : [value]) {
      params.set(key, entry);
    }
  }
  return params;
}

async function renderHome(searchParams: Record<string, string | string[] | undefined> = {}) {
  // FilterBar reads the "current" filter state from useSearchParams(), so the
  // URL fixture handed to Home() must be mirrored into the mocked hook —
  // this is what makes a page reload with `?categoria=...` reproducible.
  mockUseSearchParams.mockReturnValue(toUrlSearchParams(searchParams));
  const ui = await Home({ searchParams: Promise.resolve(searchParams) });
  return render(ui);
}

describe("Home page (gallery Server Component)", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

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

  it("narrows to proyectos matching ?categoria=", async () => {
    const db: TestDb = makeTestDb();
    const roboticaId = createCategoria(db, { nombre: "Robótica", color: "#3B82F6" }).id;
    const softwareId = createCategoria(db, { nombre: "Software", color: "#10B981" }).id;
    createProyecto(db, baseProyectoInput(roboticaId, { titulo: "Brazo robótico" }));
    createProyecto(db, baseProyectoInput(softwareId, { titulo: "Dashboard IoT" }));
    mockGetDb.mockReturnValue(db);

    await renderHome({ categoria: String(roboticaId) });

    expect(screen.getAllByTestId("proyecto-card")).toHaveLength(1);
    expect(screen.getByText("Brazo robótico")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard IoT")).not.toBeInTheDocument();
  });

  it("narrows to the AND intersection for ?categoria=&contacto=", async () => {
    const db: TestDb = makeTestDb();
    const roboticaId = createCategoria(db, { nombre: "Robótica", color: "#3B82F6" }).id;
    const anaId = createContacto(db, { nombre: "Ana" }).id;
    const beloId = createContacto(db, { nombre: "Beto" }).id;

    const matching = createProyecto(db, baseProyectoInput(roboticaId, { titulo: "Brazo robótico" }));
    vincularContacto(db, matching.id, anaId);

    const wrongContacto = createProyecto(db, baseProyectoInput(roboticaId, { titulo: "Sensor IoT" }));
    vincularContacto(db, wrongContacto.id, beloId);

    mockGetDb.mockReturnValue(db);

    await renderHome({ categoria: String(roboticaId), contacto: String(anaId) });

    expect(screen.getAllByTestId("proyecto-card")).toHaveLength(1);
    expect(screen.getByText("Brazo robótico")).toBeInTheDocument();
    expect(screen.queryByText("Sensor IoT")).not.toBeInTheDocument();
  });

  it("shows the no-matches empty state when active filters produce zero results", async () => {
    const db: TestDb = makeTestDb();
    const roboticaId = createCategoria(db, { nombre: "Robótica", color: "#3B82F6" }).id;
    const softwareId = createCategoria(db, { nombre: "Software", color: "#10B981" }).id;
    createProyecto(db, baseProyectoInput(roboticaId, { titulo: "Brazo robótico" }));
    mockGetDb.mockReturnValue(db);

    await renderHome({ categoria: String(softwareId) });

    expect(screen.getByTestId("empty-state")).toHaveTextContent(/ningún proyecto coincide/i);
    expect(screen.queryAllByTestId("proyecto-card")).toHaveLength(0);
  });

  it("reproduces the same filtered view on a fresh render from the same URL (reload)", async () => {
    const db: TestDb = makeTestDb();
    const roboticaId = createCategoria(db, { nombre: "Robótica", color: "#3B82F6" }).id;
    const softwareId = createCategoria(db, { nombre: "Software", color: "#10B981" }).id;
    createProyecto(db, baseProyectoInput(roboticaId, { titulo: "Brazo robótico" }));
    createProyecto(db, baseProyectoInput(softwareId, { titulo: "Dashboard IoT" }));
    mockGetDb.mockReturnValue(db);

    const fixture = { categoria: String(roboticaId) };
    const first = await renderHome(fixture);
    const firstCards = first.getAllByTestId("proyecto-card").map((el) => el.textContent);
    first.unmount();

    const second = await renderHome(fixture);
    const secondCards = second.getAllByTestId("proyecto-card").map((el) => el.textContent);

    expect(secondCards).toEqual(firstCards);
  });

  it("opens the comparison overlay for ?modo=comparar&seleccion=1,3 matching only those proyectos", async () => {
    const db: TestDb = makeTestDb();
    const roboticaId = createCategoria(db, { nombre: "Robótica", color: "#3B82F6" }).id;
    const first = createProyecto(db, baseProyectoInput(roboticaId, { titulo: "Brazo robótico", tiempoEstimadoH: 40, tiempoInvertidoH: 10, montoPago: 150 }));
    createProyecto(db, baseProyectoInput(roboticaId, { titulo: "Dashboard IoT", tiempoEstimadoH: 20, tiempoInvertidoH: 5, montoPago: 300 }));
    const third = createProyecto(db, baseProyectoInput(roboticaId, { titulo: "Sensor IoT", tiempoEstimadoH: 15, tiempoInvertidoH: 20, montoPago: null }));
    mockGetDb.mockReturnValue(db);

    const { getByRole, getByTestId, queryByText } = await renderHome({
      modo: "comparar",
      seleccion: `${first.id},${third.id}`,
    });

    fireEvent.click(getByRole("button", { name: /comparar seleccionados/i }));

    const table = getByTestId("comparison-table");
    expect(within(table).getByText("Brazo robótico")).toBeInTheDocument();
    expect(within(table).getByText("Sensor IoT")).toBeInTheDocument();
    expect(within(table).queryByText("Dashboard IoT")).not.toBeInTheDocument();
    expect(within(table).getByText(/no establecido/i)).toBeInTheDocument();
    expect(queryByText("Dashboard IoT")).toBeInTheDocument(); // still visible as a gallery card, just not compared
  });
});
