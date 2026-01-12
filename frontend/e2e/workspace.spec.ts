import { test, expect } from '@playwright/test';
import { testUsers, testWorkspaces } from './fixtures/test-data';
import { login, createWorkspace, clearLocalStorage } from './utils/test-helpers';

test.describe('Workspace Management', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
    // Login before each test
    await login(page, testUsers.validUser.email, testUsers.validUser.password);
  });

  test('create workspace', async ({ page }) => {
    // Navigate to workspaces page
    await page.goto('/workspace');

    // Click "New Workspace" button
    await page.click('text=New Workspace');

    // Fill workspace form
    await page.fill('[name="name"]', testWorkspaces.workspace1.name);
    await page.fill('[name="description"]', testWorkspaces.workspace1.description);

    // Submit form
    await page.click('button:has-text("Create")');

    // Wait for modal to close
    await page.waitForTimeout(1000);

    // Verify workspace appears in list
    await expect(page.locator(`text=${testWorkspaces.workspace1.name}`)).toBeVisible();
  });

  test('view workspaces list', async ({ page }) => {
    // Navigate to workspaces page
    await page.goto('/workspace');

    // Verify workspaces displayed
    await expect(page.locator('h2:has-text("Workspaces")')).toBeVisible();

    // Check if workspace cards are rendered
    const workspaceCards = page.locator('[class*="grid"]');
    await expect(workspaceCards).toBeVisible();
  });

  test('delete workspace', async ({ page }) => {
    // Navigate to workspaces page
    await page.goto('/workspace');

    // Create a workspace first
    await createWorkspace(page, testWorkspaces.workspace2.name);
    await page.waitForTimeout(1000);

    // Find and click delete button for the workspace
    const workspaceCard = page.locator(`text=${testWorkspaces.workspace2.name}`).locator('..');
    await workspaceCard.locator('button:has-text("Delete")').click();

    // Confirm deletion in dialog
    page.on('dialog', dialog => dialog.accept());

    // Wait for deletion
    await page.waitForTimeout(1000);

    // Verify workspace removed from list
    await expect(page.locator(`text=${testWorkspaces.workspace2.name}`)).not.toBeVisible();
  });

  test('workspace selector', async ({ page }) => {
    // Create multiple workspaces
    await page.goto('/workspace');
    await createWorkspace(page, 'Workspace A');
    await page.waitForTimeout(500);
    await createWorkspace(page, 'Workspace B');
    await page.waitForTimeout(500);

    // Navigate to dashboard to see sidebar
    await page.goto('/dashboard');

    // Click workspace selector in sidebar
    const workspaceSelector = page.locator('[class*="workspace"]').first();
    await workspaceSelector.click();

    // Verify workspace dropdown appears
    await expect(page.locator('text=Workspace A')).toBeVisible();
    await expect(page.locator('text=Workspace B')).toBeVisible();

    // Select a workspace
    await page.click('text=Workspace A');

    // Verify selected workspace displayed
    await expect(workspaceSelector).toContainText('Workspace A');
  });
});
