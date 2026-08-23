import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeTestDb, type TestDb } from "../../../helpers/test-db";
import { createCategoria } from "@/db/repositories/categorias";
import { createContacto } from "@/db/repositories/contactos";
import { createProyecto, getProyectoConDetalle, listProyectos } from "@/db/repositories/proyectos";

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

import {
  editarProyectoAction,
  eliminarProyectoAction,
  agregarInspiracionAction,
  eliminarInspiracionAction,
} from "@/app/proyectos/[id]/actions";

function buildProyectoFormData(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  const base: Record<string, string> = {
    titulo: "Brazo robótico",
    categoria_id: "1",
    tiempo_estimado_h: "40",
    tiempo_invertido_h: "5",
    frecuencia_avance: "semanal",
    estado: "idea",
  };
  for (const [key, value] of Object.entries({ ...base, ...overrides })) {
    fd.set(key, value);
  }
  return fd;
}

function buildInspiracionFormData(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  const base: Record<string, string> = {
    url_origen: "https://example.com/reference",
    tipo_referencia: "diseno_ui",
  };
  for (const [key, value] of Object.entries({ ...base, ...overrides })) {
    fd.set(key, value);
  }
  return fd;
}

describe("proyecto [id] actions", () => {
  let db: TestDb;
  let categoriaId: number;
  let proyectoId: number;

  beforeEach(() => {
    db = makeTestDb();
    categoriaId = createCategoria(db, { nombre: "Robótica", color: "#3B82F6" }).id;
    proyectoId = createProyecto(db, {
      titulo: "Original",
      estado: "idea",
      categoriaId,
      tiempoEstimadoH: 10,
      tiempoInvertidoH: 0,
      frecuenciaAvance: "semanal",
      montoPago: null,
      carpetaDriveUrl: null,
      repositorioGhUrl: null,
    }).id;

    mockGetDb.mockReset();
    mockGetDb.mockReturnValue(db);
    mockRevalidatePath.mockClear();
    mockRedirect.mockClear();
  });

  describe("editarProyectoAction", () => {
    it("updates the proyecto fields and revalidates the gallery", async () => {
      const formData = buildProyectoFormData({ titulo: "Actualizado", categoria_id: String(categoriaId) });

      const result = await editarProyectoAction(proyectoId, null, formData);

      expect(result.ok).toBe(true);
      const detail = getProyectoConDetalle(db, proyectoId);
      expect(detail?.titulo).toBe("Actualizado");
      expect(detail?.tiempoInvertidoH).toBe(5);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    });

    it("returns {ok:false} when the proyecto id does not exist", async () => {
      const formData = buildProyectoFormData({ categoria_id: String(categoriaId) });

      const result = await editarProyectoAction(999999, null, formData);

      expect(result.ok).toBe(false);
    });

    it("returns {ok:false} without updating when validation fails", async () => {
      const formData = buildProyectoFormData({ titulo: "   ", categoria_id: String(categoriaId) });

      const result = await editarProyectoAction(proyectoId, null, formData);

      expect(result.ok).toBe(false);
      const detail = getProyectoConDetalle(db, proyectoId);
      expect(detail?.titulo).toBe("Original");
    });
  });

  describe("eliminarProyectoAction", () => {
    it("removes the proyecto, its contactos and inspiraciones, then redirects to the gallery", async () => {
      const contactoId = createContacto(db, { nombre: "Ana", url: null }).id;
      const { vincularContacto } = await import("@/db/repositories/contactos");
      vincularContacto(db, proyectoId, contactoId);
      const { createInspiracion, listInspiracionesPorProyecto } = await import(
        "@/db/repositories/inspiraciones"
      );
      createInspiracion(db, { proyectoId, urlOrigen: "https://example.com", tipoReferencia: "otro", notas: null });

      await expect(eliminarProyectoAction(proyectoId)).rejects.toThrow(/NEXT_REDIRECT:\/$/);

      expect(listProyectos(db)).toHaveLength(0);
      expect(listInspiracionesPorProyecto(db, proyectoId)).toHaveLength(0);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/");
      expect(mockRedirect).toHaveBeenCalledWith("/");
    });

    it("returns {ok:false} when the proyecto id does not exist", async () => {
      const result = await eliminarProyectoAction(999999);

      expect(result).toEqual(expect.objectContaining({ ok: false }));
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe("agregarInspiracionAction", () => {
    it("persists a new inspiracion row for the proyecto", async () => {
      const formData = buildInspiracionFormData();

      const result = await agregarInspiracionAction(proyectoId, null, formData);

      expect(result.ok).toBe(true);
      const detail = getProyectoConDetalle(db, proyectoId);
      expect(detail?.inspiraciones).toHaveLength(1);
      expect(detail?.inspiraciones[0].urlOrigen).toBe("https://example.com/reference");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    });

    it("returns {ok:false} and inserts no row when tipo_referencia is invalid", async () => {
      const formData = buildInspiracionFormData({ tipo_referencia: "no_valido" });

      const result = await agregarInspiracionAction(proyectoId, null, formData);

      expect(result.ok).toBe(false);
      const detail = getProyectoConDetalle(db, proyectoId);
      expect(detail?.inspiraciones).toHaveLength(0);
    });
  });

  describe("eliminarInspiracionAction", () => {
    it("removes the inspiracion row", async () => {
      const { createInspiracion } = await import("@/db/repositories/inspiraciones");
      const inspiracion = createInspiracion(db, {
        proyectoId,
        urlOrigen: "https://example.com",
        tipoReferencia: "otro",
        notas: null,
      });

      const result = await eliminarInspiracionAction(inspiracion.id);

      expect(result).toEqual(expect.objectContaining({ ok: true }));
      const detail = getProyectoConDetalle(db, proyectoId);
      expect(detail?.inspiraciones).toHaveLength(0);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    });

    it("returns {ok:false} when the inspiracion id does not exist", async () => {
      const result = await eliminarInspiracionAction(999999);

      expect(result).toEqual(expect.objectContaining({ ok: false }));
    });
  });
});
