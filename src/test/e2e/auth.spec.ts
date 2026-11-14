import { test, expect } from '@playwright/test';

test.describe('Auth Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('Signup, logout, login, wrong password, protected route redirect', async ({ page }) => {
    // 1. Unauthenticated user accessing /library should redirect to /login
    await page.goto('/library');
    await page.waitForURL(/\/login/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/login/);

    // 2. Signup with short password fails validation
    await page.goto('/signup');
    await page.fill('#signup-email', 'e2e-user@example.com');
    await page.fill('#signup-password', '123');
    await page.fill('#signup-confirm', '123');
    await page.click('#signup-submit-btn');
    await expect(page.locator('#signup-password-error')).toBeVisible();

    // 3. Signup with matching credentials succeeds and redirects to originally requested route (/library or /)
    await page.fill('#signup-password', 'password123');
    await page.fill('#signup-confirm', 'password123');
    await page.click('#signup-submit-btn');

    // Should redirect to home or library
    await expect(page).toHaveURL(/\/(library)?$/);

    // 4. Session persists after refresh
    await page.reload();
    await expect(page).not.toHaveURL(/\/login/);

    // 5. Logout works and clears session
    // Open user menu or click sign out
    const signOutBtn = page.locator('button:has-text("Log out"), button[aria-label="Log out"]');
    if (await signOutBtn.isVisible()) {
      await signOutBtn.click();
    } else {
      // Open account menu first
      const accountMenu = page.locator('button[aria-label="Account menu"]');
      if (await accountMenu.isVisible()) {
        await accountMenu.click();
        await page.click('text=Log out');
      }
    }

    // Should redirect to /
    await expect(page).toHaveURL(/\/$/);

    // 6. Accessing protected route now redirects to /login again
    await page.goto('/library');
    await expect(page).toHaveURL(/\/login/);

    // 7. Login with wrong password shows error
    await page.goto('/login');
    await page.fill('#login-email', 'e2e-user@example.com');
    await page.fill('#login-password', 'wrongpassword');
    await page.click('#login-submit-btn');
    await expect(page.locator('#password-error')).toBeVisible();

    // 8. Login with correct password succeeds and redirects back to /library (stored returnTo)
    await page.fill('#login-password', 'password123');
    await page.click('#login-submit-btn');
    await expect(page).toHaveURL(/\/library$/);
  });
});