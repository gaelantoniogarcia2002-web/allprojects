import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { makeTestDb, type TestDb } from "../helpers/test-db";
import {
  createProyecto,
  listProyectos,
  getProyectoConDetalle,
  updateProyecto,
  deleteProyecto,
} from "@/db/repositories/proyectos";
import { createCategoria } from "@/db/repositories/categorias";
import { createContacto, vincularContacto } from "@/db/repositories/contactos";
import { createInspiracion } from "@/db/repositories/inspiraciones";
import { proyectoContactos, inspiraciones } from "@/db/schema";
import { NotFoundError } from "@/db/errors";

function baseInput(categoriaId: number, overrides: Partial<Parameters<typeof createProyecto>[1]> = {}) {
  return {
    titulo: "Brazo robótico",
    categoriaId,
    tiempoEstimadoH: 20,
    frecuenciaAvance: "semanal" as const,
    estado: "idea" as const,
    montoPago: null,
    carpetaDriveUrl: null,
    repositorioGhUrl: null,
    ...overrides,
  };
}

describe("proyectos repository", () => {
  let db: TestDb;
  let categoriaId: number;

  beforeEach(() => {
    db = makeTestDb();
    categoriaId = createCategoria(db, { nombre: "Robótica", color: "#3B82F6" }).id;
  });

  describe("createProyecto", () => {
    it("defaults tiempo_invertido_h to 0 when omitted", () => {
      const proyecto = createProyecto(db, baseInput(categoriaId));

      expect(proyecto.tiempoInvertidoH).toBe(0);
      expect(proyecto.titulo).toBe("Brazo robótico");
    });

    it("persists an explicit tiempo_invertido_h", () => {
      const proyecto = createProyecto(db, baseInput(categoriaId, { tiempoInvertidoH: 5 }));

      expect(proyecto.tiempoInvertidoH).toBe(5);
    });
  });

  describe("listProyectos", () => {
    it("filters by estado", () => {
      createProyecto(db, baseInput(categoriaId, { titulo: "Idea 1", estado: "idea" }));
      createProyecto(db, baseInput(categoriaId, { titulo: "En desarrollo 1", estado: "en_desarrollo" }));

      const result = listProyectos(db, { estado: "en_desarrollo" });

      expect(result).toHaveLength(1);
      expect(result[0].titulo).toBe("En desarrollo 1");
    });

    it("filters by categoriaId", () => {
      const otraCategoria = createCategoria(db, { nombre: "Otra", color: "#10B981" });
      createProyecto(db, baseInput(categoriaId, { titulo: "A" }));
      createProyecto(db, baseInput(otraCategoria.id, { titulo: "B" }));

      const result = listProyectos(db, { categoriaId: otraCategoria.id });

      expect(result).toHaveLength(1);
      expect(result[0].titulo).toBe("B");
    });

    it("filters by contactoId", () => {
      const proyectoConContacto = createProyecto(db, baseInput(categoriaId, { titulo: "Con contacto" }));
      createProyecto(db, baseInput(categoriaId, { titulo: "Sin contacto" }));
      const contacto = createContacto(db, { nombre: "Ada Lovelace", url: null });
      vincularContacto(db, proyectoConContacto.id, contacto.id);

      const result = listProyectos(db, { contactoId: contacto.id });

      expect(result).toHaveLength(1);
      expect(result[0].titulo).toBe("Con contacto");
    });

    it("returns all proyectos with their categoria when no filter is given", () => {
      createProyecto(db, baseInput(categoriaId, { titulo: "A" }));
      createProyecto(db, baseInput(categoriaId, { titulo: "B" }));

      const result = listProyectos(db);

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.categoria.id === categoriaId)).toBe(true);
    });
  });

  describe("getProyectoConDetalle", () => {
    it("returns nested categoria, contactos and inspiraciones", () => {
      const proyecto = createProyecto(db, baseInput(categoriaId));
      const contacto = createContacto(db, { nombre: "Ada Lovelace", url: null });
      vincularContacto(db, proyecto.id, contacto.id);
      createInspiracion(db, {
        proyectoId: proyecto.id,
        urlOrigen: "https://example.com/ref",
        tipoReferencia: "diseno_ui",
        notas: null,
      });

      const detalle = getProyectoConDetalle(db, proyecto.id);

      expect(detalle).not.toBeNull();
      expect(detalle?.categoria.id).toBe(categoriaId);
      expect(detalle?.contactos).toHaveLength(1);
      expect(detalle?.contactos[0].id).toBe(contacto.id);
      expect(detalle?.inspiraciones).toHaveLength(1);
      expect(detalle?.inspiraciones[0].urlOrigen).toBe("https://example.com/ref");
    });

    it("returns null when the proyecto does not exist", () => {
      expect(getProyectoConDetalle(db, 999)).toBeNull();
    });
  });

  describe("updateProyecto", () => {
    it("applies the patch and bumps updated_at", async () => {
      const proyecto = createProyecto(db, baseInput(categoriaId));
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const updated = updateProyecto(db, proyecto.id, { estado: "en_desarrollo" });

      expect(updated.estado).toBe("en_desarrollo");
      expect(updated.updatedAt).not.toBe(proyecto.updatedAt);
    });

    it("throws NotFoundError for a missing id", () => {
      expect(() => updateProyecto(db, 999, { estado: "en_desarrollo" })).toThrow(NotFoundError);
    });
  });

  describe("deleteProyecto", () => {
    it("cascades to inspiraciones and proyecto_contactos", () => {
      const proyecto = createProyecto(db, baseInput(categoriaId));
      const contacto = createContacto(db, { nombre: "Ada Lovelace", url: null });
      vincularContacto(db, proyecto.id, contacto.id);
      createInspiracion(db, {
        proyectoId: proyecto.id,
        urlOrigen: "https://example.com/ref",
        tipoReferencia: "diseno_ui",
        notas: null,
      });

      deleteProyecto(db, proyecto.id);

      expect(db.select().from(proyectoContactos).where(eq(proyectoContactos.proyectoId, proyecto.id)).all()).toEqual([]);
      expect(db.select().from(inspiraciones).where(eq(inspiraciones.proyectoId, proyecto.id)).all()).toEqual([]);
    });

    it("throws NotFoundError when the proyecto does not exist", () => {
      expect(() => deleteProyecto(db, 999)).toThrow(NotFoundError);
    });
  });
});
