---
name: inspect-project
description: Safely inspect this repository before planning or changing code. Use for project orientation, pre-change discovery, current-state checks, or when Git, docs, configuration, code paths, and known risks must be established without exposing secrets.
---

# Inspect Project

1. Read `AGENTS.md`, then `docs/TASKS.md` and documents governing the requested area.
2. Check branch and working-tree status. Preserve and report pre-existing changes; do not modify or discard them.
3. Inspect relevant package manifests, configuration, entry points, and target code. Exclude generated directories unless their status matters.
4. Compare implementation with the owning source-of-truth documents and accepted decisions.
5. Identify data, security, external-service, generated-file, and human-approval risks before suggesting commands or changes.
6. Treat `.env*` values as secrets. Report only required key names or file presence when authorized.
7. Mark facts as verified, inferred, or unknown. Do not infer live schema, RLS, Storage policy, deployment state, or successful checks from configuration alone.
8. Return a concise summary containing Git state, relevant docs, technical path, known risks, unknowns, approvals, and recommended next action.

Remain read-only unless the user separately authorizes implementation.
