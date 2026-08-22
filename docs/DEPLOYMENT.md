# Deployment

## Current known state

- No Vercel configuration found; the current `main` branch tracks `origin/main` (remote URL intentionally omitted here); deployment procedure remains unverified.
- Application references `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- `.env.local` is ignored; never display or commit its values.
- The artifact-safe production build check succeeds locally; deployment-environment build behavior remains unverified.

Production deployment requires explicit approval. Hosting, environments, CI/CD, domains, secrets, previews, monitoring, rollback, and ownership remain undecided. Do not infer Vercel settings.

## Approved Release Requirements

- Hosting must return the application entry for approved direct routes and refreshes without exposing unauthorized data.
- Production Auth requires reviewed redirect allowlists and end-to-end verification and password-reset tests.
- Production email requires an approved custom SMTP configuration, sender/domain validation, deliverability checks, and rate-limit review.
- Required static, test, database-security, browser, and artifact-safe build gates in [`TESTING.md`](TESTING.md) must pass; CI success does not authorize deployment.
- Environment checks report required key names or presence only, never values.
- Account-deletion monitoring, alerts, manual recovery, and signed-URL residual-access behavior require security approval before release.
- GitHub Actions is the selected CI provider through the local quality workflow. Deployment environment, release browser matrix, domains, monitoring, rollback, and production artifact retention remain unselected.

## Approved CI foundation

`.github/workflows/quality.yml` runs on pull requests, pushes to `main`, and manual dispatch. It defines independent static, local Docker-backed database-security, and Chromium E2E jobs. Each uses Node `22.23.2`, npm `11.6.2`, `npm ci`, read-only repository permissions, cancellation of superseded runs, and timeouts. E2E failure trace/screenshot output is retained from the runner temporary directory for three days. The workflow does not deploy, access live Supabase, read repository secrets, or authorize production release.
