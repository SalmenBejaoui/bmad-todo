# Story 3-6: Accessibility & Responsive Polish

## Status: in-progress

## Story

As a user on any device or using any assistive technology,
I want the full task loop to be operable by keyboard and screen reader, and render correctly on mobile and desktop,
So that the application meets WCAG 2.1 AA standards and works excellently across all supported contexts.

## Acceptance Criteria

- Full keyboard operability (Tab, Shift+Tab, Enter, Space, Escape)
- Visible 2px accent focus ring on all interactive elements (`focus-visible:ring-2`)
- `aria-live="polite"` on TaskList container (already in place)
- Correct aria-labels on Checkbox and delete button (already in place)
- Mobile 375px: single-column `px-4`, 44×44px touch targets, `py-3` padding
- Desktop 1280px: `max-w-xl` centred, delete icon hover-reveal only
- All transitions use `motion-safe:` prefix
- Zero critical WCAG violations

## Tasks

1. Fix `flex-shrink-0` → `shrink-0` lint issues (Tailwind v4 canonical)
2. Verify/add `motion-safe:` prefix to all transition classes
3. Audit focus rings: ensure no bare `focus:outline-none` without `focus-visible:ring-*`
4. Check touch targets: interactive elements ≥ 44px
5. Verify responsive layout correctness
6. Run tests to confirm no regressions
