# Product

## Status

Phase 1 Product Definition was approved on 2026-08-17. Phase 2 Architecture and Data Design was approved on the same date. This document defines user-visible Product behavior; implementation details are owned by the linked architecture documents and still require bounded implementation plans.

## Product Vision

Provide an individual with a simple way to record personally owned physical items and understand what they own and how much they have. The application is developed independently from the existing yarn inventory application and may reuse suitable behavior without inheriting yarn-specific requirements.

## Target Users and Scope

- v1 serves one individual per account.
- It manages personally owned physical items, including consumables and one-of-a-kind possessions.
- Inventory is private to its owner.
- Household sharing and business inventory are future or out-of-scope capabilities, not implicit v1 requirements.
- Generalization follows a common-field plus category-attribute direction, with a deliberately limited v1.

## Core Use Cases

- Register an item with quantity and unit.
- Browse, search, filter, sort, and inspect current inventory.
- Edit an item, set its low-stock threshold, or mark it out of stock by setting quantity to zero.
- Organize items with default or personal categories.
- Delete an item through an explicit irreversible action.
- Manage authentication and the personal account.

## Item Definition

An Item is one inventory record representing a physical product, possession, or group of equivalent possessions that the user chooses to manage together. Duplicate item names are allowed.

### Common fields

| Field | Requirement | Product behavior |
| --- | --- | --- |
| Item name | Required | Human-readable name. |
| Category | Optional | Missing category is shown as `Uncategorized`. |
| Quantity | Required | Defaults to `1`; zero is valid; negative values are invalid. |
| Unit | Required | Defaults to `点`; selected from the v1 fixed list. |
| Low-stock threshold | Optional | Disabled by default and expressed in the item's unit. |
| Image | Optional | One image in v1. |
| Notes | Optional | Free text. |
| Purchase date | Optional | Enables date filtering and sorting. |
| Brand / maker | Optional | Common across categories. |
| Color | Optional | Common across categories. |
| Model / product code | Optional | General model or product identifier, not a business SKU workflow. |
| Created time | System managed | Available for sorting. |
| Updated time | System managed | Available for sorting. |

## Category

- Category is optional; unassigned items appear as `Uncategorized` and can be filtered.
- v1 provides protected system categories: `日用品`, `食品・飲料`, `衣類・服飾`, `家電・電子機器`, `趣味・コレクション`, and `工具・用品`.
- System categories cannot be renamed or deleted in v1.
- Users can create a category from an Item form or the Category management screen.
- User categories can be renamed, reordered, and deleted from Category management.
- A Category name is required, and duplicate Category names are not allowed for the same user. Approved name-comparison and normalization direction is documented in [`DATABASE.md`](DATABASE.md).
- Deleting a user category never deletes its Items. A confirmation shows the affected count, then those Items become Uncategorized.
- A Category may have an optional color from a preset palette. Names remain visible so color is never the only signal.
- Category icons and hierarchy are not part of v1.

## Category-specific Attributes

v1 uses protected, system-defined optional templates. User-created Categories use common Item fields only. Users cannot create attribute definitions in v1.

| Category | Attribute | Type |
| --- | --- | --- |
| 日用品 | 規格・サイズ | text |
| 日用品 | 開封済み | boolean |
| 食品・飲料 | 内容量 | text |
| 食品・飲料 | 開封済み | boolean |
| 衣類・服飾 | サイズ | text |
| 衣類・服飾 | 素材 | text |
| 家電・電子機器 | シリアル番号 | text |
| 趣味・コレクション | シリーズ | text |
| 趣味・コレクション | 素材 | text |
| 工具・用品 | 規格・サイズ | text |
| 工具・用品 | 材質 | text |

When an Item changes Category, values belonging to the previous Category are retained but hidden. Hidden values are not searched or filtered and are restored if the Item returns to that Category. The approved storage representation is documented in [`DATABASE.md`](DATABASE.md).

## Inventory, Quantity, Unit, and Status

### Quantity rules

- Quantity is required and defaults to `1`.
- Count units accept non-negative integers.
- Measurement units accept non-negative decimals.
- Negative inventory is invalid.
- Quantity zero retains the Item and marks it out of stock; it never deletes the Item.
- A one-of-a-kind Item is represented as `1 点` with no low-stock threshold.

### Fixed units

- Count units: `点`, `個`, `本`, `枚`, `冊`, `着`, `組`, `セット`, `箱`, `袋`, `パック`, `台`.
- Measurement units: `g`, `kg`, `mL`, `L`, `cm`, `m`.
- User-defined units and automatic conversion are not in v1.
- Changing Unit does not convert Quantity automatically.

