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

The general-purpose product model, UI, schema, and migration approach remain undecided.
