import { randomBytes } from 'node:crypto';

export interface NewUser {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  dob: string;
  phone: string;
  address: {
    street: string;
    house_number: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
}

/**
 * Random password that satisfies the policy (upper + lower case, digit, symbol, 8+ chars).
 * It has to be random: Toolshop rejects passwords found in known data leaks (HTTP 422),
 * and that includes the example password printed in its own API documentation.
 */
function generatePassword(): string {
  return `Aa1!${randomBytes(9).toString('base64url')}`;
}

/**
 * Builds a valid, unique registration payload (see UserRequest in docs/openapi:
 * dob must be 18-75 years ago). A unique e-mail per call means tests never depend on
 * the shared public demo accounts.
 */
export function buildUser(overrides: Partial<NewUser> = {}): NewUser {
  const unique = `${Date.now()}${Math.floor(Math.random() * 10_000)}`;
  return {
    first_name: 'Test',
    last_name: 'Automation',
    email: `qa.${unique}@example.com`,
    password: generatePassword(),
    dob: '1990-05-15',
    phone: '0987654321',
    address: {
      street: 'Main Street',
      house_number: '12',
      city: 'Prague',
      state: 'Prague',
      country: 'CZ',
      postal_code: '11000',
    },
    ...overrides,
  };
}
