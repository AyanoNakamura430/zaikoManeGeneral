# Testing and Quality Gates

## Status and Evidence Boundary

The Phase 2 quality architecture is approved. The artifact-safe verification shell and initial strict TypeScript foundation are implemented; later quality stages remain unimplemented.

Current repository facts:

- the canonical artifact-safe strict typecheck is `npm run verify:typecheck` (use `npm.cmd` from Windows PowerShell); it completed without emitting files or changing protected workspace artifacts on 2026-08-17;
- no lint or formatter configuration;
- no unit, component, integration, database-security, or E2E test configuration;
- the canonical artifact-safe build check is `npm run verify:build` (use `npm.cmd` from Windows PowerShell); it successfully built to an OS temporary directory without changing protected workspace artifacts on 2026-08-17;
- no CI configuration is established.

Do not report any check as successful until it has actually run successfully. Reports distinguish passed, failed, unavailable, deliberately omitted, and environment-dependent checks.

## TypeScript Target

Strict TypeScript is the v1 target.

- Apply strict settings to all new architecture modules from the start.
- Target hardened indexed access and optional-property semantics for new modules.
- Keep temporary legacy/generated exclusions explicit, documented, and shrinking.
- All active production source must pass strict typecheck before v1 cutover.
- Typecheck emits no application artifacts.
- Style and unused-code policy belong to lint rather than being hidden inside typecheck.

The initial foundation uses exact dev dependencies `typescript@6.0.3`, `@types/react@18.3.31`, and `@types/react-dom@18.3.7`. `tsconfig.json` enables `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`, `isolatedModules`, and `verbatimModuleSyntax`, with `noEmit` and no incremental build information.

The initial strict scope is `src/lib/supabase.ts`, `src/vite-env.d.ts`, and every future `src/**/*.ts` or `src/**/*.tsx` file outside the explicit exclusions below. New Product or architecture code must not be added under an excluded path. An existing excluded asset must enter the strict scope before it is connected to the production entry graph.

### Legacy Exclusion Register

| Path | Reason | Exit condition |
| --- | --- | --- |
| `src/main.tsx` | It imports the frozen legacy App. | Move it into strict scope when the new App shell replaces the legacy entry. |
| `src/app/App.tsx` | It is the oversized legacy monolith. | Move it into strict scope when the approved vertical-slice cutover is complete. |
| `src/imports/**` | It contains Figma-generated reference assets. | Audit each reused asset into strict scope, or remove the reference assets with approval. |
| `src/app/components/ui/**` | It contains currently unadopted UI assets. | Select the primary design system and audit each reused asset into strict scope. |
| `src/app/components/figma/**` | It contains a reference helper. | Audit it into strict scope if it is adopted by production code. |
| `vite.config.ts` | It is Node tooling configuration outside the browser-source TypeScript project. | Add it to a separately approved strict Node-tooling project. |
| `scripts/verify.mjs` | It is the existing JavaScript verification tool. | Migrate tooling to TypeScript only through a separately approved work package. |

The last two paths are outside the `src/**/*.ts` and `src/**/*.tsx` include patterns rather than entries in `tsconfig.json`'s `exclude` array.

## Database and Domain Types

Generate Supabase database types from the repository migration state after migrations exist.

- Commit generated types and mark them hand-edit prohibited.
- Use them only inside adapters/infrastructure.
- Do not export database row types as Domain or UI contracts.
- Generated compile-time types do not replace runtime decoding or Domain validation.
- Generate comparison output into an OS/runner temporary directory and fail when it differs from the committed file.
- Only an explicit approved update command writes the generated file in the repository.

## Static Quality Tools

Approved tool families:

- ESLint for TypeScript, React Hooks, accessibility, and architecture/import restrictions.
- Prettier for formatting, with check and write modes kept separate.

New architecture code targets zero warnings. Any temporary legacy exception is file-scoped, justified, and assigned a removal task. In particular, lint should prevent direct Supabase imports from feature screens and enforce approved dependency direction where practical.

Exact versions, plugins, rules, and configuration require compatibility and dependency review.

## Test Layers

### Domain Unit Tests

Vitest is the approved candidate. Critical scenarios include:

- Quantity, Unit, threshold, and derived stock states;
- Category normalization, duplicate behavior, protection, ordering, and deletion commands;
- Hybrid Attribute known-type validation, unknown preservation, and hidden restoration;
- Search normalization and multi-token behavior;
- Copy/reset behavior;
- Auth-return allowlisting and open-redirect rejection;
- provider error mapping and image partial-result types.

### Component and Router Integration

Use React Testing Library, user-event, DOM accessibility matchers, and an in-memory Router candidate. Test user-visible behavior rather than implementation details.

Critical scenarios include form validation, dirty/reset behavior, unsaved guards, route protection, refresh and Back/replace semantics, explicit loading/empty/no-results/error states, Auth expiry, keyboard/focus behavior, and image partial-result messaging.

### Database, RLS, and Storage

Use an ephemeral local Supabase environment as the primary repeatable security harness, with dedicated staging verification before deployment.

Tests include:

- applying all migrations to an empty database;
- approved legacy upgrade path and seed idempotency;
- negative constraints for names, Quantity, Units, owner relationships, duplicate Categories, and known JSON types;
- separate GRANT and RLS assertions for anonymous, unverified, User A, User B, and deleting-account contexts;
- every allowed and denied SELECT, INSERT, UPDATE, and DELETE;
- system Category protection and cross-owner Category attachment rejection;
- private bucket paths, MIME/size limits, signed access, unsupported upsert/update, replacement ordering, unlink behavior, and cleanup retry;
- account-deletion failure injection at each step and eventual complete cleanup without affecting another user or global reference data.

