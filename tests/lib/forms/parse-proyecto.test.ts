import { describe, it, expect } from "vitest";
import { parseProyecto } from "@/lib/forms/parse-proyecto";

function buildFormData(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  const base: Record<string, string> = {
    titulo: "Brazo robótico",
    categoria_id: "1",
    tiempo_estimado_h: "40",
    tiempo_invertido_h: "10",
    frecuencia_avance: "semanal",
    estado: "idea",
  };
  for (const [key, value] of Object.entries({ ...base, ...overrides })) {
    fd.set(key, value);
  }
  return fd;
}

describe("parseProyecto", () => {
  it("returns ok:true with the parsed value for valid data", () => {
    const result = parseProyecto(buildFormData());

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok result");
    expect(result.value).toMatchObject({
      titulo: "Brazo robótico",
      categoriaId: 1,
      tiempoEstimadoH: 40,
      tiempoInvertidoH: 10,
      frecuenciaAvance: "semanal",
      estado: "idea",
      contactoIds: [],
    });
  });

  it("collects contactoId values via getAll into contactoIds", () => {
    const fd = buildFormData();
    fd.append("contactoId", "1");
    fd.append("contactoId", "2");

    const result = parseProyecto(fd);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok result");
    expect(result.value.contactoIds).toEqual([1, 2]);
  });

  it("rejects an empty titulo", () => {
    const result = parseProyecto(buildFormData({ titulo: "" }));

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected fail result");
    expect(result.fieldErrors.titulo).toBeDefined();
  });

  it("rejects a whitespace-only titulo", () => {
    const result = parseProyecto(buildFormData({ titulo: "   " }));

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected fail result");
    expect(result.fieldErrors.titulo).toBeDefined();
  });

  it("rejects a negative tiempo_estimado_h", () => {
    const result = parseProyecto(buildFormData({ tiempo_estimado_h: "-5" }));

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected fail result");
    expect(result.fieldErrors.tiempo_estimado_h).toBeDefined();
  });

  it("rejects a NaN tiempo_estimado_h", () => {
    const result = parseProyecto(buildFormData({ tiempo_estimado_h: "no-es-un-numero" }));

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected fail result");
    expect(result.fieldErrors.tiempo_estimado_h).toBeDefined();
  });

  it("rejects a negative tiempo_invertido_h", () => {
    const result = parseProyecto(buildFormData({ tiempo_invertido_h: "-1" }));

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected fail result");
    expect(result.fieldErrors.tiempo_invertido_h).toBeDefined();
  });

  it("rejects a NaN tiempo_invertido_h", () => {
    const result = parseProyecto(buildFormData({ tiempo_invertido_h: "abc" }));

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected fail result");
    expect(result.fieldErrors.tiempo_invertido_h).toBeDefined();
  });

  it("defaults tiempo_invertido_h to 0 when omitted", () => {
    const fd = buildFormData();
    fd.delete("tiempo_invertido_h");

    const result = parseProyecto(fd);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok result");
    expect(result.value.tiempoInvertidoH).toBe(0);
  });

  it("rejects an invalid estado", () => {
    const result = parseProyecto(buildFormData({ estado: "cancelado" }));

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected fail result");
    expect(result.fieldErrors.estado).toBeDefined();
  });

  it("rejects an invalid frecuencia_avance", () => {
    const result = parseProyecto(buildFormData({ frecuencia_avance: "mensual" }));

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected fail result");
    expect(result.fieldErrors.frecuencia_avance).toBeDefined();
  });

  it("rejects a missing categoria_id", () => {
    const fd = buildFormData();
    fd.delete("categoria_id");

    const result = parseProyecto(fd);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected fail result");
    expect(result.fieldErrors.categoria_id).toBeDefined();
  });

  it("rejects a non-numeric categoria_id", () => {
    const result = parseProyecto(buildFormData({ categoria_id: "no-es-un-id" }));

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected fail result");
    expect(result.fieldErrors.categoria_id).toBeDefined();
  });

  it("parses optional monto_pago, carpeta_drive_url and repositorio_gh_url when present, null when absent", () => {
    const withValues = parseProyecto(
      buildFormData({
        monto_pago: "150.5",
        carpeta_drive_url: "https://drive.example/x",
        repositorio_gh_url: "https://github.com/x/y",
      })
    );
    expect(withValues.ok).toBe(true);
    if (!withValues.ok) throw new Error("expected ok result");
    expect(withValues.value.montoPago).toBe(150.5);
    expect(withValues.value.carpetaDriveUrl).toBe("https://drive.example/x");
    expect(withValues.value.repositorioGhUrl).toBe("https://github.com/x/y");

    const withoutValues = parseProyecto(buildFormData());
    expect(withoutValues.ok).toBe(true);
    if (!withoutValues.ok) throw new Error("expected ok result");
    expect(withoutValues.value.montoPago).toBeNull();
    expect(withoutValues.value.carpetaDriveUrl).toBeNull();
    expect(withoutValues.value.repositorioGhUrl).toBeNull();
  });
});