### Derived stock status

- `Out of stock`: Quantity is zero.
- `Low stock`: Quantity is positive, a threshold is enabled, and Quantity is at or below it.
- `Available`: all other positive quantities.

The status is derived rather than manually selected. The threshold is per Item, optional, and disabled by default. No global or Category threshold is provided in v1.

## Search

- A single search box searches Item name, Category name, Notes, and currently active searchable text/select common and Category attributes.
- It excludes Quantity, dates, booleans, thresholds, and hidden previous-Category values.
- Matching ignores surrounding whitespace, English letter case, and common full-width/half-width differences.
- Multiple tokens use AND semantics; tokens may match different fields.
- An empty query returns all Items.
- Fuzzy search, field syntax, ranking, saved search, exclusions, and suggestions are Future capabilities.

## Filter

- v1 provides multi-select filters for Category, stock status, and currently used Units.
- Uncategorized is a Category-filter option.
- Purchase date supports an optional from/to range; Items without a date are excluded while a date condition is active.
- Values within one filter dimension use OR. Different dimensions and Search use AND.
- Each filter and all filters can be cleared. Search has its own clear action.
- A no-results state offers an action to clear Search and filters together.
- Closing the filter UI retains conditions, but a page reload resets them.
- Quantity ranges and Category-attribute filters are not in v1.

## Sort

- Sortable fields: Created time, Updated time, Item name, and Purchase date.
- Quantity is sortable only while exactly one Unit is selected in the Unit filter.
- Every option supports ascending and descending direction.
- The default is Created time descending.
- Missing values and Uncategorized Items appear last regardless of direction.
- Category sorting and cross-unit Quantity comparison are not in v1.

## Image

- Image is optional, and Items can be registered without one.
- v1 supports one JPEG, PNG, or WebP image up to 5 MB per Item.
- Image selection provides a local preview before Save.
- Add, replace, and remove operations become final only after a successful Save; Cancel retains the prior saved image.
- An image failure preserves the form and existing image and allows retry or continuing without a new image.
- Image-less Items use a neutral placeholder with optional Category-color accent, never a fake product photograph.
- Multiple images, HEIC, automated compression, and camera-specific workflows are Future capabilities.

## CRUD

### v1 Must

- Create: allow image-less registration and validate required fields.
- List: show image/placeholder, Item name, Quantity and Unit, stock status, and Category.
- Detail: provide read-only inspection and explicit Edit, Copy, and Delete actions where available.
- Edit: update common fields, active Category attributes, Category, threshold, and image.
- Delete: irreversible explicit action, separate from Quantity zero.

Delete confirmation names the Item, explains that the Item record and associated image will become unavailable, and states that v1 has no undo or recycle bin. A failed delete keeps the Item visible.

### v1 Should

Copy is a v1 target but not a release blocker. If deferred, it must be explicitly carried into the next increment.

Copy opens a prefilled Create form and creates an independent Item. It copies Item name, Category, Unit, Notes, approved common fields, active Category attributes, and threshold. It resets Quantity to `1` and Purchase date to empty, and does not copy the image, hidden attributes, identity, or timestamps.

### Interaction quality

- Validation appears near the affected field and preserves entered values.
- Initial loading, true empty inventory, no results, network error, authentication expiry, success, and failure are distinct states.
- Save and Delete prevent duplicate submission.
- Failed writes remain visibly unsaved and support retry.
- Leaving a changed Create, Edit, or Copy form requires confirmation before discarding changes.

## Authentication and Account

- Inventory use requires authentication; v1 has no guest inventory.
- v1 uses email and password sign-up/sign-in.
- Email verification is required before inventory use, with resend and email-correction paths.
- Password reset is a production v1 Must.
- One account represents one individual, and all Items, Categories, attributes, and images are private to that user.
- v1 has no organization, role, invitation, collaborative ownership, or sharing link.
- The Account screen shows email, verification state, password recovery/change entry points, Logout, and Delete Account.
- Logout clears the previous account's inventory, images, Search, and UI state from view. Unsaved-change confirmation runs first when needed.
- Session expiry is shown as a re-authentication requirement, not as empty inventory or a generic network error. Current-tab form input is retained where feasible without persistent storage.

Self-service Delete Account is a production-release gate. It requires re-authentication and explicit confirmation. There is no grace period or undo, and access terminates immediately. Physical deletion of all user-owned Items, materialized Categories, attribute values, images, application records, and the Auth user proceeds through a durable retryable workflow. Global system Category Templates and Attribute Definitions are shared reference data and are not deleted.

