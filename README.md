# zaikoManeGeneral

An independent project for evolving an existing yarn inventory application into a general-purpose inventory management application. The current application remains yarn-specific; this repository is currently in the AI development foundation phase.

## Current status

- Existing application code is preserved without generalization changes.
- Markdown files under [`docs/`](docs/) are the source of truth for future requirements and design.
- [`AGENTS.md`](AGENTS.md) defines durable rules for humans and AI agents.
- General-purpose product, database, and UI designs are not finalized.

See [`docs/CURRENT_STATE.md`](docs/CURRENT_STATE.md) for the investigation snapshot and [`docs/TASKS.md`](docs/TASKS.md) for planned phases.

## Technology snapshot

- React 18.3.1 and Vite 6.3.5
- `.ts` / `.tsx` source files
- Tailwind CSS 4 and project theme CSS
- Supabase JS 2.x, Auth, and Storage
- Radix/shadcn-style assets; MUI is also installed

TypeScript configuration, linting, formatting, and tests are not established. A successful production build has not been confirmed.

## Local development

Supported runtime versions have not been formally documented. With dependencies installed, the configured development command is:

```powershell
npm run dev
```

The application references `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Use a local ignored environment file where appropriate. Never commit or publish environment values or secrets.

## Documentation

- [Product](docs/PRODUCT.md)
- [Current state](docs/CURRENT_STATE.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database and Supabase](docs/DATABASE.md)
- [Frontend](docs/FRONTEND.md)
- [Design](docs/DESIGN.md)
- [Testing](docs/TESTING.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Tasks](docs/TASKS.md)
- [Decisions](docs/DECISIONS.md)

AI agents must read [AGENTS.md](AGENTS.md) before starting work.
