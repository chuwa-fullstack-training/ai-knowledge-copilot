import { Page } from '@playwright/test';

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

export async function createWorkspace(
  page: Page,
  name: string,
  description?: string
) {
  await page.click('text=New Workspace');
  await page.fill('[name="name"]', name);
  if (description) {
    await page.fill('[name="description"]', description);
  }
  await page.click('button:has-text("Create Workspace")');
}

export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => localStorage.clear());
}
