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

import { SelectionCheckbox } from "./selection-checkbox";

function setUrl(search: string) {
  mockUseSearchParams.mockReturnValue(new URLSearchParams(search));
}

describe("SelectionCheckbox", () => {
  beforeEach(() => {
    mockPush.mockClear();
    setUrl("modo=comparar");
  });

  it("is unchecked when the proyecto is not in the current seleccion", () => {
    render(<SelectionCheckbox proyectoId={5} />);

    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("is checked when the proyecto id is present in seleccion", () => {
    setUrl("modo=comparar&seleccion=1,5");

    render(<SelectionCheckbox proyectoId={5} />);

    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("checking an unselected proyecto adds it to the URL seleccion list", () => {
    setUrl("modo=comparar&seleccion=1");

    render(<SelectionCheckbox proyectoId={5} />);

    fireEvent.click(screen.getByRole("checkbox"));

    expect(mockPush).toHaveBeenCalledWith("/?modo=comparar&seleccion=1%2C5", { scroll: false });
  });

  it("unchecking a selected proyecto removes it from the URL seleccion list", () => {
    setUrl("modo=comparar&seleccion=1,5");

    render(<SelectionCheckbox proyectoId={5} />);

    fireEvent.click(screen.getByRole("checkbox"));

    expect(mockPush).toHaveBeenCalledWith("/?modo=comparar&seleccion=1", { scroll: false });
  });
});
