import { describe, it, expect, beforeEach } from "vitest";
import { makeTestDb, type TestDb } from "../helpers/test-db";
import { createCategoria, listCategorias, deleteCategoria } from "@/db/repositories/categorias";
import { createProyecto } from "@/db/repositories/proyectos";
import { CategoriaEnUsoError } from "@/db/errors";

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
  });
});
