import path from 'node:path';
import { test as base, expect } from '@playwright/test';
import { ToolshopApi } from '../api/toolshop-api';
import { env, TEST_ID_ATTRIBUTE } from '../config/env';
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

interface WorkerFixtures {
  /** One user per worker, registered through the API. */
  workerUser: NewUser;
  /** Path of a saved browser session (storageState) for workerUser. */
  workerStorageState: string;
}

export const test = base.extend<Fixtures, WorkerFixtures>({
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

  // Register once per worker through the API (fast), instead of clicking through the form.
  workerUser: [
    async ({ playwright }, use) => {
      const request = await playwright.request.newContext();
      const user = buildUser();
      const response = await new ToolshopApi(request).register(user);
      expect(
        response.status(),
        `precondition: registering the worker user. Response: ${await response.text()}`,
      ).toBe(201);
      await request.dispose();
      await use(user);
    },
    { scope: 'worker' },
  ],

  // Sign in through the UI once per worker and keep the session, so signed-in tests
  // start already authenticated and skip the login form completely.
  workerStorageState: [
    async ({ browser, playwright, workerUser }, use, workerInfo) => {
      // Worker fixtures run before Playwright applies the config's testIdAttribute (that happens in
      // a per-test fixture), so the first test of a fresh worker would look for data-testid.
      playwright.selectors.setTestIdAttribute(TEST_ID_ATTRIBUTE);
      const file = path.resolve(workerInfo.project.outputDir, '.auth', `${workerInfo.workerIndex}.json`);
      const page = await browser.newPage({ baseURL: env.baseURL });
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(workerUser.email, workerUser.password);
      await expect(page).toHaveURL(/\/account/);
      await page.context().storageState({ path: file });
      await page.close();
      await use(file);
    },
    { scope: 'worker' },
  ],
});

/** Same as `test`, but every test starts with the worker user already signed in. */
export const authedTest = test.extend({
  storageState: async ({ workerStorageState }, use) => {
    await use(workerStorageState);
  },
});

export { expect };
