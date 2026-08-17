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

Database schema, migration, RLS, Storage, routing, component structure, and primary UI-library choices remain Phase 2 or later decisions.
