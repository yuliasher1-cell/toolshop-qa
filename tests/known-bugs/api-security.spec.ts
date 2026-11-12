import { test, expect } from '../../src/fixtures';
import { users } from '../../src/config/env';
import { buildUser } from '../../src/data/user-factory';
import { verifyBug } from '../../src/support/known-bug';

/**
 * Documented defects of the deliberately buggy build (sprint5-with-bugs), API side.
 * IDs refer to the official list: docs/bugs/README.md links each one to its report.
 *
 * Every test asserts the CORRECT behaviour. On the normal build it must pass; on the buggy build
 * `verifyBug` expects the assertion to fail (see src/support/known-bug.ts).
 */

/** Registers a user and returns its credentials and id (the id format differs between builds). */
async function registerUser(api: import('../../src/api/toolshop-api').ToolshopApi) {
  const user = buildUser();
  const response = await api.register(user);
  expect(response.status(), `precondition: register user. Response: ${await response.text()}`).toBe(201);
  const body = await response.json();
  return { ...user, id: String(body.id) };
}

test.describe('Known bugs: API', () => {
  test('BUG-74: a customer cannot delete a brand', async ({ api }) => {
    // Set-up: the admin creates a brand that a customer then tries to delete.
    const adminToken = await api.tokenFor(users.admin.email, users.admin.password);
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const created = await api.createBrand(adminToken, { name: `QA brand ${suffix}`, slug: `qa-brand-${suffix}` });
    expect(created.status(), `precondition: create brand. Response: ${await created.text()}`).toBe(201);
    const brandId = (await created.json()).id as string;
    const customer = await registerUser(api);
    const customerToken = await api.tokenFor(customer.email, customer.password);

    try {
      const response = await api.deleteBrand(brandId, customerToken);

      await verifyBug(74, 'A non-admin user can delete a brand', async () => {
        expect(response.status(), 'a customer must be forbidden').toBe(403);
        expect((await api.getBrand(brandId)).status(), 'the brand must still exist').toBe(200);
      });
    } finally {
      await api.deleteBrand(brandId, adminToken); // clean up, ignore the result
    }
  });

  test('BUG-78: a customer sees only their own invoices', async ({ api }) => {
    const customer = await registerUser(api); // brand new user, so there is nothing to show
    const token = await api.tokenFor(customer.email, customer.password);

    const response = await api.getInvoices(token);

    expect(response.status(), await response.text()).toBe(200);
    const body = await response.json();
    await verifyBug(78, 'All invoices are returned to every user', async () => {
      expect(body.data, 'a user without orders must get an empty list').toHaveLength(0);
    });
  });

  test("BUG-71: a customer cannot read another user's profile", async ({ api }) => {
    const owner = await registerUser(api);
    const stranger = await registerUser(api);
    const strangerToken = await api.tokenFor(stranger.email, stranger.password);

    const response = await api.getUser(owner.id, strangerToken);

    await verifyBug(71, "The profile of another user can be retrieved by its ID", async () => {
      expect(response.ok(), `expected a refusal, got ${response.status()}`).toBe(false);
      expect(await response.text()).not.toContain(owner.email);
    });
  });

  test('BUG-73: the user profile does not expose internal account fields', async ({ api }) => {
    const customer = await registerUser(api);
    const token = await api.tokenFor(customer.email, customer.password);

    const response = await api.getUser(customer.id, token);

    expect(response.status(), await response.text()).toBe(200);
    const body = await response.json();
    await verifyBug(73, 'Internal fields (enabled, failed_login_attempts) are revealed', async () => {
      expect(body).not.toHaveProperty('enabled');
      expect(body).not.toHaveProperty('failed_login_attempts');
    });
  });

  test('BUG-72: the access token is short-lived', async ({ api }) => {
    const customer = await registerUser(api);

    const response = await api.login(customer.email, customer.password);

    expect(response.status(), await response.text()).toBe(200);
    const { expires_in: expiresIn } = await response.json();
    await verifyBug(72, 'The access token lives for about half a year', async () => {
      expect(expiresIn, 'expires_in is in seconds, one day is 86400').toBeLessThanOrEqual(24 * 60 * 60);
    });
  });

  test('BUG-21: the account is not locked after two failed sign-ins', async ({ api }) => {
    const customer = await registerUser(api);
    await api.login(customer.email, 'Wrong-password-1!');
    await api.login(customer.email, 'Wrong-password-2!');

    const response = await api.login(customer.email, customer.password);

    await verifyBug(21, 'The user is locked after one invalid attempt (should be three)', async () => {
      expect(response.status(), 'correct password after two failures must still work').toBe(200);
    });
  });

  test('BUG-79: a SQL injection in the e-mail does not log anyone in', async ({ api }) => {
    const response = await api.login(`${users.customer.email}' -- `, 'definitely-not-the-password');

    await verifyBug(79, 'SQL injection signs in as another account', async () => {
      expect(response.status(), 'the request must be rejected').not.toBe(200);
    });
  });

  test('BUG-80: application logs are not served over the web', async ({ api }) => {
    const response = await api.get('/logs/laravel.log');

    await verifyBug(80, 'laravel.log is publicly accessible', async () => {
      expect(response.status(), 'the log must not be reachable').not.toBe(200);
    });
  });

  test('BUG-82: user IDs cannot be guessed', async ({ api }) => {
    const customer = await registerUser(api);

    await verifyBug(82, 'IDs are sequential integers', async () => {
      expect(customer.id, 'IDs must be non-sequential (ULID), not plain numbers').not.toMatch(/^\d+$/);
    });
  });

  test('BUG-2: sorting products by price ascending is really ascending', async ({ api }) => {
    const response = await api.getProducts({ sort: 'price,asc' });

    expect(response.status(), await response.text()).toBe(200);
    const prices = ((await response.json()).data as { price: number }[]).map((p) => Number(p.price));
    expect(prices.length, 'precondition: the page has products to compare').toBeGreaterThan(1);
    await verifyBug(2, 'Sorting works the other way around', async () => {
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });
  });
});
