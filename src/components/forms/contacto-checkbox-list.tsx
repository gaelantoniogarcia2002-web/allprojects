import type { Contacto } from "@/db/types";

type ContactoCheckboxListProps = {
  contactos: Contacto[];
  selectedIds?: number[];
};

/**
 * Checkbox list (not a native multi-select, per `project-authoring`
 * §Contacto Association) associating existing contactos with a proyecto.
 * Every checkbox shares `name="contactoId"` so the surrounding form reads
 * the checked set via `FormData.getAll("contactoId")`. `selectedIds`
 * pre-checks already-linked contactos, reused by the Phase 3 edit form.
 */
export function ContactoCheckboxList({ contactos, selectedIds = [] }: ContactoCheckboxListProps) {
  return (
    <fieldset data-testid="contacto-checkbox-list">
      <legend>Contactos</legend>
      {contactos.map((contacto) => (
        <label key={contacto.id} htmlFor={`contacto-${contacto.id}`}>
          <input
            type="checkbox"
            id={`contacto-${contacto.id}`}
            name="contactoId"
            value={contacto.id}
            defaultChecked={selectedIds.includes(contacto.id)}
          />
          {contacto.nombre}
        </label>
      ))}
    </fieldset>
  );
}
