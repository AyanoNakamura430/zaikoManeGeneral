---
name: update-docs
description: Synchronize this repository's source-of-truth documentation after an approved code, behavior, architecture, database, design, testing, deployment, or task-status change. Use when implementation or an accepted decision may make docs stale.
---

# Update Docs

1. Read `AGENTS.md`, inspect the approved change and diff, and identify the document that owns each changed fact.
2. Update only affected source-of-truth documents. Link to the owner instead of copying the same detail elsewhere.
3. Keep `docs/CURRENT_STATE.md` a dated snapshot; update or supersede it only when verified facts justify doing so.
4. Add an entry to `docs/DECISIONS.md` only for an accepted decision, not a proposal or unresolved question.
5. Update `docs/TASKS.md` only when task status actually changed; do not use it as a specification.
6. Keep unknowns explicitly marked and do not infer live database, RLS, Storage, environment, test, or deployment state.
7. Check README and `AGENTS.md` only when navigation or durable rules changed.
8. Review links, terminology, approval boundaries, duplicated content, and consistency with code.
9. Return documents changed, why each changed, decisions/tasks updated, validation performed, and remaining documentation gaps.
