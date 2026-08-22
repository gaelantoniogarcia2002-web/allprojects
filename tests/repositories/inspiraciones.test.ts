import { describe, it, expect, beforeEach } from "vitest";
import { makeTestDb, type TestDb } from "../helpers/test-db";
import {
  createInspiracion,
  listInspiracionesPorProyecto,
  deleteInspiracion,
} from "@/db/repositories/inspiraciones";
import { createCategoria } from "@/db/repositories/categorias";
import { createProyecto } from "@/db/repositories/proyectos";

let categoriaCounter = 0;

function makeProyecto(db: TestDb, titulo = "Brazo robótico") {
  categoriaCounter += 1;
  const categoria = createCategoria(db, { nombre: `Robótica ${categoriaCounter}`, color: "#3B82F6" });
  return createProyecto(db, {
    titulo,
    categoriaId: categoria.id,
    tiempoEstimadoH: 20,
    frecuenciaAvance: "semanal",
    estado: "idea",
    montoPago: null,
    carpetaDriveUrl: null,
    repositorioGhUrl: null,
  });
}

describe("inspiraciones repository", () => {
  let db: TestDb;

  beforeEach(() => {
    db = makeTestDb();
  });

  describe("createInspiracion", () => {
    it("persists an inspiracion linked to its proyecto", () => {
      const proyecto = makeProyecto(db);

      const inspiracion = createInspiracion(db, {
        proyectoId: proyecto.id,
        urlOrigen: "https://example.com/ref",
        tipoReferencia: "diseno_ui",
        notas: "Referencia de color",
      });

      expect(inspiracion.id).toBeGreaterThan(0);
      expect(inspiracion.proyectoId).toBe(proyecto.id);
      expect(inspiracion.urlOrigen).toBe("https://example.com/ref");
      expect(inspiracion.notas).toBe("Referencia de color");
    });
  });

  describe("listInspiracionesPorProyecto", () => {
    it("returns only inspiraciones belonging to the given proyecto", () => {
      const proyectoA = makeProyecto(db, "Proyecto A");
      const proyectoB = makeProyecto(db, "Proyecto B");
      createInspiracion(db, {
        proyectoId: proyectoA.id,
        urlOrigen: "https://example.com/a1",
        tipoReferencia: "diseno_ui",
        notas: null,
      });
      createInspiracion(db, {
        proyectoId: proyectoA.id,
        urlOrigen: "https://example.com/a2",
        tipoReferencia: "funcionalidad",
        notas: null,
      });
      createInspiracion(db, {
        proyectoId: proyectoB.id,
        urlOrigen: "https://example.com/b1",
        tipoReferencia: "otro",
        notas: null,
      });

      const result = listInspiracionesPorProyecto(db, proyectoA.id);

      expect(result).toHaveLength(2);
      expect(result.map((i) => i.urlOrigen).sort()).toEqual([
        "https://example.com/a1",
        "https://example.com/a2",
      ]);
    });

    it("returns an empty array when the proyecto has no inspiraciones", () => {
      const proyecto = makeProyecto(db);

      expect(listInspiracionesPorProyecto(db, proyecto.id)).toEqual([]);
    });
  });

  describe("deleteInspiracion", () => {
    it("deletes the inspiracion and returns true", () => {
      const proyecto = makeProyecto(db);
      const inspiracion = createInspiracion(db, {
        proyectoId: proyecto.id,
        urlOrigen: "https://example.com/ref",
        tipoReferencia: "stack_tecnologico",
        notas: null,
      });

      const result = deleteInspiracion(db, inspiracion.id);

      expect(result).toBe(true);
      expect(listInspiracionesPorProyecto(db, proyecto.id)).toEqual([]);
    });

    it("returns false when the inspiracion does not exist", () => {
      expect(deleteInspiracion(db, 999)).toBe(false);
    });
  });
});
