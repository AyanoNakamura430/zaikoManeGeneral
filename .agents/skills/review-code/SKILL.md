---
name: review-code
description: Review repository changes against approved requirements, architecture, security, data isolation, regression risk, tests, and documentation. Use for diffs, pull requests, implementation handoffs, or pre-completion quality review; return findings without fixing them unless separately authorized.
---

# Review Code

1. Read `AGENTS.md`, `docs/TASKS.md`, the governing requirements/design docs, Git status, and the complete relevant diff.
2. Confirm the intended behavior and approved scope before judging implementation.
3. Review:
   - requirement and architecture alignment;
   - TypeScript and React correctness;
   - new responsibility added to oversized files;
   - duplicated logic and inconsistent domain mapping;
   - error, loading, and partial-failure handling;
   - Supabase queries and user-data separation;
   - unverified RLS assumptions and Storage lifecycle/security;
   - destructive operations and rollback;
   - regressions and compatibility;
   - actual test/type/lint/build evidence;
   - docs drift and dependency changes.
4. Classify actionable findings:
   - Blocker: unsafe or incorrect to ship.
   - Major: significant correctness, security, regression, or maintainability risk.
   - Minor: bounded issue worth correcting.
   - Suggestion: optional improvement, clearly non-blocking.
5. For each finding, cite evidence, describe impact, and state the expected correction or missing verification.
6. Do not report style preferences as defects and do not claim checks passed without output.
7. Return findings first, then questions, verification reviewed, documentation drift, and residual risk. State when no findings were identified.

Do not edit files unless the user or Lead issues a separate implementation request.
