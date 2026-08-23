import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeTestDb, type TestDb } from "../../helpers/test-db";
import { createCategoria, listCategorias } from "@/db/repositories/categorias";
import { createProyecto } from "@/db/repositories/proyectos";

const { mockGetDb, mockRevalidatePath } = vi.hoisted(() => ({
  mockGetDb: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock("@/db/client", () => ({ getDb: mockGetDb }));
vi.mock("next/cache", () => ({ revalidatePath: mockRevalidatePath }));

import { editarCategoriaAction, eliminarCategoriaAction } from "@/app/categorias/actions";

function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

describe("categorias actions", () => {
  let db: TestDb;
  let categoriaId: number;

  beforeEach(() => {
    db = makeTestDb();
    categoriaId = createCategoria(db, { nombre: "Robótica", color: "#3B82F6" }).id;

    mockGetDb.mockReset();
    mockGetDb.mockReturnValue(db);
    mockRevalidatePath.mockClear();
  });

  describe("editarCategoriaAction", () => {
    it("updates nombre and color", async () => {
      const formData = buildFormData({ nombre: "Robótica avanzada", color: "#111111" });

      const result = await editarCategoriaAction(categoriaId, null, formData);

      expect(result.ok).toBe(true);
      const updated = listCategorias(db).find((c) => c.id === categoriaId);
      expect(updated?.nombre).toBe("Robótica avanzada");
      expect(updated?.color).toBe("#111111");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    });

    it("returns {ok:false} when the categoria id does not exist", async () => {
      const formData = buildFormData({ nombre: "Robótica", color: "#111111" });

      const result = await editarCategoriaAction(999999, null, formData);

      expect(result.ok).toBe(false);
    });
  });

  describe("eliminarCategoriaAction", () => {
    it("returns {ok:false} with CategoriaEnUsoError's message and keeps the row when in use", async () => {
      createProyecto(db, {
        titulo: "Brazo robótico",
        estado: "idea",
        categoriaId,
        tiempoEstimadoH: 10,
        tiempoInvertidoH: 0,
        frecuenciaAvance: "semanal",
        montoPago: null,
        carpetaDriveUrl: null,
        repositorioGhUrl: null,
      });

      const result = await eliminarCategoriaAction(categoriaId);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/still referenced/i);
      }
      expect(listCategorias(db).some((c) => c.id === categoriaId)).toBe(true);
    });

    it("deletes the categoria when unused", async () => {
      const result = await eliminarCategoriaAction(categoriaId);

      expect(result.ok).toBe(true);
      expect(listCategorias(db).some((c) => c.id === categoriaId)).toBe(false);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    });

    it("returns {ok:false} when the categoria id does not exist", async () => {
      const result = await eliminarCategoriaAction(999999);

      expect(result.ok).toBe(false);
    });
  });
});
