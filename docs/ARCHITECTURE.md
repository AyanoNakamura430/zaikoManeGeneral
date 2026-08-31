# Architecture

## Status and Evidence Boundary

The Phase 2 target architecture is approved and partially implemented through pure Domain modules, provider-neutral Inventory, Auth eligibility, trusted-onboarding, and Auth-bootstrap Application boundaries, a repository-local production-schema migration, Supabase browser adapters, typed browser-client and Auth composition boundaries, and a trusted-onboarding Edge Function verified in ephemeral Supabase. Auth eligibility uses the stored session only to detect presence, server-verifies the user, then reads the caller's Application Account under RLS. The trusted Function independently verifies the caller, keeps elevated credentials in the server runtime, and idempotently converges missing and pending accounts to active after materializing the exact six system Categories; deleting accounts remain closed. The provider-neutral Auth bootstrap loads eligibility, invokes onboarding once only for missing or pending accounts, reloads eligibility, and admits only the refreshed active state; initial eligibility, onboarding, and post-onboarding failures remain explicit. The Auth composition boundary accepts one typed browser client and wires it to both Auth adapters. The browser-client factory validates its injected URL and public key without reading environment values, prefers the current publishable-key format, temporarily accepts a legacy anon fallback, and rejects identifiable secret or service-role credentials. The active entry graph remains the monolithic implementation described in [`CURRENT_STATE.md`](CURRENT_STATE.md); these Product boundaries are not connected to a new application shell or screen yet.

Live Supabase schema, data, RLS, GRANT, Storage, Auth settings, platform versions, and production safety have not been verified. Exact SQL, policies, functions, dependencies, and external configuration require separate implementation plans and approval.

## Target Architecture

Use a bounded modular frontend architecture with these logical responsibilities:

1. Presentation for screens, forms, and user-visible states.
2. Feature/Application use cases for workflows and partial-success behavior.
3. Pure Domain for Item, Category, Attribute, Quantity, Unit, stock, normalization, and validation rules.
4. Ports and Data Adapters for persistence and service boundaries.
5. Infrastructure for Supabase and trusted server operations.

Organize product work primarily by feature: Auth, Inventory, Items, Categories, and Account. Shared code is limited to approved UI primitives, pure domain contracts, ports, and infrastructure used by multiple features.

Dependency direction is `Feature UI -> Application -> Domain/Ports <- Adapters/Infrastructure`.

- Domain code must not import React, routing, Supabase, or UI code.
- Infrastructure must not import feature UI.
- Supabase calls and row mapping belong only in adapters, infrastructure, and the composition root.
- Form models, Domain models, and database rows remain distinct and use explicit mappers.
- Trusted onboarding, image cleanup, and account deletion use dedicated gateways rather than ordinary browser CRUD.

## Core Domain Boundaries

- Item owns approved typed common fields, optional current Category identity, category-specific values, timestamps, and an optional image reference.
- Category Template and Attribute Definition are global read-only reference definitions.
- Category is a user-owned materialized system or custom Category.
- Attribute Values belong to an Item and remain private even though Definitions are shared reference data.
- Application Account represents verified onboarding and deletion eligibility independently from browser UI state.
- Stock status is derived from Quantity and the optional threshold, not stored as a second authoritative value.

The Hybrid attribute contract and relational direction are owned by [`DATABASE.md`](DATABASE.md).

## Trusted Operation Boundary

Browser clients never receive a service-role or secret credential. Verified onboarding runs through the repository's authenticated Supabase Edge Function; durable image cleanup and account deletion still require separately approved trusted implementations. Custom application objects are not added to Supabase-managed `auth` or `storage` schemas.

Any privileged function must be separately reviewed for schema exposure, caller verification, grants, search path, idempotency, and failure recovery. Trusted onboarding now uses the approved Edge Function boundary; the exact durable image-cleanup and account-deletion runtimes remain unselected.

## Error and Result Boundaries

Adapters translate provider responses into application errors such as authentication expiry, unavailable or not found, network failure, validation or integrity failure, and conflict. Raw PostgREST, Auth, or Storage responses do not reach screens.

Workflows that span the database and Storage use explicit result types and compensating cleanup. They do not report complete success when only part of the operation succeeded.

## Change Strategy

Use a Strangler-style vertical-slice migration rather than a big-bang rewrite.

1. Establish artifact-safe verification and minimum quality tooling.
2. Introduce pure Domain contracts, result types, codecs, and mappers with tests.
3. Add ports and adapters for the new schema.
4. Add the application shell, routing, and Auth bootstrap.
5. Implement read paths before write paths.
6. Implement Categories, then Item CRUD, Auth/Account, and image lifecycle.
7. Implement Copy only after v1 Must behavior is complete.
8. Perform the controlled data and application cutover.
9. Remove legacy application code and assets only in separately reviewed cleanup tasks.

Freeze the current `src/app/App.tsx`: do not add new general-product responsibilities to it. Temporary legacy exclusions must be explicit and shrink until all active production code meets the target architecture and quality gates.

## Re-evaluation Triggers

Revisit the current boundaries or normalized Attribute Value storage when any of these enter scope:

- user-defined Attribute schemas;
- Category-specific typed filtering or sorting as a primary capability;
- Attribute analytics, reports, or exports;
- JSON query or index performance that fails an approved target;
- cross-route server-state invalidation or background refresh that cannot remain simple;
- a requirement for stronger database-level dynamic type enforcement.

Do not add a backend service, query-state library, runtime schema library, or new shared abstraction merely as a precaution. Each requires demonstrated need and an approved implementation plan.
