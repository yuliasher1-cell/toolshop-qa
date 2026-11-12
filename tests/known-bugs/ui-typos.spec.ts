import { test, expect } from '../../src/fixtures';
import { verifyBug } from '../../src/support/known-bug';

/**
 * Documented defects of the deliberately buggy build, UI side: wrong texts on the home page.
 * Each test first waits for the product list, so a page that did not load is a failure of the
 * test and not a "typo that is not there".
 */
test.describe('Known bugs: UI texts', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.productNames.first()).toBeVisible();
  });

  test('BUG-33: the sort control is labelled "Sort"', async ({ page }) => {
    await verifyBug(33, 'The label reads "Sorth" instead of "Sort"', async () => {
      await expect(page.getByText('Sorth', { exact: true })).toHaveCount(0, { timeout: 2_000 });
    });
  });

  test('BUG-34: the search button says "Search"', async ({ page }) => {
    await verifyBug(34, 'The button reads "Serch" instead of "Search"', async () => {
      await expect(page.getByText('Serch', { exact: true })).toHaveCount(0, { timeout: 2_000 });
    });
  });
});
