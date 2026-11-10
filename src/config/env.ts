/**
 * Test targets. The same suite runs against two public Toolshop deployments:
 *  - clean: the normal app, every test is expected to pass
 *  - bugs:  the deliberately buggy build, used to prove the suite catches defects
 *
 * Select with the TARGET env variable (default: clean).
 */
export type Target = 'clean' | 'bugs' | 'local';

interface Environment {
  name: Target;
  baseURL: string;
  apiURL: string;
}

const ENVIRONMENTS: Record<Target, Environment> = {
  clean: {
    name: 'clean',
    baseURL: 'https://practicesoftwaretesting.com',
    apiURL: 'https://api.practicesoftwaretesting.com',
  },
  bugs: {
    name: 'bugs',
    baseURL: 'https://with-bugs.practicesoftwaretesting.com',
    apiURL: 'https://api-with-bugs.practicesoftwaretesting.com',
  },
  // Toolshop started with Docker on this machine (docker-compose from the Toolshop repository).
  // Which build runs (normal or with bugs) is decided by SPRINT_FOLDER when the containers start.
  // CI uses this target because the public site shows a bot check to GitHub-hosted runners.
  local: {
    name: 'local',
    baseURL: 'http://localhost:4200',
    apiURL: 'http://localhost:8091',
  },
};

function resolveTarget(): Target {
  const raw = (process.env.TARGET ?? 'clean').toLowerCase();
  if (raw !== 'clean' && raw !== 'bugs' && raw !== 'local') {
    throw new Error(`Unknown TARGET "${raw}". Use "clean", "bugs" or "local".`);
  }
  return raw;
}

export const env: Environment = ENVIRONMENTS[resolveTarget()];

/** Toolshop marks elements with data-test, so getByTestId('email') matches data-test="email". */
export const TEST_ID_ATTRIBUTE = 'data-test';

/** Public demo accounts published by the Toolshop project. */
export const users = {
  customer: { email: 'customer@practicesoftwaretesting.com', password: 'welcome01' },
  customer2: { email: 'customer2@practicesoftwaretesting.com', password: 'welcome01' },
  admin: { email: 'admin@practicesoftwaretesting.com', password: 'welcome01' },
} as const;
