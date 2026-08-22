import type { categorias, contactos, proyectos, inspiraciones } from "./schema";

export type Categoria = typeof categorias.$inferSelect;
export type NuevaCategoria = Omit<typeof categorias.$inferInsert, "id">;

export type Contacto = typeof contactos.$inferSelect;
export type NuevoContacto = Omit<typeof contactos.$inferInsert, "id">;

export type Proyecto = typeof proyectos.$inferSelect;
export type NuevoProyecto = Omit<typeof proyectos.$inferInsert, "id" | "createdAt" | "updatedAt">;

export type Inspiracion = typeof inspiraciones.$inferSelect;
export type NuevaInspiracion = Omit<typeof inspiraciones.$inferInsert, "id" | "createdAt">;

export type ProyectoConDetalle = Proyecto & {
  categoria: Categoria;
  contactos: Contacto[];
  inspiraciones: Inspiracion[];
};

export type FiltroProyectos = {
  estado?: Proyecto["estado"];
  categoriaId?: number;
  contactoId?: number;
};
