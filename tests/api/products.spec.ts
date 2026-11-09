import type { ToolshopApi, ProductQuery } from '../../src/api/toolshop-api';
import { test, expect } from '../../src/fixtures';
import { PaginatedProductsSchema, ProductSchema } from '../../src/schemas/product';
import { parseContract } from '../../src/schemas/validate';

/** Fetches a page of products, checking the status first so a server error is reported as such. */
async function fetchProductPage(api: ToolshopApi, params: ProductQuery = {}) {
  const response = await api.getProducts(params);
  expect(response.status(), `GET /products ${JSON.stringify(params)}`).toBe(200);
  return parseContract(PaginatedProductsSchema, await response.json());
}

test.describe('Products API', () => {
  test('GET /products matches the contract and is non-empty @smoke', async ({ api }) => {
    const page = await fetchProductPage(api);

    expect(page.data.length).toBeGreaterThan(0);
    expect(page.total).toBeGreaterThanOrEqual(page.data.length);
  });

  test('pagination returns a different page of products', async ({ api }) => {
    const first = await fetchProductPage(api, { page: 1 });
    const second = await fetchProductPage(api, { page: 2 });

    expect(second.current_page).toBe(2);
    const firstIds = new Set(first.data.map((p) => p.id));
    expect(second.data.some((p) => firstIds.has(p.id))).toBe(false);
  });

  test('sort=price,asc returns prices in ascending order', async ({ api }) => {
    const page = await fetchProductPage(api, { sort: 'price,asc' });

    const prices = page.data.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('between=price,10,30 returns only products in that price range', async ({ api }) => {
    const page = await fetchProductPage(api, { between: 'price,10,30' });

    expect(page.data.length).toBeGreaterThan(0);
    for (const product of page.data) {
      expect(product.price, `price of "${product.name}"`).toBeGreaterThanOrEqual(10);
      expect(product.price, `price of "${product.name}"`).toBeLessThanOrEqual(30);
    }
  });

  test('GET /products/{id} returns the same product as the list', async ({ api }) => {
    const page = await fetchProductPage(api);
    const listed = page.data[0];

    const response = await api.getProduct(listed.id);

    expect(response.status()).toBe(200);
    const product = parseContract(ProductSchema, await response.json());
    expect(product.id).toBe(listed.id);
    expect(product.name).toBe(listed.name);
    expect(product.price).toBe(listed.price);
  });

  test('GET /products/{id} returns 404 for an unknown id', async ({ api }) => {
    const response = await api.getProduct('01ZZZZZZZZZZZZZZZZZZZZZZZZ');

    expect(response.status()).toBe(404);
  });
});
