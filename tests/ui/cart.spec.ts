import { test, expect } from '../../src/fixtures';
import { PaginatedProductsSchema } from '../../src/schemas/product';
import { parseContract } from '../../src/schemas/validate';

test.describe('Cart', () => {
  test('adds an in-stock product to the cart @smoke', async ({ api, productPage, header, cartPage }) => {
    // Pick the product through the API, so the test never trips over an out-of-stock item
    const response = await api.getProducts();
    expect(response.status(), 'precondition: GET /products').toBe(200);
    const list = parseContract(PaginatedProductsSchema, await response.json());
    const product = list.data.find((p) => p.in_stock && !p.is_rental);
    if (!product) throw new Error('Precondition failed: no in-stock, non-rental product returned by the API');

    await productPage.goto(product.id);
    await expect(productPage.name).toHaveText(product.name);
    await productPage.addToCart();

    await expect(header.cartQuantity).toHaveText('1');
    await header.openCart();
    await expect(cartPage.productTitles).toContainText([product.name]);
  });
});
