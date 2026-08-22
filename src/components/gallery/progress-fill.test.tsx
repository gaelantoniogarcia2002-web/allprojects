import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressFill } from "./progress-fill";
import { computeProgress } from "@/lib/gallery/progress";

describe("ProgressFill", () => {
  it("renders a solid fill whose width matches computeProgress's percent", () => {
    const { percent } = computeProgress(40, 10); // 25%
    render(<ProgressFill tintColor="color-mix(in srgb, #3B82F6 15%, transparent)" solidColor="#3B82F6" percent={percent} />);

    const fill = screen.getByRole("progressbar");
    expect(fill).toHaveAttribute("aria-valuenow", "25");
    expect(fill).toHaveStyle({ width: "25%", backgroundColor: "#3B82F6" });
  });

  it("clamps the visible fill at 100% when investido exceeds the estimate", () => {
    const { percent } = computeProgress(10, 15); // clamped to 100

    render(<ProgressFill tintColor="color-mix(in srgb, #22C55E 15%, transparent)" solidColor="#22C55E" percent={percent} />);

    const fill = screen.getByRole("progressbar");
    expect(fill).toHaveAttribute("aria-valuenow", "100");
    expect(fill).toHaveStyle({ width: "100%" });
  });

  it("renders the tint color as the track background", () => {
    render(<ProgressFill tintColor="color-mix(in srgb, #F97316 15%, transparent)" solidColor="#F97316" percent={0} />);

    expect(screen.getByTestId("progress-tint")).toHaveStyle({
      backgroundColor: "color-mix(in srgb, #F97316 15%, transparent)",
    });
  });
});
