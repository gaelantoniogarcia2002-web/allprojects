import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeTestDb, type TestDb } from "../../helpers/test-db";
import { createContacto, listContactos, vincularContacto } from "@/db/repositories/contactos";
import { createCategoria } from "@/db/repositories/categorias";
import { createProyecto } from "@/db/repositories/proyectos";

const { mockGetDb, mockRevalidatePath } = vi.hoisted(() => ({
  mockGetDb: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock("@/db/client", () => ({ getDb: mockGetDb }));
vi.mock("next/cache", () => ({ revalidatePath: mockRevalidatePath }));

import { editarContactoAction, eliminarContactoAction } from "@/app/contactos/actions";

function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

describe("contactos actions", () => {
  let db: TestDb;
  let contactoId: number;

  beforeEach(() => {
    db = makeTestDb();
    contactoId = createContacto(db, { nombre: "Ada Lovelace", url: null }).id;

    mockGetDb.mockReset();
    mockGetDb.mockReturnValue(db);
    mockRevalidatePath.mockClear();
  });

  describe("editarContactoAction", () => {
    it("updates nombre and url", async () => {
      const formData = buildFormData({ nombre: "Ada King", url: "https://example.com" });

      const result = await editarContactoAction(contactoId, null, formData);

      expect(result.ok).toBe(true);
      const updated = listContactos(db).find((c) => c.id === contactoId);
      expect(updated?.nombre).toBe("Ada King");
      expect(updated?.url).toBe("https://example.com");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    });

    it("returns {ok:false} when the contacto id does not exist", async () => {
      const formData = buildFormData({ nombre: "Ghost", url: "" });

      const result = await editarContactoAction(999999, null, formData);

      expect(result.ok).toBe(false);
    });
  });

  describe("eliminarContactoAction", () => {
    it("always succeeds, cascading only the join rows for a linked contacto", async () => {
      const categoriaId = createCategoria(db, { nombre: "Robótica", color: "#3B82F6" }).id;
      const proyectoId = createProyecto(db, {
        titulo: "Brazo robótico",
        estado: "idea",
        categoriaId,
        tiempoEstimadoH: 10,
        tiempoInvertidoH: 0,
        frecuenciaAvance: "semanal",
        montoPago: null,
        carpetaDriveUrl: null,
        repositorioGhUrl: null,
      }).id;
      vincularContacto(db, proyectoId, contactoId);

      const result = await eliminarContactoAction(contactoId);

      expect(result.ok).toBe(true);
      expect(listContactos(db).some((c) => c.id === contactoId)).toBe(false);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    });

    it("returns {ok:false} when the contacto id does not exist", async () => {
      const result = await eliminarContactoAction(999999);

      expect(result.ok).toBe(false);
    });
  });
});