Private ownership is a product promise. The application is not production-ready until cross-account isolation and image access are verified; current RLS and Storage policies remain unverified.

## LocalStorage, Online, and Offline

- Online user data is the only authoritative inventory source in v1.
- The current silent LocalStorage inventory fallback must be removed during implementation.
- v1 does not persist inventory cache, form drafts, or an offline mutation queue in LocalStorage or IndexedDB.
- Unsaved form data and image preview may remain only in current-tab memory.
- Initial load failure shows a dedicated error with Retry rather than an empty list or stale local inventory.
- Write failure preserves the visible form or Item and never reports success.
- Offline support remains a Future capability requiring explicit sync, conflict, privacy, account-switch, deletion, and retention rules.
- Treatment of any existing local data must be investigated and approved during migration planning.

## UI Direction

- Use a hybrid approach: design the general-purpose information architecture and flows deliberately, then audit current UI patterns and assets for reuse.
- The approved Figma design is the visual and interaction specification. `docs/DESIGN.md` owns design workflow and behavior not adequately represented in Figma.
- Figma Make output is a prototype/reference, not production source. Repository code remains production source.
- Use staged human approval before implementation: screen inventory and flows, wireframes/navigation, states/responsive behavior, then visual system/tokens/components.
- Design mobile-first and provide the same v1 capabilities on desktop.
- Top-level destinations are Inventory, Categories, and Account. Create Item is the primary Inventory action.
- Create and Edit are independent-screen candidates, particularly on mobile; the approved wireframe makes the final presentation choice.
- Browser Back must behave predictably.
- Inventory, Categories, Account, Create, Item Detail, and Edit support stable direct navigation, refresh, and post-authentication return. Temporary confirmation UI does not require a direct URL.
- Private URLs never grant access to another user's data. Missing, deleted, and unauthorized resources require appropriate states.
- WCAG 2.2 AA is the v1 accessibility target.

See [`DESIGN.md`](DESIGN.md) and [`FRONTEND.md`](FRONTEND.md) for the approved workflow and implementation-design boundary.

## v1 Must

- Individual private inventory with required authentication.
- Email verification and password reset.
- Item Create, List, Detail, Edit, and Delete.
- Approved common fields, Categories, fixed Category templates, Quantity, Units, and stock status.
- Search, Filter, and Sort defined above.
- Optional single image.
- Category and Account management.
- Explicit error, retry, validation, loading, confirmation, and unsaved-change behavior.
- Online authoritative data without silent LocalStorage fallback.
- Mobile-first responsive approved design and WCAG 2.2 AA target.
- Private direct navigation and owner-isolation verification.

## v1 Should

- Copy / duplicate into a prefilled Create form. It is a target but not a release blocker.

## Future

- User-defined Category attributes and Units; structured measurement attributes and Unit conversion.
- Household sharing, organizations, roles, and collaborative ownership.
- Multiple locations, stock movement history, expiration/notifications, ordering/sales, and complex lots.
- Advanced search, saved filters, Quantity ranges, and typed Category-attribute filters.
- Offline cache, synchronization, conflict resolution, and persistent drafts.
- Multiple images, Archive, recycle bin/undo, batch operations, import/export, and barcode workflows.
- Category icons, dark mode/theme customization, native app, and PWA.
- Advanced Figma automation or Code Connect after the design system and component boundaries are established.

## Out of Scope / Won't for Now

- Guest inventory.
- Business inventory, accounting, ordering, sales, or business SKU workflows.
- Sharing, invitations, roles, or public Item links.
- Negative inventory or automatic deletion at Quantity zero.
- Automatic Unit conversion.
- Category hierarchy and user-created attribute builder.
- Silent LocalStorage fallback or offline writes reported as successful.
- Fake product photographs as placeholders.
- Direct production adoption of unapproved generated Figma code.

## Architecture Handoff

Phase 2 approved the general Item/Category/Attribute representation, Category ordering, logical schema and migration direction, GRANT/RLS and Storage direction, image lifecycle, authentication and deletion architecture, Search/Filter/Sort implementation direction, direct navigation, frontend boundaries, quality gates, and treatment of existing yarn/local data. See [`ARCHITECTURE.md`](ARCHITECTURE.md), [`DATABASE.md`](DATABASE.md), [`FRONTEND.md`](FRONTEND.md), and [`TESTING.md`](TESTING.md). Implementation must not reinterpret the approved Product behavior without new human approval.
