# Architecture

## Current architecture

- React built by Vite; Supabase client in `src/lib/supabase.ts`.
- Auth, table CRUD, and Storage called directly from frontend code.
- `src/app/App.tsx` owns UI, state, domain-shaped types, validation, and data access.
- State-driven screens and overlays rather than routing; React hooks without a dedicated state library.

See [`CURRENT_STATE.md`](CURRENT_STATE.md) for the snapshot and [`DATABASE.md`](DATABASE.md) for data operations.

## Target direction candidate

Architecture work should define boundaries between UI, domain rules and transformations, data access, hooks/state, and Supabase client configuration. These are candidates, not an approved directory structure.

## Change strategy

- Do not combine generalization with an unbounded rewrite.
- Define product and data requirements before target boundaries.
- Introduce boundaries in small, testable steps and preserve behavior unless requirements change it.
- Record accepted architecture choices in [`DECISIONS.md`](DECISIONS.md).
