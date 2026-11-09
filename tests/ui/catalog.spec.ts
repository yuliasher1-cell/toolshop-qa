import { test, expect } from '../../src/fixtures';

const isAscending = (values: number[]): boolean => values.every((v, i) => i === 0 || values[i - 1] <= v);

test.describe('Catalog', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('shows the product catalog @smoke', async ({ page, homePage }) => {
    await expect(page).toHaveTitle(/Practice Software Testing/i);
    expect(await homePage.productNames.count()).toBeGreaterThan(0);
  });

  test('search returns matching products @smoke', async ({ homePage }) => {
    await homePage.search('hammer');

    // Web-first assertion: retries until the grid is re-rendered with results
    await expect(homePage.productNames.first()).toContainText(/hammer/i);
  });

  test('sorting by price ascending orders the grid', async ({ homePage }) => {
    await homePage.sortBy('price,asc');

    // Poll: the grid re-renders a moment after the response arrives
    await expect
      .poll(async () => {
        const prices = await homePage.visiblePrices();
        return prices.length > 1 && isAscending(prices);
      })
      .toBe(true);
  });

  test('opening a product shows the same name and price as the grid', async ({ homePage, productPage }) => {
    const name = (await homePage.productNames.first().innerText()).trim();
    const [gridPrice] = await homePage.visiblePrices();

    await homePage.openProduct(name);

    await expect(productPage.name).toHaveText(name);
    await expect
      .poll(async () => Number((await productPage.unitPrice.innerText()).replace(/[^0-9.]/g, '')))
      .toBe(gridPrice);
  });
});
