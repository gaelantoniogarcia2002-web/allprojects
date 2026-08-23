import { describe, it, expect } from "vitest";
import { parseInspiracion } from "@/lib/forms/parse-inspiracion";

function buildFormData(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  const base: Record<string, string> = {
    url_origen: "https://example.com/reference",
    tipo_referencia: "diseno_ui",
  };
  for (const [key, value] of Object.entries({ ...base, ...overrides })) {
    fd.set(key, value);
  }
  return fd;
}

describe("parseInspiracion", () => {
  it("parses a valid submission with notas omitted", () => {
    const result = parseInspiracion(buildFormData());

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        urlOrigen: "https://example.com/reference",
        tipoReferencia: "diseno_ui",
        notas: null,
      });
    }
  });

  it("parses a valid submission with notas present", () => {
    const fd = buildFormData({ tipo_referencia: "stack_tecnologico" });
    fd.set("notas", "Comparar con proyecto anterior");

    const result = parseInspiracion(fd);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.notas).toBe("Comparar con proyecto anterior");
      expect(result.value.tipoReferencia).toBe("stack_tecnologico");
    }
  });

  it("rejects an empty or whitespace-only url_origen", () => {
    const result = parseInspiracion(buildFormData({ url_origen: "   " }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.url_origen).toBeDefined();
    }
  });

  it("rejects a tipo_referencia outside the closed enum set", () => {
    const result = parseInspiracion(buildFormData({ tipo_referencia: "no_valido" }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.tipo_referencia).toBeDefined();
    }
  });

  it("treats a whitespace-only notas as null", () => {
    const fd = buildFormData();
    fd.set("notas", "   ");

    const result = parseInspiracion(fd);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.notas).toBeNull();
    }
  });
});
