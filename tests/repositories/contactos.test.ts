import { describe, it, expect, beforeEach } from "vitest";
import { makeTestDb, type TestDb } from "../helpers/test-db";
import {
  createContacto,
  listContactos,
  vincularContacto,
  desvincularContacto,
  updateContacto,
  deleteContacto,
} from "@/db/repositories/contactos";
import { createCategoria } from "@/db/repositories/categorias";
import { createProyecto } from "@/db/repositories/proyectos";
import { proyectoContactos, proyectos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NotFoundError } from "@/db/errors";

function makeProyecto(db: TestDb, titulo = "Brazo robótico") {
  const categoria = createCategoria(db, { nombre: "Robótica", color: "#3B82F6" });
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

describe("contactos repository", () => {
  let db: TestDb;

  beforeEach(() => {
    db = makeTestDb();
  });

  describe("createContacto", () => {
    it("persists a contacto and returns it with a generated id", () => {
      const contacto = createContacto(db, { nombre: "Ada Lovelace", url: "https://example.com" });

      expect(contacto.id).toBeGreaterThan(0);
      expect(contacto.nombre).toBe("Ada Lovelace");
      expect(contacto.url).toBe("https://example.com");
    });
  });

  describe("listContactos", () => {
    it("returns all persisted contactos", () => {
      createContacto(db, { nombre: "Ada Lovelace", url: null });
      createContacto(db, { nombre: "Alan Turing", url: null });

      const contactos = listContactos(db);

      expect(contactos).toHaveLength(2);
      expect(contactos.map((c) => c.nombre).sort()).toEqual(["Ada Lovelace", "Alan Turing"]);
    });
  });

  describe("vincularContacto / desvincularContacto", () => {
    it("links a contacto to a proyecto", () => {
      const proyecto = makeProyecto(db);
      const contacto = createContacto(db, { nombre: "Ada Lovelace", url: null });

      vincularContacto(db, proyecto.id, contacto.id);

      const links = db.select().from(proyectoContactos).where(eq(proyectoContactos.proyectoId, proyecto.id)).all();
      expect(links).toHaveLength(1);
      expect(links[0].contactoId).toBe(contacto.id);
    });

    it("is idempotent when linking the same pair twice", () => {
      const proyecto = makeProyecto(db);
      const contacto = createContacto(db, { nombre: "Ada Lovelace", url: null });

      vincularContacto(db, proyecto.id, contacto.id);
      vincularContacto(db, proyecto.id, contacto.id);

      const links = db.select().from(proyectoContactos).where(eq(proyectoContactos.proyectoId, proyecto.id)).all();
      expect(links).toHaveLength(1);
    });

    it("is idempotent when unlinking a pair that was never linked", () => {
      const proyecto = makeProyecto(db);
      const contacto = createContacto(db, { nombre: "Ada Lovelace", url: null });

      expect(() => desvincularContacto(db, proyecto.id, contacto.id)).not.toThrow();

      const links = db.select().from(proyectoContactos).where(eq(proyectoContactos.proyectoId, proyecto.id)).all();
      expect(links).toHaveLength(0);
    });

    it("removes an existing link", () => {
      const proyecto = makeProyecto(db);
      const contacto = createContacto(db, { nombre: "Ada Lovelace", url: null });
      vincularContacto(db, proyecto.id, contacto.id);

      desvincularContacto(db, proyecto.id, contacto.id);

      const links = db.select().from(proyectoContactos).where(eq(proyectoContactos.proyectoId, proyecto.id)).all();
      expect(links).toHaveLength(0);
    });
  });

  describe("updateContacto", () => {
    it("updates a contacto's nombre", () => {
      const contacto = createContacto(db, { nombre: "Ada Lovelace", url: null });

      const updated = updateContacto(db, contacto.id, { nombre: "Ada King" });

      expect(updated.nombre).toBe("Ada King");
      expect(updated.url).toBeNull();
    });

    it("updates a contacto's url", () => {
      const contacto = createContacto(db, { nombre: "Ada Lovelace", url: null });

      const updated = updateContacto(db, contacto.id, { url: "https://example.com" });

      expect(updated.url).toBe("https://example.com");
      expect(updated.nombre).toBe("Ada Lovelace");
    });

    it("throws NotFoundError for a missing id", () => {
      expect(() => updateContacto(db, 999, { nombre: "Ghost" })).toThrow(NotFoundError);
    });
  });

  describe("deleteContacto", () => {
    it("cascades only join rows, leaving the proyecto and other contactos untouched", () => {
      const proyecto = makeProyecto(db);
      const contacto = createContacto(db, { nombre: "Ada Lovelace", url: null });
      const otroContacto = createContacto(db, { nombre: "Alan Turing", url: null });
      vincularContacto(db, proyecto.id, contacto.id);
      vincularContacto(db, proyecto.id, otroContacto.id);

      deleteContacto(db, contacto.id);

      const links = db.select().from(proyectoContactos).where(eq(proyectoContactos.proyectoId, proyecto.id)).all();
      expect(links.map((l) => l.contactoId)).toEqual([otroContacto.id]);
      expect(listContactos(db).map((c) => c.id)).toEqual([otroContacto.id]);
      const proyectoRow = db.select().from(proyectos).where(eq(proyectos.id, proyecto.id)).get();
      expect(proyectoRow?.id).toBe(proyecto.id);
    });

    it("throws NotFoundError when the contacto does not exist", () => {
      expect(() => deleteContacto(db, 999)).toThrow(NotFoundError);
    });
  });
});
