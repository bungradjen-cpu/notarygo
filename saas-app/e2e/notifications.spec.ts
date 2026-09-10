import { test, expect } from '@playwright/test';

test.describe('Notifications Engine', () => {
  test('In-App Notification and Preferences Flow', async ({ page }) => {
    // 1. Login
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'staff@notarygo.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 2. Open Notification Bell
    // Assuming we have triggered a mock task assignment via DB seeding
    await page.click('button:has(svg)'); // The bell icon
    
    // Expect to see a notification
    await expect(page.locator('text=Notifications')).toBeVisible();

    // 3. Navigate to Preferences
    await page.click('text=Notification Settings');
    await expect(page).toHaveURL(/.*\/dashboard\/settings\/notifications/);

    // 4. Update Preferences
    await page.uncheck('input[name="email_task_assigned"]');
    await page.uncheck('input[name="email_overdue"]');
    await page.click('button[type="submit"]');

    // Changes should persist
    await expect(page.locator('input[name="email_task_assigned"]')).not.toBeChecked();
  });
});
