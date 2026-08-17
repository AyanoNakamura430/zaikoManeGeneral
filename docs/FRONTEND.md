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

## Approved Product-facing Structure

The detailed behavior belongs to [`PRODUCT.md`](PRODUCT.md). The frontend must support these top-level destinations:

- Inventory, including Item List and its Search, Filter, Sort, loading, empty, no-results, and error states.
- Categories, including system Category display and user Category management.
- Account, including email state, password entry points, Logout, and Delete Account.

Item flows include Create, read-only Detail, Edit, irreversible Delete confirmation, and Copy when the v1 Should item is implemented. Create Item is the primary Inventory action.

Authentication flows include Sign in, Sign up, email-verification pending/resend/correction, password-reset request, new password, and invalid/expired-link states. Common flows include authentication expiry, Retry, validation, success/failure feedback, and unsaved-change confirmation.

## Navigation Expectations

- Browser Back behaves predictably.
- Inventory, Categories, Account, Create, Item Detail, and Edit support stable direct navigation and page refresh.
- A user who reaches a permitted private destination before authentication returns to that destination after successful authentication where feasible.
- Missing, deleted, and unauthorized Items have explicit states.
- A URL never grants another user access to private data.
- Temporary confirmation Dialogs and other transient UI do not require direct URLs.

These are Product requirements, not a decision to use a particular router or route layout. Routing, URL structure, state boundaries, and component organization belong to Phase 2.

## Implementation Constraints

- Use the approved Figma design and [`DESIGN.md`](DESIGN.md) as design input; treat repository code as production source.
- Implement mobile-first responsive behavior with equivalent desktop capabilities.
- Do not extend the existing oversized `App.tsx` without an approved responsibility-boundary plan.
- Separate UI, domain rules, state/hooks, and data access through incremental, reviewed changes.
- Remove the current silent LocalStorage inventory fallback when the approved implementation task reaches that behavior; do not introduce a replacement cache or offline queue without approval.
- Preserve input through validation and failed writes, prevent duplicate submissions, and distinguish unsaved from saved state.
