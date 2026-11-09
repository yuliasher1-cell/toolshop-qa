import { test, expect } from '../../src/fixtures';
import { PaginatedProductsSchema, ProductSchema } from '../../src/schemas/product';
import { parseContract } from '../../src/schemas/validate';

test.describe('Products API', () => {
  test('GET /products matches the contract and is non-empty @smoke', async ({ api }) => {
    const response = await api.getProducts();

    expect(response.status()).toBe(200);
    const page = parseContract(PaginatedProductsSchema, await response.json());
    expect(page.data.length).toBeGreaterThan(0);
    expect(page.total).toBeGreaterThanOrEqual(page.data.length);
  });

  test('pagination returns a different page of products', async ({ api }) => {
    const first = parseContract(PaginatedProductsSchema, await (await api.getProducts({ page: 1 })).json());
    const second = parseContract(PaginatedProductsSchema, await (await api.getProducts({ page: 2 })).json());

    expect(second.current_page).toBe(2);
    const firstIds = new Set(first.data.map((p) => p.id));
    expect(second.data.some((p) => firstIds.has(p.id))).toBe(false);
  });

  test('sort=price,asc returns prices in ascending order', async ({ api }) => {
    const page = parseContract(
      PaginatedProductsSchema,
      await (await api.getProducts({ sort: 'price,asc' })).json(),
    );

    const prices = page.data.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('between=price,10,30 returns only products in that price range', async ({ api }) => {
    const page = parseContract(
      PaginatedProductsSchema,
      await (await api.getProducts({ between: 'price,10,30' })).json(),
    );

    expect(page.data.length).toBeGreaterThan(0);
    for (const product of page.data) {
      expect(product.price, `price of "${product.name}"`).toBeGreaterThanOrEqual(10);
      expect(product.price, `price of "${product.name}"`).toBeLessThanOrEqual(30);
    }
  });

  test('GET /products/{id} returns the same product as the list', async ({ api }) => {
    const page = parseContract(PaginatedProductsSchema, await (await api.getProducts()).json());
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
