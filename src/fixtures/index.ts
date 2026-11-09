import { test as base, expect } from '@playwright/test';
import { ToolshopApi } from '../api/toolshop-api';
import { buildUser, type NewUser } from '../data/user-factory';

interface Fixtures {
  /** API client bound to the active target (clean / bugs). */
  api: ToolshopApi;
  /** A freshly registered user, unique per test, so tests never touch shared demo accounts. */
  newUser: NewUser;
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
});

export { expect };
