"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db/client";
import { updateCategoria, deleteCategoria } from "@/db/repositories/categorias";
import { parseCategoria } from "@/lib/forms/parse-taxonomia";
import { ok, toActionError, type ActionResult } from "@/lib/forms/result";

/**
 * `useActionState`-compatible Server Action backing the inline edit form on
 * `/categorias` (`taxonomy-management` §Categoria List, Edit and Delete
 * Screen). `categoriaId` is pre-bound by the page (`.bind(null, id)`).
 */
export async function editarCategoriaAction(
  categoriaId: number,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseCategoria(formData);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  try {
    const db = getDb();
    updateCategoria(db, categoriaId, parsed.value);
  } catch (err) {
    return toActionError(err);
  }

  revalidatePath("/");
  return ok(undefined);
}

/**
 * Deletes a categoria behind a single confirmation step. Blocked inline
 * (`{ok:false}`) when `CategoriaEnUsoError` is thrown by the repository
 * because at least one proyecto still references it (`taxonomy-management`
 * §Categoria Deletion Blocked When In Use) — no redirect either way, the
 * row list re-renders in place.
 */
export async function eliminarCategoriaAction(categoriaId: number): Promise<ActionResult> {
  try {
    const db = getDb();
    deleteCategoria(db, categoriaId);
  } catch (err) {
    return toActionError(err);
  }

  revalidatePath("/");
  return ok(undefined);
}
