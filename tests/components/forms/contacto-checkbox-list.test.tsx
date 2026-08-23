import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContactoCheckboxList } from "@/components/forms/contacto-checkbox-list";

const contactos = [
  { id: 1, nombre: "Ana", url: null },
  { id: 2, nombre: "Beto", url: null },
];

function renderInForm(onSubmit: (values: string[]) => void, selectedIds?: number[]) {
  return render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget).getAll("contactoId").map(String));
      }}
    >
      <ContactoCheckboxList contactos={contactos} selectedIds={selectedIds} />
      <button type="submit">Enviar</button>
    </form>
  );
}

describe("ContactoCheckboxList", () => {
  it("emits one contactoId value per checked checkbox via FormData.getAll", () => {
    const onSubmit = vi.fn();
    renderInForm(onSubmit);

    fireEvent.click(screen.getByLabelText("Ana"));
    fireEvent.click(screen.getByLabelText("Beto"));
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(onSubmit).toHaveBeenCalledWith(["1", "2"]);
  });

  it("omits unchecked contactos from the FormData payload", () => {
    const onSubmit = vi.fn();
    renderInForm(onSubmit);

    fireEvent.click(screen.getByLabelText("Beto"));
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(onSubmit).toHaveBeenCalledWith(["2"]);
  });

  it("pre-checks contactos from selectedIds and includes them in the submitted payload without re-clicking", () => {
    const onSubmit = vi.fn();
    renderInForm(onSubmit, [1]);

    expect(screen.getByLabelText("Ana")).toBeChecked();
    expect(screen.getByLabelText("Beto")).not.toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(onSubmit).toHaveBeenCalledWith(["1"]);
  });
});
