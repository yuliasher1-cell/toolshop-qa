# toolshop-qa

Playwright + TypeScript test automation framework (UI + API + contract) for the public
[Toolshop](https://practicesoftwaretesting.com) demo application.

The same suite runs against two deployments:

| Target  | App                                              | Expectation                       |
| ------- | ------------------------------------------------ | --------------------------------- |
| `clean` | https://practicesoftwaretesting.com              | all tests pass                    |
| `bugs`  | https://with-bugs.practicesoftwaretesting.com    | tests fail where bugs are planted |

Every failure on the `bugs` target is analysed and documented in `docs/bugs/` (later stage).

## Quick start

```bash
npm install
npx playwright install --with-deps chromium

npm run test:clean      # everything against the clean app
npm run test:bugs       # everything against the buggy build
npm run test:smoke      # only tests tagged @smoke
npm run test:api        # API project only
npm run test:ui         # UI project only
npm run report          # open the last HTML report
```

## Continuous integration

Workflows live in `.github/workflows/`.

| Workflow                      | When                                  | What it does |
| ----------------------------- | ------------------------------------- | ------------ |
| `ci.yml`                      | push to `main`, pull requests, manual | Runs the suite on the clean app in 2 parallel shards, merges the shard results into one HTML report (published on GitHub Pages for `main`, kept as an artifact otherwise), runs the same suite against the buggy build without failing the workflow, and compares screenshots once baselines exist. Every run prints a pass/fail summary. |
| `update-visual-baselines.yml` | manual                                | Renders the visual baselines on the CI runner and commits them. |

One-time setup: in the repository go to *Settings, Pages* and set *Source* to *GitHub Actions*
(on the free plan Pages needs a public repository).

**Visual regression.** Screenshots depend on the operating system's fonts, so baselines are always
rendered on the CI runner, never on a developer machine. The `visual` project therefore exists only
when `CI` is set, and local runs skip it. After the first push, run *Update visual baselines* once
(*Actions, Run workflow*); later the same workflow accepts an intended UI change. A failing
comparison uploads the expected, actual and diff images as the `visual-diff` artifact.

## Design decisions

- **No dependency on shared demo accounts.** The public demo users are shared by everyone, and the
  app locks an account after repeated failed logins (HTTP 423). Tests therefore register their own
  unique user through the API (`newUser` fixture) instead of reusing `customer@...`.
- **Random passwords.** The app checks passwords against known data leaks and answers 422 for
  common ones (even the example from its own docs), so every test user gets a generated password.
- **Built for a flaky public target.** The Toolshop demo is shared and sometimes slow or down. A
  global setup checks the target first and fails fast with one clear message; the suite runs with
  a small number of workers, one retry locally (retried passes show up as "flaky" in the report)
  and generous timeouts. Tests check the HTTP status before validating a schema, so a server error
  is never mistaken for a contract violation.
- **Sign in once per worker.** A worker-scoped fixture registers a user through the API, signs in
  through the UI a single time and saves the session (`storageState`). Tests written with
  `authedTest` start already signed in, so they skip the login form; the login tests themselves
  still use the normal, signed-out `test`.
- **Hybrid tests.** Setup goes through the fast API, verification through the UI (for example a
  favourite added by the API must appear on the favourites page).
- **Accessibility as a regression gate.** axe scans fail the build on any *new* serious or critical
  WCAG 2 A/AA violation; problems that already exist are listed per page in a known-issues map (described in
  `docs/findings/accessibility.md`) rather than
  hidden. The full axe report is attached to every test result.
- **Contract tests with Zod.** Response schemas in `src/schemas/` are derived from the OpenAPI spec
  (`docs/openapi/`). `parseContract` reports every violated field in one readable error.
- **Thin API client.** `ToolshopApi` returns raw responses; the tests decide what to assert.
- **Environment switch.** One `TARGET` variable selects the clean or the buggy deployment.

## Project layout

```
src/config/     environment targets, public demo accounts
src/api/        API client
src/schemas/    Zod schemas + contract helper
src/data/       test data factories
src/pages/      Page Objects (home, product, cart, login, header)
src/fixtures/   custom Playwright fixtures (api, newUser, page objects)
tests/api/      API + contract tests
tests/ui/       browser tests
tests/visual/   screenshot comparison (runs in CI only)
scripts/        helper scripts (results summary)
.github/        CI workflows
docs/openapi/   Toolshop OpenAPI specification (reference)
docs/findings/  findings about the application under test
```

## Roadmap

- [x] Stage 1: project skeleton, two targets, first UI and API smoke tests
- [x] Stage 2: API client, Zod schemas, fixtures, auth + products contract tests
- [x] Stage 3: Page Objects, UI scenarios (catalog, cart, login)
- [x] Stage 4: session reuse (storageState), hybrid API + UI tests, accessibility checks (axe)
- [x] Stage 5: GitHub Actions (sharding, HTML report on GitHub Pages), visual regression with baselines built in CI
- [ ] Stage 6: bug reports, test strategy, optional AI failure summary
