# Project Filtering Specification

## Purpose

Define read-only, URL-driven filtering of the gallery by `categoria` and `contacto`, so the resulting view is shareable and reproducible via a link, without introducing client-side state management.

## Requirements

### Requirement: Categoría Filter

The system MUST allow the user to select at most one `categoria` to narrow the gallery to proyectos whose `categoria_id` matches the selection, and MUST encode the selection in a URL search parameter.

#### Scenario: Filter by a single categoria

- GIVEN proyectos exist across multiple categorias
- WHEN the user selects one categoria in the filter control
- THEN the gallery shows only proyectos belonging to that categoria and the URL includes the categoria selection

#### Scenario: Clearing the categoria filter shows all proyectos

- GIVEN a categoria filter is active
- WHEN the user clears the categoria selection
- THEN the gallery shows proyectos from every categoria and the URL no longer includes the categoria parameter

### Requirement: Contacto Filter

The system MUST allow the user to select at most one `contacto` to narrow the gallery to proyectos associated with that contacto, and MUST encode the selection in a URL search parameter.

#### Scenario: Filter by a single contacto

- GIVEN proyectos are linked to different contactos
- WHEN the user selects one contacto in the filter control
- THEN the gallery shows only proyectos associated with that contacto and the URL includes the contacto selection

### Requirement: Combined Categoría and Contacto Filtering

When both a categoría and a contacto filter are set, the system MUST apply them as an intersection (AND), returning only proyectos that satisfy both conditions.

#### Scenario: Both filters narrow to their intersection

- GIVEN a proyecto A matches the selected categoria but not the selected contacto, and a proyecto B matches both
- WHEN both filters are set
- THEN the gallery shows proyecto B only

### Requirement: URL-Driven, Shareable Filter State

The system MUST derive all active filters from URL search parameters on page load and MUST update those parameters when the user changes a filter, so that reloading or sharing the URL reproduces the identical filtered view.

#### Scenario: Reloading the URL reproduces the filtered view

- GIVEN a URL with `?categoria=2&contacto=5`
- WHEN the page is loaded fresh from that URL
- THEN the gallery renders the same filtered set as when the filters were originally selected

### Requirement: No-Match Filter Empty State

The system MUST render a distinct empty-state message when active filters produce zero matching proyectos, informing the user that the filters returned no results.

#### Scenario: Filter combination matches nothing

- GIVEN a categoria/contacto combination that matches no proyecto
- WHEN the filters are applied
- THEN the gallery shows a "no results" empty state instead of an empty grid
