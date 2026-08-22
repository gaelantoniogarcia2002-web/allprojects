import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createDb } from "@/db/client";

const url = process.env.DATABASE_URL ?? "./data/allprojects.db";
const { db, close } = createDb(url);

migrate(db, { migrationsFolder: "./drizzle" });
close();

// eslint-disable-next-line no-console
console.log(`Migrations applied to ${url}`);
