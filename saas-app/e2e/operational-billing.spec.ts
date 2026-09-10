import { test, expect } from '@playwright/test';

test.describe('Operational Billing & PDF Generation', () => {
  test('E2E Flow: Matter -> Draft Invoice -> Issue -> Pay -> Receipt', async ({ page }) => {
    // 1. Login
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'owner@notarygo.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Navigate to Billing section of a Matter (assume Matter ID 1 exists)
    await page.goto('/dashboard/matters/1/billing');

    // 2. Create Draft Invoice
    await page.click('button:has-text("Create Draft Invoice")');
    await expect(page.locator('text=Draft Invoice')).toBeVisible();

    // 3. Add Invoice Items
    await page.fill('input[name="description"]', 'Legal Consultation');
    await page.fill('input[name="quantity"]', '2');
    await page.fill('input[name="unitPrice"]', '500');
    await page.click('button:has-text("Add")');

    // Verify item was added and total is calculated (via trigger)
    await expect(page.locator('text=Legal Consultation')).toBeVisible();
    await expect(page.locator('text=$1000')).toBeVisible(); // 2 * 500

    // 4. Issue Invoice & Generate PDF
    await page.click('button:has-text("Issue Invoice & Generate PDF")');
    
    // Status should change to ISSUED and an Invoice number should appear
    await expect(page.locator('text=Status: ISSUED')).toBeVisible();
    
    // 5. Record Partial Payment
    await page.fill('input[name="amount"]', '400');
    await page.selectOption('select[name="method"]', 'BANK_TRANSFER');
    await page.click('button:has-text("Record Payment & Generate Receipt")');

    // Status should be PARTIAL
    await expect(page.locator('text=Status: PARTIAL')).toBeVisible();
    await expect(page.locator('text=Balance: $600')).toBeVisible();

    // 6. Record Final Payment
    await page.fill('input[name="amount"]', '600');
    await page.click('button:has-text("Record Payment & Generate Receipt")');

    // Status should be PAID
    await expect(page.locator('text=Status: PAID')).toBeVisible();
    await expect(page.locator('text=Balance: $0')).toBeVisible();

    // 7. Verify PDFs are in Document Center
    await page.goto('/dashboard/matters/1/documents');
    await expect(page.locator('text=Invoice INV-')).toBeVisible();
    await expect(page.locator('text=Receipt RCT-').first()).toBeVisible();
  });
});
