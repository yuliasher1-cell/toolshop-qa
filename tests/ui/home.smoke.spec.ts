import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('shows the product catalog @smoke', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Practice Software Testing/i);
    await expect(page.getByTestId('product-name').first()).toBeVisible();
    expect(await page.getByTestId('product-name').count()).toBeGreaterThan(0);
  });

  test('search returns matching products @smoke', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('search-query').fill('hammer');
    await page.getByTestId('search-submit').click();

    // Web-first assertion: retries until the grid is re-rendered with results
    await expect(page.getByTestId('product-name').first()).toContainText(/hammer/i);
  });
});
