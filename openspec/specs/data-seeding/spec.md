# Data Seeding Specification

## Purpose

Define reproducible, disposable seed data covering 2-3 fictitious projects with linked categories, contacts and inspirations, so the future UI and repository layer can be developed and tested against realistic records instead of mocks.

## Requirements

### Requirement: Seed Script Produces Representative Data

The system MUST provide a seed script that inserts 2 to 3 fictitious `Proyecto` records, each with a valid `categoria_id`, at least one linked `contacto` via `proyecto_contactos`, and at least one linked `inspiracion`.

#### Scenario: Run the seed script on an empty database

- GIVEN a freshly migrated, empty database
- WHEN the seed script runs
- THEN 2 to 3 proyecto rows exist, each with a valid categoria reference, at least one associated contacto and at least one associated inspiracion

#### Scenario: Seed data satisfies all data-model constraints

- GIVEN the seed script has run
- WHEN each inserted row is checked against `estado`, `frecuencia_avance`, `tipo_referencia` enum CHECKs and all foreign keys
- THEN every row satisfies the constraints defined in `project-data-model`

### Requirement: Seed Data Covers Enum Diversity

The seed data SHOULD include proyecto rows spanning more than one `estado` value and more than one `frecuencia_avance` value, so downstream consumers can exercise each enum branch without writing additional fixtures.

#### Scenario: Multiple estado values present

- GIVEN the seed script has run
- WHEN the persisted proyecto rows are inspected
- THEN at least two distinct `estado` values are present among them

### Requirement: Seed Data Is Disposable and Reseedable

Seed data MUST be treated as throwaway demo content. The seed script MUST be safe to run against a database that already contains prior seed output without producing constraint violations (for example, by clearing prior seed rows first or using idempotent upserts on natural keys).

#### Scenario: Re-run the seed script

- GIVEN the seed script has already been run once
- WHEN the seed script is run again against the same database
- THEN it completes without constraint violations and the database still contains 2 to 3 proyecto rows with their categorias, contactos and inspiraciones

#### Scenario: Seed data is never treated as production data

- GIVEN seed data exists in the database
- WHEN any process needs to reset or discard it
- THEN removing and re-seeding the affected rows MUST NOT be treated as a data-loss incident
