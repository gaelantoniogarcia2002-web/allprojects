import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProyectoForm } from "@/components/forms/proyecto-form";
import type { ActionResult } from "@/lib/forms/result";

const categorias = [{ id: 1, nombre: "Robótica", color: "#3B82F6" }];
const contactos = [{ id: 1, nombre: "Ana", url: null }];

describe("ProyectoForm", () => {
  it("submits the filled titulo/categoria and checked contactos to the given action", async () => {
    const action = vi.fn(async (_prevState: ActionResult | null, _formData: FormData): Promise<ActionResult> => ({
      ok: true,
      data: undefined,
    }));

    render(<ProyectoForm action={action} categorias={categorias} contactos={contactos} />);

    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Brazo robótico" } });
    fireEvent.change(screen.getByLabelText("Categoría"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Tiempo estimado (h)"), { target: { value: "40" } });
    fireEvent.click(screen.getByLabelText("Ana"));
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));

    const [, formData] = action.mock.calls[0];
    expect(formData.get("titulo")).toBe("Brazo robótico");
    expect(formData.get("categoria_id")).toBe("1");
    expect(formData.getAll("contactoId")).toEqual(["1"]);
  });

  it("renders the action's error result inline instead of navigating away", async () => {
    const action = vi.fn(async (): Promise<ActionResult> => ({ ok: false, error: "El título es obligatorio." }));

    render(<ProyectoForm action={action} categorias={categorias} contactos={contactos} />);

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText("El título es obligatorio.")).toBeInTheDocument();
  });

  it("pre-fills fields from defaultValues and pre-checks selectedContactoIds (edit reuse)", () => {
    const action = vi.fn(async (): Promise<ActionResult> => ({ ok: true, data: undefined }));

    render(
      <ProyectoForm
        action={action}
        categorias={categorias}
        contactos={contactos}
        defaultValues={{ titulo: "Dashboard IoT", categoriaId: 1 }}
        selectedContactoIds={[1]}
        submitLabel="Guardar cambios"
      />
    );

    expect(screen.getByLabelText("Título")).toHaveValue("Dashboard IoT");
    expect(screen.getByLabelText("Ana")).toBeChecked();
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();
  });
});