Trusted credentials may create fixtures but must not be used for authorization assertions.

### Browser E2E

Playwright is the approved candidate. Begin with a primary browser for critical PR coverage and determine the release browser matrix separately.

Critical flows include signup, verification, onboarding, Sign in, password reset, session expiry, direct protected routes, Item CRUD, Category deletion, image lifecycle and partial failure, unsaved changes, User A/B isolation, and account deletion.

Do not introduce Jest, Cypress, MSW, a runtime schema library, or pgTAP during initial foundation work without demonstrated need and approval.

## Coverage Policy

Do not set an arbitrary global percentage before a baseline exists.

- Scope coverage to active new production modules.
- Exclude generated types, configuration, Figma/reference assets, and frozen non-production legacy code where justified.
- Never exclude active new production code merely to raise a metric.
- Require named tests for every critical Product and security invariant.
- Establish non-decreasing coverage ratchets after the baseline is measured.
- Every bug fix includes a regression test.
- Do not add skipped/only tests or unexplained flaky retries.

Exact numeric thresholds and diff-coverage capability require later approval.

## CI Gate Layers

Provider-neutral required stages are:

1. lockfile-respecting installation;
2. generated-type drift check when migrations exist;
3. non-writing format check;
4. lint;
5. strict no-emit typecheck;
6. unit tests and coverage;
7. component/Router integration tests;
8. artifact-safe production build;
9. ephemeral Supabase migration, constraint, RLS, GRANT, and Storage tests;
10. critical browser E2E;
11. release-only environment, route-fallback, email, browser-matrix, and deployment checks.

A required unavailable environment blocks release; it is not converted into a pass. CI success never grants deployment authority.

## Artifact-Safe Verification

The verified runtime baseline is declared only in `package.json`: Node `22.23.2`, npm `11.6.2`, and package manager `npm@11.6.2`. Do not add a second runtime marker unless a later approved CI or version-manager requirement establishes its ownership.

Canonical local interfaces:

- `npm run verify:build` (`npm.cmd run verify:build` from Windows PowerShell) runs the existing Vite build with its output redirected to a validated unique OS temporary directory.
- `npm run verify:self-test` (`npm.cmd run verify:self-test` from Windows PowerShell) exercises the verification boundary in disposable OS-temporary Git fixtures.
- `npm run verify:typecheck` (`npm.cmd run verify:typecheck` from Windows PowerShell) runs the fixed `tsc --project tsconfig.json --noEmit` command through the same before/after artifact boundary.

The wrapper accepts only registered task names and no additional arguments. The registered tasks are build, self-test, and typecheck. A future lint, test, coverage, generated-type, or browser task must be added to the internal allowlist by its separately approved work package. It must define fixed arguments, redirect supported outputs to OS temporary storage, and add any unavoidable workspace fallback output to the protected manifest.

All verification outputs must use a validated unique OS/runner temporary root where supported, including:

- Vite build output and cache;
- coverage and test results;
- Playwright output, reports, screenshots, and traces;
- TypeScript build information;
- generated database type comparison files;
- local Supabase runtime state.

Keep normal developer/deployment `build` behavior separate from a required temporary-output `build:check` equivalent.

Before and after verification:

- compare full Git status including untracked files and content manifests for tracked and non-ignored untracked files, so changes to an already-dirty file are detectable;
- compare protected ignored-output manifests for `dist`, Vite cache, coverage, test reports, Playwright reports, TypeScript build information, and committed generated types;
- fail when a protected workspace artifact is created or modified;
- never display environment values or secret-file contents;
- delete only resolved paths proven to be within the task-specific temporary root.

The protected ignored paths currently include `dist`, `.vite`, `node_modules/.vite`, `coverage`, `test-results`, `playwright-report`, and `*.tsbuildinfo`. The verifier does not traverse `.git`, ignored `.env*`, or all of `node_modules`, and it does not follow symlinks while creating manifests. If Git explicitly lists a tracked or non-ignored `.env*` path, the verifier records only file type, size, and modification-time metadata; it never reads or hashes its contents. Metadata-only monitoring can detect ordinary writes but cannot prove that same-size content with a preserved timestamp is unchanged. Symlink targets are hashed for comparison but the target is not followed, and target values and hashes are never logged.

Detection is non-destructive. The verifier reports repository-relative mutation paths but never resets, restores, cleans, removes, or otherwise rolls back workspace files. A detected mutation requires human review.

Git status alone is insufficient because ignored generated files may have changed.

## Staged Foundation Order

1. Artifact-safe command shell and canonical check interfaces.
2. Strict TypeScript foundation and legacy exclusion register.
3. ESLint and Prettier.
4. Vitest and critical Domain tests.
5. Testing Library and Router integration.
6. Ephemeral Supabase migration/security harness.
7. Generated database type drift gate.
8. Playwright critical E2E.
9. CI integration after local canonical scripts are stable.

Introduce dependencies by stage, pin exact direct versions, commit and review the lockfile, verify license/supply-chain and Node compatibility, and confirm workspace cleanliness after each stage. Do not add the full toolchain in one change.

Before substantial frontend implementation, stages 1 through 5 must be usable. Before schema/RLS/Storage implementation, artifact safety, static/unit foundations, and the ephemeral security harness must be usable.
