import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OverBudgetBadge } from "./over-budget-badge";
import { computeProgress } from "@/lib/gallery/progress";

describe("OverBudgetBadge", () => {
  it("shows the badge when the proyecto is over budget", () => {
    const { isOverBudget } = computeProgress(10, 12);
    render(<OverBudgetBadge isOverBudget={isOverBudget} />);

    expect(screen.getByText("⚠ Excedido")).toBeInTheDocument();
  });

  it("shows nothing when the proyecto is on budget", () => {
    const { isOverBudget } = computeProgress(10, 10);
    render(<OverBudgetBadge isOverBudget={isOverBudget} />);

    expect(screen.queryByText("⚠ Excedido")).not.toBeInTheDocument();
  });

  it("shows nothing when the estimate is zero, regardless of invertido", () => {
    const { isOverBudget } = computeProgress(0, 999);
    render(<OverBudgetBadge isOverBudget={isOverBudget} />);

    expect(screen.queryByText("⚠ Excedido")).not.toBeInTheDocument();
  });
});
