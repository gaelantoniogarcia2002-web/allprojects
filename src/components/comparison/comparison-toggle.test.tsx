import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const { mockPush, mockUseSearchParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUseSearchParams: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: mockUseSearchParams,
}));

import { ComparisonToggle } from "./comparison-toggle";

function setUrl(search: string) {
  mockUseSearchParams.mockReturnValue(new URLSearchParams(search));
}

describe("ComparisonToggle", () => {
  beforeEach(() => {
    mockPush.mockClear();
    setUrl("");
  });

  it("enabling comparison mode writes modo=comparar to the URL", () => {
    render(<ComparisonToggle />);

    fireEvent.click(screen.getByRole("checkbox"));

    expect(mockPush).toHaveBeenCalledWith("/?modo=comparar", { scroll: false });
  });

  it("disabling comparison mode clears the current selection", () => {
    setUrl("modo=comparar&seleccion=1,3");

    render(<ComparisonToggle />);

    fireEvent.click(screen.getByRole("checkbox"));

    expect(mockPush).toHaveBeenCalledWith("/", { scroll: false });
  });

  it("reflects the active comparison mode from the current URL", () => {
    setUrl("modo=comparar");

    render(<ComparisonToggle />);

    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("is unchecked when comparison mode is not active", () => {
    render(<ComparisonToggle />);

    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });
});
