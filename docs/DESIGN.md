# Design

## Current assets

Tailwind CSS 4, project theme CSS, Radix/shadcn-style components, MUI dependencies, Figma-generated assets, and `guidelines/Guidelines.md` are present.

`guidelines/Guidelines.md` is an unfilled template and is not source of truth. This file owns accepted design documentation. Existing assets are not automatically approved for the general-purpose product.

## Approved Design Direction

- Use a hybrid approach: design general-purpose information architecture and flows first, then audit current yarn UI patterns, `src/imports/`, and existing UI components individually for reuse.
- Approved Figma designs are the visual and interaction specification.
- Figma Make output is prototype/reference material and is not adopted directly as production code.
- Repository code is the production source.
- Do not automatically adopt or delete existing design assets.
- Do not mix MUI, Radix/shadcn-style, and custom UI without an approved primary design-system decision.

## Approval Workflow

Design proceeds through human-approved gates:

1. v1 screen inventory and primary user flows.
2. Mobile-first low-fidelity wireframes and navigation.
3. Loading, empty, no-results, error, validation, confirmation, disabled, success, authentication-expiry, and unsaved-change states.
4. Desktop adaptation with the same v1 capabilities.
5. Visual direction, tokens, typography, spacing, status and Category colors, and component states.
6. Reuse audit and primary design-system recommendation.
7. Screen-level implementation plan.

Do not implement an unapproved screen solely because generated code exists.

## Responsive and Accessibility Targets

- Design mobile-first while providing the same functionality on desktop.
- Avoid mobile-only or desktop-only actions in v1.
- Treat WCAG 2.2 AA as the target quality bar.
- Support keyboard completion of primary flows, visible focus, logical focus order, and Dialog focus management.
- Use persistent labels and associate errors with fields.
- Never communicate Category or stock status by color alone.
- Provide sufficient contrast and practical touch targets.
- Use semantic controls and meaningful Item-image alternative text.
- Support zoom, reflow, long names, and reduced-motion preferences.
- Distinguish loading, empty, no-results, error, disabled, and success states.

Exact test tooling and automated gates belong to Phase 3.

## Pending Design Decisions

- Visual style, brand direction, tokens, fonts, and exact responsive breakpoints.
- Mobile and desktop navigation components.
- Whether Create/Edit render as full screens, Dialogs, or another approved responsive pattern; independent mobile screens are the first wireframe candidate.
- Primary UI system: MUI, Radix/shadcn-style, current custom UI, or an approved alternative.
- Reuse or retirement of individual current UI and Figma-generated assets.
- Figma file ownership, versioning, and design/code drift workflow.

These decisions are prerequisites for new screen implementation. Phase 2 architecture deliberately does not select a primary UI library. Until approval, do not use the presence of MUI, Radix/shadcn-style, custom UI, or generated Figma assets as permission to mix or adopt them in new features.
