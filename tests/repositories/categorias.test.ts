import { describe, it, expect, beforeEach } from "vitest";
import { makeTestDb, type TestDb } from "../helpers/test-db";
import {
  createCategoria,
  listCategorias,
  updateCategoria,
  deleteCategoria,
} from "@/db/repositories/categorias";
import { createProyecto } from "@/db/repositories/proyectos";
import { CategoriaEnUsoError, NotFoundError } from "@/db/errors";

describe("categorias repository", () => {
  let db: TestDb;

  beforeEach(() => {
    db = makeTestDb();
  });

  describe("createCategoria", () => {
    it("persists a categoria and returns it with a generated id", () => {
      const categoria = createCategoria(db, { nombre: "Robótica Hobbie", color: "#3B82F6" });

      expect(categoria.id).toBeGreaterThan(0);
      expect(categoria.nombre).toBe("Robótica Hobbie");
      expect(categoria.color).toBe("#3B82F6");
    });
  });

  describe("listCategorias", () => {
    it("returns all persisted categorias", () => {
      createCategoria(db, { nombre: "Robótica Hobbie", color: "#3B82F6" });
      createCategoria(db, { nombre: "Automatización Hogar", color: "#10B981" });

      const categorias = listCategorias(db);

      expect(categorias).toHaveLength(2);
      expect(categorias.map((c) => c.nombre).sort()).toEqual([
        "Automatización Hogar",
        "Robótica Hobbie",
      ]);
    });

    it("returns an empty array when no categorias exist", () => {
      expect(listCategorias(db)).toEqual([]);
    });
  });

  describe("updateCategoria", () => {
    it("updates a categoria's color", () => {
      const categoria = createCategoria(db, { nombre: "Robótica Hobbie", color: "#3B82F6" });

      const updated = updateCategoria(db, categoria.id, { color: "#EF4444" });

      expect(updated.color).toBe("#EF4444");
      expect(updated.nombre).toBe("Robótica Hobbie");
    });

    it("updates a categoria's nombre", () => {
      const categoria = createCategoria(db, { nombre: "Robótica Hobbie", color: "#3B82F6" });

      const updated = updateCategoria(db, categoria.id, { nombre: "Robótica Avanzada" });

      expect(updated.nombre).toBe("Robótica Avanzada");
      expect(updated.color).toBe("#3B82F6");
    });

    it("throws NotFoundError for a missing id", () => {
      expect(() => updateCategoria(db, 999, { color: "#EF4444" })).toThrow(NotFoundError);
    });
  });

  describe("deleteCategoria", () => {
    it("throws CategoriaEnUsoError when referenced by a proyecto", () => {
      const categoria = createCategoria(db, { nombre: "Robótica Hobbie", color: "#3B82F6" });
      createProyecto(db, {
        titulo: "Brazo robótico",
        categoriaId: categoria.id,
        tiempoEstimadoH: 20,
        frecuenciaAvance: "semanal",
        estado: "idea",
        montoPago: null,
        carpetaDriveUrl: null,
        repositorioGhUrl: null,
      });

      expect(() => deleteCategoria(db, categoria.id)).toThrow(CategoriaEnUsoError);
      expect(listCategorias(db)).toHaveLength(1);
    });

    it("succeeds when the categoria is unreferenced", () => {
      const categoria = createCategoria(db, { nombre: "Sin usar", color: "#EF4444" });

      deleteCategoria(db, categoria.id);

      expect(listCategorias(db)).toEqual([]);
    });

    it("throws NotFoundError for a missing id", () => {
      expect(() => deleteCategoria(db, 999)).toThrow(NotFoundError);
    });

    it("regression: FK-restrict precedence — an in-use categoria still throws CategoriaEnUsoError, never NotFoundError", () => {
      const categoria = createCategoria(db, { nombre: "En uso", color: "#3B82F6" });
      createProyecto(db, {
        titulo: "Proyecto dependiente",
        categoriaId: categoria.id,
        tiempoEstimadoH: 10,
        frecuenciaAvance: "semanal",
        estado: "idea",
        montoPago: null,
        carpetaDriveUrl: null,
        repositorioGhUrl: null,
      });

      expect(() => deleteCategoria(db, categoria.id)).toThrow(CategoriaEnUsoError);
      expect(() => deleteCategoria(db, categoria.id)).not.toThrow(NotFoundError);
      expect(listCategorias(db)).toHaveLength(1);
    });
  });
});
