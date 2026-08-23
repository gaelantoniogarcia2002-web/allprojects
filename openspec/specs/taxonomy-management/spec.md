# Taxonomy Management Specification

## Purpose

Define standalone list/edit/delete screens for `Categoria` and `Contacto`, independent of the proyecto authoring flow. This spec covers Server Action behavior; visual layout is not in scope.

## Requirements

### Requirement: Categoria List, Edit and Delete Screen

The system MUST expose `/categorias`, listing every categoria with `nombre` and `color`, and allowing in-place edit and delete for each.

#### Scenario: Edit a categoria's nombre or color
- GIVEN a categoria exists
- WHEN its `nombre` and/or `color` are edited and submitted with valid values
- THEN the row updates and the list reflects the new values
- AND any gallery card using that categoria reflects the new color on next render, with no additional propagation step required

#### Scenario: Reject empty nombre
- GIVEN the edit form is submitted with `nombre` empty or whitespace-only
- WHEN validation runs
- THEN the action returns `{ok:false, error}` and no update occurs

#### Scenario: Reject a duplicate nombre
- GIVEN another categoria already has the submitted `nombre`
- WHEN the edit form is submitted
- THEN the action returns `{ok:false, error}` derived from the UNIQUE constraint violation

#### Scenario: Act on a missing categoria id
- GIVEN no categoria exists with the given id
- WHEN an edit or delete is attempted against it
- THEN the action catches `NotFoundError` and returns `{ok:false, error}`

### Requirement: Categoria Deletion Blocked When In Use

The system MUST block deleting a categoria still referenced by at least one proyecto and MUST show the resulting message inline on the `/categorias` screen, without offering a reassignment flow.

#### Scenario: Delete an in-use categoria
- GIVEN a categoria is referenced by at least one proyecto
- WHEN the user attempts to delete it
- THEN the action catches `CategoriaEnUsoError` and returns `{ok:false, error}`, the message renders inline next to the row, and the row remains in the list

#### Scenario: Delete an unreferenced categoria
- GIVEN a categoria is referenced by no proyecto
- WHEN the user confirms its deletion
- THEN the row is removed from the database and disappears from the list

### Requirement: Contacto List, Edit and Delete Screen

The system MUST expose `/contactos`, listing every contacto with `nombre` and `url`, and allowing in-place edit and delete for each.

#### Scenario: Edit a contacto's nombre or url
- GIVEN a contacto exists
- WHEN its `nombre` and/or `url` are edited and submitted with valid values
- THEN the row updates and the list reflects the new values

#### Scenario: Reject empty nombre
- GIVEN the edit form is submitted with `nombre` empty or whitespace-only
- WHEN validation runs
- THEN the action returns `{ok:false, error}` and no update occurs

#### Scenario: Act on a missing contacto id
- GIVEN no contacto exists with the given id
- WHEN an edit or delete is attempted against it
- THEN the action catches `NotFoundError` and returns `{ok:false, error}`

### Requirement: Contacto Deletion Is Always Allowed

Deleting a contacto MUST always succeed behind a simple confirm click, cascading only its `proyecto_contactos` join rows without affecting any proyecto row.

#### Scenario: Delete a contacto linked to a proyecto
- GIVEN a contacto is linked to a proyecto
- WHEN the user confirms deletion via a simple confirm click
- THEN the contacto row and its join rows are removed, the row disappears from `/contactos`, and the linked proyecto is unaffected
