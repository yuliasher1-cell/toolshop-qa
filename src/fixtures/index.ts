import { test as base, expect } from '@playwright/test';
import { ToolshopApi } from '../api/toolshop-api';
import { buildUser, type NewUser } from '../data/user-factory';
import { CartPage } from '../pages/cart.page';
import { Header } from '../pages/header.component';
import { HomePage } from '../pages/home.page';
import { LoginPage } from '../pages/login.page';
import { ProductPage } from '../pages/product.page';

interface Fixtures {
  /** API client bound to the active target (clean / bugs). */
  api: ToolshopApi;
  /** A freshly registered user, unique per test, so tests never touch shared demo accounts. */
  newUser: NewUser;
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  loginPage: LoginPage;
  header: Header;
}

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    await use(new ToolshopApi(request));
  },

  newUser: async ({ api }, use) => {
    const user = buildUser();
    const response = await api.register(user);
    expect(
      response.status(),
      `precondition: registering a fresh test user. Response: ${await response.text()}`,
    ).toBe(201);
    await use(user);
  },

  homePage: async ({ page }, use) => use(new HomePage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  header: async ({ page }, use) => use(new Header(page)),
});

export { expect };
