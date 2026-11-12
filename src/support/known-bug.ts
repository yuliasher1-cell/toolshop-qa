import { expect, test } from '@playwright/test';
import { isBuggyBuild } from '../config/env';

/**
 * Checks one documented defect of the deliberately buggy Toolshop build.
 *
 * `check` must assert the CORRECT behaviour. Then:
 *  - on the normal build the check runs as is, so a failure is a real regression;
 *  - on the buggy build the check is expected to fail, because that is the planted defect.
 *    The test passes only if it does, so a bug that gets fixed (or a test that no longer
 *    reaches the defect) shows up as a failure instead of going unnoticed.
 *
 * Do the set-up (registering users, creating data) BEFORE calling this helper: a broken
 * precondition must fail the test, never be mistaken for a reproduced bug.
 */
export async function verifyBug(id: number, title: string, check: () => Promise<void>): Promise<void> {
  if (!isBuggyBuild) {
    await check();
    return;
  }

  let observed: string | undefined;
  try {
    await check();
  } catch (error) {
    observed = error instanceof Error ? error.message.split('\n')[0] : String(error);
  }

  test.info().annotations.push({ type: `BUG-${id}`, description: title });
  if (observed !== undefined) {
    test.info().annotations.push({ type: 'observed', description: observed });
  }
  expect(
    observed,
    `BUG-${id} ("${title}") did not reproduce: the buggy build behaved correctly. Was it fixed?`,
  ).toBeDefined();
}
