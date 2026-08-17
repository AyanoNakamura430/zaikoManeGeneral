---
name: create-implementation-plan
description: Create an approval-ready implementation plan before code changes. Use when a feature, fix, refactor, database-related task, or other repository change needs scope, impacts, approval boundaries, verification, documentation, and completion criteria resolved first.
---

# Create Implementation Plan

1. Read `AGENTS.md`, `docs/TASKS.md`, the governing source-of-truth docs, Git status, and affected code.
2. Distinguish verified current behavior, approved requirements, assumptions, and unresolved decisions.
3. Stop before implementation when a material unknown changes behavior, data compatibility, security, or architecture. Return it as a user question.
4. Produce this plan:
   - Purpose
   - Current State
   - Scope
   - Out of Scope
   - Files Likely Affected
   - Data Impact
   - Security Impact
   - Human Approval Required
   - Implementation Steps
   - Verification
   - Documentation Impact
   - Completion Criteria
5. Keep steps small, ordered, and independently verifiable. Do not include unrelated cleanup.
6. Identify generated files, external effects, migrations, rollback needs, and checks that are unavailable.
7. Request confirmation that the plan matches the expected result before implementation begins.
