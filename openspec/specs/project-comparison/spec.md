# Project Comparison Specification

## Purpose

Define the read-only comparison module: a toggleable multi-select mode over gallery cards and an overlay that presents a side-by-side table of key metrics for the selected proyectos.

## Requirements

### Requirement: Comparison Mode Toggle

The system MUST provide a "Modo Comparación" toggle that switches the gallery between normal browsing and comparison-selection mode, and MUST reflect the active mode in the URL.

#### Scenario: Enabling comparison mode reveals selection checkboxes

- GIVEN the gallery is in normal mode
- WHEN the user enables "Modo Comparación"
- THEN each card displays a selection checkbox and the URL reflects comparison mode as active

#### Scenario: Disabling comparison mode hides checkboxes and clears selection

- GIVEN comparison mode is active with proyectos selected
- WHEN the user disables "Modo Comparación"
- THEN the checkboxes disappear and the prior selection no longer applies

### Requirement: Multi-Select Proyecto Selection

While in comparison mode, the system MUST allow the user to select two or more proyectos via per-card checkboxes, and MUST persist the current selection in the URL.

#### Scenario: Selecting proyectos updates the URL

- GIVEN comparison mode is active
- WHEN the user checks proyectos with ids 1, 3 and 5
- THEN the URL reflects the selection of ids 1, 3 and 5

#### Scenario: Fewer than two selections cannot open the comparison overlay

- GIVEN comparison mode is active with only one proyecto checked
- WHEN the user attempts to open the comparison overlay
- THEN the system does not open the overlay and indicates at least two selections are required

### Requirement: Comparison Overlay Table

When two or more proyectos are selected, the system MUST allow the user to open an overlay presenting a table comparing, for each selected proyecto, `tiempo_estimado_h`, `tiempo_invertido_h`, `monto_pago` and `frecuencia_avance`.

#### Scenario: Opening the overlay with a valid selection

- GIVEN comparison mode is active with proyectos A and B checked
- WHEN the user opens the comparison overlay
- THEN the overlay shows a table with one column (or row) per selected proyecto and rows for `tiempo_estimado_h`, `tiempo_invertido_h`, `monto_pago` and `frecuencia_avance`

#### Scenario: Optional monto_pago is shown as absent when not set

- GIVEN a selected proyecto has no `monto_pago` value
- WHEN the comparison table renders that proyecto's column
- THEN the `monto_pago` cell shows an explicit "not set" indicator rather than a blank or zero value

#### Scenario: Closing the overlay returns to comparison selection

- GIVEN the comparison overlay is open
- WHEN the user closes it
- THEN the gallery returns to comparison mode with the same selection intact
