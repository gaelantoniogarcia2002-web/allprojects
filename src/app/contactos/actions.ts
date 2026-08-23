"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db/client";
import { updateContacto, deleteContacto } from "@/db/repositories/contactos";
import { parseContacto } from "@/lib/forms/parse-taxonomia";
import { ok, toActionError, type ActionResult } from "@/lib/forms/result";

/**
 * `useActionState`-compatible Server Action backing the inline edit form on
 * `/contactos` (`taxonomy-management` §Contacto List, Edit and Delete
 * Screen). `contactoId` is pre-bound by the page (`.bind(null, id)`).
 */
export async function editarContactoAction(
  contactoId: number,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseContacto(formData);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  try {
    const db = getDb();
    updateContacto(db, contactoId, parsed.value);
  } catch (err) {
    return toActionError(err);
  }

  revalidatePath("/");
  return ok(undefined);
}

/**
 * Deletes a contacto behind a single confirmation click. Always succeeds
 * for an existing id — `ON DELETE CASCADE` removes only its
 * `proyecto_contactos` join rows, leaving every referenced proyecto
 * untouched (`taxonomy-management` §Contacto Deletion Is Always Allowed).
 */
export async function eliminarContactoAction(contactoId: number): Promise<ActionResult> {
  try {
    const db = getDb();
    deleteContacto(db, contactoId);
  } catch (err) {
    return toActionError(err);
  }

  revalidatePath("/");
  return ok(undefined);
}
