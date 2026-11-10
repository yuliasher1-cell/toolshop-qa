# Accessibility findings

Found by the axe-core scans in `tests/ui/a11y.spec.ts` (rule sets WCAG 2 A and AA) against the
clean Toolshop deployment, 10 Nov 2026. Only serious and critical violations fail the suite.
Each finding is registered in the `KNOWN_ISSUES` map of the spec, per page, so it is tracked but
does not hide new regressions.

| ID     | Page  | axe rule      | Impact   | WCAG criterion                | Elements | Status |
| ------ | ----- | ------------- | -------- | ----------------------------- | -------- | ------ |
| A11Y-1 | Home  | `list`        | serious  | 1.3.1 Info and Relationships  | 3        | known  |
| A11Y-2 | Login | `button-name` | critical | 4.1.2 Name, Role, Value       | 1        | known  |

The product details page had no serious or critical violations in this run.

## A11Y-1: lists contain elements other than list items (home page)

- **What:** axe rule `list`: a `<ul>` or `<ol>` directly contains something other than `<li>`,
  `<script>` or `<template>`.
- **Why it matters:** screen readers announce lists by counting their items. A list with foreign
  children is announced with a wrong or confusing structure.
- **Expected:** every direct child of a `<ul>`/`<ol>` is an `<li>`; wrapper elements go inside the item.
- **Affected elements:** 3. Selectors are in `axe-violations.json`, attached to the test in the
  HTML report (`npm run report`, open the test, section Attachments; see `nodes[].target`).

## A11Y-2: button without an accessible name (login page)

- **What:** axe rule `button-name`: a `<button>` has no text, `aria-label` or `aria-labelledby`.
- **Why it matters:** a screen reader announces only "button", so the user cannot tell what it does.
- **Expected:** every button has a visible text or an `aria-label` describing its action.
- **Affected elements:** 1. Selector in the same `axe-violations.json` attachment.

## Notes

- axe finds roughly a third of accessibility problems automatically. A clean scan does not mean
  the page is accessible; keyboard navigation and screen reader behaviour still need manual checks.
- The scans are repeatable, so any new serious or critical violation shows up as a failing test.
