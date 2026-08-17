# Database and Supabase

## Evidence boundary

This records repository-observed fields and operations, not a verified live schema. No migration, generated database types, RLS policies, or Storage policies are tracked.

## Observable table and fields

Frontend code accesses `zaikomane_items`: `id`, `user_id`, `photo`, `image`, `maker`, `product_name`, `color_name`, `color_code`, `material`, `gauge`, `quantity`, `purchase_date`, `url`, `notes`, `weight_g`, `length_m`, `needle_min`, `needle_max`, `hook_min`, `hook_max`, `gauge_stitches`, `gauge_rows`, `created_at`, and `updated_at`.

Nullability, defaults, constraints, indexes, foreign keys, and actual types are unverified.

## Observable CRUD

- Select visible rows ordered by `created_at` descending.
- Insert with authenticated `user_id` and return the row.
- Update by `id` with client-generated `updated_at`.
- Delete by `id`.

Select, update, and delete lack a frontend `user_id` filter. Effective isolation may depend on RLS; security must not be assumed while policies are unverified.

## Storage

- Bucket `product-images`; upload path `{user_id}/{timestamp}-{original filename}`.
- Signed URL lifetime 600 seconds.
- JPEG, PNG, WebP; frontend maximum 5 MB.
- After item deletion, frontend checks for another `photo` reference before requesting object deletion.

Storage policy, ownership enforcement, visibility, and server-side validation are unverified.

## Known concerns

`photo` and `image` overlap; their compatibility intent is undocumented. The general-purpose item/category schema and migration/rollback process are undecided. Schema, migration, RLS, Storage policy, and destructive data changes require approval and rollback planning.
