# Deployment

## Current known state

- No Vercel configuration found; Git remote not configured; deployment procedure unverified.
- Application references `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- `.env.local` is ignored; never display or commit its values.
- Production build success is unverified.

Production deployment requires explicit approval. Hosting, environments, CI/CD, domains, secrets, previews, monitoring, rollback, and ownership remain undecided. Do not infer Vercel settings.
