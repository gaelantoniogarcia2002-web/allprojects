# Project Data Model Specification

## Purpose

Define the persisted entities, fields, enums, relationships and referential-integrity rules for `Proyecto`, `Categoria`, `Contacto` and `Inspiracion` — the relational foundation the future gallery/filter/comparison UI will query. This spec covers the data layer only; no UI or presentation behavior is in scope.

## Requirements

### Requirement: Proyecto Entity

The system MUST persist a `Proyecto` with `id` (PK), `titulo` (required, non-empty text), `categoria_id` (required, FK to `Categoria`), `tiempo_estimado_h` (required numeric), `tiempo_invertido_h` (numeric, default 0), `frecuencia_avance` (required enum), `estado` (required enum), `monto_pago` (optional numeric), `carpeta_drive_url` (optional text), `repositorio_gh_url` (optional text), `created_at` and `updated_at` timestamps.

#### Scenario: Create a valid proyecto

- GIVEN a `categoria` already exists
- WHEN a proyecto is inserted with `titulo`, `categoria_id`, `tiempo_estimado_h`, `frecuencia_avance` and `estado` set
- THEN the row persists with `tiempo_invertido_h` defaulted to 0 and both timestamps populated

#### Scenario: Reject missing titulo

- GIVEN a proyecto insert without `titulo`
- WHEN the insert is executed
- THEN the system MUST reject it with a NOT NULL constraint violation

#### Scenario: Reject proyecto referencing a nonexistent categoria

- GIVEN no `categoria` row exists with id `999`
- WHEN a proyecto is inserted with `categoria_id = 999`
- THEN the system MUST reject it with a foreign key constraint violation

### Requirement: Estado Enum Enforcement

The system MUST restrict `proyecto.estado` to the closed set `idea`, `en_desarrollo`, `pausado`, `finalizado`, enforced by a database CHECK constraint.

#### Scenario: Reject invalid estado

- GIVEN a proyecto insert with `estado = 'archivado'`
- WHEN the insert is executed
- THEN the system MUST reject it with a CHECK constraint violation

#### Scenario: Accept each defined estado value

- GIVEN a proyecto insert for each of `idea`, `en_desarrollo`, `pausado`, `finalizado`
- WHEN each insert is executed
- THEN all four persist successfully

### Requirement: Frecuencia Avance Enum Enforcement

The system MUST restrict `proyecto.frecuencia_avance` to the closed set `diario`, `semanal`, `ocasional`, enforced by a database CHECK constraint.

#### Scenario: Reject invalid frecuencia_avance

- GIVEN a proyecto insert with `frecuencia_avance = 'mensual'`
- WHEN the insert is executed
- THEN the system MUST reject it with a CHECK constraint violation

### Requirement: Tiempo Estimado Non-Negative

The system MUST NOT allow `tiempo_estimado_h` or `tiempo_invertido_h` to be negative. A value of `0` MUST be accepted as valid at the data layer; progress-percentage computation and any divide-by-zero handling belong to a future UI/consumer layer, not this data model.

#### Scenario: Accept zero tiempo_estimado_h

- GIVEN a proyecto insert with `tiempo_estimado_h = 0`
- WHEN the insert is executed
- THEN the row persists successfully

#### Scenario: Reject negative tiempo_estimado_h

- GIVEN a proyecto insert with `tiempo_estimado_h = -5`
- WHEN the insert is executed
- THEN the system MUST reject it with a CHECK constraint violation

#### Scenario: Reject negative tiempo_invertido_h

- GIVEN a proyecto insert with `tiempo_invertido_h = -1`
- WHEN the insert is executed
- THEN the system MUST reject it with a CHECK constraint violation

### Requirement: Categoria Entity

The system MUST persist a `Categoria` with `id` (PK), `nombre` (required, unique text) and `color` (required text, a user-chosen hex string). The system MUST NOT derive or compute `color` automatically; it is stored exactly as provided.

#### Scenario: Create a categoria with a user-chosen color

- GIVEN a categoria insert with `nombre = 'Robótica Hobbie'` and `color = '#3B82F6'`
- WHEN the insert is executed
- THEN the row persists with `color` stored verbatim as `#3B82F6`

#### Scenario: Reject duplicate categoria nombre

- GIVEN a categoria `Automatización Trabajo` already exists
- WHEN a second categoria is inserted with the same `nombre`
- THEN the system MUST reject it with a UNIQUE constraint violation

### Requirement: Categoria Deletion Is Restricted When Referenced

The system MUST prevent deletion of a `Categoria` that is still referenced by at least one `Proyecto`. The foreign key from `proyecto.categoria_id` MUST NOT cascade on delete.

#### Scenario: Block deleting a referenced categoria

- GIVEN a categoria referenced by at least one proyecto
- WHEN a delete is issued against that categoria
- THEN the system MUST reject it with a foreign key restriction error and the categoria row MUST remain

#### Scenario: Allow deleting an unreferenced categoria

- GIVEN a categoria referenced by no proyecto
- WHEN a delete is issued against that categoria
- THEN the deletion succeeds

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

### Requirement: Contacto Entity and Proyecto Association

The system MUST persist a `Contacto` with `id` (PK), `nombre` (required text) and `url` (optional text). The system MUST support a many-to-many association between `Proyecto` and `Contacto` via a `proyecto_contactos` join table keyed on `(proyecto_id, contacto_id)`.

#### Scenario: Associate a contacto with multiple proyectos

- GIVEN one contacto and two proyectos already exist
- WHEN the contacto is linked to both proyectos via `proyecto_contactos`
- THEN both join rows persist and each proyecto's contact list includes that contacto

#### Scenario: Re-link an already-linked contacto is idempotent

- GIVEN a proyecto and contacto are already linked
- WHEN the same `(proyecto_id, contacto_id)` pair is linked again
- THEN the operation succeeds without error and no duplicate join row is created

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

### Requirement: Tipo Referencia Enum Enforcement

The system MUST restrict `inspiracion.tipo_referencia` to the closed set `diseno_ui`, `stack_tecnologico`, `funcionalidad`, `otro`, enforced by a database CHECK constraint.

#### Scenario: Reject invalid tipo_referencia

- GIVEN an inspiracion insert with `tipo_referencia = 'video'`
- WHEN the insert is executed
- THEN the system MUST reject it with a CHECK constraint violation

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
