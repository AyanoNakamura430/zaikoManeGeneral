# Product

## Status

Product definition is incomplete. This document records only approved direction and open decisions; it does not infer requirements from the yarn-specific implementation.

## Confirmed direction

- Develop this repository separately from the existing yarn inventory application.
- Aim for a general-purpose inventory management application rather than a yarn-only product.
- Reuse suitable existing implementation where safe and consistent with approved design.
- Continued Supabase use is likely, but its general-purpose design is undecided.
- The future approved general-purpose UI will be authoritative over the current yarn-specific UI.

## Open product decisions

- Scope of managed physical items.
- Fixed, user-defined, hierarchical, or other category model.
- Optional and category-specific attribute model.
- Inventory units.
- General-purpose item model and required fields.
- Image count, formats, limits, lifecycle, and ownership.
- Searchable fields and search behavior.
- Filter behavior and dimensions.
- Sort options and defaults.
- Whether LocalStorage fallback remains.
- How Figma or Figma Make participates in design-to-code.

These require Product Definition and human approval before implementation.
