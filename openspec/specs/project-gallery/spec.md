# Project Gallery Specification

## Purpose

Define the read-only gallery view that renders every seeded `Proyecto` as a card whose visual size reflects `tiempo_estimado_h`, whose fill reflects progress toward that estimate, and whose border/badge flags an over-budget project. Data-layer fields consumed here (`tiempo_estimado_h`, `tiempo_invertido_h`, `categoria.color`) are defined in `project-data-model`; this spec covers presentation only.

## Requirements

### Requirement: Proportional Card Sizing

The system MUST render each proyecto card with a tile size derived from `tiempo_estimado_h` via a deterministic bin-packing geometry function, such that cards are genuinely size-differentiated relative to one another (not grouped into a small fixed set of discrete size buckets), and MUST arrange all tiles without gaps between them.

#### Scenario: Larger estimate yields a larger tile

- GIVEN two proyectos with `tiempo_estimado_h` of 5 and 50 respectively
- WHEN the gallery renders both cards
- THEN the card for the 50-hour proyecto occupies a visibly larger tile area than the card for the 5-hour proyecto

#### Scenario: Tiles pack without gaps

- GIVEN a set of proyectos with varying `tiempo_estimado_h`
- WHEN the gallery computes tile geometry
- THEN the resulting layout places every tile in a bin-packed grid with no empty gaps between tiles

#### Scenario: Zero estimated hours renders a minimum tile

- GIVEN a proyecto with `tiempo_estimado_h = 0`
- WHEN the gallery renders its card
- THEN the card renders at the defined minimum tile size

### Requirement: Progress Fill Rendering

The system MUST render each card's background as a transparent tint of `categoria.color` and overlay a solid fill of `categoria.color` whose width equals `(tiempo_invertido_h / tiempo_estimado_h) * 100` percent, visually clamped to a maximum of 100% width. When `tiempo_estimado_h = 0`, the system MUST render the fill at 0% instead of computing the division.

#### Scenario: Partial progress renders a proportional fill

- GIVEN a proyecto with `tiempo_estimado_h = 40` and `tiempo_invertido_h = 10`
- WHEN the card renders
- THEN the solid fill occupies 25% of the card width and the remaining area shows the transparent categoria tint

#### Scenario: Progress exceeding estimate is visually clamped

- GIVEN a proyecto with `tiempo_estimado_h = 10` and `tiempo_invertido_h = 15`
- WHEN the card renders
- THEN the solid fill occupies exactly 100% of the card width, not 150%

#### Scenario: Zero estimated hours avoids division by zero

- GIVEN a proyecto with `tiempo_estimado_h = 0` and `tiempo_invertido_h = 0`
- WHEN the card renders
- THEN the fill renders at 0% width and no division-by-zero error occurs

### Requirement: Over-Budget Alert

The system MUST visually flag a proyecto whose `tiempo_invertido_h` is strictly greater than its `tiempo_estimado_h` with both a solid red 2px card border and a visible "⚠ Excedido" badge. The system MUST NOT show this alert when `tiempo_estimado_h = 0`.

#### Scenario: Over-budget proyecto shows border and badge

- GIVEN a proyecto with `tiempo_estimado_h = 10` and `tiempo_invertido_h = 12`
- WHEN the card renders
- THEN the card shows a solid red 2px border and the "⚠ Excedido" badge

#### Scenario: On-budget proyecto shows no alert

- GIVEN a proyecto with `tiempo_estimado_h = 10` and `tiempo_invertido_h = 10`
- WHEN the card renders
- THEN the card shows neither the red border nor the badge

#### Scenario: Zero-estimate proyecto never shows over-budget alert

- GIVEN a proyecto with `tiempo_estimado_h = 0`
- WHEN the card renders
- THEN the card shows neither the red border nor the badge regardless of `tiempo_invertido_h`

### Requirement: Gallery Empty States

The system MUST render a distinct, informative empty state when no proyectos exist in the database, separate from any empty state produced by filtering (covered in `project-filtering`).

#### Scenario: No proyectos seeded

- GIVEN the database contains zero proyecto rows
- WHEN the gallery page renders
- THEN the system shows an empty-state message instead of an empty grid

### Requirement: Card Detail Link

The system MUST render each gallery card as a link (or link-equivalent control) to that proyecto's `/proyectos/[id]` detail/edit route, and MUST suppress that navigation while comparison mode is active.

#### Scenario: Navigate to a proyecto's detail page

- GIVEN the gallery is not in comparison mode
- WHEN the user activates a card's link
- THEN the browser navigates to `/proyectos/[id]` for that proyecto

#### Scenario: Card navigation suppressed during comparison mode

- GIVEN the gallery is in comparison mode
- WHEN the user activates a card
- THEN the card participates in comparison selection instead of navigating

### Requirement: Gallery Create Entry Point

The system MUST expose a "Nuevo proyecto" link on the gallery page that navigates to `/proyectos/nuevo`.

#### Scenario: Navigate to the create form

- GIVEN the gallery page is rendered
- WHEN the user activates the "Nuevo proyecto" link
- THEN the browser navigates to `/proyectos/nuevo`
