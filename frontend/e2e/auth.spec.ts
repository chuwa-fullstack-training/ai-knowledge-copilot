import { test, expect } from '@playwright/test';
import { testUsers } from './fixtures/test-data';
import { clearLocalStorage, login } from './utils/test-helpers';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
  });

  test('user registration flow', async ({ page }) => {
    await page.goto('/register');

    // Fill registration form
    await page.fill('[name="email"]', testUsers.validUser.email);
    await page.fill('[name="password"]', testUsers.validUser.password);
    await page.fill('[name="confirmPassword"]', testUsers.validUser.password);
    await page.fill('[name="userName"]', testUsers.validUser.userName);
    await page.fill('[name="firstName"]', testUsers.validUser.firstName);
    await page.fill('[name="lastName"]', testUsers.validUser.lastName);

    // Submit form
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Verify token stored in localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

  test('user login flow', async ({ page }) => {
    await login(page, testUsers.validUser.email, testUsers.validUser.password);

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Verify token persistence
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

  test('login with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Enter invalid credentials
    await page.fill('[name="email"]', testUsers.invalidUser.email);
    await page.fill('[name="password"]', testUsers.invalidUser.password);
    await page.click('button[type="submit"]');

    // Verify error message displayed
    await expect(page.locator('text=/Login failed|Invalid credentials|check your credentials/i')).toBeVisible();

    // Verify no redirect occurs
    await expect(page).toHaveURL('/login');
  });

  test('protected route access', async ({ page }) => {
    // Try to navigate to protected route without token
    await page.goto('/dashboard');

    // Verify redirect to login page
    await expect(page).toHaveURL('/login');

    // Login with valid credentials
    await login(page, testUsers.validUser.email, testUsers.validUser.password);

    // Verify access to protected route
    await expect(page).toHaveURL('/dashboard');
  });

  test('logout flow', async ({ page }) => {
    // Login as user
    await login(page, testUsers.validUser.email, testUsers.validUser.password);

    // Click logout button
    await page.click('button:has-text("Logout")');

    // Verify redirect to login
    await expect(page).toHaveURL('/login');

    // Verify token removed from localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();

    // Verify cannot access protected routes
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });
});
