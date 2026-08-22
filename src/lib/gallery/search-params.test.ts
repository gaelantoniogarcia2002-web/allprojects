import { describe, it, expect } from "vitest";
import { parseGalleryParams, buildGalleryHref } from "./search-params";

describe("parseGalleryParams", () => {
  it("parses categoria, contacto, modo and seleccion from search params", () => {
    const result = parseGalleryParams({
      categoria: "3",
      contacto: "7",
      modo: "comparar",
      seleccion: "1,3,5",
    });

    expect(result).toEqual({
      categoriaId: 3,
      contactoId: 7,
      comparisonMode: true,
      seleccion: [1, 3, 5],
    });
  });

  it("drops non-numeric categoria/contacto values silently instead of throwing", () => {
    expect(() =>
      parseGalleryParams({ categoria: "not-a-number", contacto: "also-bad" })
    ).not.toThrow();

    const result = parseGalleryParams({ categoria: "not-a-number", contacto: "also-bad" });
    expect(result.categoriaId).toBeUndefined();
    expect(result.contactoId).toBeUndefined();
  });

  it("defaults comparisonMode to false and seleccion to an empty array when absent", () => {
    const result = parseGalleryParams({});
    expect(result.comparisonMode).toBe(false);
    expect(result.seleccion).toEqual([]);
  });

  it("drops non-numeric entries from seleccion while keeping valid ones", () => {
    const result = parseGalleryParams({ seleccion: "1,abc,3" });
    expect(result.seleccion).toEqual([1, 3]);
  });
});

describe("buildGalleryHref", () => {
  it("round-trips a full GalleryParams state through parse and build", () => {
    const current = parseGalleryParams({
      categoria: "3",
      contacto: "7",
      modo: "comparar",
      seleccion: "1,3,5",
    });

    const href = buildGalleryHref(current, {});
    const reparsed = parseGalleryParams(
      Object.fromEntries(new URLSearchParams(href.split("?")[1] ?? "").entries())
    );

    expect(reparsed).toEqual(current);
  });

  it("applies a patch to change only the targeted field", () => {
    const current = parseGalleryParams({ categoria: "3", modo: "comparar", seleccion: "1,3" });
    const href = buildGalleryHref(current, { categoriaId: undefined });

    const reparsed = parseGalleryParams(
      Object.fromEntries(new URLSearchParams(href.split("?")[1] ?? "").entries())
    );

    expect(reparsed.categoriaId).toBeUndefined();
    expect(reparsed.comparisonMode).toBe(true);
    expect(reparsed.seleccion).toEqual([1, 3]);
  });
});
