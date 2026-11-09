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

## Design decisions

- **No dependency on shared demo accounts.** The public demo users are shared by everyone, and the
  app locks an account after repeated failed logins (HTTP 423). Tests therefore register their own
  unique user through the API (`newUser` fixture) instead of reusing `customer@...`.
- **Random passwords.** The app checks passwords against known data leaks and answers 422 for
  common ones (even the example from its own docs), so every test user gets a generated password.
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
src/fixtures/   custom Playwright fixtures (api, newUser)
tests/api/      API + contract tests
tests/ui/       browser tests
docs/openapi/   Toolshop OpenAPI specification (reference)
```

## Roadmap

- [x] Stage 1: project skeleton, two targets, first UI and API smoke tests
- [x] Stage 2: API client, Zod schemas, fixtures, auth + products contract tests
- [ ] Stage 3: Page Objects, UI regression scenarios
- [ ] Stage 4: hybrid tests (API login + storageState), accessibility, visual checks
- [ ] Stage 5: GitHub Actions (sharding, HTML report on GitHub Pages)
- [ ] Stage 6: bug reports, test strategy, optional AI failure summary
