# Delta for Project Gallery

## ADDED Requirements

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
