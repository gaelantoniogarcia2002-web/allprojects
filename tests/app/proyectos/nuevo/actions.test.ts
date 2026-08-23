import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeTestDb, type TestDb } from "../../../helpers/test-db";
import { createCategoria } from "@/db/repositories/categorias";
import { createContacto } from "@/db/repositories/contactos";
import { getProyectoConDetalle, listProyectos } from "@/db/repositories/proyectos";

const { mockGetDb, mockRevalidatePath, mockRedirect } = vi.hoisted(() => ({
  mockGetDb: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockRedirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

vi.mock("@/db/client", () => ({ getDb: mockGetDb }));
vi.mock("next/cache", () => ({ revalidatePath: mockRevalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mockRedirect }));

import { crearProyectoAction } from "@/app/proyectos/nuevo/actions";

function buildFormData(overrides: Record<string, string> = {}, contactoIds: number[] = []) {
  const fd = new FormData();
  const base: Record<string, string> = {
    titulo: "Brazo robótico",
    categoria_id: "1",
    tiempo_estimado_h: "40",
    tiempo_invertido_h: "0",
    frecuencia_avance: "semanal",
    estado: "idea",
  };
  for (const [key, value] of Object.entries({ ...base, ...overrides })) {
    fd.set(key, value);
  }
  for (const id of contactoIds) {
    fd.append("contactoId", String(id));
  }
  return fd;
}

describe("crearProyectoAction", () => {
  let db: TestDb;
  let categoriaId: number;

  beforeEach(() => {
    db = makeTestDb();
    categoriaId = createCategoria(db, { nombre: "Robótica", color: "#3B82F6" }).id;
    mockGetDb.mockReset();
    mockGetDb.mockReturnValue(db);
    mockRevalidatePath.mockClear();
    mockRedirect.mockClear();
  });

  it("persists a valid proyecto, links contactos, revalidates and redirects", async () => {
    const anaId = createContacto(db, { nombre: "Ana", url: null }).id;
    const formData = buildFormData({ categoria_id: String(categoriaId) }, [anaId]);

    await expect(crearProyectoAction(null, formData)).rejects.toThrow(/NEXT_REDIRECT/);

    const rows = listProyectos(db);
    expect(rows).toHaveLength(1);
    expect(rows[0].titulo).toBe("Brazo robótico");

    const detail = getProyectoConDetalle(db, rows[0].id);
    expect(detail?.contactos.map((c) => c.id)).toEqual([anaId]);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    expect(mockRedirect).toHaveBeenCalledWith(`/proyectos/${rows[0].id}`);
  });

  it("returns {ok:false} without touching the database when titulo is empty", async () => {
    const formData = buildFormData({ titulo: "   ", categoria_id: String(categoriaId) });

    const result = await crearProyectoAction(null, formData);

    expect(result.ok).toBe(false);
    expect(listProyectos(db)).toHaveLength(0);
    expect(mockGetDb).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("returns {ok:false} without touching the database when estado is invalid", async () => {
    const formData = buildFormData({ estado: "cancelado", categoria_id: String(categoriaId) });

    const result = await crearProyectoAction(null, formData);

    expect(result.ok).toBe(false);
    expect(listProyectos(db)).toHaveLength(0);
    expect(mockGetDb).not.toHaveBeenCalled();
  });

  it("returns {ok:false} and inserts no row when categoria_id does not reference an existing categoria", async () => {
    const formData = buildFormData({ categoria_id: "999999" });

    const result = await crearProyectoAction(null, formData);

    expect(result.ok).toBe(false);
    expect(listProyectos(db)).toHaveLength(0);
  });

  it("creating a proyecto with the same contactoId submitted twice stays idempotent (no duplicate join row)", async () => {
    const anaId = createContacto(db, { nombre: "Ana", url: null }).id;
    const formData = buildFormData({ categoria_id: String(categoriaId) }, [anaId, anaId]);

    await expect(crearProyectoAction(null, formData)).rejects.toThrow(/NEXT_REDIRECT/);

    const rows = listProyectos(db);
    const detail = getProyectoConDetalle(db, rows[0].id);
    expect(detail?.contactos).toHaveLength(1);
  });
});
