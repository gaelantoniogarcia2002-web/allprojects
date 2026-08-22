import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { makeTestDb, type TestDb } from "../helpers/test-db";
import {
  categorias,
  contactos,
  proyectos,
  proyectoContactos,
  inspiraciones,
  ESTADOS,
  FRECUENCIAS_AVANCE,
  TIPOS_REFERENCIA,
} from "@/db/schema";

function insertCategoria(db: TestDb, nombre = "Robótica Hobbie", color = "#3B82F6") {
  return db.insert(categorias).values({ nombre, color }).returning().get();
}

function baseProyecto(categoriaId: number, overrides: Partial<typeof proyectos.$inferInsert> = {}) {
  return {
    titulo: "Proyecto de prueba",
    categoriaId,
    tiempoEstimadoH: 10,
    frecuenciaAvance: "semanal" as const,
    estado: "idea" as const,
    ...overrides,
  };
}

describe("schema constraints", () => {
  let db: TestDb;

  beforeEach(() => {
    db = makeTestDb();
  });

  describe("proyecto.estado CHECK", () => {
    it("rejects an invalid estado value", () => {
      const categoria = insertCategoria(db);
      expect(() =>
        db
          .insert(proyectos)
          .values({
            ...baseProyecto(categoria.id),
            // @ts-expect-error deliberately invalid for CHECK test
            estado: "archivado",
          })
          .run()
      ).toThrow();
    });

    it("accepts each defined estado value", () => {
      const categoria = insertCategoria(db);
      for (const estado of ESTADOS) {
        expect(() =>
          db
            .insert(proyectos)
            .values(baseProyecto(categoria.id, { estado, titulo: `Proyecto ${estado}` }))
            .run()
        ).not.toThrow();
      }
      const rows = db.select().from(proyectos).all();
      expect(rows).toHaveLength(ESTADOS.length);
    });
  });

  describe("proyecto.frecuencia_avance CHECK", () => {
    it("rejects an invalid frecuencia_avance value", () => {
      const categoria = insertCategoria(db);
      expect(() =>
        db
          .insert(proyectos)
          .values({
            ...baseProyecto(categoria.id),
            // @ts-expect-error deliberately invalid for CHECK test
            frecuenciaAvance: "mensual",
          })
          .run()
      ).toThrow();
    });
  });

  describe("inspiracion.tipo_referencia CHECK", () => {
    it("rejects an invalid tipo_referencia value", () => {
      const categoria = insertCategoria(db);
      const proyecto = db.insert(proyectos).values(baseProyecto(categoria.id)).returning().get();
      expect(() =>
        db
          .insert(inspiraciones)
          // @ts-expect-error deliberately invalid tipoReferencia for CHECK test
          .values({
            proyectoId: proyecto.id,
            urlOrigen: "https://example.com",
            tipoReferencia: "video",
          })
          .run()
      ).toThrow();
    });

    it("accepts each defined tipo_referencia value", () => {
      const categoria = insertCategoria(db);
      const proyecto = db.insert(proyectos).values(baseProyecto(categoria.id)).returning().get();
      for (const tipoReferencia of TIPOS_REFERENCIA) {
        expect(() =>
          db
            .insert(inspiraciones)
            .values({ proyectoId: proyecto.id, urlOrigen: "https://example.com", tipoReferencia })
            .run()
        ).not.toThrow();
      }
      const rows = db.select().from(inspiraciones).all();
      expect(rows).toHaveLength(TIPOS_REFERENCIA.length);
    });
  });

  describe("proyecto.titulo NOT NULL", () => {
    it("rejects a proyecto insert without titulo", () => {
      const categoria = insertCategoria(db);
      expect(() =>
        db
          .insert(proyectos)
          // @ts-expect-error deliberately missing required titulo field
          .values({
            categoriaId: categoria.id,
            tiempoEstimadoH: 10,
            frecuenciaAvance: "semanal",
            estado: "idea",
            titulo: undefined,
          })
          .run()
      ).toThrow();
    });
  });

  describe("categorias.nombre UNIQUE", () => {
    it("rejects a duplicate categoria nombre", () => {
      insertCategoria(db, "Automatización Trabajo", "#FF0000");
      expect(() => insertCategoria(db, "Automatización Trabajo", "#00FF00")).toThrow();
    });
  });

  describe("proyecto.categoria_id FK", () => {
    it("rejects a proyecto referencing a nonexistent categoria", () => {
      expect(() => db.insert(proyectos).values(baseProyecto(999)).run()).toThrow();
    });

    it("blocks deleting a categoria still referenced by a proyecto", () => {
      const categoria = insertCategoria(db);
      db.insert(proyectos).values(baseProyecto(categoria.id)).run();
      expect(() => db.delete(categorias).where(eq(categorias.id, categoria.id)).run()).toThrow();
      const remaining = db.select().from(categorias).where(eq(categorias.id, categoria.id)).all();
      expect(remaining).toHaveLength(1);
    });

    it("allows deleting a categoria referenced by no proyecto", () => {
      const categoria = insertCategoria(db);
      expect(() => db.delete(categorias).where(eq(categorias.id, categoria.id)).run()).not.toThrow();
      const remaining = db.select().from(categorias).where(eq(categorias.id, categoria.id)).all();
      expect(remaining).toHaveLength(0);
    });
  });

  describe("proyecto deletion cascades", () => {
    it("cascades delete to proyecto_contactos and inspiraciones, leaving contacto rows intact", () => {
      const categoria = insertCategoria(db);
      const proyecto = db.insert(proyectos).values(baseProyecto(categoria.id)).returning().get();
      const contactoA = db.insert(contactos).values({ nombre: "Ana" }).returning().get();
      const contactoB = db.insert(contactos).values({ nombre: "Beto" }).returning().get();
      db.insert(proyectoContactos).values({ proyectoId: proyecto.id, contactoId: contactoA.id }).run();
      db.insert(proyectoContactos).values({ proyectoId: proyecto.id, contactoId: contactoB.id }).run();
      db.insert(inspiraciones)
        .values({ proyectoId: proyecto.id, urlOrigen: "https://example.com", tipoReferencia: "otro" })
        .run();

      db.delete(proyectos).where(eq(proyectos.id, proyecto.id)).run();

      const joinRows = db.select().from(proyectoContactos).where(eq(proyectoContactos.proyectoId, proyecto.id)).all();
      const inspiracionRows = db.select().from(inspiraciones).where(eq(inspiraciones.proyectoId, proyecto.id)).all();
      const remainingContactos = db.select().from(contactos).all();

      expect(joinRows).toHaveLength(0);
      expect(inspiracionRows).toHaveLength(0);
      expect(remainingContactos).toHaveLength(2);
    });
  });

  describe("contacto deletion removes only join rows", () => {
    it("removes the join row and leaves the proyecto row unaffected", () => {
      const categoria = insertCategoria(db);
      const proyecto = db.insert(proyectos).values(baseProyecto(categoria.id)).returning().get();
      const contacto = db.insert(contactos).values({ nombre: "Ana" }).returning().get();
      db.insert(proyectoContactos).values({ proyectoId: proyecto.id, contactoId: contacto.id }).run();

      db.delete(contactos).where(eq(contactos.id, contacto.id)).run();

      const joinRows = db.select().from(proyectoContactos).all();
      const proyectoRows = db.select().from(proyectos).where(eq(proyectos.id, proyecto.id)).all();

      expect(joinRows).toHaveLength(0);
      expect(proyectoRows).toHaveLength(1);
    });
  });

  describe("tiempo_estimado_h / tiempo_invertido_h non-negative", () => {
    it("accepts zero tiempo_estimado_h", () => {
      const categoria = insertCategoria(db);
      expect(() =>
        db.insert(proyectos).values(baseProyecto(categoria.id, { tiempoEstimadoH: 0 })).run()
      ).not.toThrow();
    });

    it("rejects negative tiempo_estimado_h", () => {
      const categoria = insertCategoria(db);
      expect(() =>
        db.insert(proyectos).values(baseProyecto(categoria.id, { tiempoEstimadoH: -5 })).run()
      ).toThrow();
    });

    it("rejects negative tiempo_invertido_h", () => {
      const categoria = insertCategoria(db);
      expect(() =>
        db.insert(proyectos).values(baseProyecto(categoria.id, { tiempoInvertidoH: -1 })).run()
      ).toThrow();
    });

    it("defaults tiempo_invertido_h to 0 when omitted", () => {
      const categoria = insertCategoria(db);
      const proyecto = db.insert(proyectos).values(baseProyecto(categoria.id)).returning().get();
      expect(proyecto.tiempoInvertidoH).toBe(0);
    });
  });
});
