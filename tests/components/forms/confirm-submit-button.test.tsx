import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";

describe("ConfirmSubmitButton", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("submits without confirmation when no confirmMessage is given", () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ConfirmSubmitButton>Guardar</ConfirmSubmitButton>
      </form>
    );

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("blocks submission when the user declines the confirm dialog", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ConfirmSubmitButton confirmMessage="¿Eliminar proyecto?">Eliminar</ConfirmSubmitButton>
      </form>
    );

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits when the user accepts the confirm dialog", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ConfirmSubmitButton confirmMessage="¿Eliminar proyecto?">Eliminar</ConfirmSubmitButton>
      </form>
    );

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
