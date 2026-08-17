# Deployment

## Current known state

- No Vercel configuration found; Git remote not configured; deployment procedure unverified.
- Application references `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- `.env.local` is ignored; never display or commit its values.
- Production build success is unverified.

Production deployment requires explicit approval. Hosting, environments, CI/CD, domains, secrets, previews, monitoring, rollback, and ownership remain undecided. Do not infer Vercel settings.

## Approved Release Requirements

- Hosting must return the application entry for approved direct routes and refreshes without exposing unauthorized data.
- Production Auth requires reviewed redirect allowlists and end-to-end verification and password-reset tests.
- Production email requires an approved custom SMTP configuration, sender/domain validation, deliverability checks, and rate-limit review.
- Required static, test, database-security, browser, and artifact-safe build gates in [`TESTING.md`](TESTING.md) must pass; CI success does not authorize deployment.
- Environment checks report required key names or presence only, never values.
- Account-deletion monitoring, alerts, manual recovery, and signed-URL residual-access behavior require security approval before release.
- Deployment environment, CI provider, browser matrix, domains, monitoring, rollback, and artifact retention remain unselected.
