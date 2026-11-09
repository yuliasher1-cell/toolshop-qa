# toolshop-qa

Playwright + TypeScript test automation framework (UI + API + contract) for the public
[Toolshop](https://practicesoftwaretesting.com) demo application.

The same suite runs against two deployments:

| Target  | App                                              | Expectation                    |
| ------- | ------------------------------------------------ | ------------------------------ |
| `clean` | https://practicesoftwaretesting.com              | all tests pass                 |
| `bugs`  | https://with-bugs.practicesoftwaretesting.com    | tests fail where bugs are planted |

Every failure on the `bugs` target is analysed and documented in `docs/bugs/` (coming in a later stage).

## Quick start

```bash
npm install
npx playwright install --with-deps chromium

npm run test:clean      # run everything against the clean app
npm run test:bugs       # run everything against the buggy build
npm run test:smoke      # only tests tagged @smoke
npm run test:api        # API project only
npm run test:ui         # UI project only
npm run report          # open the last HTML report
```

## Project layout

```
src/config/     environment targets and public demo accounts
tests/ui/       browser tests
tests/api/      API tests (Playwright request fixture, no browser)
```

## Roadmap

- [x] Stage 1: project skeleton, two targets, first UI and API smoke tests
- [ ] Stage 2: API clients, Zod schemas, contract tests against the OpenAPI spec
- [ ] Stage 3: Page Objects, custom fixtures, UI regression scenarios
- [ ] Stage 4: hybrid tests (API login + storageState), accessibility, visual checks
- [ ] Stage 5: GitHub Actions (sharding, HTML report on GitHub Pages)
- [ ] Stage 6: bug reports, test strategy, optional AI failure summary
