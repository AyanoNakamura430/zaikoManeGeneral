# Frontend

## Current state

- `src/app/App.tsx` exceeds 2,600 lines, tightly coupling UI, state, domain-shaped types, validation, Auth, CRUD, and Storage.
- `react-router` is installed but unused; no dedicated state library.
- Screens use local state, modals, and overlays.
- Search, yarn filters, stock filter, and sorting live in `App.tsx`.
- Supabase fetch failure can fall back to LocalStorage, which also receives loaded items.
- `src/app/components/ui/` and `src/imports/` are present but unused by the current entry graph.

## Future direction

Before generalization, define component, hook/state, domain, and data-access boundaries. Exact directories, routing, and state tools remain undecided. Refactor incrementally, preserving or explicitly redefining behavior with verification and documentation.
