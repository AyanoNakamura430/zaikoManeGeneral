# Tasks

This tracks phase status; requirements and design belong in their owning documents.

## Phase 0 — AI Development Foundation

- [x] Repository copy / separation
- [x] Initial investigation
- [x] AGENTS.md
- [x] Source-of-truth docs
- [x] Project Subagents
- [x] P0 Skills
- [x] Foundation review

## Phase 1 — Product Definition

- [x] Define product purpose, target user, and managed item scope
- [x] Define Item common fields and v1 scope tiers
- [x] Decide Category behavior and default Categories
- [x] Decide fixed v1 Category attributes
- [x] Decide Quantity, Unit, and stock-status behavior
- [x] Define Search, Filter, and Sort behavior
- [x] Define Image and CRUD behavior
- [x] Define Authentication and personal ownership
- [x] Decide LocalStorage and Offline direction
- [x] Decide UI, Figma, responsive, and accessibility direction
- [x] Complete Product Definition review and approval

## Phase 2 — Architecture and Data Design

- [x] General-purpose Item model
- [x] Category model and ordering
- [x] Hybrid Category-Attribute representation and hidden-value lifecycle
- [x] Logical Supabase schema, constraints, and index direction
- [x] GRANT, RLS, and cross-account verification design
- [x] Private Storage and image lifecycle design
- [x] Authentication, trusted onboarding, and account-deletion design
- [x] Additive migration, rollback, legacy yarn data, and LocalStorage direction
- [x] Frontend responsibility, route, state, validation, and error boundaries
- [x] Search, Filter, and Sort implementation direction
- [x] Strict quality, test-layer, CI-gate, and artifact-safety direction
- [x] Phase 2 integration review and human approval

## Phase 3 — Quality Foundation

- [x] WP1: Runtime and tool compatibility discovery with an approved implementation plan
- [x] WP2: Artifact-safe verification shell and temporary-output build check
- [x] WP3: Strict TypeScript foundation and legacy exclusion register
- [x] WP4: ESLint, Prettier, and architecture import gates
- [x] WP5: Vitest Domain unit-test foundation and coverage baseline
  - [x] WP5-A: Artifact-safe Vitest runner, strict test project, and empty pre-baseline coverage command
  - [x] WP5-B: First approved production Domain slice, critical unit tests, and meaningful coverage baseline
- [x] WP6: Component and Router integration-test foundation
- [x] WP7: Ephemeral Supabase migration, constraint, RLS, GRANT, and Storage harness
- [x] WP8: Generated database type drift gate after initial migrations exist
- [x] WP9: Playwright critical E2E foundation
- [x] WP10: CI integration after canonical local checks are stable

Each work package requires its own bounded implementation plan and approval. Exact dependencies, versions, configs, SQL, policies, providers, and external settings are not approved by Phase 2 completion.

## Phase 4 — Implementation

- [x] WP1: Pure Inventory Domain Core for fixed Units, Quantity, threshold, and derived stock status
- [ ] WP2: Define the next bounded implementation slice after prerequisite review

## Phase 5 — Test and Review

Not started.

## Phase 6 — Deployment

Not started. Deployment requires explicit human approval.
