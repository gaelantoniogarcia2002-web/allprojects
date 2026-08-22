import { describe, it, expect } from "vitest";
import { computeProgress } from "./progress";

describe("computeProgress", () => {
  it("renders a proportional fill for partial progress", () => {
    const result = computeProgress(40, 10);
    expect(result.percent).toBe(25);
    expect(result.isOverBudget).toBe(false);
  });

  it("clamps the fill to 100% when invertido exceeds estimado", () => {
    const result = computeProgress(10, 15);
    expect(result.percent).toBe(100);
    expect(result.isOverBudget).toBe(true);
  });

  it("returns 0% and no over-budget flag when estimado is zero, without dividing by zero", () => {
    const result = computeProgress(0, 0);
    expect(result.percent).toBe(0);
    expect(result.isOverBudget).toBe(false);
    expect(Number.isFinite(result.percent)).toBe(true);
  });

  it("does not flag over-budget when invertido exactly equals estimado", () => {
    const result = computeProgress(10, 10);
    expect(result.percent).toBe(100);
    expect(result.isOverBudget).toBe(false);
  });

  it("never flags over-budget when estimado is zero regardless of invertido", () => {
    const result = computeProgress(0, 5);
    expect(result.percent).toBe(0);
    expect(result.isOverBudget).toBe(false);
  });
});
