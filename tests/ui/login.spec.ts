import { test, expect } from '../../src/fixtures';

test.describe('Login (UI)', () => {
  test('logs in with a registered user @smoke', async ({ page, loginPage, header, newUser }) => {
    await loginPage.goto();
    await loginPage.login(newUser.email, newUser.password);

    await expect(page).toHaveURL(/\/account/);
    await expect(header.userMenu).toContainText(newUser.first_name);
  });

  test('shows an error for a wrong password', async ({ page, loginPage, newUser }) => {
    await loginPage.goto();
    await loginPage.login(newUser.email, 'Wrong-password-1!');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
