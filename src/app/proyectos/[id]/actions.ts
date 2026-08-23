"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { updateProyecto, deleteProyecto } from "@/db/repositories/proyectos";
import { createInspiracion, deleteInspiracion } from "@/db/repositories/inspiraciones";
import { parseProyecto } from "@/lib/forms/parse-proyecto";
import { parseInspiracion } from "@/lib/forms/parse-inspiracion";
import { ok, toActionError, type ActionResult } from "@/lib/forms/result";

/**
 * `useActionState`-compatible Server Action backing the edit form on
 * `/proyectos/[id]`. `proyectoId` is pre-bound by the page (`.bind(null,
 * id)`) so the resulting function matches `ProyectoForm`'s
 * `(prevState, formData) => Promise<ActionResult>` shape. `revalidatePath`
 * runs after a successful update; no redirect since editing stays on the
 * same detail page.
 */
export async function editarProyectoAction(
  proyectoId: number,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseProyecto(formData);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  const { contactoIds: _contactoIds, ...input } = parsed.value;

  try {
    const db = getDb();
    updateProyecto(db, proyectoId, input);
  } catch (err) {
    return toActionError(err);
  }

  revalidatePath("/");
  return ok(undefined);
}

/**
 * Deletes the proyecto behind a single confirmation step
 * (`ConfirmSubmitButton`'s `window.confirm` gate). `redirect()` runs
 * OUTSIDE the try/catch so its `NEXT_REDIRECT` control-flow error is never
 * swallowed by `toActionError`.
 */
export async function eliminarProyectoAction(proyectoId: number): Promise<ActionResult> {
  try {
    const db = getDb();
    deleteProyecto(db, proyectoId);
  } catch (err) {
    return toActionError(err);
  }

  revalidatePath("/");
  redirect("/");
}

/**
 * Adds an inspiracion to the proyecto's sub-list. `proyectoId` is
 * pre-bound by the page, matching the same `(prevState, formData)` shape
 * used by `editarProyectoAction`.
 */
export async function agregarInspiracionAction(
  proyectoId: number,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseInspiracion(formData);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  try {
    const db = getDb();
    createInspiracion(db, { ...parsed.value, proyectoId });
  } catch (err) {
    return toActionError(err);
  }

  revalidatePath("/");
  return ok(undefined);
}

/**
 * Deletes one inspiracion row. No inline editing is supported for
 * inspiraciones (`project-authoring` §Inspiraciones Sub-Management).
 */
export async function eliminarInspiracionAction(inspiracionId: number): Promise<ActionResult> {
  try {
    const db = getDb();
    deleteInspiracion(db, inspiracionId);
  } catch (err) {
    return toActionError(err);
  }

  revalidatePath("/");
  return ok(undefined);
}
