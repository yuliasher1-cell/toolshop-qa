import { test, expect } from '../../src/fixtures';

/**
 * Screenshot comparison. These tests only run in CI (the `visual` project exists only when CI is
 * set), against baselines rendered on the CI runner. To accept an intended change, run the
 * "Update visual baselines" workflow.
 */
test.describe('Visual regression', () => {
  test('login page', async ({ page, loginPage }) => {
    await loginPage.goto();
    await expect(page.getByTestId('login-submit')).toBeVisible();

    await expect(page).toHaveScreenshot('login-page.png', { fullPage: true });
  });

  test('login page after a failed sign-in', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(`nobody-${Date.now()}@example.com`, 'Wrong-password-1!');
    await expect(loginPage.errorMessage).toBeVisible();

    await expect(page).toHaveScreenshot('login-page-error.png', { fullPage: true });
  });
});
