# Testing and Quality Gates

## Current state

- No lint, formatter, unit, integration, or E2E configuration or scripts found.
- TypeScript source exists, but no TypeScript dependency or `tsconfig` found.
- Build is `vite build`; success is unverified because the read-only investigation avoided updating `dist/`.

Do not report a check as successful unless it actually ran successfully.

## Candidate quality gates

Before substantial AI implementation, approve and establish: type check, lint, unit tests, integration tests, production build, and risk-based E2E. Tools, versions, coverage, and CI remain undecided; this foundation phase adds none.

Reports must separate passed, failed, unavailable, deliberately omitted, and environment-dependent verification.
