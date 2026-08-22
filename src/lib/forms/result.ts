import { CategoriaEnUsoError, NotFoundError } from "@/db/errors";

/**
 * Discriminated result returned by every mutation Server Action. `ok:false`
 * carries a user-facing message and, for validation failures, per-field
 * messages so a form can render inline errors next to the offending input.
 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Discriminated result returned by pure `parse-*.ts` functions. Unlike
 * `ActionResult`, `fieldErrors` is always present (even if empty) so a form
 * can index into it without an `?.` check.
 */
export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; fieldErrors: Record<string, string> };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(error: string, fieldErrors?: Record<string, string>): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

function isSqliteConstraintError(err: unknown): err is Error & { code: string } {
  return (
    err instanceof Error &&
    "code" in err &&
    typeof (err as { code?: unknown }).code === "string" &&
    (err as { code: string }).code.startsWith("SQLITE_CONSTRAINT")
  );
}

/**
 * Translates a caught repository error into an `ActionResult`. Handles the
 * business-level errors defined in `db/errors.ts` plus SQLite constraint
 * failures (UNIQUE / FOREIGN KEY) that surface directly from an insert or
 * update. Any other error is a genuine bug and is rethrown so it still
 * reaches Next's error overlay.
 */
export function toActionError(err: unknown): ActionResult<never> {
  if (err instanceof NotFoundError) {
    return fail(err.message);
  }
  if (err instanceof CategoriaEnUsoError) {
    return fail(err.message);
  }
  if (isSqliteConstraintError(err)) {
    if (err.code.includes("UNIQUE")) {
      return fail("Ya existe un registro con esos datos.");
    }
    if (err.code.includes("FOREIGNKEY")) {
      return fail("La categoría o el contacto seleccionado no existe.");
    }
    return fail("La operación no pudo completarse por una restricción de datos.");
  }
  throw err;
}
