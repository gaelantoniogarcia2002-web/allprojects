import { describe, it, expect } from "vitest";
import { toTint, toSolid } from "./color";

describe("toTint", () => {
  it("returns a color-mix() expression blending the hex color as a transparent tint", () => {
    expect(toTint("#3B82F6")).toBe("color-mix(in srgb, #3B82F6 15%, transparent)");
  });

  it("uses a custom alpha percentage when provided", () => {
    expect(toTint("#EF4444", 30)).toBe("color-mix(in srgb, #EF4444 30%, transparent)");
  });
});

describe("toSolid", () => {
  it("returns the hex color unchanged at full opacity", () => {
    expect(toSolid("#3B82F6")).toBe("#3B82F6");
  });

  it("returns a different value for a different hex input", () => {
    expect(toSolid("#10B981")).toBe("#10B981");
    expect(toSolid("#10B981")).not.toBe(toSolid("#3B82F6"));
  });
});
