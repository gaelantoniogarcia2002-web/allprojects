import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createDb, type Db } from "@/db/client";
import { seed } from "../scripts/seed";
import { listProyectos, getProyectoConDetalle } from "@/db/repositories/proyectos";
import { listCategorias } from "@/db/repositories/categorias";
import { listContactos } from "@/db/repositories/contactos";

describe("seed script", () => {
  let dbPath: string;
  let db: Db;
  let close: () => void;

  beforeEach(() => {
    dbPath = path.join(os.tmpdir(), `allprojects-seed-test-${Date.now()}-${Math.random()}.db`);
    const conn = createDb(dbPath);
    db = conn.db;
    close = conn.close;
    migrate(db, { migrationsFolder: "./drizzle" });
  });

  afterEach(() => {
    close();
    for (const suffix of ["", "-journal", "-wal", "-shm"]) {
      fs.rmSync(`${dbPath}${suffix}`, { force: true });
    }
  });

  it("inserts 2-3 proyectos, each with categoria, at least one contacto and at least one inspiracion linked", () => {
    seed(db);

    const proyectos = listProyectos(db);
    expect(proyectos.length).toBeGreaterThanOrEqual(2);
    expect(proyectos.length).toBeLessThanOrEqual(3);

    for (const proyecto of proyectos) {
      expect(proyecto.categoria).toBeDefined();
      const detalle = getProyectoConDetalle(db, proyecto.id);
      expect(detalle).not.toBeNull();
      expect(detalle?.contactos.length).toBeGreaterThanOrEqual(1);
      expect(detalle?.inspiraciones.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("covers at least two distinct estado values across seeded proyectos", () => {
    seed(db);

    const estados = new Set(listProyectos(db).map((p) => p.estado));
    expect(estados.size).toBeGreaterThanOrEqual(2);
  });

  it("is idempotent when re-run without --reset: completes without throwing and does not duplicate rows", () => {
    seed(db);
    const proyectoCountAfterFirstRun = listProyectos(db).length;
    const categoriaCountAfterFirstRun = listCategorias(db).length;
    const contactoCountAfterFirstRun = listContactos(db).length;

    expect(() => seed(db)).not.toThrow();

    expect(listProyectos(db)).toHaveLength(proyectoCountAfterFirstRun);
    expect(listCategorias(db)).toHaveLength(categoriaCountAfterFirstRun);
    expect(listContactos(db)).toHaveLength(contactoCountAfterFirstRun);
  });

  it("supports --reset: wipes existing rows and reseeds cleanly", () => {
    seed(db);
    seed(db, { reset: true });

    const proyectos = listProyectos(db);
    expect(proyectos.length).toBeGreaterThanOrEqual(2);
    expect(proyectos.length).toBeLessThanOrEqual(3);
  });
});
