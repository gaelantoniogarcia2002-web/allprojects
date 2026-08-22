"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { createProyecto, vincularContacto } from "@/db/repositories";
import { parseProyecto } from "@/lib/forms/parse-proyecto";
import { toActionError, type ActionResult } from "@/lib/forms/result";

/**
 * `useActionState`-compatible Server Action backing `/proyectos/nuevo`.
 * Parses `formData` with the pure `parseProyecto`, persists the proyecto and
 * its contacto links, then revalidates the gallery and redirects to the new
 * detail page. `redirect()` runs OUTSIDE the try/catch so its `NEXT_REDIRECT`
 * control-flow error is never swallowed by `toActionError`.
 */
export async function crearProyectoAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseProyecto(formData);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  const { contactoIds, ...input } = parsed.value;

  let proyectoId: number;
  try {
    const db = getDb();
    const proyecto = createProyecto(db, input);
    for (const contactoId of contactoIds) {
      vincularContacto(db, proyecto.id, contactoId);
    }
    proyectoId = proyecto.id;
  } catch (err) {
    return toActionError(err);
  }

  revalidatePath("/");
  redirect(`/proyectos/${proyectoId}`);
}
