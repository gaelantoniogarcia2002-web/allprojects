import { describe, it, expect } from "vitest";
import { parseCategoria, parseContacto } from "@/lib/forms/parse-taxonomia";

function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

describe("parseCategoria", () => {
  it("parses a valid nombre and color", () => {
    const result = parseCategoria(buildFormData({ nombre: "Robótica", color: "#3B82F6" }));

    expect(result).toEqual({ ok: true, value: { nombre: "Robótica", color: "#3B82F6" } });
  });

  it("rejects an empty nombre", () => {
    const result = parseCategoria(buildFormData({ nombre: "   ", color: "#3B82F6" }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.nombre).toBeDefined();
    }
  });

  it("rejects a missing color", () => {
    const result = parseCategoria(buildFormData({ nombre: "Robótica", color: "" }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.color).toBeDefined();
    }
  });

  it("rejects a color that isn't a hex-ish string", () => {
    const result = parseCategoria(buildFormData({ nombre: "Robótica", color: "blue" }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.color).toBeDefined();
    }
  });
});

describe("parseContacto", () => {
  it("parses a valid nombre with url", () => {
    const result = parseContacto(buildFormData({ nombre: "Ana", url: "https://example.com" }));

    expect(result).toEqual({ ok: true, value: { nombre: "Ana", url: "https://example.com" } });
  });

  it("parses a valid nombre with url omitted", () => {
    const result = parseContacto(buildFormData({ nombre: "Ana" }));

    expect(result).toEqual({ ok: true, value: { nombre: "Ana", url: null } });
  });

  it("collapses a whitespace-only url to null", () => {
    const result = parseContacto(buildFormData({ nombre: "Ana", url: "   " }));

    expect(result).toEqual({ ok: true, value: { nombre: "Ana", url: null } });
  });

  it("rejects an empty nombre", () => {
    const result = parseContacto(buildFormData({ nombre: "   ", url: "https://example.com" }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.nombre).toBeDefined();
    }
  });
});
