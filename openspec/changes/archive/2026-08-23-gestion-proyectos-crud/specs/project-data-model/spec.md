# Delta for Project Data Model

## ADDED Requirements

### Requirement: Categoria Update

The system MUST support updating an existing `Categoria`'s `nombre` and/or `color`. Updating against a nonexistent id MUST raise `NotFoundError`.

#### Scenario: Update a categoria's color
- GIVEN a categoria exists
- WHEN it is updated with a new `color`
- THEN the row persists the new `color` value

#### Scenario: Update raises NotFoundError for a missing id
- GIVEN no categoria exists with id `999`
- WHEN an update is issued against id `999`
- THEN the system MUST raise `NotFoundError`

### Requirement: Contacto Update

The system MUST support updating an existing `Contacto`'s `nombre` and/or `url`. Updating against a nonexistent id MUST raise `NotFoundError`.

#### Scenario: Update a contacto's nombre
- GIVEN a contacto exists
- WHEN it is updated with a new `nombre`
- THEN the row persists the new `nombre` value

#### Scenario: Update raises NotFoundError for a missing id
- GIVEN no contacto exists with id `999`
- WHEN an update is issued against id `999`
- THEN the system MUST raise `NotFoundError`

## MODIFIED Requirements

### Requirement: Proyecto Deletion Cascades to Dependent Rows

Deleting a `Proyecto` MUST cascade-delete its `proyecto_contactos` join rows and its `Inspiracion` rows, without deleting the referenced `Contacto` or `Categoria` rows themselves. Updating or deleting a `Proyecto` against a nonexistent id MUST raise `NotFoundError` instead of returning falsy.
(Previously: update/delete against a missing id returned falsy with no thrown error.)

#### Scenario: Delete a proyecto with contacts and inspiraciones
- GIVEN a proyecto has two linked contactos and one inspiracion
- WHEN the proyecto is deleted
- THEN the join rows and the inspiracion row are removed, and both contacto rows remain

#### Scenario: Update or delete raises NotFoundError for a missing id
- GIVEN no proyecto exists with id `999`
- WHEN an update or delete is issued against id `999`
- THEN the system MUST raise `NotFoundError`

### Requirement: Contacto Deletion Removes Only Join Rows

The system MUST allow deleting a `Contacto` at any time. Deleting a `Contacto` MUST cascade-delete only its rows in `proyecto_contactos`; it MUST NOT delete or restrict the associated `Proyecto` rows. Deleting a `Contacto` against a nonexistent id MUST raise `NotFoundError` instead of returning falsy.
(Previously: delete against a missing id returned falsy with no thrown error.)

#### Scenario: Delete a contacto linked to a proyecto
- GIVEN a contacto linked to one proyecto via `proyecto_contactos`
- WHEN the contacto is deleted
- THEN the join row is removed and the proyecto row remains unaffected

#### Scenario: Delete raises NotFoundError for a missing id
- GIVEN no contacto exists with id `999`
- WHEN a delete is issued against id `999`
- THEN the system MUST raise `NotFoundError`

### Requirement: Inspiracion Entity

The system MUST persist an `Inspiracion` with `id` (PK), `proyecto_id` (required FK to `Proyecto`), `url_origen` (required text), `tipo_referencia` (required enum), `notas` (optional text) and `created_at` timestamp. Deleting a `Proyecto` MUST cascade-delete its `Inspiracion` rows. Deleting an `Inspiracion` against a nonexistent id MUST raise `NotFoundError` instead of returning falsy.
(Previously: delete against a missing id returned falsy with no thrown error.)

#### Scenario: Create an inspiracion for a proyecto
- GIVEN a proyecto exists
- WHEN an inspiracion is inserted with `proyecto_id`, `url_origen` and `tipo_referencia` set
- THEN the row persists with `created_at` populated

#### Scenario: Cascade delete inspiraciones with their proyecto
- GIVEN a proyecto has two inspiraciones
- WHEN the proyecto is deleted
- THEN both inspiracion rows are also deleted

#### Scenario: Delete raises NotFoundError for a missing id
- GIVEN no inspiracion exists with id `999`
- WHEN a delete is issued against id `999`
- THEN the system MUST raise `NotFoundError`
