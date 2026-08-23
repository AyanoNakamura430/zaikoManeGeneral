# Frontend

## Status and Current Gap

The target frontend architecture is approved and partially implemented through pure Domain modules, provider-neutral Application errors and collection states, an Inventory read port with no caller-supplied owner ID, and the Inventory list use case. Owner and session binding remains an Adapter responsibility. No adapter, new application shell, Router integration, or Product screen uses those contracts yet. The current `src/app/App.tsx` still couples UI, state, validation, Auth, CRUD, Storage, Search, Filter, Sort, and LocalStorage fallback. See [`CURRENT_STATE.md`](CURRENT_STATE.md).

`react-router` and `react-hook-form` are installed but unused by the current entry graph. Their exact current APIs, Vite integration, and deployment behavior must be verified before implementation. Existing MUI, Radix/shadcn-style, custom UI, and Figma assets are not automatically approved.

## Feature Boundaries

- App composition: providers, routing, Auth bootstrap, and root error boundary only.
- Auth: Sign in, Sign up, verification, reset, callback, and session-expiry presentation.
- Inventory: Item list, Search, Filter, Sort, and collection states.
- Items: Create, Detail, Edit, Delete, Copy, forms, and image partial results.
- Categories: management, inline creation, ordering, and delete-to-Uncategorized flow.
- Account: account status, Logout, and deletion request/status.
- Domain and ports: pure shared contracts with no React or Supabase dependency.
- Adapters and infrastructure: Supabase access, row mapping, Hybrid codec, and provider error translation.

Feature internals must not be deep-imported by another feature. New Supabase `.from()`, Auth, or Storage calls are prohibited in screens and components.

## Route Contract

React Router is the approved routing direction, subject to current-version implementation verification.

Public and Auth routes:

- `/sign-in`
- `/sign-up`
- `/verify-email`
- `/password-reset`
- `/password-reset/confirm`

Protected routes:

- `/inventory`
- `/items/new`
- `/items/:itemId`
- `/items/:itemId/edit`
- `/categories`
- `/account`

`/` safely redirects according to session and application-account state. Confirmation Dialogs and unsaved-change prompts do not require routes.

Authentication return targets must be allowlisted relative application paths. Reject schemes, hosts, protocol-relative paths, and unknown routes. Reauthorize the destination after authentication and onboarding; the URL never grants private access.

## Navigation Semantics

- Refresh preserves route identity and reloads authoritative remote data.
- Create Save replaces the Create entry with the new Detail route.
- Edit Save replaces Edit with Detail.
- Delete success replaces the deleted Detail with Inventory.
- Auth callbacks replace callback/history entries with the permitted destination.
- Cancel returns to a safe origin; direct Create entry falls back to Inventory and direct Edit entry to Detail.
- Search, Filter, and Sort remain Inventory-page memory state and reset on reload as required by [`PRODUCT.md`](PRODUCT.md).
- Vite and hosting fallback for direct routes belongs to deployment implementation.

## State Ownership

Server state includes session eligibility, Items, Categories, Definitions, deletion status, and saved image paths. It is remote-authoritative and is not persisted to LocalStorage or IndexedDB.

Form state includes values, touched/errors, dirty state, selected files, local previews, and submit state. It remains in the current route/tab.

UI state includes Dialogs, panels, Search/Filter/Sort, notifications, and temporary selection. Route state contains only destination identity, IDs, and sanitized Auth return information, not entity snapshots.

Start server-state orchestration with React Router loader/action equivalents calling Application use cases. Do not add TanStack Query, SWR, or another cache library until repeated invalidation, background refresh, deduplication, or performance needs justify a new approval.

Use the existing React Hook Form dependency as the form-management candidate. Keep its types inside feature forms and map submitted values into Domain commands.

## Validation Boundaries

1. Form/UI validation supplies immediate, accessible feedback and image prechecks.
2. Domain/Application validation owns Product invariants and is reused by form submission and use cases.
3. Adapters decode database, JSON, and trusted-operation responses at runtime.
4. Database, RLS, and Storage independently enforce integrity and authorization.

Generated database types do not replace runtime decoding or Domain validation. Start with pure validators and guards; propose a runtime schema library only when nested-contract duplication or review complexity crosses the approved threshold.

## Explicit Page States

Auth state distinguishes session checking, unauthenticated, verification required, onboarding required/running/failed, active, reauthentication required, and deleting account.

Collections distinguish loading, load error, true empty, loaded with Items, and no Search/Filter results. Entity routes distinguish loading, ready, not-found-or-unavailable, authentication expiry, and load error.

For private Items, missing and unauthorized states share the user-facing `not-found-or-unavailable` presentation to avoid disclosing existence. Internal tests and telemetry may preserve the distinction. Authentication expiry is not displayed as an empty list or generic network failure.

## Unsaved Changes

Guard dirty Create, Edit, and Copy forms for internal navigation, Back, Cancel, Logout, reload, and tab close where browsers permit. Initialize and prefill forms as clean; reset the baseline only after server-confirmed success. Keep input and preview after validation or write failure.

During authentication expiry, preserve current-tab form memory where feasible and require explicit Retry after reauthentication. Do not persist a draft. Browser `beforeunload` text is best-effort and cannot be customized reliably.

## Image Partial Results

Application use cases, not components, coordinate database and image operations. Results distinguish:

- saved with image;
- Item saved but image not saved;
- common edits saved while the previous image remains;
- image unlink succeeded while physical cleanup is pending;
- Item data not saved.

Create image failure must not cause a second Save to duplicate the Item. Edit replacement failure keeps the previous image. Cleanup failures remain internal retry/monitoring concerns after the image is inaccessible to the user.

## Implementation Constraints

- Follow [`ARCHITECTURE.md`](ARCHITECTURE.md) dependency direction.
- Use approved Figma design and [`DESIGN.md`](DESIGN.md) before screen implementation.
- Do not mix UI systems without a primary-system decision.
- Remove the silent LocalStorage fallback at controlled cutover; do not replace it with an unapproved cache or offline queue.
- Implement mobile-first responsive behavior with equivalent desktop capability.
- Establish the quality prerequisites in [`TESTING.md`](TESTING.md) before substantial feature implementation.
