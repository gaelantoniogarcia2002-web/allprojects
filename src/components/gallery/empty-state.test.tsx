import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("shows the no-proyectos message by default", () => {
    render(<EmptyState />);

    expect(screen.getByText(/todavía no hay proyectos/i)).toBeInTheDocument();
  });

  it("shows a distinct no-matches message for the filtered/empty variant", () => {
    render(<EmptyState variant="no-matches" />);

    expect(screen.getByText(/ningún proyecto coincide/i)).toBeInTheDocument();
    expect(screen.queryByText(/todavía no hay proyectos/i)).not.toBeInTheDocument();
  });
});
