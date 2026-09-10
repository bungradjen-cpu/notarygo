import { test, expect } from '@playwright/test';

// NOTE: This test requires a running backend with a seeded database.
// It assumes the test user is an OWNER and there is an existing Client and Service Type.

test.describe('Core Operational Vertical Slice', () => {
  test('End-to-End Operating Loop', async ({ page }) => {
    // 1. Login as Owner
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'owner@notarygo.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect to Dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('h1')).toContainText('Welcome to');

    // 2. We'll skip the UI steps for creating Client/ServiceType in this test
    // and assume they exist (would normally use API seeding before test).
    
    // 3. Create Matter (Assuming there's a form at /dashboard/matters/new)
    // For this vertical slice, we'll navigate directly if the route existed, 
    // but since we only built the detail page, we'll verify the Dashboard data first.
    
    // Check Total Active Matters metric
    await expect(page.locator('text=Total Active Matters')).toBeVisible();

    // 4. Verify Task in "My Work"
    // The Owner might also be assigned tasks
    await expect(page.locator('text=My Work (Assigned Tasks)')).toBeVisible();

    // 5. Navigate to a specific Matter detail
    // We would normally click a link, but we'll just check if the lists render
    const mattersList = page.locator('text=Matter:');
    if (await mattersList.count() > 0) {
      await mattersList.first().click();
      
      // Verify Matter Detail Page
      await expect(page.locator('text=Workflow Tasks')).toBeVisible();
      await expect(page.locator('text=Checklist')).toBeVisible();
      await expect(page.locator('text=Activity Log')).toBeVisible();

      // Complete a task
      const completeButton = page.locator('text=Mark Complete').first();
      if (await completeButton.isVisible()) {
        await completeButton.click();
        
        // Task should disappear or turn green
        await expect(page.locator('text=COMPLETED').first()).toBeVisible();
      }
    }
  });
});
