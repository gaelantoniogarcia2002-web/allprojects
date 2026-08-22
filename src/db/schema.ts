import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  real,
  integer,
  primaryKey,
  index,
  check,
} from "drizzle-orm/sqlite-core";

export const ESTADOS = ["idea", "en_desarrollo", "pausado", "finalizado"] as const;
export type Estado = (typeof ESTADOS)[number];

export const FRECUENCIAS_AVANCE = ["diario", "semanal", "ocasional"] as const;
export type FrecuenciaAvance = (typeof FRECUENCIAS_AVANCE)[number];

export const TIPOS_REFERENCIA = ["diseno_ui", "stack_tecnologico", "funcionalidad", "otro"] as const;
export type TipoReferencia = (typeof TIPOS_REFERENCIA)[number];

export const categorias = sqliteTable("categorias", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull().unique(),
  color: text("color").notNull(),
});

export const contactos = sqliteTable("contactos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  url: text("url"),
});

export const proyectos = sqliteTable(
  "proyectos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    titulo: text("titulo").notNull(),
    estado: text("estado").notNull().$type<Estado>(),
    categoriaId: integer("categoria_id")
      .notNull()
      .references(() => categorias.id, { onDelete: "restrict" }),
    tiempoEstimadoH: real("tiempo_estimado_h").notNull(),
    tiempoInvertidoH: real("tiempo_invertido_h").notNull().default(0),
    frecuenciaAvance: text("frecuencia_avance").notNull().$type<FrecuenciaAvance>(),
    montoPago: real("monto_pago"),
    carpetaDriveUrl: text("carpeta_drive_url"),
    repositorioGhUrl: text("repositorio_gh_url"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    check("estado_check", sql`${table.estado} IN (${sql.raw(ESTADOS.map((e) => `'${e}'`).join(", "))})`),
    check(
      "frecuencia_avance_check",
      sql`${table.frecuenciaAvance} IN (${sql.raw(FRECUENCIAS_AVANCE.map((f) => `'${f}'`).join(", "))})`
    ),
    check("tiempo_estimado_h_check", sql`${table.tiempoEstimadoH} >= 0`),
    check("tiempo_invertido_h_check", sql`${table.tiempoInvertidoH} >= 0`),
    index("proyectos_categoria_id_idx").on(table.categoriaId),
    index("proyectos_estado_idx").on(table.estado),
  ]
);

export const proyectoContactos = sqliteTable(
  "proyecto_contactos",
  {
    proyectoId: integer("proyecto_id")
      .notNull()
      .references(() => proyectos.id, { onDelete: "cascade" }),
    contactoId: integer("contacto_id")
      .notNull()
      .references(() => contactos.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.proyectoId, table.contactoId] })]
);

export const inspiraciones = sqliteTable(
  "inspiraciones",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    proyectoId: integer("proyecto_id")
      .notNull()
      .references(() => proyectos.id, { onDelete: "cascade" }),
    urlOrigen: text("url_origen").notNull(),
    tipoReferencia: text("tipo_referencia").notNull().$type<TipoReferencia>(),
    notas: text("notas"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    check(
      "tipo_referencia_check",
      sql`${table.tipoReferencia} IN (${sql.raw(TIPOS_REFERENCIA.map((t) => `'${t}'`).join(", "))})`
    ),
    index("inspiraciones_proyecto_id_idx").on(table.proyectoId),
  ]
);
