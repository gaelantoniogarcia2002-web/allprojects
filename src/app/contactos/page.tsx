import { getDb } from "@/db/client";
import { listContactos } from "@/db/repositories/contactos";
import { ContactoRow } from "@/components/forms/contacto-row";
import { editarContactoAction, eliminarContactoAction } from "./actions";

/**
 * Standalone contacto list/edit/delete screen (`taxonomy-management`
 * §Contacto List, Edit and Delete Screen). Delete always succeeds behind a
 * single confirmation click — only `proyecto_contactos` join rows cascade.
 */
export default async function ContactosPage() {
  const db = getDb();
  const contactos = listContactos(db);

  return (
    <main>
      <h1>Contactos</h1>
      <ul data-testid="contactos-list">
        {contactos.map((contacto) => (
          <ContactoRow
            key={contacto.id}
            contacto={contacto}
            editAction={editarContactoAction.bind(null, contacto.id)}
            deleteAction={eliminarContactoAction.bind(null, contacto.id)}
          />
        ))}
      </ul>
    </main>
  );
}
