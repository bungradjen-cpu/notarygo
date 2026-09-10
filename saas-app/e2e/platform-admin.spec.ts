import { test, expect } from '@playwright/test';

test.describe('Platform Superadmin Portal Security', () => {
  test('Non-admin user receives 404 when accessing /admin', async ({ page }) => {
    // 1. Login as standard staff/owner
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'staff@notarygo.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 2. Attempt to navigate directly to /admin
    const response = await page.goto('/admin');
    
    // Expect notFound() response or 404 status/page
    expect(response?.status()).toBe(404);
  });

  test('Platform admin can access metrics and audit logs', async ({ page }) => {
    // 1. Login as verified Platform Admin
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@notarygo.com');
    await page.fill('input[name="password"]', 'adminSecret123');
    await page.click('button[type="submit"]');

    // 2. Navigate to /admin
    await page.goto('/admin');
    await expect(page.locator('text=NOTARYGO SUPERADMIN')).toBeVisible();
    await expect(page.locator('text=Platform Metrics')).toBeVisible();
    await expect(page.locator('text=Total Organizations')).toBeVisible();

    // 3. Navigate to Audit Logs
    await page.click('text=Audit Logs');
    await expect(page).toHaveURL(/.*\/admin\/audit/);
    await expect(page.locator('text=Platform Audit Logs')).toBeVisible();
  });
});
