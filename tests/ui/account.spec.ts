import { authedTest as test, expect } from '../../src/fixtures';
import { PaginatedProductsSchema } from '../../src/schemas/product';
import { TokenSchema } from '../../src/schemas/user';
import { parseContract } from '../../src/schemas/validate';

test.describe('Signed-in user (session prepared once per worker, no login form)', () => {
  test('opens the account page already authenticated @smoke', async ({ page, header, workerUser }) => {
    await page.goto('/account');

    await expect(page).toHaveURL(/\/account/);
    await expect(header.userMenu).toContainText(workerUser.first_name);
  });

  test('a favourite added through the API shows up in the UI', async ({ page, api, workerUser }) => {
    // Setup through the API: pick a product, sign in, add it to favourites
    const listResponse = await api.getProducts();
    expect(listResponse.status(), 'precondition: GET /products').toBe(200);
    const [product] = parseContract(PaginatedProductsSchema, await listResponse.json()).data;

    const loginResponse = await api.login(workerUser.email, workerUser.password);
    expect(loginResponse.status(), 'precondition: API login').toBe(200);
    const { access_token } = parseContract(TokenSchema, await loginResponse.json());

    const favoriteResponse = await api.addFavorite(access_token, product.id);
    expect([200, 201], `POST /favorites responded ${favoriteResponse.status()}`).toContain(
      favoriteResponse.status(),
    );

    // Verification through the UI
    await page.goto('/account/favorites');
    await expect(page.getByText(product.name).first()).toBeVisible();
  });
});
