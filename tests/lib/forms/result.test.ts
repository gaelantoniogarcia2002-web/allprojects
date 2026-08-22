import { describe, it, expect } from "vitest";
import { ok, fail, toActionError } from "@/lib/forms/result";
import { NotFoundError, CategoriaEnUsoError } from "@/db/errors";

function sqliteConstraintError(code: string, message: string): Error {
  const err = new Error(message) as Error & { code: string };
  err.code = code;
  return err;
}

describe("ok/fail", () => {
  it("wraps a value in an ok result", () => {
    expect(ok(42)).toEqual({ ok: true, data: 42 });
  });

  it("wraps an error message in a fail result", () => {
    expect(fail("boom")).toEqual({ ok: false, error: "boom", fieldErrors: undefined });
  });

  it("wraps an error message with fieldErrors in a fail result", () => {
    expect(fail("boom", { titulo: "required" })).toEqual({
      ok: false,
      error: "boom",
      fieldErrors: { titulo: "required" },
    });
  });
});

describe("toActionError", () => {
  it("maps NotFoundError to a fail result with its message", () => {
    const result = toActionError(new NotFoundError("Proyecto", 5));
    expect(result).toEqual({ ok: false, error: "Proyecto with id 5 was not found.", fieldErrors: undefined });
  });

  it("maps CategoriaEnUsoError to a fail result with its message", () => {
    const result = toActionError(new CategoriaEnUsoError(3));
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected fail result");
    expect(result.error).toContain("Categoria 3");
  });

  it("maps a SQLITE_CONSTRAINT_UNIQUE error to a duplicate-record message", () => {
    const result = toActionError(sqliteConstraintError("SQLITE_CONSTRAINT_UNIQUE", "UNIQUE constraint failed"));
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected fail result");
    expect(result.error).toMatch(/ya existe/i);
  });

  it("maps a SQLITE_CONSTRAINT_FOREIGNKEY error to a missing-reference message", () => {
    const result = toActionError(sqliteConstraintError("SQLITE_CONSTRAINT_FOREIGNKEY", "FOREIGN KEY constraint failed"));
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected fail result");
    expect(result.error).toMatch(/no existe/i);
  });

  it("rethrows an unknown error instead of swallowing it", () => {
    const boom = new Error("unexpected");
    expect(() => toActionError(boom)).toThrow(boom);
  });
});
