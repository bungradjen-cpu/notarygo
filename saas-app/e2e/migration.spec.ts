import { test, expect } from '@playwright/test';

test.describe('Legacy GAS Migration Tooling', () => {
  const samplePayload = JSON.stringify({
    version: "1.0",
    clients: [
      {
        clientId: "LEGACY-C-01",
        name: "Budi Santoso",
        phone: "+62811223344",
        email: "budi@example.com"
      }
    ],
    matters: [
      {
        matterId: "LEGACY-M-01",
        matterNumber: "LEGACY/2026/001",
        clientId: "LEGACY-C-01",
        title: "Perjanjian Sewa Menyewa",
        status: "ACTIVE",
        priority: "NORMAL"
      }
    ],
    tasks: [
      {
        taskId: "LEGACY-T-01",
        matterId: "LEGACY-M-01",
        title: "Drafting Kontrak",
        status: "PENDING"
      }
    ]
  });

  test('Dry run validation and confirm migration execution flow', async ({ page }) => {
    // 1. Login as Owner
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'owner@notarygo.com');
    await page.fill('input[name="password"]', 'ownerPassword123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 2. Navigate to Migration Settings
    await page.goto('/dashboard/settings/migration');
    await expect(page.locator('text=Legacy Data Migration')).toBeVisible();

    // 3. Paste JSON Payload
    await page.fill('textarea', samplePayload);

    // 4. Trigger Dry-Run Validation
    await page.click('text=Run Dry-Run Validation & Preview');

    // 5. Verify Preview counts
    await expect(page.locator('text=Step 2: Dry-Run Preview Summary')).toBeVisible();
    await expect(page.locator('text=Ready for Confirmation')).toBeVisible();

    // 6. Confirm and Execute Migration
    await page.click('text=Confirm & Execute Migration');

    // 7. Verify Success
    await expect(page.locator('text=Migration Successfully Executed!')).toBeVisible();
  });
});
