import { request } from '@playwright/test';
import { env } from '../config/env';

/**
 * Runs once before the whole suite. The tests hit a public demo server that is sometimes slow
 * or down. Instead of 15 confusing timeouts, fail fast with one clear message.
 */
export default async function globalSetup(): Promise<void> {
  const context = await request.newContext();
  const url = `${env.apiURL}/products`;
  let lastError = 'no response';

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await context.get(url, { timeout: 15_000 });
      if (response.ok()) {
        await context.dispose();
        return;
      }
      lastError = `HTTP ${response.status()}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message.split('\n')[0] : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 2_000 * attempt));
  }

  await context.dispose();
  throw new Error(
    `Target "${env.name}" is not available (${url}: ${lastError}). ` +
      'The public Toolshop demo may be down or overloaded, try again later.',
  );
}
