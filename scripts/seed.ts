import { createDb, type Db } from "@/db/client";
import {
  createCategoria,
  listCategorias,
  deleteCategoria,
  createContacto,
  listContactos,
  deleteContacto,
  createProyecto,
  listProyectos,
  deleteProyecto,
  vincularContacto,
  createInspiracion,
} from "@/db/repositories";
import type { NuevaCategoria, NuevaInspiracion, NuevoContacto, NuevoProyecto } from "@/db/types";

const CATEGORIAS: NuevaCategoria[] = [
  { nombre: "Robótica Hobbie", color: "#3B82F6" },
  { nombre: "Automatización Agencia", color: "#F97316" },
  { nombre: "Automatización Trabajo", color: "#10B981" },
];

const CONTACTOS: NuevoContacto[] = [
  { nombre: "Ana Torres", url: "https://github.com/anatorres" },
  { nombre: "Marcos Liu", url: null },
  { nombre: "Elena Ríos", url: "https://linkedin.com/in/elenarios" },
];

interface ProyectoSeed {
  categoriaIndex: number;
  data: Omit<NuevoProyecto, "categoriaId">;
  contactoIndexes: number[];
  inspiraciones: Omit<NuevaInspiracion, "proyectoId">[];
}

// Three fictitious personal-automation projects. Deliberately covers:
// - distinct estado values (en_desarrollo / idea / finalizado)
// - one over-budget project (tiempoInvertidoH > tiempoEstimadoH)
// - one project with montoPago: null
// - inspiraciones spanning all four tipo_referencia values
const PROYECTOS: ProyectoSeed[] = [
  {
    categoriaIndex: 0,
    data: {
      titulo: "Brazo Robótico Casero",
      estado: "en_desarrollo",
      tiempoEstimadoH: 40,
      tiempoInvertidoH: 55,
      frecuenciaAvance: "semanal",
      montoPago: 300,
      carpetaDriveUrl: null,
      repositorioGhUrl: "https://github.com/example/brazo-robotico",
    },
    contactoIndexes: [0, 1],
    inspiraciones: [
      { urlOrigen: "https://example.com/ref/brazo-diseno", tipoReferencia: "diseno_ui", notas: null },
      {
        urlOrigen: "https://example.com/ref/brazo-stack",
        tipoReferencia: "stack_tecnologico",
        notas: "Comparar micro-controladores compatibles",
      },
    ],
  },
  {
    categoriaIndex: 1,
    data: {
      titulo: "Bot de Reportes para Cliente",
      estado: "idea",
      tiempoEstimadoH: 15,
      tiempoInvertidoH: 0,
      frecuenciaAvance: "ocasional",
      montoPago: null,
      carpetaDriveUrl: "https://drive.google.com/example-bot-reportes",
      repositorioGhUrl: null,
    },
    contactoIndexes: [1],
    inspiraciones: [
      { urlOrigen: "https://example.com/ref/bot-funcionalidad", tipoReferencia: "funcionalidad", notas: null },
    ],
  },
  {
    categoriaIndex: 2,
    data: {
      titulo: "Script de Backups Internos",
      estado: "finalizado",
      tiempoEstimadoH: 10,
      tiempoInvertidoH: 9,
      frecuenciaAvance: "diario",
      montoPago: 0,
      carpetaDriveUrl: null,
      repositorioGhUrl: "https://github.com/example/backups-internos",
    },
    contactoIndexes: [2],
    inspiraciones: [
      { urlOrigen: "https://example.com/ref/backups-otro", tipoReferencia: "otro", notas: null },
      { urlOrigen: "https://example.com/ref/backups-diseno", tipoReferencia: "diseno_ui", notas: null },
    ],
  },
];

function insertSeedData(db: Db): void {
  const categoriaIds = CATEGORIAS.map((categoria) => createCategoria(db, categoria).id);
  const contactoIds = CONTACTOS.map((contacto) => createContacto(db, contacto).id);

  for (const proyectoSeed of PROYECTOS) {
    const proyecto = createProyecto(db, {
      ...proyectoSeed.data,
      categoriaId: categoriaIds[proyectoSeed.categoriaIndex],
    });

    for (const contactoIndex of proyectoSeed.contactoIndexes) {
      vincularContacto(db, proyecto.id, contactoIds[contactoIndex]);
    }

    for (const inspiracion of proyectoSeed.inspiraciones) {
      createInspiracion(db, { ...inspiracion, proyectoId: proyecto.id });
    }
  }
}

// Deletes every seeded row, child-first: proyectos (cascades to
// proyecto_contactos + inspiraciones), then contactos, then categorias
// (would otherwise be blocked by the categoria_id FK RESTRICT).
function wipe(db: Db): void {
  for (const proyecto of listProyectos(db)) deleteProyecto(db, proyecto.id);
  for (const contacto of listContactos(db)) deleteContacto(db, contacto.id);
  for (const categoria of listCategorias(db)) deleteCategoria(db, categoria.id);
}

/**
 * Seeds 3 fictitious proyectos (with categorias, contactos and
 * inspiraciones) in a single transaction. Pass `{ reset: true }` to wipe
 * all existing rows first. Without `reset`, re-running against
 * already-seeded data throws on `UNIQUE(categorias.nombre)` instead of
 * silently duplicating rows — the whole transaction rolls back.
 */
export function seed(db: Db, options: { reset?: boolean } = {}): void {
  db.transaction((tx) => {
    if (options.reset) {
      wipe(tx as unknown as Db);
    }
    insertSeedData(tx as unknown as Db);
  });
}

const isMainModule = process.argv[1] !== undefined && import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const url = process.env.DATABASE_URL ?? "./data/allprojects.db";
  const { db, close } = createDb(url);
  const reset = process.argv.slice(2).includes("--reset");

  try {
    seed(db, { reset });
    // eslint-disable-next-line no-console
    console.log(`Seed complete (${url})${reset ? " [reset]" : ""}.`);
  } finally {
    close();
  }
}
