# AI Development Rules

## Project Overview

`zaikoManeGeneral` is an independent repository for developing a general-purpose inventory management application. It was copied from an existing yarn inventory application so that the original yarn application can remain intact while this project evolves separately.

The current implementation is still yarn-specific. Do not treat the general-purpose product requirements, data model, or UI as decided until the relevant documents record an approved decision.

## Source of Truth

Use this order: the user's current approved instructions; accepted decisions in [`docs/DECISIONS.md`](docs/DECISIONS.md); [`docs/PRODUCT.md`](docs/PRODUCT.md); the relevant design document; current code and configuration; then the dated snapshot in [`docs/CURRENT_STATE.md`](docs/CURRENT_STATE.md).

- [`docs/PRODUCT.md`](docs/PRODUCT.md): approved product direction and open product questions.
- [`docs/CURRENT_STATE.md`](docs/CURRENT_STATE.md): dated snapshot of the existing application.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): current architecture and approved target direction.
- [`docs/DATABASE.md`](docs/DATABASE.md): repository-observable data access and approved data design.
- [`docs/FRONTEND.md`](docs/FRONTEND.md): frontend structure and boundaries.
- [`docs/DESIGN.md`](docs/DESIGN.md): official design documentation and unresolved design choices.
- [`docs/TESTING.md`](docs/TESTING.md): quality gates and verification status.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md): environments and approved release process.
- [`docs/TASKS.md`](docs/TASKS.md): phases and work status, not specifications.
- [`docs/DECISIONS.md`](docs/DECISIONS.md): accepted architectural and process decisions.

Avoid copying the same specification into several documents. Link to its owner instead.

## Before Starting Work

1. Read this file.
2. Read [`docs/TASKS.md`](docs/TASKS.md).
3. Read the documents governing the affected area.
4. Check Git status and preserve unrelated user changes.
5. Inspect the actual code and configuration involved.
6. Identify unresolved requirements and required human approvals.

Use repository skills under `.agents/skills/` when their descriptions match. Delegate only bounded work that benefits from specialization, with explicit scope, forbidden work, expected evidence, and output.

## Human Approval Required

Do not perform these without explicit approval: database schema changes or migrations; RLS or Storage policy changes; production or external-service operations; destructive operations or data deletion; large dependency changes; breaking changes; important architecture changes; production deployment; Git commit or push.

Stop for approval when an unresolved choice would materially change product behavior, data compatibility, security, or implementation approach.

## Safety

- Do not turn assumptions into requirements or decisions.
- Never expose secrets or report values from `.env*` files.
- Do not describe RLS or Storage as safe while policies are unverified.
- Do not report lint, tests, type checks, or builds as successful unless they ran successfully.
- Inspect commands for generated files, cache writes, network access, and external effects before running them.
- Keep changes within approved scope and preserve unrelated work.

## Development Rules

- Implement only an approved specification and make small, reviewable changes.
- Update the owning source-of-truth document when behavior or design changes.
- Run verification appropriate to the change and report anything not run.
- Do not continue adding responsibilities to oversized files.
- For new work, separate UI, domain logic, state/hooks, and data access where the approved design permits.
- Do not add opportunistic cleanup, dependency changes, or refactoring outside the task.

## Completion Criteria

For work requiring implementation, testing, review, and documentation, do not mark it complete while any required part remains unfinished. Report what changed, verification performed, verification omitted, documentation updates, review findings, residual risks, and remaining approvals.
