import { test, expect } from '@playwright/test';
import { users } from '../../src/config/env';

test.describe('Products API', () => {
  test('GET /products returns a non-empty paginated list @smoke', async ({ request }) => {
    const response = await request.get('/products');

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });
});

test.describe('Auth API', () => {
  test('POST /users/login returns a token for a valid customer @smoke', async ({ request }) => {
    const response = await request.post('/users/login', { data: users.customer });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.access_token).toBeTruthy();
  });

  test('POST /users/login rejects a wrong password @smoke', async ({ request }) => {
    const response = await request.post('/users/login', {
      data: { email: users.customer.email, password: 'definitely-wrong' },
    });

    expect(response.status()).toBe(401);
  });
});
