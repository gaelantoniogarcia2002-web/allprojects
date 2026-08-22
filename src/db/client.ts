import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

export type Db = BetterSQLite3Database<typeof schema>;

/**
 * Opens a new SQLite connection at `url`, enables foreign key enforcement,
 * and returns a Drizzle client plus a `close()` handle.
 */
export function createDb(url: string): { db: Db; close(): void } {
  const sqlite = new Database(url);
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  return { db, close: () => sqlite.close() };
}

let singleton: Db | undefined;

/**
 * Returns a process-wide singleton `Db` connected to `DATABASE_URL`
 * (defaults to `./data/allprojects.db`).
 */
export function getDb(): Db {
  if (!singleton) {
    const url = process.env.DATABASE_URL ?? "./data/allprojects.db";
    singleton = createDb(url).db;
  }
  return singleton;
}
