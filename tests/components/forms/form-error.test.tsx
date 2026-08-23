import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormError } from "@/components/forms/form-error";

describe("FormError", () => {
  it("renders nothing when there is no result yet", () => {
    render(<FormError result={null} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders nothing when the result succeeded", () => {
    render(<FormError result={{ ok: true, data: undefined }} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders the error message when the result failed", () => {
    render(<FormError result={{ ok: false, error: "El título es obligatorio." }} />);
    expect(screen.getByRole("alert")).toHaveTextContent("El título es obligatorio.");
  });
});
