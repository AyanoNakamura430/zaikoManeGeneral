# Testing and Quality Gates

## Status and Evidence Boundary

The Phase 2 quality architecture is approved. The artifact-safe verification shell, strict TypeScript, lint/format, unit, Component/Router integration, ephemeral Supabase security, generated-type drift, Playwright E2E, and GitHub Actions CI foundations through WP10 are implemented. The GitHub-hosted workflow has not yet been observed running; production application tests and deployment validation remain future work.

Current repository facts:

- the canonical artifact-safe strict typecheck is `npm run verify:typecheck` (use `npm.cmd` from Windows PowerShell); it completed without emitting files or changing protected workspace artifacts on 2026-08-17;
- the canonical artifact-safe lint, architecture-gate, and format checks completed with zero warnings and without changing protected workspace artifacts on 2026-08-17;
- the canonical artifact-safe Vitest runner, runner self-test, test typecheck, and coverage command completed without changing protected workspace artifacts on 2026-08-17;
- the current Vitest suite contains the runner-foundation smoke test and critical tests for Category comparison-name normalization and the Phase 4 fixed-Unit, Quantity, threshold, and derived-stock-status Domain core;
- the canonical artifact-safe Component/Router integration suite completed 2 files and 3 tests without changing protected workspace artifacts on 2026-08-22;
- the canonical local database harness applied its test-only migration twice and completed 12 constraint, GRANT/RLS, account-state, cross-account, and private Storage assertions without changing protected workspace artifacts on 2026-08-22;
- the canonical test-only generated-type check and intentional-drift self-test completed against the local WP7 migration without changing protected workspace artifacts on 2026-08-22;
- the canonical Playwright fixture E2E suite completed 3 tests with Chromium headless shell without changing protected workspace artifacts on 2026-08-22;
- the canonical artifact-safe build check is `npm run verify:build` (use `npm.cmd` from Windows PowerShell); it successfully built to an OS temporary directory without changing protected workspace artifacts on 2026-08-17;
- WP10 establishes `.github/workflows/quality.yml` with static, local database-security, and Chromium E2E jobs on pull requests, `main` pushes, and manual dispatch. It uses canonical verification scripts, `npm ci`, Node `22.23.2`, npm `11.6.2`, read-only permissions, cancellation of superseded runs, and bounded job timeouts. E2E failure traces/screenshots are uploaded only from runner-temporary storage with three-day retention. WP10 implementation is complete, but a GitHub Actions run has not yet been observed. CI remains a quality gate and does not authorize deployment.

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

WP8 applies the WP7 test-only migration in a unique OS-temporary local Supabase project and uses pinned CLI `supabase@2.115.0` to generate the `public` TypeScript schema. `verify:database-types` compares the generated bytes with `tests/supabase/generated/database.generated.ts` without writing the repository. `verify:database-types-self-test` accepts an exact temporary candidate and rejects an intentionally drifted candidate. Only `update:database-types` writes the committed baseline, after successful generation and local-stack cleanup.

The current generated file is a test-harness contract, not a Product database type and not an Adapter input. It must remain under `tests/supabase/generated`; Product types belong in the approved Adapter/Infrastructure boundary only after production migrations exist. The generated header prohibits manual edits and carries only the narrow lint exception required by the current Supabase generator output. This foundation does not establish live-schema parity or authorize remote/linked type generation.

## Static Quality Tools

Approved tool families:

- ESLint for TypeScript, React Hooks, accessibility, and architecture/import restrictions.
- Prettier for formatting, with check and write modes kept separate.

New architecture code targets zero warnings. Any temporary legacy exception is file-scoped, justified, and assigned a removal task. In particular, lint should prevent direct Supabase imports from feature screens and enforce approved dependency direction where practical.

The initial exact tool baseline is ESLint `9.39.5`, `@eslint/js` `9.39.5`, `typescript-eslint` `8.67.0`, `eslint-plugin-react-hooks` `7.1.1`, `eslint-plugin-jsx-a11y` `6.10.2`, and Prettier `3.9.6`. ESLint uses the type-aware recommended TypeScript rules through the TypeScript project service, plus recommended JavaScript, React Hooks, and accessibility rules with `--max-warnings 0`. Strict compiler semantics remain independently enforced by `verify:typecheck`.

Lint and format commands target every `src/**/*.ts` and `src/**/*.tsx` path so future architecture modules enter the gates automatically. ESLint's global ignores and `.prettierignore` preserve the WP3 legacy exclusions as the source of truth; those exclusions must shrink under their recorded exit conditions. `format:check` is non-writing and is the verification gate; `format:write` is an explicit developer command over the same non-ignored source scope.

Architecture import gates apply automatically when files are added under `src/domain`, `src/application`, `src/features`, `src/adapters`, and `src/infrastructure`:

