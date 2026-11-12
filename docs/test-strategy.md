# Test strategy

Scope: the Toolshop demo web shop (Angular UI + Laravel REST API), tested black-box from the outside.
Goal of this project: a small but realistic automation framework that is reliable in CI, readable,
and honest about what it does not cover.

## Risks that drive the choices

| Risk | Consequence | Answer |
|---|---|---|
| Money and orders: cart, checkout, prices | Wrong totals or lost orders | UI tests of the core buying path, API tests of prices, sorting and filters |
| Accounts and access: login, roles, lockout | Data leak, account takeover | API tests of authentication rules; known-bugs suite for authorization defects |
| API drift between UI and backend | Broken screens after a backend change | Contract tests (Zod schemas derived from the OpenAPI spec) |
| Accessibility | Users cannot use the shop; legal exposure | axe scans of key pages as a regression gate |
| Unintended visual change | Broken layout nobody notices | Screenshot comparison of the login page, rendered on the CI runner |
| Flaky or unavailable test target | Red builds that mean nothing | The app under test runs inside the CI job (Docker), tests create their own data |

## Levels and what each one covers

| Level | Tooling | What is tested | Why at this level |
|---|---|---|---|
| API | Playwright `request` | Registration, login, lockout, products (pagination, sorting, filters, 404) | Fast and stable; most business rules live in the API |
| Contract | Zod schemas | Shape and types of responses | Catches silent API changes that break the UI |
| UI | Playwright, Page Objects | Catalogue, cart, login, account area | Only what needs a browser: rendering, navigation, state in the page |
| Hybrid | API set-up, UI check | A favourite added by the API appears in the account | Cheap set-up, meaningful end-to-end check |
| Accessibility | axe-core | WCAG 2 A/AA on home, login, product | Automated part of accessibility; the rest needs manual review |
| Visual | `toHaveScreenshot` | Login page, normal and error state | Layout regressions; kept small because screenshots are costly to maintain |
| Known bugs | Playwright, helper `verifyBug` | 12 documented defects of the buggy build | Shows the framework can detect real defects (see `docs/bugs/`) |

The shape follows the test pyramid: most checks are API, a thinner layer is UI, and the browser is used
only when a browser is the point.

## Test data and independence

- Every test registers its own user with a unique e-mail and a random password. No test depends on a
  shared demo account or on the result of another test.
- Passwords are generated because the app rejects well-known passwords (HTTP 422).
- Sessions are prepared once per worker (`storageState`), so tests do not repeat the login form.
- Tests run in parallel with one retry locally and two in CI. A test that passes only after a retry is
  reported as flaky in the HTML report and should be fixed, not accepted.

## Environments

| Target | Used for |
|---|---|
| `local` (Docker, normal build) | CI: the full suite, visual baselines. Also usable on a developer machine |
| `local` with `BUGGY_BUILD=true` (Docker, buggy build) | CI: the known-bugs job |
| `clean` (public demo) | Manual and local runs. Not used in CI: the public site shows a bot check to GitHub-hosted runners |

The buggy build is an older generation of the application (numeric IDs, other fields), so the
functional suite is deliberately not run against it. Only the known-bugs suite is.

## Pipeline

1. The suite runs in two parallel shards; each job starts its own copy of Toolshop.
2. Shard results are merged into one HTML report, published on GitHub Pages for `main`.
3. A job summary lists totals and failed tests for every run.
4. The known-bugs job runs separately against the buggy build and is expected to reproduce every defect.
5. Visual comparison runs against baselines that were rendered on the CI runner.

## Out of scope, on purpose

- Payment and invoice PDF flows, e-mail content, file upload on the contact page.
- Cross-browser and mobile layouts (Chromium only); most planted layout defects need Firefox or Edge.
- Performance, load and penetration testing; the known-bugs suite documents a handful of security
  defects but is not a security audit.
- Visual testing of anything beyond the login page.

## Known limits of the framework

- The Toolshop images install npm and Composer packages on every start, so a CI run takes several
  minutes before the first test.
- `verifyBug` counts any failure of its assertion as a reproduced defect; set-up code runs before it
  to keep that honest, and the observed failure is attached to the report.
- Accessibility findings that already exist are listed per page in a known-issues map and documented in
  `docs/findings/accessibility.md`; only new serious or critical findings fail the build.

## Ideas for later

- A short AI-generated summary of failures based on the JSON report.
- API tests for orders and invoices, once a stable way to create a full order through the API is in place.
