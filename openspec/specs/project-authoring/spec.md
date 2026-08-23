# Project Authoring Specification

## Purpose

Define the UI write path for creating, editing and deleting a `Proyecto`, including its `Inspiracion` sub-list and `Contacto` associations. This spec covers Server Action behavior and validation; visual layout is not in scope.

## Requirements

### Requirement: Proyecto Creation Form

The system MUST expose a create form at `/proyectos/nuevo` covering every `NuevoProyecto` field (`titulo`, `categoria_id`, `tiempo_estimado_h`, `tiempo_invertido_h`, `frecuencia_avance`, `estado`, `monto_pago`, `carpeta_drive_url`, `repositorio_gh_url`) plus a contacto checkbox list, submitted via a Server Action.

#### Scenario: Create a proyecto with valid data
- GIVEN a user fills `titulo`, `categoria_id`, `tiempo_estimado_h`, `frecuencia_avance` and `estado`
- WHEN the form is submitted
- THEN the proyecto persists, `revalidatePath("/")` runs, and the user is redirected to `/proyectos/[id]`

#### Scenario: Reject empty titulo
- GIVEN the form is submitted with `titulo` empty or whitespace-only
- WHEN validation runs
- THEN the action returns `{ok:false, error}` with a field-level message and no row is inserted

#### Scenario: Reject negative tiempo values
- GIVEN `tiempo_estimado_h` or `tiempo_invertido_h` is negative
- WHEN the form is submitted
- THEN the action returns `{ok:false, error}` before reaching the database

#### Scenario: Reject invalid estado or frecuencia_avance
- GIVEN `estado` or `frecuencia_avance` is outside its closed enum set
- WHEN the form is submitted
- THEN the action returns `{ok:false, error}` with a field-level message

#### Scenario: Reject a nonexistent categoria_id
- GIVEN `categoria_id` does not reference an existing categoria
- WHEN the form is submitted
- THEN the action returns `{ok:false, error}` without inserting the proyecto

### Requirement: Proyecto Detail, Edit and Delete

The system MUST expose `/proyectos/[id]`, backed by `getProyectoConDetalle`, allowing in-place editing of all creation fields and deletion of the proyecto behind a single confirmation step.

#### Scenario: Edit an existing proyecto
- GIVEN a proyecto exists
- WHEN its fields are edited and submitted with valid values
- THEN the row updates, `revalidatePath` runs, and the same detail page reflects the new values

#### Scenario: Delete a proyecto after confirmation
- GIVEN a proyecto exists with linked inspiraciones and contactos
- WHEN the user confirms deletion via a single confirmation step
- THEN the proyecto, its `proyecto_contactos` join rows and its inspiraciones are removed (per `project-data-model` cascade rules), and the user is redirected to the gallery
- AND no undo option is offered

#### Scenario: Act on a missing proyecto id
- GIVEN no proyecto exists with the given id
- WHEN an edit or delete is attempted against it
- THEN the action catches `NotFoundError` and returns `{ok:false, error}`, never Next's error overlay

#### Scenario: tiempo_invertido_h is only editable via the full form
- GIVEN a proyecto is displayed in the gallery
- WHEN the user wants to update `tiempo_invertido_h`
- THEN no quick-log control exists on the card; the value MUST be changed through the `/proyectos/[id]` edit form

### Requirement: Inspiraciones Sub-Management

The system MUST allow adding and deleting `Inspiracion` rows for a proyecto from its detail page, without supporting inline editing of an existing inspiracion.

#### Scenario: Add an inspiracion
- GIVEN a proyecto detail page is open
- WHEN the user submits `url_origen` and `tipo_referencia` (and optional `notas`) via the add form
- THEN a new inspiracion row persists and appears in the sub-list

#### Scenario: Delete an inspiracion
- GIVEN a proyecto has at least one inspiracion
- WHEN the user deletes it
- THEN the row is removed and no longer appears in the sub-list

#### Scenario: Reject an inspiracion with an invalid tipo_referencia
- GIVEN the add form is submitted with `tipo_referencia` outside the closed enum set
- WHEN validation runs
- THEN the action returns `{ok:false, error}` and no row is inserted

### Requirement: Contacto Association via Checkbox List

The system MUST let a user associate existing contactos with a proyecto through a checkbox list (not a native multi-select) on the create/edit form.

#### Scenario: Associate multiple contactos
- GIVEN two contactos exist
- WHEN both checkboxes are checked and the form is submitted
- THEN both `proyecto_contactos` join rows persist for that proyecto

#### Scenario: Re-submitting the same association is idempotent
- GIVEN a proyecto is already linked to a contacto
- WHEN the edit form is submitted with that same contacto checked
- THEN no duplicate join row is created

### Requirement: Business Errors Never Reach the Error Overlay

Every proyecto and inspiracion mutation Server Action MUST catch `NotFoundError` and any repository error and return a discriminated result `{ok:true, ...} | {ok:false, error:string}` instead of letting it bubble to Next's error overlay.

#### Scenario: Repository error is surfaced inline
- GIVEN a mutation action encounters a caught error
- WHEN the action completes
- THEN the caller receives `{ok:false, error}` and the page renders the message inline