- Domain rejects React, routing, Supabase, and outer-layer imports.
- Application rejects UI, provider implementation, adapter, and infrastructure imports.
- Features reject direct Supabase, adapter, infrastructure, and aliased feature-internal imports.
- Adapters and infrastructure reject dependencies back into UI or Application workflows.
- Direct `@supabase/supabase-js` imports are allowed only in adapters, infrastructure, and composition roots.

`src/lib/supabase.ts` is a temporary direct-Supabase exception for the frozen legacy application. Remove the exception when the new composition root replaces the legacy client entry; new Product code must not import it. `src/vite-env.d.ts` declares only the required public Vite environment key names and their string types; it contains no values. `npm run verify:lint-gates` checks five negative and three positive virtual source cases through ESLint's `lintText` API using an isolated architecture-only config, without creating workspace fixtures or weakening type-aware lint for real source.

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

WP5-A uses exact dev dependencies `vitest@4.1.10` and `@vitest/coverage-v8@4.1.10`, the Node test environment, explicit imports rather than globals, and a separate strict test TypeScript project at `tests/tsconfig.json`. The runner rejects focused `.only` tests and an empty test selection. Its self-test verifies successful, failing, focused-only, and no-test processes in OS-temporary fixtures.

The first production Domain slices are `normalizeCategoryNameKey` and the fixed-Unit inventory core. Named tests cover Category comparison normalization; the exact 18-Unit catalog and runtime immutability; Unit-key-bound opaque Quantity and threshold validation; finite, non-negative, count-integer, decimal-measurement, and negative-zero behavior; and `out`, `low`, and `available` status derivation. The separate `tests/unit/vitest-foundation.test.ts` smoke test remains excluded from production coverage and is not counted as Domain behavior coverage.

### Component and Router Integration

Use React Testing Library, user-event, DOM accessibility matchers, and an in-memory Router candidate. Test user-visible behavior rather than implementation details.

Critical scenarios include form validation, dirty/reset behavior, unsaved guards, route protection, refresh and Back/replace semantics, explicit loading/empty/no-results/error states, Auth expiry, keyboard/focus behavior, and image partial-result messaging.

WP6 uses exact dev dependencies `@testing-library/react@16.3.2`, `@testing-library/dom@10.4.1`, `@testing-library/user-event@14.6.6`, `@testing-library/jest-dom@7.0.1`, and `jsdom@30.0.1`. The separate `vitest.integration.config.mjs` inherits the artifact boundary and runner policies from the Node unit configuration but replaces the test selection and environment with `tests/integration/**/*.test.tsx` and jsdom. DOM matchers and cleanup are test-only setup concerns.

The foundation fixtures prove accessible role queries, user-event interaction and focus, a React Router direct entry, and push, replace, and Back history behavior through `createMemoryRouter` and `RouterProvider`. They do not implement or claim coverage of the production route contract, Auth protection, forms, approved UI, refresh at the browser/hosting boundary, or Product behavior. Those scenarios require approved production slices and later integration/E2E tests.

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

WP7 uses exact dev dependency `supabase@2.115.0`, the existing `@supabase/supabase-js` client, and a dedicated test project under `tests/supabase/project`. `npm run verify:database` (`npm.cmd run verify:database` from Windows PowerShell) copies that project to a validated unique OS-temporary directory, starts one local Docker-backed Supabase stack, discovers and resets the test migration twice, runs the black-box Vitest assertions, and stops the stack with local volumes removed in `finally`. It does not link to, inspect, reset, or modify a remote project. Provider credentials obtained from local status are passed only to the child test process and are redacted from failure output.

The current fixture deliberately models only a small security cross-section: blank-name and nonnegative-Quantity constraints, owner-preserving Category references, explicit GRANT versus RLS, anonymous and active/pending/deleting account states, User A/B isolation, and a private image bucket with owner/Item path checks, MIME/size restrictions, no upsert, and no direct client delete. Trusted service credentials create fixtures only; assertions use anonymous or signed-in user clients. Storage ownership lookup is isolated in a test-only private-schema function with a fixed empty `search_path`, revoked PUBLIC execution, and authenticated-only execution.

This harness is foundation evidence, not a claim that the future production schema, live RLS/GRANT, Auth configuration, Storage policies, migrations, account-deletion workflow, or existing project are safe. The migration and table names are explicitly test-only and must not be promoted into Product migrations. Remaining scenarios listed above become enforceable only after their production schema or workflow exists; dedicated staging verification remains required before deployment.

### Browser E2E

Playwright is the approved candidate. Begin with a primary browser for critical PR coverage and determine the release browser matrix separately.

