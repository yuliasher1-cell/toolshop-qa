import { test, expect } from '../../src/fixtures';
import { buildUser } from '../../src/data/user-factory';
import { TokenSchema, UserSchema } from '../../src/schemas/user';
import { parseContract } from '../../src/schemas/validate';

test.describe('Registration', () => {
  test('creates a user and returns a contract-valid response without the password @smoke', async ({ api }) => {
    const user = buildUser();

    const response = await api.register(user);

    expect(response.status(), await response.text()).toBe(201);
    const body = await response.json();
    const created = parseContract(UserSchema, body);
    expect(created.email).toBe(user.email);
    expect(body).not.toHaveProperty('password');
  });

  test('rejects a second registration with the same e-mail', async ({ api, newUser }) => {
    const response = await api.register(buildUser({ email: newUser.email }));

    expect(response.status()).toBe(409);
  });
});

test.describe('Login', () => {
  test('returns a bearer token for a registered user @smoke', async ({ api, newUser }) => {
    const response = await api.login(newUser.email, newUser.password);

    expect(response.status()).toBe(200);
    const token = parseContract(TokenSchema, await response.json());
    expect(token.token_type.toLowerCase()).toBe('bearer');
    expect(token.access_token.length).toBeGreaterThan(20);
  });

  test('rejects a wrong password @smoke', async ({ api, newUser }) => {
    const response = await api.login(newUser.email, 'Wrong-password-1!');

    expect(response.status()).toBe(401);
  });

  test('rejects an unknown e-mail', async ({ api }) => {
    const response = await api.login(`nobody-${Date.now()}@example.com`, 'Wrong-password-1!');

    expect(response.status()).toBe(401);
  });

  test('locks the account after repeated failed attempts', async ({ api, newUser }) => {
    // Uses its own throw-away user, so it can never lock a shared demo account.
    let lockedAfter = 0;
    for (let attempt = 1; attempt <= 10; attempt++) {
      const response = await api.login(newUser.email, 'Wrong-password-1!');
      if (response.status() === 423) {
        lockedAfter = attempt;
        break;
      }
      expect(response.status(), `failed attempt #${attempt}`).toBe(401);
    }
    expect(lockedAfter, 'account should lock within 10 failed attempts').toBeGreaterThan(0);

    const withCorrectPassword = await api.login(newUser.email, newUser.password);
    expect(withCorrectPassword.status(), 'a locked account rejects even the correct password').toBe(423);
  });
});
