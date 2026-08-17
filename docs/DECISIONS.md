# Decisions

Record only accepted decisions. Keep proposals and unresolved questions in their owning documents.

## Decision 001 — Independent repository

**Status:** Accepted
**Decision:** Develop the general-purpose application in this copied repository rather than directly generalizing the existing yarn application.

**Reasons:** Preserve the yarn application, isolate breaking changes, and provide a safer AI-driven development environment.

## Decision 002 — Markdown source of truth

**Status:** Accepted
**Decision:** Use `docs/` for product, design, current-state, verification, deployment, task, and decision records without duplicating specifications.

## Decision 003 — Human approval for high-impact changes

**Status:** Accepted
**Decision:** Require approval for important database, migration, RLS, Storage policy, destructive data, architecture, breaking-change, production deployment, commit, and push operations.

## Decision 004 — Individual, private, physical-item inventory for v1

**Status:** Accepted
**Decision:** v1 serves one individual per account and manages personally owned physical Items. User data is private. Household sharing and business inventory are not part of v1.

**Reasons:** Keep v1 understandable and bounded while preserving room for future household use without introducing membership, role, audit, or business workflow requirements now.

## Decision 005 — Limited common fields plus fixed Category templates

**Status:** Accepted
**Decision:** Use common Item fields with optional, protected system-defined Category attributes in v1. Allow user Categories, but do not allow user-defined attribute schemas yet.

**Reasons:** Provide meaningful generalization beyond renamed yarn fields without introducing a full custom-attribute builder and its validation and lifecycle complexity.

## Decision 006 — Quantity and stock semantics

**Status:** Accepted
**Decision:** Quantity is required, non-negative, and paired with a required fixed Unit. Quantity zero retains the Item as out of stock. Low stock is derived from an optional per-Item threshold. Unit conversion is outside v1.

**Reasons:** Keep inventory state explicit and predictable across both consumables and one-of-a-kind possessions without conflating zero stock and deletion.

## Decision 007 — Online data is authoritative

**Status:** Accepted
**Decision:** Remove the silent LocalStorage inventory fallback. v1 requires online authoritative data and does not persist inventory cache, drafts, or offline mutations. Offline behavior must be designed explicitly in a future phase.

**Reasons:** Avoid stale or cross-account data, ambiguous conflict resolution, and false indications that failed writes are saved.

## Decision 008 — Approved design and production-code boundary

**Status:** Accepted
**Decision:** Use a hybrid UI approach. Approved Figma designs define visual and interaction intent; Figma Make output is reference/prototype material; repository code is the production source. Require staged design approval before implementation.

**Reasons:** Remove yarn-specific UI assumptions while reusing suitable assets deliberately and preserving production quality, accessibility, and maintainability.

## Decision 009 — v1 scope tiers

**Status:** Accepted
**Decision:** Treat Create, List, Detail, Edit, and Delete plus the other requirements in `PRODUCT.md` as v1 Must. Treat Copy as v1 Should but not a release blocker. Keep advanced customization, sharing, offline synchronization, multiple images, batch operations, and business workflows outside v1.

**Reasons:** Keep the initial product small enough to validate while retaining a clear path for valuable follow-up capabilities.

## Decision 010 — Bounded modular frontend architecture

**Status:** Accepted
**Decision:** Organize the target application as feature-first slices over pure Domain and Application boundaries, with ports/adapters isolating Supabase and trusted operations. Enforce the dependency direction documented in [`ARCHITECTURE.md`](ARCHITECTURE.md), freeze the legacy `App.tsx`, and migrate through tested vertical slices.

**Reasons:** Keep Product rules independent from UI and provider details, make security and partial failures testable, and give human and AI contributors discoverable change boundaries without introducing a separate service prematurely.

## Decision 011 — Per-user Categories and Hybrid Attributes

**Status:** Accepted
**Decision:** Use global read-only Category Templates and Attribute Definitions, materialized user-owned system and custom Categories, typed common Item fields, and versioned Item-owned JSONB for Category-specific values keyed by stable identities.

**Reasons:** Preserve simple owner-scoped RLS and v1 implementation while retaining hidden values and a migration path to normalized values if dynamic Attributes or advanced querying become necessary.

## Decision 012 — Verified-active owner authorization

**Status:** Accepted
**Decision:** Require a trusted-onboarded active application account plus owner identity for private data access. Treat explicit GRANT and RLS as separate required gates, with anonymous application-data access denied and cross-account black-box tests required.

**Reasons:** UI state, authenticated role, or JWT metadata alone cannot satisfy the private and verification-only Product promise.

## Decision 013 — Private image lifecycle and trusted cleanup

**Status:** Accepted
**Decision:** Use a new private v1 bucket with owner/Item-scoped paths, unique-object uploads rather than client upserts, database-link changes before old-object deletion, and idempotent trusted cleanup.

**Reasons:** Database and Storage are not one transaction. The sequence preserves the previous image on replacement failure and avoids granting broad client deletion/update capability.

## Decision 014 — Durable irreversible account deletion

**Status:** Accepted
**Decision:** Interpret immediate account deletion as no grace or undo and immediate access termination, followed by a durable idempotent cleanup workflow: deleting gate, session revocation, Storage cleanup, application rows, then Auth user deletion.

**Reasons:** A synchronous browser workflow cannot safely recover from cross-service partial failure, and deleting the Auth user alone does not prove immediate token invalidation or complete data cleanup.

## Decision 015 — Stable routing and explicit frontend state

**Status:** Accepted
**Decision:** Use stable direct routes, allowlisted relative Auth returns, explicit server/form/UI/route state ownership, replace navigation after successful writes and callbacks, Domain-centered validation, and explicit error and partial-success results.

**Reasons:** These boundaries satisfy refresh, Back, Auth recovery, unsaved-input, privacy, and image-failure requirements without reproducing the current state-driven monolith.

## Decision 016 — Strict, layered, artifact-safe quality gates

**Status:** Accepted
**Decision:** Make strict TypeScript the v1 target; use generated database types only at adapter boundaries; adopt semantic lint plus separate formatting; establish unit, component/Router, database-security, and browser test layers; and direct verification artifacts outside the workspace with before/after protected-output checks.

**Reasons:** The new architecture and security promises need executable evidence, while build and test tools must not silently modify tracked or ignored repository artifacts.

## Decision 017 — Additive migration and controlled cutover

**Status:** Accepted
**Decision:** Build the general schema beside the legacy table, backfill deterministically, verify ownership and behavior, use a controlled write freeze and final delta, retain the legacy data read-only for a rollback window, and require separate approval for destructive cleanup.

**Reasons:** In-place conversion cannot safely handle unknown live constraints, missing values, legacy image semantics, or yarn-specific data without an evidence-based rollback path.
