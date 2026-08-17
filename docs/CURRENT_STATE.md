# Current State

## Snapshot

This is a repository-observable snapshot based on the read-only investigation completed on 2026-08-16 and a clean-tree recheck on 2026-08-17. Runtime services and the Supabase dashboard were not inspected.

## Git state at investigation

- Branch `main`; working tree clean; no remote configured.
- One commit: `ead50a7 Initial commit`.
- `dist/` exists locally but is ignored and untracked.
- `.env.local` exists locally and is ignored.

## Technology

- React/React DOM 18.3.1; Vite 6.3.5; `.ts` and `.tsx` source.
- No TypeScript dependency or `tsconfig` found.
- Tailwind CSS 4, project theme CSS, and CSS-loaded Google Fonts.
- Supabase JS 2.x with Auth and Storage calls.
- Radix/shadcn-style UI assets and MUI dependencies are present.
- `react-router` is installed but unused by the current entry path.
- React hooks provide state; no dedicated state library.
- No lint, formatter, or test configuration or scripts.
- Build is `vite build`; success is unverified because it would update `dist/`.
- No repository deployment configuration found.

## Directory overview

- `src/main.tsx`: React entry point.
- `src/app/App.tsx`: current UI, state, authentication, CRUD, and Storage behavior.
- `src/lib/supabase.ts`: Supabase client.
- `src/styles/`: Tailwind and project CSS.
- `src/app/components/ui/`: present but not imported by current `App.tsx`.
- `src/imports/`: Figma-generated assets not referenced by the current entry graph.
- `guidelines/Guidelines.md`: unfilled template, not source of truth.
- `ATTRIBUTIONS.md`: shadcn/ui and Unsplash attribution.
- No `public/`, tracked migrations, or deployment configuration found.

## Current features

- Email/password sign-in, sign-up, session observation, and sign-out.
- Inventory list, create, copy-create, detail, edit, and delete.
- Search over maker, color, material, gauge, and notes.
- Sort by purchase date, quantity, maker, or color.
- Filter by material, yarn gauge, and fixed stock thresholds.
- Image validation, preview, upload, signed URL, replacement, and cleanup.
- Quantity management and LocalStorage fallback after initial fetch failure.
- State-driven modals/overlays; no URL routing.
- No general-purpose category feature.

## Supabase, Auth, and Storage

- Frontend directly accesses `zaikomane_items`.
- Inserts include authenticated `user_id`; select, update, and delete lack a code-level `user_id` filter.
- Separation may depend on RLS, but RLS was not verified.
- Bucket `product-images`; path `{user_id}/{timestamp}-{original filename}`; signed URL lifetime 600 seconds.
- JPEG, PNG, WebP accepted; frontend maximum 5 MB.
- Storage policies were not verified.

## Repository-observable item fields

`id`, `user_id`, `photo`, `image`, `maker`, `product_name`, `color_name`, `color_code`, `material`, `gauge`, `quantity`, `purchase_date`, `url`, `notes`, `weight_g`, `length_m`, `needle_min`, `needle_max`, `hook_min`, `hook_max`, `gauge_stitches`, `gauge_rows`, `created_at`, `updated_at`.

These are frontend references, not a verified live schema declaration.

## Yarn-specific behavior

Fixed materials, yarn gauges and makers; weight/length/needle/hook/stitch/row fields; yarn-specific labels, filtering, search assumptions, placeholder art, and LocalStorage key.

## Structure and known risks

`src/app/App.tsx` exceeds 2,600 lines and combines types, mapping, images, Auth, CRUD, state, forms, dialogs, and screens. Other known risks are unverified live schema/RLS/Storage policies, unproven user isolation, overlapping `photo`/`image` fields, undecided LocalStorage safety, missing quality gates, and uncertain status of unused UI/Figma assets. Do not delete or redesign these without approval.