WP9 adds the pinned `@playwright/test@1.62.1` foundation. `npm run verify:e2e` starts a dependency-free Node HTTP fixture on a dedicated loopback port, runs Chromium headless with one worker and zero retries, then terminates only the runner-owned server. `npm run verify:e2e-self-test` exercises pass, failure, focused-only, and empty-suite policy cases. The fixture proves accessible role-based interaction, direct URL entry, refresh, push/replace history, Back behavior, and live-region status. Failure screenshots and traces are retained under a validated OS-temporary output directory; video is disabled and no repository `test-results` or report directory is used by the canonical wrapper. The fixture is not the Product route/Auth contract and does not exercise the legacy app, Supabase, or environment variables.

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

The first meaningful baseline was measured on 2026-08-22 over the active `src/domain/**/*.ts` scope: Statements 100% (2/2), Functions 100% (1/1), and Lines 100% (2/2). The implementation contains no branches, so Branches reports 100% (0/0) and is not evidence of exercised branch behavior. This baseline describes the initial one-module scope only; it is not a repository-wide quality claim. No numeric threshold or ratchet is configured yet, pending separate approval after baseline review.

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
- `npm run verify:lint` (`npm.cmd run verify:lint` from Windows PowerShell) runs the fixed zero-warning lint scope.
- `npm run verify:lint-gates` (`npm.cmd run verify:lint-gates` from Windows PowerShell) runs the architecture-import rule self-test.
- `npm run verify:format` (`npm.cmd run verify:format` from Windows PowerShell) runs the non-writing Prettier check.
- `npm run verify:test-typecheck` (`npm.cmd run verify:test-typecheck` from Windows PowerShell) typechecks the test project without emitting files.
- `npm run verify:unit-self-test` (`npm.cmd run verify:unit-self-test` from Windows PowerShell) checks Vitest pass, failure, focused-only, and no-test exit behavior in OS-temporary fixtures.
- `npm run verify:unit` (`npm.cmd run verify:unit` from Windows PowerShell) runs the fixed Node unit-test suite with cache/output directed to a validated OS-temporary directory.
- `npm run verify:coverage` (`npm.cmd run verify:coverage` from Windows PowerShell) runs V8 coverage with reports directed to the validated OS-temporary directory.
- `npm run verify:integration` (`npm.cmd run verify:integration` from Windows PowerShell) runs the fixed jsdom Component/Router integration suite with cache/output directed to a validated OS-temporary directory.
- `npm run verify:e2e` (`npm.cmd run verify:e2e` from Windows PowerShell) starts the owned loopback fixture server and runs the fixed Chromium critical E2E suite with failure artifacts directed to validated OS-temporary storage.
- `npm run verify:e2e-self-test` (`npm.cmd run verify:e2e-self-test` from Windows PowerShell) verifies successful, failing, focused-only, and empty Playwright suite policies without using a Product route or repository report directory.
- `npm run verify:database` (`npm.cmd run verify:database` from Windows PowerShell) runs the fixed local-only Supabase migration and security harness. It requires a working Docker daemon and may download/start pinned local service images; it always requests local stack cleanup in `finally`.
- `npm run verify:database-types` (`npm.cmd run verify:database-types` from Windows PowerShell) regenerates test-only types from local migrations into validated OS-temporary storage and performs a byte-for-byte drift check.
- `npm run verify:database-types-self-test` (`npm.cmd run verify:database-types-self-test` from Windows PowerShell) validates exact-match acceptance and intentional-drift rejection without starting Docker or writing repository files.
- `npm run update:database-types` (`npm.cmd run update:database-types` from Windows PowerShell) is the explicit write-mode command for the test-only generated baseline; it is not a verification command and must be run only for an approved migration/type update.

The wrapper accepts only registered task names and no additional arguments. The registered tasks are build, coverage, database, database-types, database-types-self-test, e2e, e2e-self-test, format, integration, lint, lint-gates, self-test, test-typecheck, typecheck, unit, and unit-self-test. Browser tasks use fixed arguments and redirect supported outputs to OS temporary storage; any future unavoidable workspace fallback output must be added to the protected manifest.

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
4. Vitest runner foundation, followed by separately approved critical Domain tests and the first meaningful coverage baseline.
5. Testing Library and Router integration.
6. Ephemeral Supabase migration/security harness.
7. Generated database type drift gate.
8. Playwright critical E2E.
9. CI integration after local canonical scripts are stable.

Introduce dependencies by stage, pin exact direct versions, commit and review the lockfile, verify license/supply-chain and Node compatibility, and confirm workspace cleanliness after each stage. Do not add the full toolchain in one change.

Before substantial frontend implementation, stages 1 through 5 must be usable. Before schema/RLS/Storage implementation, artifact safety, static/unit foundations, and the ephemeral security harness must be usable.
