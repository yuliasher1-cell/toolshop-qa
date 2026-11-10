import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';
import { test, expect } from '../../src/fixtures';
import { PaginatedProductsSchema } from '../../src/schemas/product';
import { parseContract } from '../../src/schemas/validate';

type PageName = 'home' | 'login' | 'product';

/**
 * Accessibility problems already present on the demo app, per page, by axe rule id.
 * They are described in docs/findings/accessibility.md. A known issue is only excused on the
 * page where it was found: the same rule on another page, or any other serious/critical rule,
 * still fails the test. When an issue gets fixed, delete it from this map.
 */
const KNOWN_ISSUES: Record<PageName, readonly string[]> = {
  home: ['list'], // <ul>/<ol> directly containing something other than <li> (3 elements)
  login: ['button-name'], // a button without an accessible name (1 element)
  product: [],
};

type Violations = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'];

async function scan(page: Page, testInfo: TestInfo, name: PageName): Promise<Violations> {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  // Keep the full report (with element selectors) next to the test result, even when it passes
  await testInfo.attach('axe-violations.json', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });
  return results.violations.filter(
    (v) => (v.impact === 'serious' || v.impact === 'critical') && !KNOWN_ISSUES[name].includes(v.id),
  );
}

const describeViolation = (v: Violations[number]): string =>
  `${v.id} (${v.impact}): ${v.help} - ${v.nodes.length} element(s)`;

test.describe('Accessibility (axe, WCAG 2 A/AA)', () => {
  test('home page has no new serious or critical violations @smoke', async ({ page, homePage }, testInfo) => {
    await homePage.goto();

    const violations = await scan(page, testInfo, 'home');

    expect(violations.map(describeViolation)).toEqual([]);
  });

  test('login page has no new serious or critical violations', async ({ page, loginPage }, testInfo) => {
    await loginPage.goto();
    await expect(page.getByTestId('login-submit')).toBeVisible();

    const violations = await scan(page, testInfo, 'login');

    expect(violations.map(describeViolation)).toEqual([]);
  });

  test('product page has no new serious or critical violations', async ({ page, api, productPage }, testInfo) => {
    const response = await api.getProducts();
    expect(response.status(), 'precondition: GET /products').toBe(200);
    const [product] = parseContract(PaginatedProductsSchema, await response.json()).data;

    await productPage.goto(product.id);
    await expect(productPage.name).toBeVisible();

    const violations = await scan(page, testInfo, 'product');

    expect(violations.map(describeViolation)).toEqual([]);
  });
});
